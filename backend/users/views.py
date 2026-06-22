"""
Users views — authentication, registration, and user management.
"""

import logging
from datetime import datetime, timedelta

from django.db.models import Count, Q
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import User, WellnessCheckIn, CounsellingAppointment
from .serializers import (
    LoginSerializer, UserSerializer, StudentRegistrationSerializer,
    ChangePasswordSerializer, WellnessCheckInSerializer,
    CounsellingAppointmentSerializer, AppointmentCreateSerializer,
    CounsellorCreateSerializer, UserUpdateSerializer
)
from screening.models import ScreeningResult

logger = logging.getLogger(__name__)


# ─── Authentication ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """POST /api/auth/login/ — Authenticate and return token"""
    serializer = LoginSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.validated_data['user']
    token, _ = Token.objects.get_or_create(user=user)

    logger.info("User %s logged in (role: %s).", user.username, user.role)

    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def student_register(request):
    """POST /api/auth/register/student/ — Student self-registration"""
    serializer = StudentRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)

    logger.info("New student registered: %s", user.username)

    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
        'message': 'Registration successful! Welcome to MiNaP.'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/ — Revoke current auth token"""
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    logger.info("User %s logged out.", request.user.username)
    return Response({'detail': 'Successfully logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """GET /api/auth/me/ — Get current user profile"""
    return Response(UserSerializer(request.user).data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """PUT/PATCH /api/auth/profile/ — Update own profile"""
    serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """POST /api/auth/change-password/"""
    serializer = ChangePasswordSerializer(
        data=request.data, context={'request': request}
    )
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(serializer.validated_data['new_password'])
    request.user.save()

    # Rotate token
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    new_token, _ = Token.objects.get_or_create(user=request.user)

    return Response({
        'detail': 'Password changed successfully.',
        'token': new_token.key,
    })


# ─── Student Dashboard ────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    """GET /api/student/dashboard/ — Student dashboard summary"""
    if not request.user.is_student:
        return Response(
            {'detail': 'Access denied. Students only.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Get all screening history for this student
    all_screenings = ScreeningResult.objects.filter(
        trainee_session__student=request.user
    ).select_related('trainee_session').order_by('-created_at')
    
    # Get total count
    total_screenings = all_screenings.count()
    
    # Get recent screenings for display
    screenings = all_screenings[:10]

    # Get severity trend
    severity_counts = {}
    severity_timeline = []
    for s in screenings:
        severity_counts[s.severity] = severity_counts.get(s.severity, 0) + 1
        severity_timeline.append({
            'date': s.created_at.date().isoformat(),
            'severity': s.severity,
            'pcl5_score': s.pcl5_score
        })

    # Wellness check-ins (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    wellness_data = WellnessCheckIn.objects.filter(
        student=request.user,
        created_at__gte=thirty_days_ago
    ).order_by('-created_at')[:30]

    # Appointments
    upcoming_appointments = CounsellingAppointment.objects.filter(
        student=request.user,
        preferred_date__gte=datetime.now().date(),
        status__in=['requested', 'confirmed']
    ).order_by('preferred_date', 'preferred_time')[:5]

    recent_appointments = CounsellingAppointment.objects.filter(
        student=request.user
    ).order_by('-created_at')[:5]

    # Recommendations based on latest screening
    latest_screening = screenings.first()
    recommendations = _get_recommendations(latest_screening) if latest_screening else []

    return Response({
        'total_screenings': total_screenings,
        'severity_distribution': severity_counts,
        'severity_timeline': list(reversed(severity_timeline)),
        'latest_screening': {
            'date': latest_screening.created_at.isoformat() if latest_screening else None,
            'severity': latest_screening.severity if latest_screening else None,
            'pcl5_score': latest_screening.pcl5_score if latest_screening else None,
        } if latest_screening else None,
        'wellness_checkins_count': wellness_data.count(),
        'recent_wellness': WellnessCheckInSerializer(wellness_data, many=True).data,
        'upcoming_appointments': CounsellingAppointmentSerializer(upcoming_appointments, many=True).data,
        'recent_appointments': CounsellingAppointmentSerializer(recent_appointments, many=True).data,
        'recommendations': recommendations,
    })


def _get_recommendations(screening):
    """Generate personalized recommendations based on screening results"""
    recommendations = []
    
    if screening.severity in ['severe', 'critical']:
        recommendations.append({
            'type': 'urgent',
            'title': 'Professional Support Recommended',
            'message': 'Your recent screening indicates you may benefit from professional support. Please book a counselling appointment.',
            'action': 'book_appointment'
        })
    
    if screening.cluster_arousal_reactivity > 15:
        recommendations.append({
            'type': 'tip',
            'title': 'Manage Arousal & Reactivity',
            'message': 'Try deep breathing exercises and progressive muscle relaxation.',
            'action': 'view_resources'
        })
    
    if screening.cluster_intrusion > 12:
        recommendations.append({
            'type': 'tip',
            'title': 'Coping with Intrusive Thoughts',
            'message': 'Grounding techniques can help manage intrusive memories.',
            'action': 'view_resources'
        })
    
    recommendations.append({
        'type': 'info',
        'title': 'Track Your Progress',
        'message': 'Daily wellness check-ins help you monitor your mental health journey.',
        'action': 'checkin'
    })
    
    return recommendations


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_screening_history(request):
    """GET /api/student/screenings/ — Student's screening history"""
    if not request.user.is_student:
        return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    screenings = ScreeningResult.objects.filter(
        trainee_session__student=request.user
    ).select_related('trainee_session').order_by('-created_at')

    from screening.serializers import ScreeningResultSerializer
    paginator = PageNumberPagination()
    paginator.page_size = 10
    page = paginator.paginate_queryset(screenings, request)
    serializer = ScreeningResultSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# ─── Wellness Check-ins ───────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wellness_checkin_list(request):
    """GET/POST /api/student/wellness/"""
    if not request.user.is_student:
        return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        checkins = WellnessCheckIn.objects.filter(student=request.user).order_by('-created_at')[:30]
        serializer = WellnessCheckInSerializer(checkins, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = WellnessCheckInSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(student=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─── Appointments ─────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointment_list(request):
    """GET/POST /api/student/appointments/"""
    if not request.user.is_student:
        return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        appointments = CounsellingAppointment.objects.filter(
            student=request.user
        ).order_by('-preferred_date', '-preferred_time')
        serializer = CounsellingAppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AppointmentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(student=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def appointment_detail(request, pk):
    """GET/PATCH/DELETE /api/student/appointments/<pk>/"""
    try:
        appointment = CounsellingAppointment.objects.get(pk=pk)
    except CounsellingAppointment.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Students can only access their own appointments
    if request.user.is_student and appointment.student != request.user:
        return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = CounsellingAppointmentSerializer(appointment)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        # Students can cancel, counsellors can update status/notes
        if request.user.is_student:
            allowed_fields = {'status': 'cancelled'}
            data = {k: v for k, v in request.data.items() if k in allowed_fields}
        else:
            data = request.data
        
        serializer = CounsellingAppointmentSerializer(
            appointment, data=data, partial=True
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    elif request.method == 'DELETE':
        if not request.user.is_student or appointment.student != request.user:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        appointment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Admin: User Management (CRUD) ────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """GET/POST /api/admin/users/ — List all users or create new user"""
    if request.method == 'GET':
        role = request.query_params.get('role')
        queryset = User.objects.all().order_by('-created_at')
        
        if role:
            queryset = queryset.filter(role=role)
        
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    elif request.method == 'POST':
        role = request.data.get('role')
        
        if role == 'student':
            serializer = StudentRegistrationSerializer(data=request.data)
        elif role == 'counsellor':
            serializer = CounsellorCreateSerializer(data=request.data)
        else:
            return Response(
                {'detail': 'Invalid role. Must be student or counsellor.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_user_detail(request, pk):
    """GET/PUT/PATCH/DELETE /api/admin/users/<pk>/ — Manage individual user"""
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(UserSerializer(user).data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = UserUpdateSerializer(user, data=request.data, partial=(request.method == 'PATCH'))
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(UserSerializer(user).data)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """GET /api/admin/dashboard/ — Admin analytics dashboard"""
    total_students = User.objects.filter(role='student').count()
    total_counsellors = User.objects.filter(role='counsellor').count()
    total_screenings = ScreeningResult.objects.count()
    
    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_students = User.objects.filter(
        role='student',
        created_at__gte=thirty_days_ago
    ).count()

    # Appointment statistics
    pending_appointments = CounsellingAppointment.objects.filter(status='requested').count()
    total_appointments = CounsellingAppointment.objects.count()

    # Severity distribution
    severity_dist = ScreeningResult.objects.values('severity').annotate(count=Count('id'))

    # Active users (logged in last 7 days)
    from django.contrib.sessions.models import Session
    from datetime import datetime
    active_sessions = Session.objects.filter(
        expire_date__gte=datetime.now()
    ).count()

    return Response({
        'total_students': total_students,
        'total_counsellors': total_counsellors,
        'total_screenings': total_screenings,
        'recent_student_registrations': recent_students,
        'pending_appointments': pending_appointments,
        'total_appointments': total_appointments,
        'severity_distribution': list(severity_dist),
        'active_sessions': active_sessions,
    })
