"""
Users app serializers — authentication and user management.
"""

from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User, WellnessCheckIn, CounsellingAppointment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'department', 'programme', 'year_of_study', 'gender', 'phone_number',
            'specialization', 'license_number', 'date_of_birth',
            'allow_longitudinal_tracking', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False)
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 'password_confirm',
            'first_name', 'last_name', 'student_id', 'department',
            'programme', 'year_of_study', 'gender', 'phone_number',
            'emergency_contact', 'date_of_birth', 'allow_longitudinal_tracking'
        ]

    def validate(self, data):
        # Accept either password2 or password_confirm
        password_confirm = data.pop('password2', None) or data.pop('password_confirm', None)
        
        if password_confirm and data['password'] != password_confirm:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
        
        if data.get('student_id') and User.objects.filter(student_id=data['student_id']).exists():
            raise serializers.ValidationError({"student_id": "This student ID is already registered."})
        
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['role'] = 'student'
        user = User.objects.create_user(password=password, **validated_data)
        return user


class CounsellorCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'department', 'specialization', 'license_number', 'phone_number'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['role'] = 'counsellor'
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'department', 'programme', 'year_of_study', 'gender',
            'emergency_contact', 'date_of_birth', 'allow_longitudinal_tracking',
            'specialization', 'license_number'
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            username=data['username'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please try again.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class WellnessCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessCheckIn
        fields = ['id', 'mood', 'stress_level', 'sleep_quality', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class CounsellingAppointmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    counsellor_name = serializers.CharField(source='counsellor.get_full_name', read_only=True)

    class Meta:
        model = CounsellingAppointment
        fields = [
            'id', 'student', 'student_name', 'counsellor', 'counsellor_name',
            'preferred_date', 'preferred_time', 'reason', 'status',
            'counsellor_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'student_name', 'counsellor_name']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounsellingAppointment
        fields = ['preferred_date', 'preferred_time', 'reason']
