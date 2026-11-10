
import pandas as pd


def validate_readings(df):

    # Work on a copy so the original data remains unchanged.
    data = df.copy()

    # Store validation reasons for every record.
    data["validation_reason"] = ""

    # 1. Check missing values.
    missing_mask = (
        data["reading_timestamp"].isna() |
        data["demand_kw"].isna()
    )

    data.loc[missing_mask, "validation_reason"] += "Missing value; "

    # 2. Validate demand data type.
    data["demand_kw"] = pd.to_numeric(
        data["demand_kw"],
        errors="coerce"
    )

    invalid_type_mask = (
        data["demand_kw"].isna() &
        ~missing_mask
    )

    data.loc[invalid_type_mask, "validation_reason"] += (
        "Invalid demand format; "
    )

    # 3. Validate demand range.
    invalid_demand_mask = (
        data["demand_kw"].notna() &
        (
            (data["demand_kw"] <= 0) |
            (data["demand_kw"] > 500)
        )
    )

    data.loc[invalid_demand_mask, "validation_reason"] += (
        "Demand outside allowed range; "
    )

    # 4. Validate timestamps.
    data["parsed_timestamp"] = pd.to_datetime(
        data["reading_timestamp"],
        errors="coerce"
    )

    invalid_timestamp_mask = data["parsed_timestamp"].isna()

    data.loc[invalid_timestamp_mask, "validation_reason"] += (
        "Invalid timestamp; "
    )

    # Reject future timestamps.
    current_time = pd.Timestamp.now()

    future_mask = (
        data["parsed_timestamp"].notna() &
        (data["parsed_timestamp"] > current_time)
    )

    data.loc[future_mask, "validation_reason"] += (
        "Future timestamp; "
    )

    # 5. Check duplicate timestamps.
    duplicate_mask = (
        data["parsed_timestamp"].notna() &
        data["parsed_timestamp"].duplicated(keep="first")
    )

    data.loc[duplicate_mask, "validation_reason"] += (
        "Duplicate timestamp; "
    )

    # 6. Separate valid and rejected records.
    rejected_mask = data["validation_reason"] != ""

    valid_readings = data.loc[~rejected_mask].copy()
    rejected_readings = data.loc[rejected_mask].copy()

    # 7. Assign quality status.
    valid_readings["data_quality_status"] = "VALID"
    rejected_readings["data_quality_status"] = "INVALID"

    # Remove internal validation columns from valid API records.
    valid_readings = valid_readings.drop(
        columns=["validation_reason", "parsed_timestamp"]
    )

    # 8. Generate quality report.
    report = {
        "total": len(data),
        "missing": int(missing_mask.sum()),
        "invalid_demand": int(
            (invalid_type_mask | invalid_demand_mask).sum()
        ),
        "invalid_timestamp": int(
            (invalid_timestamp_mask | future_mask).sum()
        ),
        "duplicates": int(duplicate_mask.sum()),
        "valid": len(valid_readings),
        "rejected": len(rejected_readings)
    }

    return valid_readings, rejected_readings, report
