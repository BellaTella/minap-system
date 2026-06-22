"""
MiNaP ML Engine — PTSD Severity Classifier
Implements the SEMMA-trained Random Forest model for real-time severity prediction.

Severity bands (PCL-5 total score):
  Minimal  : 0–19
  Mild     : 20–31
  Moderate : 32–43
  Severe   : 44–59
  Critical : 60–80
"""

import os
import logging
import numpy as np

logger = logging.getLogger(__name__)

# Severity label mapping (matches training label encoding)
SEVERITY_LABELS = ['minimal', 'mild', 'moderate', 'severe', 'critical']

# Rule-based fallback thresholds (PCL-5 total score)
PCL5_THRESHOLDS = {
    'minimal':  (0, 19),
    'mild':     (20, 31),
    'moderate': (32, 43),
    'severe':   (44, 59),
    'critical': (60, 80),
}


def rule_based_severity(pcl5_score: int) -> tuple[str, float]:
    """
    Deterministic rule-based severity classification using PCL-5 score bands.
    Used as fallback when the ML model is not available.

    Returns (severity_label, confidence) where confidence is 1.0 for rule-based.
    """
    for label, (low, high) in PCL5_THRESHOLDS.items():
        if low <= pcl5_score <= high:
            return label, 1.0
    # Edge case: clamp to critical if above 80
    return 'critical', 1.0


def build_feature_vector(
    pcl5_score: int,
    cluster_intrusion: int,
    cluster_avoidance: int,
    cluster_cognition_mood: int,
    cluster_arousal_reactivity: int,
    dts_score: int,
    sentiment_score: float = 0.0,
    trauma_flag: bool = False,
    crisis_flag: bool = False,
) -> np.ndarray:
    """
    Assembles the feature vector passed to the ML model.
    Feature order must match the training pipeline exactly.

    Features (9 total):
      0: pcl5_score (0-80)
      1: cluster_intrusion (0-20)
      2: cluster_avoidance (0-8)
      3: cluster_cognition_mood (0-28)
      4: cluster_arousal_reactivity (0-24)
      5: dts_score (0-136)
      6: sentiment_score (-1.0 to 1.0)
      7: trauma_flag (0 or 1)
      8: crisis_flag (0 or 1)
    """
    return np.array([[
        pcl5_score,
        cluster_intrusion,
        cluster_avoidance,
        cluster_cognition_mood,
        cluster_arousal_reactivity,
        dts_score,
        sentiment_score,
        int(trauma_flag),
        int(crisis_flag),
    ]], dtype=float)


class PTSDClassifier:
    """
    Wraps the joblib-serialised Random Forest model.
    Falls back to rule-based classification if the model file is not found.
    """

    _instance = None  # Singleton — loaded once at startup

    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self._loaded = False
        self._load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self):
        """Load the trained model, scaler, and label encoder from disk."""
        try:
            import joblib
            from django.conf import settings

            model_path = str(settings.TRAINED_MODEL_PATH)
            scaler_path = str(settings.SCALER_PATH)
            encoder_path = str(settings.LABEL_ENCODER_PATH)

            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logger.info("ML model loaded from %s", model_path)
            else:
                logger.warning(
                    "Model file not found at %s — using rule-based fallback.", model_path
                )
                return

            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)

            if os.path.exists(encoder_path):
                self.label_encoder = joblib.load(encoder_path)

            self._loaded = True

        except Exception as exc:
            logger.error("Failed to load ML model: %s", exc)

    def predict(
        self,
        pcl5_score: int,
        cluster_intrusion: int,
        cluster_avoidance: int,
        cluster_cognition_mood: int,
        cluster_arousal_reactivity: int,
        dts_score: int,
        sentiment_score: float = 0.0,
        trauma_flag: bool = False,
        crisis_flag: bool = False,
    ) -> dict:
        """
        Predict PTSD severity and return a structured result dict.

        Returns:
            {
                'severity': str,           # e.g. 'moderate'
                'confidence': float,       # 0.0–1.0
                'probabilities': dict,     # per-class probabilities
                'method': str,             # 'ml_model' or 'rule_based'
            }
        """
        # Crisis flag always overrides to critical regardless of score
        if crisis_flag:
            return {
                'severity': 'critical',
                'confidence': 1.0,
                'probabilities': {l: 0.0 for l in SEVERITY_LABELS},
                'method': 'crisis_override',
            }

        if self._loaded and self.model is not None:
            try:
                features = build_feature_vector(
                    pcl5_score, cluster_intrusion, cluster_avoidance,
                    cluster_cognition_mood, cluster_arousal_reactivity,
                    dts_score, sentiment_score, trauma_flag, crisis_flag
                )

                if self.scaler is not None:
                    features = self.scaler.transform(features)

                predicted_class = self.model.predict(features)[0]
                probabilities = self.model.predict_proba(features)[0]

                # Decode label if encoder is available
                if self.label_encoder is not None:
                    severity = self.label_encoder.inverse_transform([predicted_class])[0]
                    classes = self.label_encoder.classes_
                else:
                    severity = SEVERITY_LABELS[int(predicted_class)]
                    classes = SEVERITY_LABELS

                prob_dict = {
                    str(cls): float(prob)
                    for cls, prob in zip(classes, probabilities)
                }
                confidence = float(max(probabilities))

                return {
                    'severity': severity,
                    'confidence': confidence,
                    'probabilities': prob_dict,
                    'method': 'ml_model',
                }

            except Exception as exc:
                logger.error("ML prediction failed: %s — falling back to rule-based.", exc)

        # Rule-based fallback
        severity, confidence = rule_based_severity(pcl5_score)
        return {
            'severity': severity,
            'confidence': confidence,
            'probabilities': {l: 0.0 for l in SEVERITY_LABELS},
            'method': 'rule_based',
        }
