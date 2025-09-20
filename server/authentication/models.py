from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('professional', 'Young Professional'),
        ('admin', 'Administrator'),
        ('coordinator', 'Housing Coordinator'),
    ]

    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('non_binary', 'Non-binary'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    SMOKING_CHOICES = [
        ('no_preference', 'No Preference'),
        ('smoker', 'I smoke'),
        ('non_smoker', 'Non-smoker only'),
    ]

    PETS_CHOICES = [
        ('no_preference', 'No Preference'),
        ('has_pets', 'I have pets'),
        ('no_pets', 'No pets'),
        ('loves_pets', 'Love pets but don\'t have any'),
    ]

    GUESTS_CHOICES = [
        ('rarely', 'Rarely have guests'),
        ('occasionally', 'Occasionally have guests'),
        ('frequently', 'Frequently have guests'),
        ('no_guests', 'No overnight guests'),
    ]

    LEASE_DURATION_CHOICES = [
        ('3_months', '3 months'),
        ('6_months', '6 months'),
        ('12_months', '12 months'),
        ('18_months', '18 months'),
        ('24_months', '24+ months'),
        ('flexible', 'Flexible'),
    ]

    # Basic Fields
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='pending'
    )

    # Personal Information
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    # Professional Information
    occupation = models.CharField(max_length=100, blank=True)
    education = models.CharField(max_length=100, blank=True)

    # Location & Housing Preferences
    current_city = models.CharField(max_length=100, blank=True)
    preferred_city = models.CharField(max_length=100, blank=True)
    budget_min = models.IntegerField(null=True, blank=True, help_text="Minimum monthly budget in dollars")
    budget_max = models.IntegerField(null=True, blank=True, help_text="Maximum monthly budget in dollars")
    move_in_date = models.DateField(null=True, blank=True)
    lease_duration = models.CharField(max_length=20, choices=LEASE_DURATION_CHOICES, blank=True)

    # Lifestyle Preferences
    smoking_preference = models.CharField(max_length=20, choices=SMOKING_CHOICES, default='no_preference')
    pets_preference = models.CharField(max_length=20, choices=PETS_CHOICES, default='no_preference')
    guests_preference = models.CharField(max_length=20, choices=GUESTS_CHOICES, default='occasionally')
    cleanliness_level = models.IntegerField(default=50, help_text="Cleanliness preference from 0-100")
    social_level = models.IntegerField(default=50, help_text="Social preference from 0-100")
    quiet_hours = models.BooleanField(default=False)

    # Profile Information
    bio = models.TextField(blank=True, help_text="Personal bio for roommate matching")
    interests = models.TextField(blank=True, help_text="Interests and hobbies")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.email})"

    def get_full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()

    def get_age(self):
        """Calculate and return the user's age."""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
