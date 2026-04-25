from typing import Dict, List

from app.models.vendor import Vendor

PRICE_WEIGHT = 0.4
DELIVERY_WEIGHT = 0.3
RATING_WEIGHT = 0.3
HIGH_DELIVERY_PENALTY_THRESHOLD = 10
HIGH_DELIVERY_PENALTY_MULTIPLIER = 0.8

def _min_max_normalize(values: List[float], reverse: bool = False) -> List[float]:
    """
    Min-max normalization to [0, 1].
    reverse=True makes lower values better (for price and delivery).
    Handles edge cases like same values.
    """
    if not values:
        return []

    min_val = min(values)
    max_val = max(values)

    if max_val == min_val:
        # If all values are equal, assign a neutral perfect score.
        return [1.0 for _ in values]

    normalized = [(value - min_val) / (max_val - min_val) for value in values]
    if reverse:
        normalized = [1.0 - value for value in normalized]
    return normalized

def rank_vendors(vendors: List[Vendor]) -> List[Dict]:
    if not vendors:
        return []

    # Handle missing data by using safe defaults if somehow None appears,
    # though our schema requires them.
    prices = [float(vendor.price) if vendor.price is not None else 0.0 for vendor in vendors]
    deliveries = [float(vendor.delivery_days) if vendor.delivery_days is not None else 0.0 for vendor in vendors]
    ratings = [float(vendor.rating) if vendor.rating is not None else 0.0 for vendor in vendors]

    price_scores = _min_max_normalize(prices, reverse=True)
    delivery_scores = _min_max_normalize(deliveries, reverse=True)
    rating_scores = _min_max_normalize(ratings, reverse=False)

    ranked = []
    for idx, vendor in enumerate(vendors):
        score = (
            (price_scores[idx] * PRICE_WEIGHT)
            + (delivery_scores[idx] * DELIVERY_WEIGHT)
            + (rating_scores[idx] * RATING_WEIGHT)
        )

        # Advanced Logic: Penalize vendors with very high delivery time
        if deliveries[idx] > HIGH_DELIVERY_PENALTY_THRESHOLD:
            score *= HIGH_DELIVERY_PENALTY_MULTIPLIER

        ranked.append({"vendor": vendor, "score": round(score, 4)})

    ranked.sort(key=lambda item: item["score"], reverse=True)
    return ranked
