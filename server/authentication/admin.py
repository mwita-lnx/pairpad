from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'username', 'email', 'get_full_name', 'role', 'verification_status',
        'current_city', 'age_display', 'is_active', 'date_joined', 'has_personality_profile'
    ]
    list_filter = [
        'role', 'verification_status', 'gender', 'smoking_preference',
        'pets_preference', 'is_active', 'is_staff', 'is_superuser', 'date_joined'
    ]
    search_fields = [
        'username', 'email', 'first_name', 'last_name',
        'current_city', 'preferred_city', 'occupation'
    ]
    ordering = ['-date_joined']

    # Add custom fields to the user form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('PairPad Info', {
            'fields': ('role', 'verification_status')
        }),
        ('Personal Information', {
            'fields': (
                'date_of_birth', 'gender', 'phone_number',
                'occupation', 'education'
            ),
            'classes': ['wide']
        }),
        ('Location & Housing', {
            'fields': (
                'current_city', 'preferred_city',
                'budget_min', 'budget_max',
                'move_in_date', 'lease_duration'
            ),
            'classes': ['wide']
        }),
        ('Lifestyle Preferences', {
            'fields': (
                'smoking_preference', 'pets_preference', 'guests_preference',
                'cleanliness_level', 'social_level', 'quiet_hours'
            ),
            'classes': ['wide']
        }),
        ('Profile', {
            'fields': ('bio', 'interests'),
            'classes': ['wide']
        }),
    )

    # Add custom fields to the add user form
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('PairPad Info', {
            'fields': ('role', 'verification_status')
        }),
        ('Personal Information', {
            'fields': (
                'first_name', 'last_name', 'date_of_birth',
                'gender', 'phone_number'
            ),
            'classes': ['wide']
        }),
    )

    def age_display(self, obj):
        """Display user's age"""
        age = obj.get_age()
        return f"{age} years" if age else "N/A"
    age_display.short_description = 'Age'

    def has_personality_profile(self, obj):
        """Check if user has completed personality profile"""
        return hasattr(obj, 'personality_profile')
    has_personality_profile.boolean = True
    has_personality_profile.short_description = 'Has Profile'

    actions = ['verify_users', 'reject_users']

    def verify_users(self, request, queryset):
        updated = queryset.update(verification_status='verified')
        self.message_user(
            request,
            f'{updated} users were successfully verified.'
        )
    verify_users.short_description = "Mark selected users as verified"

    def reject_users(self, request, queryset):
        updated = queryset.update(verification_status='rejected')
        self.message_user(
            request,
            f'{updated} users were rejected.'
        )
    reject_users.short_description = "Mark selected users as rejected"
