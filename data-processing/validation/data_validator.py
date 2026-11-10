def validate_readings(df):

    valid_readings = df[
        (df["demandKw"] > 0) &
        (df["demandKw"] <= 500)
    ].copy()

    valid_readings["dataQualityStatus"] = "VALID"

    return valid_readings