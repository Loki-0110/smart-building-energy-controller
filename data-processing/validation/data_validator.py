
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Any
from zoneinfo import ZoneInfo


INDIA_TIMEZONE = ZoneInfo("Asia/Kolkata")


def normalize_timestamp(value: str) -> str:
    """
    Normalize timestamps to UTC for comparison.

    Timezone-naive timestamps are interpreted as IST
    because the simulator generates IST timestamps.
    """

    parsed = datetime.fromisoformat(
        str(value).replace("Z", "+00:00")
    )

    parsed = parsed.replace(microsecond=0)

    if parsed.tzinfo is None:
        parsed = parsed.replace(
            tzinfo=INDIA_TIMEZONE
        )

    parsed = parsed.astimezone(timezone.utc)

    return parsed.isoformat()


def validate_readings(
    readings: list[dict[str, Any]],
    existing_readings: list[dict[str, Any]] | None = None
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:

    valid = []
    rejected = []

    seen_batch = set()
    existing = set()

    # Collect existing database records.
    for row in existing_readings or []:

        try:
            key = (
                int(row["buildingId"]),
                normalize_timestamp(
                    row["readingTimestamp"]
                )
            )

            existing.add(key)

        except (
            KeyError,
            TypeError,
            ValueError
        ):
            continue

    # Validate generated records.
    for row in readings:

        reason = None

        try:

            building_id = int(row["buildingId"])

            timestamp = normalize_timestamp(
                row["readingTimestamp"]
            )

            demand = Decimal(
                str(row["demandKw"])
            )

            source = str(
                row.get("sourceName", "")
            ).strip()

            quality = str(
                row.get("dataQualityStatus", "")
            ).strip()

            if building_id <= 0:
                reason = "Building ID must be positive"

            elif not demand.is_finite() or demand < 0:
                reason = "Demand must be finite and non-negative"

            elif not source:
                reason = "Source name is required"

            elif len(source) > 50:
                reason = "Source name exceeds 50 characters"

            elif not quality:
                reason = "Data quality status is required"

            elif len(quality) > 30:
                reason = "Data quality status exceeds 30 characters"

            key = (building_id, timestamp)

            # Check duplicate records within this batch.
            if reason is None and key in seen_batch:
                reason = "Duplicate timestamp in generated batch"

            # Check records already stored in the database.
            if reason is None and key in existing:
                reason = "Reading already exists in database"

            if reason is None:

                seen_batch.add(key)
                valid.append(row)

            else:

                rejected.append({
                    **row,
                    "rejectionReason": reason
                })

        except (
            KeyError,
            TypeError,
            ValueError,
            InvalidOperation
        ) as exc:

            rejected.append({
                **row,
                "rejectionReason": f"Invalid reading: {exc}"
            })

    return valid, rejected
