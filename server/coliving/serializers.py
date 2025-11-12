from rest_framework import serializers
from .models import (
    LivingSpace, LivingSpaceMember, Room, LivingSpaceImage,
    RoomApplication, LivingSpaceReview, HouseRules, Task, Expense,
    ShoppingList, ShoppingListItem, Bill, Notification, CalendarEvent
)
from authentication.serializers import UserSerializer

class HouseRulesSerializer(serializers.ModelSerializer):
    # Format quiet hours as a readable string
    quiet_hours = serializers.SerializerMethodField()
    guests_allowed = serializers.BooleanField(source='overnight_guests_allowed')
    additional_rules = serializers.CharField(source='custom_rules')

    class Meta:
        model = HouseRules
        fields = [
            'smoking_allowed', 'pets_allowed', 'guests_allowed', 'quiet_hours',
            'additional_rules', 'cleaning_schedule', 'shared_chores_rotation',
            'guest_notification_required', 'max_consecutive_guest_nights'
        ]

    def get_quiet_hours(self, obj):
        """Format quiet hours as readable string"""
        if obj.quiet_hours_start and obj.quiet_hours_end:
            return f"{obj.quiet_hours_start.strftime('%I:%M %p')} - {obj.quiet_hours_end.strftime('%I:%M %p')}"
        return None

class LivingSpaceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LivingSpaceImage
        fields = [
            'id', 'image', 'image_type', 'caption', 'is_primary', 'order'
        ]

class RoomSerializer(serializers.ModelSerializer):
    images = LivingSpaceImageSerializer(many=True, read_only=True)
    compatibility_score = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'room_type', 'description', 'size_sqft',
            'has_private_bathroom', 'has_balcony', 'has_closet',
            'furnished', 'air_conditioning', 'is_available',
            'monthly_rent', 'security_deposit', 'available_from',
            'current_occupant', 'images', 'compatibility_score'
        ]

    def get_compatibility_score(self, obj):
        """Calculate compatibility score for the requesting user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.calculate_compatibility_score(request.user)
        return None

class LivingSpaceMemberSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = LivingSpaceMember
        fields = [
            'id', 'user', 'user_id', 'role', 'joined_at', 'is_active'
        ]

class LivingSpaceSerializer(serializers.ModelSerializer):
    images = LivingSpaceImageSerializer(many=True, read_only=True)
    rooms = RoomSerializer(many=True, read_only=True)
    house_rules = HouseRulesSerializer(read_only=True)
    members = LivingSpaceMemberSerializer(source='memberships', many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    available_rooms_count = serializers.SerializerMethodField()

    class Meta:
        model = LivingSpace
        fields = [
            'id', 'name', 'space_type', 'description', 'address',
            'city', 'state', 'zip_code', 'country', 'latitude', 'longitude',
            'total_bedrooms', 'total_bathrooms', 'total_rent', 'utilities_included',
            'furnished', 'parking_available', 'available_from', 'lease_duration_months',
            'created_by', 'created_at', 'is_active', 'is_public',
            'images', 'rooms', 'house_rules', 'members', 'average_rating',
            'available_rooms_count'
        ]
        read_only_fields = ['created_by', 'created_at']

    def get_average_rating(self, obj):
        """Calculate average rating from reviews"""
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.overall_rating for review in reviews) / len(reviews)
        return None

    def get_available_rooms_count(self, obj):
        """Get count of available rooms"""
        return obj.get_available_rooms().count()

class LivingSpaceCreateSerializer(serializers.ModelSerializer):
    house_rules = HouseRulesSerializer(required=False)

    class Meta:
        model = LivingSpace
        fields = [
            'name', 'space_type', 'description', 'address',
            'city', 'state', 'zip_code', 'country', 'latitude', 'longitude',
            'total_bedrooms', 'total_bathrooms', 'total_rent', 'utilities_included',
            'furnished', 'parking_available', 'available_from', 'lease_duration_months',
            'is_public', 'house_rules'
        ]

    def create(self, validated_data):
        house_rules_data = validated_data.pop('house_rules', None)
        living_space = LivingSpace.objects.create(**validated_data)

        # Create house rules if provided
        if house_rules_data:
            HouseRules.objects.create(living_space=living_space, **house_rules_data)

        # Add the creator as an admin member
        LivingSpaceMember.objects.create(
            living_space=living_space,
            user=self.context['request'].user,
            role='admin'
        )

        return living_space

class RoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            'living_space', 'name', 'room_type', 'description', 'size_sqft',
            'has_private_bathroom', 'has_balcony', 'has_closet',
            'furnished', 'air_conditioning', 'is_available',
            'monthly_rent', 'security_deposit', 'available_from'
        ]

    def validate_living_space(self, value):
        """Ensure user has permission to add rooms to this space"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = LivingSpaceMember.objects.filter(
                living_space=value,
                user=request.user,
                role='admin',
                is_active=True
            ).first()
            if not membership:
                raise serializers.ValidationError(
                    "You don't have permission to add rooms to this living space."
                )
        return value

class RoomApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.StringRelatedField(read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    living_space_name = serializers.CharField(source='room.living_space.name', read_only=True)

    class Meta:
        model = RoomApplication
        fields = [
            'id', 'room', 'applicant', 'message', 'move_in_date',
            'lease_duration_months', 'contact_email', 'contact_phone',
            'employment_status', 'monthly_income', 'references',
            'status', 'review_message', 'created_at', 'room_name', 'living_space_name'
        ]
        read_only_fields = ['applicant', 'status', 'review_message']

    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)

class LivingSpaceReviewSerializer(serializers.ModelSerializer):
    reviewer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = LivingSpaceReview
        fields = [
            'id', 'living_space', 'reviewer', 'overall_rating',
            'cleanliness_rating', 'location_rating', 'value_rating',
            'roommate_compatibility', 'review_text', 'pros', 'cons',
            'verified_stay', 'created_at'
        ]
        read_only_fields = ['reviewer', 'verified_stay']

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        # Prevent users from reviewing the same space multiple times
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            existing_review = LivingSpaceReview.objects.filter(
                living_space=attrs['living_space'],
                reviewer=request.user
            ).first()
            if existing_review:
                raise serializers.ValidationError(
                    "You have already reviewed this living space."
                )
        return attrs

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.StringRelatedField(required=False, allow_null=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_by = serializers.StringRelatedField()

    class Meta:
        model = Task
        fields = [
            'id', 'living_space', 'title', 'description', 'category',
            'assigned_to', 'assigned_to_id', 'created_by', 'due_date', 'recurrence',
            'status', 'completed_at', 'created_at'
        ]
        read_only_fields = ['created_by', 'completed_at']

class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = serializers.StringRelatedField(required=False, allow_null=True)
    paid_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'living_space', 'title', 'description', 'category',
            'amount', 'paid_by', 'paid_by_id', 'split_type', 'receipt_image',
            'expense_date', 'created_at'
        ]
        read_only_fields = []

class ShoppingListItemSerializer(serializers.ModelSerializer):
    added_by = serializers.StringRelatedField()
    purchased_by = serializers.StringRelatedField()

    class Meta:
        model = ShoppingListItem
        fields = [
            'id', 'name', 'quantity', 'category', 'is_purchased',
            'purchased_by', 'purchased_at', 'added_by', 'created_at'
        ]
        read_only_fields = ['added_by', 'purchased_by', 'purchased_at']

class ShoppingListSerializer(serializers.ModelSerializer):
    items = ShoppingListItemSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()

    class Meta:
        model = ShoppingList
        fields = ['id', 'living_space', 'name', 'items', 'created_by', 'created_at']
        read_only_fields = ['created_by']

class BillSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    paid_by = serializers.StringRelatedField()

    class Meta:
        model = Bill
        fields = [
            'id', 'living_space', 'title', 'description', 'amount',
            'due_date', 'recurrence', 'status', 'paid_by', 'paid_at',
            'created_by', 'created_at'
        ]
        read_only_fields = ['created_by', 'paid_by', 'paid_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'created_at', 'task', 'expense', 'bill', 'living_space'
        ]
        read_only_fields = ['created_at']

class CalendarEventSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()

    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'living_space', 'title', 'description', 'event_type',
            'start_datetime', 'end_datetime', 'all_day',
            'task', 'bill', 'created_by', 'created_at'
        ]
        read_only_fields = ['created_by']