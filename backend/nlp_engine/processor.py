"""
MiNaP NLP Engine
Processes optional free-text narrative inputs from trainees.

Three functions:
  1. Sentiment analysis — detects emotional valence (-1.0 to 1.0)
  2. Keyword extraction — identifies trauma-relevant terms (TF-IDF + lexicon)
  3. Crisis detection — regex lexicon for self-harm / suicidal ideation language

All processing is server-side. Raw text is NEVER persisted.
Only derived signals (sentiment_score, trauma_flag, crisis_flag) are stored.

Language support: English and Kiswahili
"""

import re
import logging
from typing import NamedTuple

logger = logging.getLogger(__name__)


# ─── Lexicons ─────────────────────────────────────────────────────────────────

# Trauma-relevant keywords (English + Kiswahili)
TRAUMA_KEYWORDS_EN = [
    'accident', 'assault', 'abuse', 'attack', 'violence', 'rape', 'death',
    'loss', 'grief', 'flashback', 'nightmare', 'trauma', 'disaster', 'fire',
    'flood', 'robbery', 'shooting', 'explosion', 'injury', 'hospital',
    'funeral', 'murder', 'kidnap', 'torture', 'war', 'conflict',
]

TRAUMA_KEYWORDS_SW = [
    'ajali', 'shambulio', 'unyanyasaji', 'kifo', 'msiba', 'ndoto mbaya',
    'majonzi', 'hasara', 'maumivu', 'vita', 'moto', 'mafuriko', 'wizi',
    'kupigwa', 'kuteswa', 'hospitali', 'mazishi', 'mauaji', 'utekaji',
]

TRAUMA_KEYWORDS = set(TRAUMA_KEYWORDS_EN + TRAUMA_KEYWORDS_SW)

# Crisis / self-harm keywords (English + Kiswahili)
# These trigger an immediate high-priority counsellor alert
CRISIS_PATTERNS_EN = [
    r'\bkill\s+myself\b', r'\bsuicide\b', r'\bsuicidal\b',
    r'\bend\s+my\s+life\b', r'\bwant\s+to\s+die\b', r'\bno\s+reason\s+to\s+live\b',
    r'\bself.?harm\b', r'\bcut\s+myself\b', r'\boverdose\b',
    r'\bhang\s+myself\b', r'\bjump\s+off\b', r'\bdon.t\s+want\s+to\s+live\b',
    r'\bwish\s+i\s+was\s+dead\b', r'\bbetter\s+off\s+dead\b',
]

CRISIS_PATTERNS_SW = [
    r'\bjiua\b', r'\bkujiua\b', r'\bkumaliza\s+maisha\b',
    r'\bsitaki\s+kuishi\b', r'\bkujidhuru\b', r'\bkujikata\b',
    r'\bkujiua\s+nafsi\b', r'\bmaisha\s+hayana\s+maana\b',
]

CRISIS_PATTERNS = [re.compile(p, re.IGNORECASE) for p in CRISIS_PATTERNS_EN + CRISIS_PATTERNS_SW]

# Negative sentiment word lists for lightweight scoring
NEGATIVE_WORDS_EN = [
    'hopeless', 'worthless', 'helpless', 'terrified', 'scared', 'afraid',
    'depressed', 'anxious', 'panic', 'numb', 'empty', 'broken', 'lost',
    'alone', 'isolated', 'trapped', 'overwhelmed', 'exhausted', 'suffering',
    'pain', 'hurt', 'angry', 'rage', 'hate', 'fear', 'shame', 'guilt',
    'nightmare', 'flashback', 'haunted', 'disturbed', 'distressed',
]

NEGATIVE_WORDS_SW = [
    'huzuni', 'wasiwasi', 'hofu', 'maumivu', 'upweke', 'kukata tamaa',
    'uchovu', 'hasira', 'aibu', 'hatia', 'kuteseka', 'kuumia',
]

POSITIVE_WORDS_EN = [
    'hope', 'better', 'improving', 'support', 'helped', 'grateful',
    'recovering', 'healing', 'strong', 'okay', 'fine', 'good',
]

POSITIVE_WORDS_SW = [
    'tumaini', 'nafuu', 'msaada', 'shukrani', 'nguvu', 'sawa',
]

NEGATIVE_WORDS = set(NEGATIVE_WORDS_EN + NEGATIVE_WORDS_SW)
POSITIVE_WORDS = set(POSITIVE_WORDS_EN + POSITIVE_WORDS_SW)


# ─── Result type ──────────────────────────────────────────────────────────────

class NLPAnalysisResult(NamedTuple):
    sentiment_score: float      # -1.0 to 1.0
    trauma_flag: bool
    crisis_flag: bool
    detected_keywords: list     # trauma keywords found


# ─── Core processor ───────────────────────────────────────────────────────────

def analyse_narrative(text: str) -> NLPAnalysisResult:
    """
    Analyse a free-text narrative and return derived NLP signals.

    Processing steps:
      1. Crisis detection (regex lexicon) — highest priority
      2. Trauma keyword extraction (lexicon matching)
      3. Sentiment scoring (lexicon-based, lightweight)

    No external API calls or model downloads required.
    Falls back gracefully if text is empty.
    """
    if not text or not text.strip():
        return NLPAnalysisResult(
            sentiment_score=0.0,
            trauma_flag=False,
            crisis_flag=False,
            detected_keywords=[],
        )

    text_clean = text.strip()

    # 1. Crisis detection
    crisis_flag = _detect_crisis(text_clean)

    # 2. Trauma keyword extraction
    trauma_flag, detected_keywords = _extract_trauma_keywords(text_clean)

    # 3. Sentiment scoring
    sentiment_score = _compute_sentiment(text_clean)

    # If crisis detected, push sentiment to most negative
    if crisis_flag:
        sentiment_score = -1.0

    logger.debug(
        "NLP result — sentiment=%.2f trauma=%s crisis=%s keywords=%s",
        sentiment_score, trauma_flag, crisis_flag, detected_keywords
    )

    return NLPAnalysisResult(
        sentiment_score=round(sentiment_score, 4),
        trauma_flag=trauma_flag,
        crisis_flag=crisis_flag,
        detected_keywords=detected_keywords,
    )


def _detect_crisis(text: str) -> bool:
    """Return True if any crisis pattern matches the text."""
    for pattern in CRISIS_PATTERNS:
        if pattern.search(text):
            return True
    return False


def _extract_trauma_keywords(text: str) -> tuple[bool, list]:
    """
    Return (trauma_flag, list_of_matched_keywords).
    Uses simple word-boundary matching against the trauma lexicon.
    """
    text_lower = text.lower()
    found = []
    for keyword in TRAUMA_KEYWORDS:
        # Word boundary match
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            found.append(keyword)
    return bool(found), found


def _compute_sentiment(text: str) -> float:
    """
    Lightweight lexicon-based sentiment scoring.
    Returns a score in [-1.0, 1.0].

    Positive words contribute +1, negative words contribute -1.
    Score is normalised by total word count.
    """
    words = re.findall(r'\b\w+\b', text.lower())
    if not words:
        return 0.0

    score = 0
    for word in words:
        if word in NEGATIVE_WORDS:
            score -= 1
        elif word in POSITIVE_WORDS:
            score += 1

    # Normalise to [-1, 1]
    normalised = score / max(len(words), 1)
    return max(-1.0, min(1.0, normalised * 5))  # amplify signal
