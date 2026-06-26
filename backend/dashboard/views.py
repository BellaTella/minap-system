"""
Dashboard views — counsellor analytics and case overview.

GET /api/dashboard/summary/     — aggregate statistics
GET /api/dashboard/cases/       — paginated case list with referral status
GET /api/dashboard/alerts/      — high-priority (severe/critical) unresolved cases
"""

import logging
from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from screening.models import ScreeningResult
from referrals.models import Referral
from screening.serializers import ScreeningResultSerializer
from users.permissions import IsCounsellorOrAdmin

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsCounsellorOrAdmin])
def dashboard_summary(request):
    """
    GET /api/dashboard/summary/
    Returns aggregate statistics for the counsellor dashboard.
    Includes severity distribution, referral counts, and trend data.
    """
    # Date range — default last 30 days
    days = int(request.query_params.get('days', 30))
    since = timezone.now() - timedelta(days=days)

    total_screenings = ScreeningResult.objects.count()
    recent_screenings = ScreeningResult.objects.filter(created_at__gte=since).count()

    # Severity distribution (all time)
    severity_dist = (
        ScreeningResult.objects
        .values('severity')
        .annotate(count=Count('id'))
        .order_by('severity')
    )

    # Referral status breakdown
    referral_stats = (
        Referral.objects
        .values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )

    # High-priority unresolved cases
    high_priority_count = Referral.objects.filter(
        screening__severity__in=['severe', 'critical'],
        status__in=['pending', 'in_progress']
    ).count()

    # Crisis alerts (NLP-detected)
    crisis_count = 0
    try:
        from nlp_engine.models import NLPResult
        crisis_count = NLPResult.objects.filter(crisis_flag=True).count()
    except Exception:
        pass

    # Daily screening trend (last 7 days)
    trend = []
    for i in range(6, -1, -1):
        day = timezone.now().date() - timedelta(days=i)
        count = ScreeningResult.objects.filter(created_at__date=day).count()
        trend.append({'date': str(day), 'count': count})

    return Response({
        'total_screenings': total_screenings,
        'recent_screenings': recent_screenings,
        'period_days': days,
        'severity_distribution': list(severity_dist),
        'referral_status': list(referral_stats),
        'high_priority_unresolved': high_priority_count,
        'crisis_alerts_total': crisis_count,
        'daily_trend': trend,
    })


@api_view(['GET'])
@permission_classes([IsCounsellorOrAdmin])
def case_list(request):
    """
    GET /api/dashboard/cases/
    Returns paginated cases with referral status for the counsellor dashboard.
    Supports filtering by severity, referral status, and date range.
    """
    queryset = ScreeningResult.objects.select_related(
        'trainee_session', 'referral'
    ).prefetch_related('nlp_result').all()

    # Filters
    severity = request.query_params.get('severity')
    if severity:
        queryset = queryset.filter(severity=severity)

    ref_status = request.query_params.get('referral_status')
    if ref_status:
        queryset = queryset.filter(referral__status=ref_status)

    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)

    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(queryset, request)

    # Build enriched case data
    cases = []
    for result in page:
        case = ScreeningResultSerializer(result).data
        case['department'] = result.trainee_session.department
        case['gender'] = result.trainee_session.gender

        # Referral info
        try:
            ref = result.referral
            case['referral'] = {
                'id': ref.pk,
                'status': ref.status,
                'follow_up_date': str(ref.follow_up_date) if ref.follow_up_date else None,
                'counsellor': ref.counsellor.get_full_name() if ref.counsellor else None,
            }
        except Referral.DoesNotExist:
            case['referral'] = None

        # Crisis flag
        try:
            case['crisis_flag'] = result.nlp_result.crisis_flag
        except Exception:
            case['crisis_flag'] = False

        cases.append(case)

    return paginator.get_paginated_response(cases)


@api_view(['GET'])
@permission_classes([IsCounsellorOrAdmin])
def high_priority_alerts(request):
    """
    GET /api/dashboard/alerts/
    Returns unresolved severe and critical cases requiring immediate attention.
    """
    alerts = Referral.objects.filter(
        screening__severity__in=['severe', 'critical'],
        status__in=['pending', 'in_progress']
    ).select_related('screening', 'screening__trainee_session', 'counsellor').order_by(
        '-screening__created_at'
    )

    data = []
    for ref in alerts:
        s = ref.screening
        data.append({
            'referral_id': ref.pk,
            'screening_id': s.pk,
            'severity': s.severity,
            'pcl5_score': s.pcl5_score,
            'department': s.trainee_session.department,
            'gender': s.trainee_session.gender,
            'referral_status': ref.status,
            'created_at': s.created_at.isoformat(),
            'counsellor': ref.counsellor.get_full_name() if ref.counsellor else 'Unassigned',
        })

    return Response({'count': len(data), 'alerts': data})
