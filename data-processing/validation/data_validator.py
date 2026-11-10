
import pandas as pd


def validate_readings(df):

    # Work on a copy so the original data remains unchanged
    data = df.copy()

    # Store validation reasons for every record
    data["validationReason"] = ""

    # 1. Check missing values   
    missing_mask = (
        data["readingTimestamp"].isna() |
        data["demandKw"].isna()
    )

    data.loc[missing_mask, "validationReason"] += "Missing value; "

    # 2. Validate demand data type
    data["demandKw"] = pd.to_numeric(
        data["demandKw"],
        errors="coerce"
    )

    invalid_type_mask = (
        data["demandKw"].isna() &
        ~missing_mask
    )

    data.loc[invalid_type_mask, "validationReason"] += (
        "Invalid demand format; "
    )

    # 3. Validate demand range
    invalid_demand_mask = (
        data["demandKw"].notna() &
        (
            (data["demandKw"] <= 0) |
            (data["demandKw"] > 500)
        )
    )

    data.loc[invalid_demand_mask, "validationReason"] += (
        "Demand outside allowed range; "
    )

    # 4. Validate timestamps
    data["parsedTimestamp"] = pd.to_datetime(
        data["readingTimestamp"],
        errors="coerce"
    )

    invalid_timestamp_mask = data["parsedTimestamp"].isna()

    data.loc[invalid_timestamp_mask, "validationReason"] += (
        "Invalid timestamp; "
    )

    # Reject timestamps in the future
    future_mask = (
        data["parsedTimestamp"].notna() &
        (data["parsedTimestamp"] > pd.Timestamp.now())
    )

    data.loc[future_mask, "validationReason"] += (
        "Future timestamp; "
    )

    # 5. Check duplicate timestamps
    duplicate_mask = (
        data["parsedTimestamp"].notna() &
        data["parsedTimestamp"].duplicated(keep="first")
    )

    data.loc[duplicate_mask, "validationReason"] += (
        "Duplicate timestamp; "
    )

    # 6. Separate valid and rejected records
    rejected_mask = data["validationReason"] != ""

    valid_readings = data.loc[~rejected_mask].copy()
    rejected_readings = data.loc[rejected_mask].copy()

    # 7. Assign quality status
    valid_readings["dataQualityStatus"] = "VALID"
    rejected_readings["dataQualityStatus"] = "INVALID"

    # Remove internal validation column from valid API records
    valid_readings = valid_readings.drop(
        columns=["validationReason", "parsedTimestamp"]
    )

    # 8. Generate quality report
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
