
from database.mysql_client import get_mysql_connection
from etl.table_config import get_table_config


def extract_table_batches(
    table_name,
    batch_size=1000,
    last_processed_id=None
):
    """
    Extract records from an approved MySQL source table
    and return them in batches.
    """

    if batch_size <= 0:
        raise ValueError("Batch size must be greater than zero")

    config = get_table_config(table_name)

    primary_key = config["primary_key"]
    load_mode = config["load_mode"]

    if load_mode == "FULL":
        last_processed_id = None

    query = f"SELECT * FROM `{table_name}`"

    if last_processed_id is not None:
        query += f" WHERE `{primary_key}` > %s"

    query += f" ORDER BY `{primary_key}`"

    connection = get_mysql_connection()
    cursor = None

    try:
        cursor = connection.cursor(dictionary=True)

        if last_processed_id is not None:
            cursor.execute(query, (last_processed_id,))
        else:
            cursor.execute(query)

        while True:
            rows = cursor.fetchmany(batch_size)

            if not rows:
                break

            yield rows

    finally:
        if cursor is not None:
            cursor.close()

        connection.close()


def extract_table(table_name, last_processed_id=None):
    """
    Convenience function for small datasets.
    Returns all extracted records as a list.
    """

    records = []

    for batch in extract_table_batches(
        table_name,
        last_processed_id=last_processed_id
    ):
        records.extend(batch)

    return records
