from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = (
            # Basic account info
            'email', 'username', 'password', 'password_confirm', 'role',
            # Personal information
            'first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number',
            # Professional information
            'occupation', 'education',
            # Location & housing preferences
            'current_city', 'preferred_city', 'budget_min', 'budget_max',
            'move_in_date', 'lease_duration',
            # Lifestyle preferences
            'smoking_preference', 'pets_preference', 'guests_preference',
            'cleanliness_level', 'social_level', 'quiet_hours',
            # Profile information
            'bio', 'interests'
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")

        # Validate budget range
        budget_min = attrs.get('budget_min')
        budget_max = attrs.get('budget_max')
        if budget_min and budget_max and budget_min >= budget_max:
            raise serializers.ValidationError("Maximum budget must be greater than minimum budget")

        # Validate age (must be 18+)
        date_of_birth = attrs.get('date_of_birth')
        if date_of_birth:
            from datetime import date
            today = date.today()
            age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
            if age < 18:
                raise serializers.ValidationError("You must be at least 18 years old to register")

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    personalityProfile = serializers.SerializerMethodField()
    verificationStatus = serializers.CharField(source='verification_status', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    fullName = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            # Basic info
            'id', 'email', 'username', 'role', 'verificationStatus',
            'createdAt', 'updatedAt', 'personalityProfile',
            # Personal information
            'first_name', 'last_name', 'fullName', 'date_of_birth', 'age',
            'gender', 'phone_number',
            # Professional information
            'occupation', 'education',
            # Location & housing preferences
            'current_city', 'preferred_city', 'budget_min', 'budget_max',
            'move_in_date', 'lease_duration',
            # Lifestyle preferences
            'smoking_preference', 'pets_preference', 'guests_preference',
            'cleanliness_level', 'social_level', 'quiet_hours',
            # Profile information
            'bio', 'interests'
        )
        read_only_fields = ('id', 'createdAt', 'updatedAt', 'fullName', 'age')

    def get_personalityProfile(self, obj):
        if hasattr(obj, 'personality_profile'):
            from personality.serializers import PersonalityProfileSerializer
            return PersonalityProfileSerializer(obj.personality_profile).data
        return None

    def get_fullName(self, obj):
        return obj.get_full_name()

    def get_age(self, obj):
        return obj.get_age()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user data to response
        data['user'] = UserSerializer(self.user).data

        return data