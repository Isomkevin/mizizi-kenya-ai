import hashlib
import json
from typing import Any


def canonical_hash(data: Any) -> str:
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def input_data_to_dict(input_data: list[dict[str, str]]) -> dict[str, str]:
    return {item["key"]: item["value"] for item in input_data if "key" in item and "value" in item}
