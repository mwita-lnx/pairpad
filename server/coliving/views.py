from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status, viewsets, filters
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import (
    LivingSpace, LivingSpaceMember, Room, LivingSpaceImage,
    RoomApplication, LivingSpaceReview, HouseRules, Task, Expense
)
from .serializers import (
    LivingSpaceSerializer, LivingSpaceCreateSerializer, RoomSerializer,
    RoomCreateSerializer, RoomApplicationSerializer, LivingSpaceReviewSerializer,
    LivingSpaceImageSerializer, TaskSerializer, ExpenseSerializer
)

class LivingSpaceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing living spaces"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['space_type', 'city', 'furnished', 'utilities_included']
    search_fields = ['name', 'description', 'city', 'address']
    ordering_fields = ['created_at', 'total_rent', 'available_from']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter living spaces based on user permissions and public visibility"""
        user = self.request.user

        # Show public spaces and spaces where user is a member
        user_spaces = LivingSpace.objects.filter(
            Q(is_public=True) | Q(members=user)
        ).distinct()

        # Filter by budget if provided
        min_budget = self.request.query_params.get('min_budget')
        max_budget = self.request.query_params.get('max_budget')

        if min_budget:
            user_spaces = user_spaces.filter(total_rent__gte=min_budget)
        if max_budget:
            user_spaces = user_spaces.filter(total_rent__lte=max_budget)

        return user_spaces.prefetch_related('images', 'rooms', 'house_rules', 'memberships')

    def get_serializer_class(self):
        if self.action == 'create':
            return LivingSpaceCreateSerializer
        return LivingSpaceSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Apply to join a living space"""
        living_space = self.get_object()

        # Check if user is already a member
        existing_membership = LivingSpaceMember.objects.filter(
            living_space=living_space,
            user=request.user,
            is_active=True
        ).first()

        if existing_membership:
            return Response(
                {'error': 'You are already a member of this living space'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create membership request
        LivingSpaceMember.objects.create(
            living_space=living_space,
            user=request.user,
            role='member'
        )

        return Response({'message': 'Successfully applied to join living space'})

    @action(detail=True, methods=['get'])
    def available_rooms(self, request, pk=None):
        """Get available rooms in this living space"""
        living_space = self.get_object()
        available_rooms = living_space.get_available_rooms()
        serializer = RoomSerializer(available_rooms, many=True, context={'request': request})
        return Response(serializer.data)

class RoomViewSet(viewsets.ModelViewSet):
    """ViewSet for managing rooms"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['room_type', 'is_available', 'has_private_bathroom', 'furnished']
    ordering_fields = ['monthly_rent', 'available_from', 'created_at']
    ordering = ['monthly_rent']

    def get_queryset(self):
        """Filter rooms based on availability and user permissions"""
        # Show available rooms in public spaces or rooms in user's spaces
        user = self.request.user
        return Room.objects.filter(
            Q(living_space__is_public=True, is_available=True) |
            Q(living_space__members=user)
        ).distinct().select_related('living_space', 'current_occupant')

    def get_serializer_class(self):
        if self.action == 'create':
            return RoomCreateSerializer
        return RoomSerializer

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply for a room"""
        room = self.get_object()

        # Check if room is available
        if not room.is_available:
            return Response(
                {'error': 'This room is not available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already applied
        existing_application = RoomApplication.objects.filter(
            room=room,
            applicant=request.user
        ).first()

        if existing_application:
            return Response(
                {'error': 'You have already applied for this room'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create application
        serializer = RoomApplicationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            application = serializer.save(room=room)
            return Response(RoomApplicationSerializer(application).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoomApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing room applications"""
    permission_classes = [IsAuthenticated]
    serializer_class = RoomApplicationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'room__living_space']
    ordering = ['-created_at']

    def get_queryset(self):
        """Show applications for user's rooms or user's own applications"""
        user = self.request.user

        # Applications for rooms in spaces where user is admin
        admin_spaces = LivingSpace.objects.filter(
            memberships__user=user,
            memberships__role='admin',
            memberships__is_active=True
        )

        return RoomApplication.objects.filter(
            Q(applicant=user) |  # User's own applications
            Q(room__living_space__in=admin_spaces)  # Applications for user's spaces
        ).select_related('applicant', 'room', 'room__living_space')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a room application"""
        application = self.get_object()

        # Check if user has permission to approve
        is_admin = LivingSpaceMember.objects.filter(
            living_space=application.room.living_space,
            user=request.user,
            role='admin',
            is_active=True
        ).exists()

        if not is_admin:
            return Response(
                {'error': 'You do not have permission to approve this application'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Approve application
        application.status = 'approved'
        application.reviewed_by = request.user
        application.save()

        # Update room
        room = application.room
        room.current_occupant = application.applicant
        room.is_available = False
        room.save()

        # Add applicant as member
        LivingSpaceMember.objects.get_or_create(
            living_space=room.living_space,
            user=application.applicant,
            defaults={'role': 'member'}
        )

        return Response({'message': 'Application approved successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a room application"""
        application = self.get_object()

        # Check if user has permission to reject
        is_admin = LivingSpaceMember.objects.filter(
            living_space=application.room.living_space,
            user=request.user,
            role='admin',
            is_active=True
        ).exists()

        if not is_admin:
            return Response(
                {'error': 'You do not have permission to reject this application'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Reject application
        application.status = 'rejected'
        application.reviewed_by = request.user
        application.review_message = request.data.get('review_message', '')
        application.save()

        return Response({'message': 'Application rejected'})

class LivingSpaceReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for managing living space reviews"""
    permission_classes = [IsAuthenticated]
    serializer_class = LivingSpaceReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['living_space', 'overall_rating', 'verified_stay']
    ordering = ['-created_at']

    def get_queryset(self):
        return LivingSpaceReview.objects.all().select_related('living_space', 'reviewer')

class LivingSpaceImageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing living space images"""
    permission_classes = [IsAuthenticated]
    serializer_class = LivingSpaceImageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['living_space', 'room', 'image_type', 'is_primary']

    def get_queryset(self):
        return LivingSpaceImage.objects.all().select_related('living_space', 'room', 'uploaded_by')

    def perform_create(self, serializer):
        # Get living_space from request data
        living_space_id = self.request.data.get('living_space')
        if living_space_id:
            try:
                living_space = LivingSpace.objects.get(id=living_space_id)
                serializer.save(uploaded_by=self.request.user, living_space=living_space)
            except LivingSpace.DoesNotExist:
                raise ValidationError({'living_space': 'Living space not found'})
        else:
            serializer.save(uploaded_by=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard(request):
    """Get co-living dashboard data"""
    user = request.user

    # Get user's living spaces
    user_spaces = LivingSpace.objects.filter(members=user)

    # Get recent tasks
    recent_tasks = Task.objects.filter(
        living_space__in=user_spaces,
        assigned_to=user
    ).order_by('-created_at')[:5]

    # Get recent expenses
    recent_expenses = Expense.objects.filter(
        living_space__in=user_spaces
    ).order_by('-created_at')[:5]

    # Get pending room applications (if user is admin)
    admin_spaces = user_spaces.filter(
        memberships__user=user,
        memberships__role='admin',
        memberships__is_active=True
    )

    pending_applications = RoomApplication.objects.filter(
        room__living_space__in=admin_spaces,
        status='pending'
    ).count()

    return Response({
        'user_spaces': LivingSpaceSerializer(user_spaces, many=True).data,
        'recent_tasks': TaskSerializer(recent_tasks, many=True).data,
        'recent_expenses': ExpenseSerializer(recent_expenses, many=True).data,
        'pending_applications': pending_applications,
        'stats': {
            'total_spaces': user_spaces.count(),
            'available_rooms': Room.objects.filter(
                living_space__in=user_spaces,
                is_available=True
            ).count(),
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_spaces(request):
    """Search living spaces with filters"""
    queryset = LivingSpace.objects.filter(is_public=True, is_active=True)

    # Location filters
    city = request.GET.get('city')
    if city:
        queryset = queryset.filter(city__icontains=city)

    # Budget filters
    min_budget = request.GET.get('min_budget')
    max_budget = request.GET.get('max_budget')
    if min_budget:
        queryset = queryset.filter(total_rent__gte=min_budget)
    if max_budget:
        queryset = queryset.filter(total_rent__lte=max_budget)

    # Feature filters
    furnished = request.GET.get('furnished')
    if furnished == 'true':
        queryset = queryset.filter(furnished=True)

    utilities_included = request.GET.get('utilities_included')
    if utilities_included == 'true':
        queryset = queryset.filter(utilities_included=True)

    # Room filters
    available_rooms_only = request.GET.get('available_rooms_only')
    if available_rooms_only == 'true':
        queryset = queryset.filter(rooms__is_available=True).distinct()

    # Compatibility score filter (requires personality profile)
    min_compatibility = request.GET.get('min_compatibility')
    if min_compatibility and hasattr(request.user, 'personality_profile'):
        # This would need additional logic to calculate compatibility
        pass

    # Pagination
    page_size = int(request.GET.get('page_size', 10))
    page = int(request.GET.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size

    total_count = queryset.count()
    results = queryset[start:end]

    serializer = LivingSpaceSerializer(results, many=True, context={'request': request})

    return Response({
        'results': serializer.data,
        'total_count': total_count,
        'page': page,
        'page_size': page_size,
        'has_next': end < total_count,
        'has_previous': page > 1
    })

# Existing views for backward compatibility
class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        user_spaces = LivingSpace.objects.filter(members=self.request.user)
        return Task.objects.filter(living_space__in=user_spaces)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        user_spaces = LivingSpace.objects.filter(members=self.request.user)
        return Task.objects.filter(living_space__in=user_spaces)

class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        user_spaces = LivingSpace.objects.filter(members=self.request.user)
        return Expense.objects.filter(living_space__in=user_spaces)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        user_spaces = LivingSpace.objects.filter(members=self.request.user)
        return Expense.objects.filter(living_space__in=user_spaces)