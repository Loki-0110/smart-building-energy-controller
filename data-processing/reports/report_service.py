
import csv
from pathlib import Path
from typing import Any

from config.settings import REJECTED_REPORT


def save_rejected_readings(
    rows: list[dict[str, Any]],
    path: Path = REJECTED_REPORT
) -> Path:

    path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    fields = [
        "buildingId",
        "readingTimestamp",
        "demandKw",
        "sourceName",
        "dataQualityStatus",
        "rejectionReason"
    ]

    with path.open(
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fields,
            extrasaction="ignore"
        )

        writer.writeheader()
        writer.writerows(rows)

    return path
