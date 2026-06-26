"""
Imara SEMMA ML Training Pipeline
Implements the full SEMMA (Sample, Explore, Modify, Model, Assess) pipeline
for training the PTSD severity classifier.

Run from the backend directory:
    python -m ml_engine.training

This script:
  1. Loads survey data (CSV or generates synthetic data for development)
  2. Explores distributions and computes cluster scores
  3. Preprocesses, encodes labels, applies SMOTE for class balance
  4. Trains Random Forest + Logistic Regression with cross-validation
  5. Evaluates on holdout test set (accuracy, F1, confusion matrix, ROC-AUC)
  6. Serialises the best model, scaler, and label encoder with joblib
"""

import os
import sys
import logging
import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAINED_MODELS_DIR = os.path.join(BASE_DIR, '..', 'trained_models')
os.makedirs(TRAINED_MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(TRAINED_MODELS_DIR, 'ptsd_classifier.joblib')
SCALER_PATH = os.path.join(TRAINED_MODELS_DIR, 'scaler.joblib')
ENCODER_PATH = os.path.join(TRAINED_MODELS_DIR, 'label_encoder.joblib')
REPORT_PATH = os.path.join(TRAINED_MODELS_DIR, 'evaluation_report.txt')


# ─── PHASE 1: SAMPLE ──────────────────────────────────────────────────────────

def load_or_generate_data(csv_path: str = None) -> pd.DataFrame:
    """
    Load survey data from CSV or generate synthetic data for development.

    Expected CSV columns:
      pcl5_item_1 … pcl5_item_20  (0-4 each)
      dts_score                   (0-136)
      gender, department          (categorical, optional)

    Synthetic data is generated when no CSV is provided, using realistic
    distributions based on published PTSD prevalence research.
    """
    if csv_path and os.path.exists(csv_path):
        logger.info("Loading survey data from %s", csv_path)
        df = pd.read_csv(csv_path)
        logger.info("Loaded %d records.", len(df))
        return df

    logger.warning("No CSV found — generating synthetic training data for development.")
    return _generate_synthetic_data(n_samples=300)


def _generate_synthetic_data(n_samples: int = 300) -> pd.DataFrame:
    """
    Generate synthetic PCL-5 + DTS data with realistic severity distribution.
    Distribution approximates Kenyan polytechnic PTSD prevalence literature:
      Minimal ~35%, Mild ~25%, Moderate ~20%, Severe ~12%, Critical ~8%
    """
    rng = np.random.default_rng(42)

    # Severity proportions
    severity_dist = {
        'minimal':  0.35,
        'mild':     0.25,
        'moderate': 0.20,
        'severe':   0.12,
        'critical': 0.08,
    }

    # PCL-5 score ranges per severity band
    score_ranges = {
        'minimal':  (0, 19),
        'mild':     (20, 31),
        'moderate': (32, 43),
        'severe':   (44, 59),
        'critical': (60, 80),
    }

    records = []
    for severity, proportion in severity_dist.items():
        n = int(n_samples * proportion)
        low, high = score_ranges[severity]

        for _ in range(n):
            total = rng.integers(low, high + 1)
            # Distribute total across 20 items (0-4 each)
            items = _distribute_score(rng, total, n_items=20, max_per_item=4)
            dts = int(rng.integers(0, 137))
            records.append({
                **{f'pcl5_item_{i+1}': items[i] for i in range(20)},
                'dts_score': dts,
                'severity_label': severity,
            })

    df = pd.DataFrame(records)
    logger.info("Generated %d synthetic records.", len(df))
    return df


def _distribute_score(rng, total: int, n_items: int, max_per_item: int) -> list:
    """Distribute a total score across n_items with max_per_item cap."""
    items = [0] * n_items
    remaining = total
    indices = list(range(n_items))
    rng.shuffle(indices)
    for idx in indices:
        val = min(rng.integers(0, max_per_item + 1), remaining)
        items[idx] = int(val)
        remaining -= val
        if remaining <= 0:
            break
    return items


# ─── PHASE 2: EXPLORE ─────────────────────────────────────────────────────────

def explore_data(df: pd.DataFrame) -> None:
    """Log descriptive statistics and distribution summaries."""
    logger.info("=== PHASE 2: EXPLORE ===")

    pcl5_cols = [f'pcl5_item_{i}' for i in range(1, 21)]
    available = [c for c in pcl5_cols if c in df.columns]

    if available:
        df['pcl5_total'] = df[available].sum(axis=1)
        logger.info("PCL-5 total — mean: %.1f, std: %.1f, min: %d, max: %d",
                    df['pcl5_total'].mean(), df['pcl5_total'].std(),
                    df['pcl5_total'].min(), df['pcl5_total'].max())

    if 'severity_label' in df.columns:
        logger.info("Severity distribution:\n%s", df['severity_label'].value_counts().to_string())

    missing = df.isnull().sum()
    if missing.any():
        logger.info("Missing values:\n%s", missing[missing > 0].to_string())


# ─── PHASE 3: MODIFY ──────────────────────────────────────────────────────────

def preprocess(df: pd.DataFrame) -> tuple:
    """
    Feature engineering, imputation, scaling, label encoding, SMOTE.
    Returns (X_train, X_test, y_train, y_test, scaler, label_encoder).
    """
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import MinMaxScaler, LabelEncoder
    from sklearn.impute import SimpleImputer

    logger.info("=== PHASE 3: MODIFY ===")

    pcl5_cols = [f'pcl5_item_{i}' for i in range(1, 21)]
    available_pcl5 = [c for c in pcl5_cols if c in df.columns]

    # Compute cluster sub-scores
    df['cluster_intrusion'] = df[[f'pcl5_item_{i}' for i in range(1, 6) if f'pcl5_item_{i}' in df.columns]].sum(axis=1)
    df['cluster_avoidance'] = df[[f'pcl5_item_{i}' for i in range(6, 8) if f'pcl5_item_{i}' in df.columns]].sum(axis=1)
    df['cluster_cognition_mood'] = df[[f'pcl5_item_{i}' for i in range(8, 15) if f'pcl5_item_{i}' in df.columns]].sum(axis=1)
    df['cluster_arousal_reactivity'] = df[[f'pcl5_item_{i}' for i in range(15, 21) if f'pcl5_item_{i}' in df.columns]].sum(axis=1)
    df['pcl5_total'] = df[available_pcl5].sum(axis=1)

    feature_cols = [
        'pcl5_total',
        'cluster_intrusion',
        'cluster_avoidance',
        'cluster_cognition_mood',
        'cluster_arousal_reactivity',
        'dts_score',
    ]
    # Add NLP features if present
    for col in ['sentiment_score', 'trauma_flag', 'crisis_flag']:
        if col in df.columns:
            feature_cols.append(col)

    X = df[feature_cols].copy()
    y_raw = df['severity_label'] if 'severity_label' in df.columns else _score_to_label(df['pcl5_total'])

    # Median imputation for missing values
    imputer = SimpleImputer(strategy='median')
    X_imputed = imputer.fit_transform(X)

    # Label encoding
    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    logger.info("Classes: %s", list(le.classes_))

    # Train/test split (80/20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X_imputed, y, test_size=0.2, random_state=42, stratify=y
    )

    # Min-max scaling
    scaler = MinMaxScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # SMOTE for class imbalance (applied only to training set)
    try:
        from imblearn.over_sampling import SMOTE
        smote = SMOTE(random_state=42, k_neighbors=min(3, _min_class_count(y_train) - 1))
        X_train, y_train = smote.fit_resample(X_train, y_train)
        logger.info("SMOTE applied — training set size: %d", len(y_train))
    except ImportError:
        logger.warning("imbalanced-learn not installed — skipping SMOTE.")
    except Exception as exc:
        logger.warning("SMOTE failed (%s) — proceeding without oversampling.", exc)

    return X_train, X_test, y_train, y_test, scaler, le


def _score_to_label(scores: pd.Series) -> pd.Series:
    """Map PCL-5 total scores to severity labels."""
    def _map(s):
        if s <= 19:
            return 'minimal'
        elif s <= 31:
            return 'mild'
        elif s <= 43:
            return 'moderate'
        elif s <= 59:
            return 'severe'
        return 'critical'
    return scores.apply(_map)


def _min_class_count(y) -> int:
    unique, counts = np.unique(y, return_counts=True)
    return int(counts.min())


# ─── PHASE 4: MODEL ───────────────────────────────────────────────────────────

def train_models(X_train, y_train) -> dict:
    """
    Train Random Forest (primary) and Logistic Regression (baseline).
    Uses GridSearchCV with stratified 5-fold cross-validation.
    """
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import GridSearchCV, StratifiedKFold

    logger.info("=== PHASE 4: MODEL ===")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # Random Forest with hyperparameter tuning
    rf_params = {
        'n_estimators': [100],
        'max_depth': [None, 10],
        'min_samples_leaf': [1, 2],
    }
    rf = GridSearchCV(
        RandomForestClassifier(random_state=42, class_weight='balanced'),
        rf_params, cv=cv, scoring='f1_macro', n_jobs=1, verbose=0
    )
    rf.fit(X_train, y_train)
    logger.info("Random Forest best params: %s", rf.best_params_)
    logger.info("Random Forest CV F1-macro: %.4f", rf.best_score_)

    # Logistic Regression baseline
    lr = LogisticRegression(
        max_iter=1000, random_state=42, class_weight='balanced'
    )
    lr.fit(X_train, y_train)

    return {'random_forest': rf.best_estimator_, 'logistic_regression': lr}


# ─── PHASE 5: ASSESS ──────────────────────────────────────────────────────────

def evaluate_models(models: dict, X_test, y_test, label_encoder) -> str:
    """
    Evaluate both models on the holdout test set.
    Returns a formatted evaluation report string.
    """
    from sklearn.metrics import (
        classification_report, confusion_matrix, accuracy_score, roc_auc_score
    )

    logger.info("=== PHASE 5: ASSESS ===")
    report_lines = ["Imara PTSD Classifier — Evaluation Report", "=" * 50]
    classes = label_encoder.classes_

    best_model_name = None
    best_f1 = -1.0

    for name, model in models.items():
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, target_names=classes)
        cm = confusion_matrix(y_test, y_pred)

        report_lines.append(f"\n--- {name.upper()} ---")
        report_lines.append(f"Accuracy: {acc:.4f}")
        report_lines.append(report)
        report_lines.append(f"Confusion Matrix:\n{cm}")

        # ROC-AUC (one-vs-rest)
        try:
            y_prob = model.predict_proba(X_test)
            auc = roc_auc_score(y_test, y_prob, multi_class='ovr', average='macro')
            report_lines.append(f"ROC-AUC (macro OvR): {auc:.4f}")
        except Exception:
            pass

        # Track best model by macro F1
        from sklearn.metrics import f1_score
        f1 = f1_score(y_test, y_pred, average='macro')
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

        logger.info("%s — Accuracy: %.4f", name, acc)

    report_lines.append(f"\nBest model: {best_model_name} (F1-macro: {best_f1:.4f})")
    full_report = "\n".join(report_lines)
    logger.info(full_report)
    return full_report, best_model_name


def save_artifacts(models: dict, best_model_name: str, scaler, label_encoder, report: str):
    """Serialise the best model, scaler, and label encoder with joblib."""
    import joblib

    best_model = models[best_model_name]
    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)

    with open(REPORT_PATH, 'w') as f:
        f.write(report)

    logger.info("Model saved to %s", MODEL_PATH)
    logger.info("Scaler saved to %s", SCALER_PATH)
    logger.info("Label encoder saved to %s", ENCODER_PATH)
    logger.info("Evaluation report saved to %s", REPORT_PATH)


# ─── Main ─────────────────────────────────────────────────────────────────────

def run_pipeline(csv_path: str = None):
    """Execute the full SEMMA pipeline."""
    logger.info("Starting Imara SEMMA Training Pipeline")

    # Phase 1: Sample
    df = load_or_generate_data(csv_path)

    # Phase 2: Explore
    explore_data(df)

    # Phase 3: Modify
    X_train, X_test, y_train, y_test, scaler, le = preprocess(df)

    # Phase 4: Model
    models = train_models(X_train, y_train)

    # Phase 5: Assess
    report, best_model_name = evaluate_models(models, X_test, y_test, le)

    # Save artifacts
    save_artifacts(models, best_model_name, scaler, le, report)

    logger.info("Pipeline complete.")
    return report


if __name__ == '__main__':
    csv_path = sys.argv[1] if len(sys.argv) > 1 else None
    run_pipeline(csv_path)
