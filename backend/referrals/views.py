"""
Referrals views — counsellor case management.

GET  /api/referrals/           — list all referrals (counsellors)
GET  /api/referrals/<id>/      — referral detail
POST /api/referrals/<id>/update/ — update status, notes, follow-up date
"""

import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Referral
from .serializers import ReferralSerializer, ReferralUpdateSerializer

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_referrals(request):
    """
    GET /api/referrals/
    Returns paginated referrals. Supports filtering by status and severity.
    """
    queryset = Referral.objects.select_related(
        'screening', 'screening__trainee_session', 'counsellor'
    ).all()

    # Filter by status
    ref_status = request.query_params.get('status')
    if ref_status:
        queryset = queryset.filter(status=ref_status)

    # Filter by severity
    severity = request.query_params.get('severity')
    if severity:
        queryset = queryset.filter(screening__severity=severity)

    # Filter by assigned counsellor
    counsellor_id = request.query_params.get('counsellor')
    if counsellor_id:
        queryset = queryset.filter(counsellor_id=counsellor_id)

    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(queryset, request)
    serializer = ReferralSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_detail(request, pk):
    """GET /api/referrals/<pk>/"""
    try:
        referral = Referral.objects.select_related(
            'screening', 'screening__trainee_session', 'counsellor'
        ).get(pk=pk)
    except Referral.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ReferralSerializer(referral)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_referral(request, pk):
    """
    POST /api/referrals/<pk>/update/
    Allows counsellors to update case status, notes, and follow-up date.
    """
    try:
        referral = Referral.objects.get(pk=pk)
    except Referral.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ReferralUpdateSerializer(referral, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    logger.info(
        "Referral #%s updated by %s — status: %s",
        pk, request.user.username, referral.status
    )
    return Response(ReferralSerializer(referral).data)
