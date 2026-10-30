import re
from typing import Optional, Tuple

def format_inr_lpa(amount_lpa: Optional[float]) -> str:
    """Format salary number in Lakhs Per Annum (LPA) representation."""
    if amount_lpa is None:
        return "Not Disclosed"
    return f"₹{amount_lpa:.1f} LPA"

def clean_text(text: str) -> str:
    """Clean and normalize raw text for NLP & regex parsing."""
    if not text:
        return ""
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Normalize whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def calculate_growth_rate(current: float, previous: float) -> float:
    """Calculate percentage growth rate between two periods with smoothing."""
    denom = max(previous, 1.0)
    return round(((current - previous) / denom) * 100.0, 2)
