#!/usr/bin/env python3
"""Self-test for the quarter-lag rule in check_data.py. Run: python3 scripts/test_check_data.py"""
import datetime as dt
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from check_data import quarter_index, quarter_overdue, REPORT_LAG_OVERRIDE

D = dt.date.fromisoformat
Q2_2026 = quarter_index("Q2 2026")


class QuarterLag(unittest.TestCase):
    def test_overdue_mid_november(self):
        self.assertTrue(quarter_overdue(Q2_2026, D("2026-11-14")))

    def test_not_overdue_in_reporting_window(self):
        self.assertFalse(quarter_overdue(Q2_2026, D("2026-10-20")))

    def test_boundary(self):  # Q3 ends 2026-09-30; overdue strictly after 40 days
        self.assertFalse(quarter_overdue(Q2_2026, D("2026-11-09")))
        self.assertTrue(quarter_overdue(Q2_2026, D("2026-11-10")))

    def test_year_rollover(self):  # Q4 2025 latest -> Q1 2026 ended 2026-03-31
        self.assertFalse(quarter_overdue(quarter_index("Q4 2025"), D("2026-05-01")))
        self.assertTrue(quarter_overdue(quarter_index("Q4 2025"), D("2026-05-15")))
        self.assertTrue(quarter_overdue(quarter_index("Q3 2025"), D("2026-02-15")))  # Q4 ends 12-31
        self.assertFalse(quarter_overdue(quarter_index("Q3 2025"), D("2026-02-05")))

    def test_yinson_exception(self):
        lag = REPORT_LAG_OVERRIDE["Yinson Holdings"]
        self.assertFalse(quarter_overdue(Q2_2026, D("2026-11-14"), lag))  # Q3 (Aug-Oct) not out yet
        self.assertFalse(quarter_overdue(Q2_2026, D("2026-12-20"), lag))  # published in December
        self.assertTrue(quarter_overdue(Q2_2026, D("2027-01-05"), lag))   # clearly late


if __name__ == "__main__":
    unittest.main()
