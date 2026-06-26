"""
Custom DRF permission classes.
"""

from rest_framework.permissions import BasePermission


class IsCounsellorOrAdmin(BasePermission):
    """Allow access only to counselling staff (counsellor role) or admins/staff."""

    message = 'Only counselling staff can access this resource.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, 'role', None) in ('counsellor', 'admin') or user.is_staff)
        )
