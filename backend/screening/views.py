"""
Screening views — the core assessment submission pipeline.

POST /api/screening/submit/
  - Accepts PCL-5 + DTS responses from an authenticated trainee
  - Computes cluster scores
  - Runs NLP on optional narrative
  - Calls ML classifier for severity prediction
  - Creates TraineeSession + ScreeningResult + NLPResult
  - Triggers referral for moderate/severe/critical cases
  - Returns personalised feedback and psychoeducational content

GET /api/screening/results/
  - Returns paginated screening results (counsellors only)

GET /api/screening/results/<id>/
  - Returns a single screening result (counsellors only)
"""

import uuid
import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import TraineeSession, ScreeningResult
from .serializers import ScreeningSubmitSerializer, ScreeningResultSerializer
from users.permissions import IsCounsellorOrAdmin

logger = logging.getLogger(__name__)

# Severity levels that automatically trigger a counsellor referral
REFERRAL_TRIGGER_SEVERITIES = {'moderate', 'severe', 'critical'}

# ─── Psychoeducational feedback content ───────────────────────────────────────

FEEDBACK_CONTENT = {
    'minimal': {
        'en': {
            'headline': 'Your results suggest minimal PTSD symptoms.',
            'message': (
                'Your responses indicate that you are currently experiencing very few or no '
                'significant PTSD symptoms. This is a positive sign. Continue to take care of '
                'your mental wellbeing through healthy routines, social connection, and '
                'self-care practices.'
            ),
            'resources': [
                'Stress management techniques: deep breathing, mindfulness',
                'Imara Wellness Library — self-care resources',
                'Peer support groups on campus',
            ],
            'action': 'No immediate referral needed. Monitor your wellbeing regularly.',
        },
        'sw': {
            'headline': 'Matokeo yako yanaonyesha dalili ndogo sana za PTSD.',
            'message': (
                'Majibu yako yanaonyesha kuwa hivi sasa una dalili chache sana au hakuna '
                'dalili kubwa za PTSD. Hii ni ishara nzuri. Endelea kutunza afya yako ya '
                'akili kupitia mazoea mazuri, uhusiano wa kijamii, na kujitunza.'
            ),
            'resources': [
                'Mbinu za kudhibiti msongo: kupumua kwa kina, utulivu wa akili',
                'Maktaba ya Ustawi wa Imara — rasilimali za kujitunza',
                'Vikundi vya msaada wa wenzako shuleni',
            ],
            'action': 'Hakuna rufaa inayohitajika sasa hivi. Fuatilia ustawi wako mara kwa mara.',
        },
    },
    'mild': {
        'en': {
            'headline': 'Your results suggest mild PTSD symptoms.',
            'message': (
                'You are experiencing some PTSD symptoms that may be affecting your daily life. '
                'These are manageable with the right support. We encourage you to explore the '
                'self-help resources below and consider speaking with a counsellor if symptoms persist.'
            ),
            'resources': [
                'Grounding techniques for managing intrusive thoughts',
                'Sleep hygiene and relaxation exercises',
                'Imara psychoeducation library — understanding PTSD',
                'Optional: Book a voluntary counselling session',
            ],
            'action': 'Self-help resources provided. Voluntary counselling recommended.',
        },
        'sw': {
            'headline': 'Matokeo yako yanaonyesha dalili za wastani za PTSD.',
            'message': (
                'Unakabiliwa na baadhi ya dalili za PTSD ambazo zinaweza kuathiri maisha yako ya '
                'kila siku. Hizi zinaweza kudhibitiwa kwa msaada sahihi. Tunakuhimiza kuchunguza '
                'rasilimali za kujisaidia hapa chini na kuzingatia kuzungumza na mshauri ikiwa '
                'dalili zitaendelea.'
            ),
            'resources': [
                'Mbinu za kutuliza mawazo yanayosumbua',
                'Mazoea ya kulala vizuri na kupumzika',
                'Maktaba ya elimu ya afya ya akili ya Imara',
                'Hiari: Panga kikao cha ushauri wa hiari',
            ],
            'action': 'Rasilimali za kujisaidia zimetolewa. Ushauri wa hiari unapendekezwa.',
        },
    },
    'moderate': {
        'en': {
            'headline': 'Your results suggest moderate PTSD symptoms.',
            'message': (
                'Your responses indicate a moderate level of PTSD symptoms that are likely '
                'impacting your studies and daily functioning. We strongly recommend connecting '
                'with a counsellor. A referral has been sent to the Guidance and '
                'Counselling office on your behalf.'
            ),
            'resources': [
                'Cognitive Behavioural Therapy (CBT) self-help workbook',
                'Crisis support contacts: Guidance & Counselling Office',
                'Breathing and grounding exercises for immediate relief',
            ],
            'action': 'Referral sent to the Guidance & Counselling office.',
        },
        'sw': {
            'headline': 'Matokeo yako yanaonyesha dalili za wastani za PTSD.',
            'message': (
                'Majibu yako yanaonyesha kiwango cha wastani cha dalili za PTSD ambazo '
                'zinaweza kuathiri masomo yako na utendaji wa kila siku. Tunakushauri sana '
                'kuwasiliana na mshauri. Rufaa imetumwa kwa ofisi ya Mwongozo na '
                'Ushauri kwa niaba yako.'
            ),
            'resources': [
                'Kitabu cha kujisaidia cha Tiba ya Utambuzi na Tabia (CBT)',
                'Mawasiliano ya msaada wa dharura: Ofisi ya Mwongozo na Ushauri',
                'Mazoezi ya kupumua na kutuliza kwa msaada wa haraka',
            ],
            'action': 'Rufaa imetumwa kwa ofisi ya Mwongozo na Ushauri.',
        },
    },
    'severe': {
        'en': {
            'headline': 'Your results suggest severe PTSD symptoms.',
            'message': (
                'You are experiencing severe PTSD symptoms that require professional support. '
                'A referral has been automatically sent to the counselling team. '
                'Please reach out to the Guidance and Counselling office as soon as possible. '
                'You do not have to face this alone.'
            ),
            'resources': [
                'Guidance & Counselling Office — visit or call today',
                'Befrienders Kenya: 0800 723 253 (free, 24/7)',
                'Emergency contacts: Campus security, nearest health facility',
            ],
            'action': 'URGENT referral sent. Please contact the counselling office today.',
        },
        'sw': {
            'headline': 'Matokeo yako yanaonyesha dalili kali za PTSD.',
            'message': (
                'Unakabiliwa na dalili kali za PTSD ambazo zinahitaji msaada wa kitaalamu. '
                'Rufaa imetumwa kiotomatiki kwa timu ya ushauri. '
                'Tafadhali wasiliana na ofisi ya Mwongozo na Ushauri haraka iwezekanavyo. '
                'Huhitaji kukabiliana na hili peke yako.'
            ),
            'resources': [
                'Ofisi ya Mwongozo na Ushauri — tembelea au piga simu leo',
                'Befrienders Kenya: 0800 723 253 (bure, masaa 24/7)',
                'Mawasiliano ya dharura: Usalama wa chuo, kituo cha afya karibu nawe',
            ],
            'action': 'Rufaa ya HARAKA imetumwa. Tafadhali wasiliana na ofisi ya ushauri leo.',
        },
    },
    'critical': {
        'en': {
            'headline': 'Your results indicate critical PTSD symptoms requiring immediate support.',
            'message': (
                'Your responses indicate critical PTSD symptoms. This is a serious concern and '
                'you deserve immediate professional support. A high-priority alert has been sent '
                'to the counselling team. Please go to the Guidance and Counselling office '
                'now, or call the emergency contacts below.'
            ),
            'resources': [
                'Guidance & Counselling Office — go NOW',
                'Befrienders Kenya: 0800 723 253 (free, 24/7)',
                'Mathare Hospital Crisis Line: +254 20 2723 031',
                'Emergency services: 999 / 112',
            ],
            'action': 'HIGH-PRIORITY alert sent. Immediate counsellor contact required.',
        },
        'sw': {
            'headline': 'Matokeo yako yanaonyesha dalili za PTSD zinazohitaji msaada wa haraka.',
            'message': (
                'Majibu yako yanaonyesha dalili za PTSD za hali ya juu. Hii ni wasiwasi mkubwa '
                'na unastahili msaada wa kitaalamu wa haraka. Arifa ya kipaumbele cha juu '
                'imetumwa kwa timu ya ushauri. Tafadhali nenda ofisini kwa Mwongozo '
                'na Ushauri SASA HIVI, au piga simu mawasiliano ya dharura hapa chini.'
            ),
            'resources': [
                'Ofisi ya Mwongozo na Ushauri — nenda SASA',
                'Befrienders Kenya: 0800 723 253 (bure, masaa 24/7)',
                'Simu ya dharura ya Hospitali ya Mathare: +254 20 2723 031',
                'Huduma za dharura: 999 / 112',
            ],
            'action': 'Arifa ya KIPAUMBELE CHA JUU imetumwa. Mawasiliano ya haraka na mshauri yanahitajika.',
        },
    },
}


# ─── Views ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_screening(request):
    """
    POST /api/screening/submit/
    Full assessment submission pipeline — authenticated trainees only.
    """
    # Only trainees (students) may submit a screening
    if not (hasattr(request.user, 'role') and request.user.role == 'student'):
        return Response(
            {'detail': 'Only trainees can submit a screening.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = ScreeningSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    lang = request.data.get('language', 'en')
    if lang not in ('en', 'sw'):
        lang = 'en'

    try:
        # ── Step 1: Create trainee session linked to the logged-in student ────
        token = str(uuid.uuid4())
        student_user = request.user

        session = TraineeSession.objects.create(
            anonymous_token=token,
            student=student_user,
            consent=data['consent'],
            gender=data['gender'],
            department=data['department'],
            programme_duration=data.get('programme_duration', '1_year'),
        )

        # ── Step 2: Build ScreeningResult and compute cluster scores ──────────
        result = ScreeningResult(
            trainee_session=session,
            dts_score=data['dts_score'],
            narrative_text='',  # never persisted
            severity='minimal',  # placeholder, updated below
            prediction_confidence=0.0,
        )
        # Set PCL-5 item values
        for i in range(1, 21):
            setattr(result, f'pcl5_item_{i}', data[f'pcl5_item_{i}'])

        result.compute_cluster_scores()

        # ── Step 3: NLP analysis on narrative ────────────────────────────────
        narrative = data.get('narrative_text', '')
        nlp_result_data = _run_nlp(narrative)

        # ── Step 4: ML severity prediction ───────────────────────────────────
        prediction = _run_classifier(result, nlp_result_data)
        result.severity = prediction['severity']
        result.prediction_confidence = prediction['confidence']
        result.save()

        # ── Step 5: Save NLP result (raw text not stored) ─────────────────────
        _save_nlp_result(result, nlp_result_data)

        # ── Step 6: Trigger referral if needed ───────────────────────────────
        referral_created = False
        if result.severity in REFERRAL_TRIGGER_SEVERITIES:
            _create_referral(result)
            referral_created = True

        # ── Step 7: Build personalised feedback response ──────────────────────
        feedback = FEEDBACK_CONTENT.get(result.severity, FEEDBACK_CONTENT['minimal'])
        lang_feedback = feedback.get(lang, feedback['en'])

        response_data = {
            'session_token': token,
            'severity': result.severity,
            'pcl5_score': result.pcl5_score,
            'dts_score': result.dts_score,
            'cluster_scores': {
                'intrusion': result.cluster_intrusion,
                'avoidance': result.cluster_avoidance,
                'cognition_mood': result.cluster_cognition_mood,
                'arousal_reactivity': result.cluster_arousal_reactivity,
            },
            'prediction_confidence': round(result.prediction_confidence, 3),
            'prediction_method': prediction.get('method', 'rule_based'),
            'feedback': lang_feedback,
            'referral_triggered': referral_created,
            'crisis_alert': nlp_result_data.get('crisis_flag', False),
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as exc:
        logger.exception("Error processing screening submission: %s", exc)
        return Response(
            {'detail': 'An error occurred processing your submission. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsCounsellorOrAdmin])
def list_results(request):
    """
    GET /api/screening/results/
    Returns paginated screening results for authenticated counsellors.
    Supports filtering by severity and date range.
    """
    queryset = ScreeningResult.objects.select_related('trainee_session').all()

    # Filter by severity
    severity = request.query_params.get('severity')
    if severity:
        queryset = queryset.filter(severity=severity)

    # Filter by date range
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)

    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(queryset, request)
    serializer = ScreeningResultSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsCounsellorOrAdmin])
def result_detail(request, pk):
    """
    GET /api/screening/results/<pk>/
    Returns a single screening result with NLP data.
    """
    try:
        result = ScreeningResult.objects.select_related(
            'trainee_session', 'nlp_result'
        ).get(pk=pk)
    except ScreeningResult.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ScreeningResultSerializer(result)
    data = serializer.data

    # Include NLP result if available
    if hasattr(result, 'nlp_result'):
        nlp = result.nlp_result
        data['nlp'] = {
            'sentiment_score': nlp.sentiment_score,
            'trauma_flag': nlp.trauma_flag,
            'crisis_flag': nlp.crisis_flag,
            'detected_keywords': nlp.detected_keywords,
        }

    return Response(data)


# ─── Internal helpers ─────────────────────────────────────────────────────────

def _run_nlp(narrative: str) -> dict:
    """Run NLP analysis and return a dict of derived signals."""
    try:
        from nlp_engine.processor import analyse_narrative
        result = analyse_narrative(narrative)
        return {
            'sentiment_score': result.sentiment_score,
            'trauma_flag': result.trauma_flag,
            'crisis_flag': result.crisis_flag,
            'detected_keywords': result.detected_keywords,
        }
    except Exception as exc:
        logger.warning("NLP processing failed: %s", exc)
        return {
            'sentiment_score': 0.0,
            'trauma_flag': False,
            'crisis_flag': False,
            'detected_keywords': [],
        }


def _run_classifier(result: ScreeningResult, nlp_data: dict) -> dict:
    """Run the ML classifier and return prediction dict."""
    try:
        from ml_engine.classifier import PTSDClassifier
        classifier = PTSDClassifier.get_instance()
        return classifier.predict(
            pcl5_score=result.pcl5_score,
            cluster_intrusion=result.cluster_intrusion,
            cluster_avoidance=result.cluster_avoidance,
            cluster_cognition_mood=result.cluster_cognition_mood,
            cluster_arousal_reactivity=result.cluster_arousal_reactivity,
            dts_score=result.dts_score,
            sentiment_score=nlp_data.get('sentiment_score', 0.0),
            trauma_flag=nlp_data.get('trauma_flag', False),
            crisis_flag=nlp_data.get('crisis_flag', False),
        )
    except Exception as exc:
        logger.warning("ML classifier failed: %s — using rule-based fallback.", exc)
        from ml_engine.classifier import rule_based_severity
        severity, confidence = rule_based_severity(result.pcl5_score)
        return {'severity': severity, 'confidence': confidence, 'method': 'rule_based'}


def _save_nlp_result(screening_result: ScreeningResult, nlp_data: dict):
    """Persist derived NLP signals (raw text is never stored)."""
    try:
        from nlp_engine.models import NLPResult
        NLPResult.objects.create(
            screening=screening_result,
            sentiment_score=nlp_data.get('sentiment_score', 0.0),
            trauma_flag=nlp_data.get('trauma_flag', False),
            crisis_flag=nlp_data.get('crisis_flag', False),
            detected_keywords=','.join(nlp_data.get('detected_keywords', [])),
        )
    except Exception as exc:
        logger.warning("Failed to save NLP result: %s", exc)


def _create_referral(screening_result: ScreeningResult):
    """Create a pending referral record for moderate/severe/critical cases."""
    try:
        from referrals.models import Referral
        Referral.objects.get_or_create(
            screening=screening_result,
            defaults={'status': 'pending'},
        )
        logger.info(
            "Referral created for screening #%s (severity: %s)",
            screening_result.pk, screening_result.severity
        )
    except Exception as exc:
        logger.error("Failed to create referral: %s", exc)
