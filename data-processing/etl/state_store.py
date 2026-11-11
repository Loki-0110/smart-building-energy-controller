
from database.snowflake_client import get_snowflake_connection


def get_last_processed_id(table_name):
    connection = get_snowflake_connection()
    cursor = None

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT LAST_PROCESSED_ID
            FROM ETL_WATERMARK
            WHERE TABLE_NAME = %s
            """,
            (table_name.upper(),)
        )

        result = cursor.fetchone()

        return int(result[0]) if result else 0

    finally:
        if cursor:
            cursor.close()
        connection.close()


def update_last_processed_id(table_name, last_id):
    connection = get_snowflake_connection()
    cursor = None

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            MERGE INTO ETL_WATERMARK TARGET
            USING (
                SELECT %s AS TABLE_NAME, %s AS LAST_PROCESSED_ID
            ) SOURCE
            ON TARGET.TABLE_NAME = SOURCE.TABLE_NAME

            WHEN MATCHED THEN UPDATE SET
                LAST_PROCESSED_ID = SOURCE.LAST_PROCESSED_ID,
                UPDATED_AT = CURRENT_TIMESTAMP()

            WHEN NOT MATCHED THEN INSERT (
                TABLE_NAME,
                LAST_PROCESSED_ID,
                UPDATED_AT
            )
            VALUES (
                SOURCE.TABLE_NAME,
                SOURCE.LAST_PROCESSED_ID,
                CURRENT_TIMESTAMP()
            )
            """,
            (table_name.upper(), last_id)
        )

        connection.commit()

    except Exception:
        connection.rollback()
        raise

    finally:
        if cursor:
            cursor.close()
        connection.close()
