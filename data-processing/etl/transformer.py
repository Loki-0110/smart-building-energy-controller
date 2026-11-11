
from datetime import datetime, date
from decimal import Decimal


BOOLEAN_COLUMNS = {
    "IS_CRITICAL",
    "IS_CONTROLLABLE",
    "IS_ACTIVE"
}


def transform_record(record):
    """
    Normalize MySQL values for Snowflake.
    """

    transformed = {}

    for column, value in record.items():
        column = column.upper()

        if value is None:
            transformed[column] = None

        elif column in BOOLEAN_COLUMNS:
            transformed[column] = bool(value)

        elif isinstance(value, (datetime, date)):
            transformed[column] = value

        elif isinstance(value, Decimal):
            transformed[column] = value

        else:
            transformed[column] = value

    return transformed


def transform_records(records):
    return [transform_record(record) for record in records]
