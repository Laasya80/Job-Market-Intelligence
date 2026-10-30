import re
from typing import Optional, Tuple, Any

class SalaryParser:
    """Enterprise parser standardizing diverse compensation strings and numbers into normalized LPA (Lakhs Per Annum)."""

    def parse_salary(self, salary_input: Any) -> Tuple[Optional[float], Optional[float], str, str]:
        """
        Extracts (salary_min_lpa, salary_max_lpa, currency, period).
        Normalizes values to LPA (Lakhs Per Annum) in INR.
        """
        if salary_input is None:
            return None, None, "INR", "Annual"

        # 1. Numeric inputs
        if isinstance(salary_input, (int, float)):
            val = float(salary_input)
            if val <= 0:
                return None, None, "INR", "Annual"
            # If large absolute INR amount (e.g. 1,200,000 -> 12.0 LPA)
            if val >= 100000:
                val = val / 100000.0
            return round(val, 2), round(val, 2), "INR", "Annual"

        text = str(salary_input).strip()
        if not text:
            return None, None, "INR", "Annual"

        text_lower = text.lower()
        undisclosed_terms = ["not disclosed", "competitive", "na", "null", "none", "best in industry", "as per industry", "as per company norms", "undisclosed"]
        if any(term in text_lower for term in undisclosed_terms):
            return None, None, "INR", "Annual"

        # 2. Monthly format check (e.g. "₹50,000 - ₹80,000 / month" or "75000 per month")
        is_monthly = "month" in text_lower or "/pm" in text_lower or "p.m" in text_lower
        
        # 3. LPA Range e.g. "8.5 - 14.0 LPA", "₹ 10 to ₹ 18 Lakhs", "6-10 Lacs"
        lpa_range_match = re.search(
            r"₹?\s*(\d+(?:\.\d+)?)\s*(?:-|to)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lacs?|l\b)",
            text,
            re.IGNORECASE
        )
        if lpa_range_match:
            min_v = float(lpa_range_match.group(1))
            max_v = float(lpa_range_match.group(2))
            min_final, max_final = min(min_v, max_v), max(min_v, max_v)
            return round(min_final, 2), round(max_final, 2), "INR", "Annual"

        # 4. Single LPA with prefix e.g. "Up to 25 LPA", "Max 18 Lakhs"
        max_lpa_match = re.search(r"(?:up\s+to|max|upto)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lacs?|l\b)", text, re.IGNORECASE)
        if max_lpa_match:
            max_v = float(max_lpa_match.group(1))
            return None, round(max_v, 2), "INR", "Annual"

        min_lpa_match = re.search(r"(?:from|min|minimum)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lacs?|l\b)", text, re.IGNORECASE)
        if min_lpa_match:
            min_v = float(min_lpa_match.group(1))
            return round(min_v, 2), None, "INR", "Annual"

        # 5. Single LPA value e.g. "12 LPA", "₹9.5 Lakhs"
        single_lpa_match = re.search(r"₹?\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|lacs?|l\b)", text, re.IGNORECASE)
        if single_lpa_match:
            val = float(single_lpa_match.group(1))
            return round(val, 2), round(val, 2), "INR", "Annual"

        # 6. Absolute INR range with commas e.g. "₹ 6,00,000 - ₹ 12,00,000", "800000 - 1500000"
        abs_range_match = re.search(r"₹?\s*([\d,]+)\s*(?:-|to)\s*₹?\s*([\d,]+)", text)
        if abs_range_match:
            min_str = abs_range_match.group(1).replace(",", "")
            max_str = abs_range_match.group(2).replace(",", "")
            try:
                min_v = float(min_str)
                max_v = float(max_str)
                if is_monthly:
                    min_v = (min_v * 12.0)
                    max_v = (max_v * 12.0)
                if min_v >= 10000:
                    min_v /= 100000.0
                if max_v >= 10000:
                    max_v /= 100000.0
                min_final, max_final = min(min_v, max_v), max(min_v, max_v)
                return round(min_final, 2), round(max_final, 2), "INR", "Annual"
            except ValueError:
                pass

        # 7. Single absolute amount fallback e.g. "12,00,000 / year" or "60000 / month"
        nums = re.findall(r"[\d,]+(?:\.\d+)?", text)
        clean_nums = []
        for n in nums:
            cleaned = n.replace(",", "")
            try:
                clean_nums.append(float(cleaned))
            except ValueError:
                continue

        if len(clean_nums) >= 2:
            v1, v2 = clean_nums[0], clean_nums[1]
            if is_monthly:
                v1 *= 12.0
                v2 *= 12.0
            if v1 >= 10000: v1 /= 100000.0
            if v2 >= 10000: v2 /= 100000.0
            return round(min(v1, v2), 2), round(max(v1, v2), 2), "INR", "Annual"
        elif len(clean_nums) == 1:
            v = clean_nums[0]
            if is_monthly:
                v *= 12.0
            if v >= 10000: v /= 100000.0
            return round(v, 2), round(v, 2), "INR", "Annual"

        return None, None, "INR", "Annual"

salary_parser = SalaryParser()
