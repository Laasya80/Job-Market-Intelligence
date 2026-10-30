import pytest
from app.services.salary_parser import SalaryParser, salary_parser

def test_lpa_ranges():
    s_min, s_max, curr, period = salary_parser.parse_salary("₹8.5 - ₹14.0 LPA")
    assert s_min == 8.5
    assert s_max == 14.0
    assert curr == "INR"

def test_lakhs_variations():
    s_min, s_max, _, _ = salary_parser.parse_salary("10 to 18 Lakhs")
    assert s_min == 10.0
    assert s_max == 18.0

    s_min, s_max, _, _ = salary_parser.parse_salary("12-16 Lacs")
    assert s_min == 12.0
    assert s_max == 16.0

def test_single_lpa():
    s_min, s_max, _, _ = salary_parser.parse_salary("15 LPA")
    assert s_min == 15.0
    assert s_max == 15.0

def test_up_to_and_min_bounds():
    s_min, s_max, _, _ = salary_parser.parse_salary("Up to 25 LPA")
    assert s_min is None
    assert s_max == 25.0

    s_min, s_max, _, _ = salary_parser.parse_salary("Min 12 Lakhs")
    assert s_min == 12.0
    assert s_max is None

def test_absolute_rupees():
    # 600,000 to 1,200,000 -> 6.0 to 12.0 LPA
    s_min, s_max, _, _ = salary_parser.parse_salary("₹ 6,00,000 - ₹ 12,00,000")
    assert s_min == 6.0
    assert s_max == 12.0

    s_min, s_max, _, _ = salary_parser.parse_salary("800000 - 1500000 INR")
    assert s_min == 8.0
    assert s_max == 15.0

def test_monthly_conversion():
    # 50,000 / month -> 6.0 LPA
    s_min, s_max, _, _ = salary_parser.parse_salary("₹50,000 / month")
    assert s_min == 6.0
    assert s_max == 6.0

def test_numeric_lpa_input():
    s_min, s_max, _, _ = salary_parser.parse_salary(12.5)
    assert s_min == 12.5
    assert s_max == 12.5

    s_min, s_max, _, _ = salary_parser.parse_salary(1500000)
    assert s_min == 15.0
    assert s_max == 15.0

def test_undisclosed_and_empty():
    undisclosed = ["Not Disclosed", "Competitive", "Best in industry", "NA", "null", "", None]
    for val in undisclosed:
        s_min, s_max, _, _ = salary_parser.parse_salary(val)
        assert s_min is None
        assert s_max is None
