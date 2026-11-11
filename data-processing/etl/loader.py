
from database.snowflake_client import get_snowflake_connection
from etl.table_config import get_table_config


def load_records(table_name, records):
    """
    Load records into a temporary Snowflake staging table
    and MERGE them into the final table.
    """

    if not records:
        print(f"No records to load for {table_name}")
        return 0

    config = get_table_config(table_name)
    primary_key = config["primary_key"]

    table_name = table_name.upper()
    stage_name = f"TEMP_{table_name}_STAGE"

    columns = list(records[0].keys())

    if primary_key not in columns:
        raise ValueError(
            f"Primary key {primary_key} missing from {table_name}"
        )

    quoted_columns = ", ".join(f'"{col}"' for col in columns)

    placeholders = ", ".join(["%s"] * len(columns))

    update_columns = [
        col for col in columns if col != primary_key
    ]

    connection = get_snowflake_connection()
    cursor = None

    try:
        cursor = connection.cursor()

        # Create temporary staging table with matching structure.
        cursor.execute(
            f"""
            CREATE TEMPORARY TABLE IF NOT EXISTS
            "{stage_name}"
            LIKE "{table_name}"
            """
        )

        # Clear staging table before loading this batch.
        cursor.execute(
            f'TRUNCATE TABLE "{stage_name}"'
        )

        insert_sql = (
            f'INSERT INTO "{stage_name}" '
            f'({quoted_columns}) VALUES ({placeholders})'
        )

        values = [
            tuple(record.get(column) for column in columns)
            for record in records
        ]

        cursor.executemany(insert_sql, values)

        # Update existing records.
        if update_columns:
            update_clause = ", ".join(
                f'TARGET."{col}" = SOURCE."{col}"'
                for col in update_columns
            )
        else:
            update_clause = None

        # Insert new records.
        insert_values = ", ".join(
            f'SOURCE."{col}"' for col in columns
        )

        if update_clause:
            merge_sql = f"""
                MERGE INTO "{table_name}" TARGET
                USING "{stage_name}" SOURCE
                ON TARGET."{primary_key}" = SOURCE."{primary_key}"

                WHEN MATCHED THEN UPDATE SET
                    {update_clause}

                WHEN NOT MATCHED THEN INSERT
                    ({quoted_columns})
                VALUES ({insert_values})
            """
        else:
            merge_sql = f"""
                MERGE INTO "{table_name}" TARGET
                USING "{stage_name}" SOURCE
                ON TARGET."{primary_key}" = SOURCE."{primary_key}"

                WHEN NOT MATCHED THEN INSERT
                    ({quoted_columns})
                VALUES ({insert_values})
            """

        cursor.execute(merge_sql)
        connection.commit()

        print(
            f"Successfully loaded {len(records)} records "
            f"into {table_name}"
        )

        return len(records)

    except Exception:
        connection.rollback()
        raise

    finally:
        if cursor:
            cursor.close()

        connection.close()
