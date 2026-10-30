import re
from typing import Dict, List, Tuple, Optional

CANONICAL_ROLES = [
    "Data Analyst",
    "Data Scientist",
    "Data Engineer",
    "ML Engineer",
    "BI Developer",
    "Software Engineer"
]

DEFAULT_ROLE_PATTERNS: List[Tuple[str, List[str]]] = [
    ("Data Analyst", [
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal|associate|staff)?\s*data\s+analyst\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead)?\s*business\s+data\s+analyst\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead)?\s*reporting\s+analyst\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead)?\s*product\s+analyst\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead)?\s*operations\s+analyst\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead)?\s*marketing\s+analyst\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead)?\s*financial\s+data\s+analyst\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead)?\s*quantitative\s+analyst\b",
        r"\banalytics\s+consultant\b",
        r"\bdata\s+insights\s+analyst\b"
    ]),
    ("Data Scientist", [
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal|chief|associate|applied|staff)?\s*data\s+scientist\b",
        r"\bapplied\s+scientist\b",
        r"\bdecision\s+scientist\b",
        r"\bresearch\s+scientist\b",
        r"\bnlp\s+scientist\b",
        r"\bai\s+research\s+scientist\b",
        r"\bstatistical\s+modeler\b"
    ]),
    ("Data Engineer", [
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal|staff)?\s*data\s+engineer\b",
        r"\bbig\s+data\s+engineer\b",
        r"\bdata\s+pipeline\s+engineer\b",
        r"\betl\s+developer\b",
        r"\betl\s+engineer\b",
        r"\bdata\s+warehouse\s+engineer\b",
        r"\bdata\s+warehouse\s+architect\b",
        r"\bdata\s+platform\s+engineer\b",
        r"\bcloud\s+data\s+engineer\b",
        r"\banalytics\s+engineer\b"
    ]),
    ("ML Engineer", [
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal|staff)?\s*machine\s+learning\s+engineer\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal|staff)?\s*ml\s+engineer\b",
        r"\bai/ml\s+engineer\b",
        r"\bai\s+engineer\b",
        r"\bdeep\s+learning\s+engineer\b",
        r"\bmlops\s+engineer\b",
        r"\bnlp\s+engineer\b",
        r"\bcomputer\s+vision\s+engineer\b",
        r"\bgenerative\s+ai\s+engineer\b",
        r"\bgenai\s+engineer\b"
    ]),
    ("BI Developer", [
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal)?\s*bi\s+developer\b",
        r"\bbusiness\s+intelligence\s+developer\b",
        r"\bpower\s*bi\s+developer\b",
        r"\bpower\s*bi\s+specialist\b",
        r"\btableau\s+developer\b",
        r"\btableau\s+specialist\b",
        r"\bbi\s+engineer\b",
        r"\bbusiness\s+intelligence\s+analyst\b",
        r"\bdashboard\s+developer\b",
        r"\blooker\s+developer\b"
    ]),
    ("Software Engineer", [
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal|staff)?\s*software\s+engineer\b",
        r"\b(?:jr\.?|sr\.?|senior|junior|lead|principal|staff)?\s*software\s+developer\b",
        r"\bfull\s*stack\s+developer\b",
        r"\bfull\s*stack\s+engineer\b",
        r"\bbackend\s+developer\b",
        r"\bbackend\s+engineer\b",
        r"\bfrontend\s+developer\b",
        r"\bfrontend\s+engineer\b",
        r"\bpython\s+developer\b",
        r"\bjava\s+developer\b",
        r"\bapplication\s+developer\b",
        r"\bsde\s*(?:i|ii|iii|1|2|3)?\b"
    ])
]

class RoleNormalizer:
    """Configurable normalization engine mapping messy, non-standard job titles to canonical roles."""

    def __init__(self, custom_rules: Optional[List[Tuple[str, List[str]]]] = None):
        self.rules = custom_rules.copy() if custom_rules else DEFAULT_ROLE_PATTERNS.copy()
        self._compiled_rules = []
        self._compile_rules()

    def _compile_rules(self) -> None:
        self._compiled_rules = []
        for canonical, patterns in self.rules:
            compiled = [re.compile(p, re.IGNORECASE) for p in patterns]
            self._compiled_rules.append((canonical, compiled))

    def add_rule(self, canonical_role: str, pattern: str) -> None:
        """Add a custom regex rule for a canonical role with high priority."""
        found = False
        for idx, (canonical, patterns) in enumerate(self.rules):
            if canonical.lower() == canonical_role.lower():
                patterns.insert(0, pattern)
                found = True
                break
        if not found:
            self.rules.insert(0, (canonical_role, [pattern]))
        self._compile_rules()

    def normalize(self, raw_title: str) -> str:
        """Map raw job title string to canonical role name."""
        if not raw_title or not isinstance(raw_title, str):
            return "Software Engineer"

        title_clean = raw_title.strip()

        # 1. Regex Pattern Matching
        for canonical, patterns in self._compiled_rules:
            for pattern in patterns:
                if pattern.search(title_clean):
                    return canonical

        # 2. Heuristic Keyword Fallback Matching
        title_lower = title_clean.lower()
        if "data analyst" in title_lower or "business analyst" in title_lower or "reporting analyst" in title_lower:
            return "Data Analyst"
        elif "scientist" in title_lower:
            return "Data Scientist"
        elif "pipeline" in title_lower or "etl" in title_lower or "warehouse" in title_lower or "data platform" in title_lower:
            return "Data Engineer"
        elif "learning" in title_lower or "mlops" in title_lower or "ai engineer" in title_lower:
            return "ML Engineer"
        elif "power bi" in title_lower or "tableau" in title_lower or "bi developer" in title_lower:
            return "BI Developer"
        elif "engineer" in title_lower or "developer" in title_lower or "programmer" in title_lower or "sde" in title_lower:
            return "Software Engineer"

        return "Data Analyst"

role_normalizer = RoleNormalizer()
