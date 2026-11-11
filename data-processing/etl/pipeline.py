
from etl.extractor import extract_table_batches
from etl.transformer import transform_records
from etl.loader import load_records
from etl.table_config import TABLE_CONFIG
from etl.state_store import (
    get_last_processed_id,
    update_last_processed_id
)


BATCH_SIZE = 1000


def run_table_etl(table_name):
    table_name = table_name.lower()

    config = TABLE_CONFIG[table_name]
    primary_key = config["primary_key"]
    load_mode = config["load_mode"]

    print(f"\n========== ETL: {table_name} ==========")

    last_id = 0

    if load_mode == "INCREMENTAL":
        last_id = get_last_processed_id(table_name)
        print(f"Previous watermark: {last_id}")

    total_loaded = 0
    latest_id = last_id

    for batch in extract_table_batches(
        table_name,
        batch_size=BATCH_SIZE,
        last_processed_id=(
            last_id if load_mode == "INCREMENTAL" else None
        )
    ):
        transformed = transform_records(batch)

        loaded = load_records(table_name, transformed)

        total_loaded += loaded

        if load_mode == "INCREMENTAL":
            batch_max_id = max(
                int(record[primary_key])
                for record in batch
            )

            # Advance watermark only after successful Snowflake load.
            update_last_processed_id(table_name, batch_max_id)

            latest_id = batch_max_id

        print(
            f"Batch loaded: {loaded} | "
            f"Total loaded: {total_loaded}"
        )

    print(f"Total records loaded: {total_loaded}")

    if load_mode == "INCREMENTAL":
        print(f"New watermark: {latest_id}")

    print(f"========== ETL COMPLETED: {table_name} ==========")

    return total_loaded


def run_all_etl():
    results = {}

    for table_name in TABLE_CONFIG:
        try:
            results[table_name] = run_table_etl(table_name)

        except Exception as exc:
            print(f"ETL FAILED: {table_name}: {exc}")
            results[table_name] = f"FAILED: {exc}"

    print("\n========== ETL SUMMARY ==========")

    for table_name, result in results.items():
        print(f"{table_name}: {result}")

    return results
