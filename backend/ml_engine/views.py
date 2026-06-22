"""
ML Engine views — exposes a training trigger endpoint for admin use.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status


@api_view(['POST'])
@permission_classes([IsAdminUser])
def trigger_training(request):
    """
    POST /api/ml/train/
    Triggers the SEMMA training pipeline (admin only).
    Accepts optional 'csv_path' in request body.
    """
    try:
        from ml_engine.training import run_pipeline
        csv_path = request.data.get('csv_path', None)
        report = run_pipeline(csv_path)
        return Response({'status': 'success', 'report': report})
    except Exception as exc:
        return Response(
            {'status': 'error', 'detail': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
