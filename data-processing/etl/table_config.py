
# MySQL source tables and their primary keys.
# These names are fixed in our application, not user input.

TABLE_CONFIG = {
    "building": {
        "primary_key": "BUILDING_ID",
        "load_mode": "FULL"
    },
    "load_equipment": {
        "primary_key": "EQUIPMENT_ID",
        "load_mode": "FULL"
    },
    "meter_readings": {
        "primary_key": "READING_ID",
        "load_mode": "INCREMENTAL"
    },
    "peak_events": {
        "primary_key": "EVENT_ID",
        "load_mode": "FULL"
    },
    "load_schedule": {
        "primary_key": "SCHEDULE_ID",
        "load_mode": "FULL"
    },
    "occupancy_schedule": {
        "primary_key": "OCCUPANCY_ID",
        "load_mode": "FULL"
    },
    "comfort_rules": {
        "primary_key": "RULE_ID",
        "load_mode": "FULL"
    },
    "peak_config": {
        "primary_key": "CONFIG_ID",
        "load_mode": "FULL"
    },
    "override_log": {
        "primary_key": "OVERRIDE_ID",
        "load_mode": "INCREMENTAL"
    }
}


def get_table_config(table_name):
    config = TABLE_CONFIG.get(table_name.lower())

    if config is None:
        raise ValueError(f"Unsupported ETL table: {table_name}")

    return config
