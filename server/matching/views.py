from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Match, MatchInteraction, CompatibilityScore
from personality.models import PersonalityProfile
from authentication.serializers import UserSerializer
import math

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_suggestions(request):
    """Get compatible user suggestions"""
    current_user = request.user

    # Get users who haven't been interacted with
    interacted_users = MatchInteraction.objects.filter(user=current_user).values_list('target_user_id', flat=True)
    excluded_users = list(interacted_users) + [current_user.id]

    # Get users with personality profiles
    suggested_users = User.objects.filter(
        personality_profile__isnull=False
    ).exclude(id__in=excluded_users)[:10]

    # Calculate compatibility scores
    suggestions_with_scores = []
    for user in suggested_users:
        compatibility = calculate_compatibility(current_user, user)
        user_data = UserSerializer(user).data
        user_data['compatibility_score'] = compatibility
        suggestions_with_scores.append(user_data)

    # Sort by compatibility score
    suggestions_with_scores.sort(key=lambda x: x['compatibility_score'], reverse=True)

    return Response(suggestions_with_scores)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_match(request):
    """Accept/like a user"""
    target_user_id = request.data.get('user_id')

    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Create interaction
    interaction, created = MatchInteraction.objects.get_or_create(
        user=request.user,
        target_user=target_user,
        defaults={'interaction_type': 'like'}
    )

    # Check if it's mutual
    mutual_interaction = MatchInteraction.objects.filter(
        user=target_user,
        target_user=request.user,
        interaction_type='like'
    ).exists()

    if mutual_interaction:
        # Create match
        compatibility = calculate_compatibility(request.user, target_user)
        match, created = Match.objects.get_or_create(
            user1=min(request.user, target_user, key=lambda x: x.id),
            user2=max(request.user, target_user, key=lambda x: x.id),
            defaults={
                'compatibility_score': compatibility,
                'status': 'mutual'
            }
        )

        return Response({
            'message': 'Match created!',
            'match_id': match.id,
            'compatibility_score': compatibility
        })

    return Response({'message': 'User liked successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_match(request):
    """Reject/pass on a user"""
    target_user_id = request.data.get('user_id')

    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    MatchInteraction.objects.get_or_create(
        user=request.user,
        target_user=target_user,
        defaults={'interaction_type': 'pass'}
    )

    return Response({'message': 'User passed'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_matches(request):
    """Get all matches for the current user"""
    user = request.user
    matches = Match.objects.filter(
        Q(user1=user) | Q(user2=user),
        status='mutual'
    ).order_by('-created_at')

    match_data = []
    for match in matches:
        other_user = match.user2 if match.user1 == user else match.user1
        other_user_data = UserSerializer(other_user).data

        match_data.append({
            'id': str(match.id),
            'user1Id': str(match.user1.id),
            'user2Id': str(match.user2.id),
            'compatibilityScore': match.compatibility_score,
            'status': match.status,
            'createdAt': match.created_at.isoformat(),
            'otherUser': other_user_data
        })

    return Response(match_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_requests(request):
    """Get incoming match requests (people who liked you but you haven't responded to)"""
    user = request.user

    # Find users who have liked the current user but current user hasn't responded
    incoming_likes = MatchInteraction.objects.filter(
        target_user=user,
        interaction_type='like'
    )

    # Filter out users that current user has already responded to
    responded_users = MatchInteraction.objects.filter(
        user=user
    ).values_list('target_user_id', flat=True)

    pending_requests = incoming_likes.exclude(
        user_id__in=responded_users
    )

    request_data = []
    for interaction in pending_requests:
        requesting_user = interaction.user
        compatibility = calculate_compatibility(user, requesting_user)
        user_data = UserSerializer(requesting_user).data

        request_data.append({
            'id': str(interaction.id),
            'requestingUser': user_data,
            'compatibilityScore': compatibility,
            'createdAt': interaction.created_at.isoformat(),
        })

    return Response(request_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_match_request(request):
    """Accept or decline a match request"""
    requester_user_id = request.data.get('user_id')
    response_type = request.data.get('response')  # 'accept' or 'decline'

    if response_type not in ['accept', 'decline']:
        return Response({'error': 'Invalid response type'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        requester_user = User.objects.get(id=requester_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check if the requester actually liked this user
    incoming_like = MatchInteraction.objects.filter(
        user=requester_user,
        target_user=request.user,
        interaction_type='like'
    ).first()

    if not incoming_like:
        return Response({'error': 'No match request found'}, status=status.HTTP_404_NOT_FOUND)

    if response_type == 'accept':
        # Create interaction for accepting
        interaction, created = MatchInteraction.objects.get_or_create(
            user=request.user,
            target_user=requester_user,
            defaults={'interaction_type': 'like'}
        )

        # Create match since both users liked each other
        compatibility = calculate_compatibility(request.user, requester_user)
        match, created = Match.objects.get_or_create(
            user1=min(request.user, requester_user, key=lambda x: x.id),
            user2=max(request.user, requester_user, key=lambda x: x.id),
            defaults={
                'compatibility_score': compatibility,
                'status': 'mutual'
            }
        )

        return Response({
            'message': 'Match request accepted!',
            'match_id': match.id,
            'compatibility_score': compatibility
        })

    else:  # decline
        # Create interaction for declining
        MatchInteraction.objects.get_or_create(
            user=request.user,
            target_user=requester_user,
            defaults={'interaction_type': 'pass'}
        )

        return Response({'message': 'Match request declined'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_compatibility(request, user_id):
    """Get compatibility score with specific user"""
    try:
        target_user = User.objects.get(id=user_id)
        compatibility = calculate_compatibility(request.user, target_user)
        return Response({'compatibility_score': compatibility})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

def calculate_compatibility(user1, user2):
    """Calculate compatibility score between two users"""
    try:
        profile1 = user1.personality_profile
        profile2 = user2.personality_profile
    except PersonalityProfile.DoesNotExist:
        return 0

    # Big Five compatibility (40% weight)
    traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    personality_score = 0

    for trait in traits:
        val1 = getattr(profile1, trait, 50)
        val2 = getattr(profile2, trait, 50)
        diff = abs(val1 - val2)
        trait_score = max(0, 100 - (diff * 2))
        personality_score += trait_score

    personality_score = personality_score / len(traits)

    # Lifestyle compatibility (30% weight)
    lifestyle_score = 0
    lifestyle_score += max(0, 100 - abs(profile1.cleanliness_level - profile2.cleanliness_level) * 2)
    lifestyle_score += max(0, 100 - abs(profile1.social_level - profile2.social_level) * 2)
    lifestyle_score += 100 if profile1.quiet_hours == profile2.quiet_hours else 50
    lifestyle_score += 100 if profile1.pets_allowed == profile2.pets_allowed else 50
    lifestyle_score += 100 if profile1.smoking_allowed == profile2.smoking_allowed else 30
    lifestyle_score = lifestyle_score / 5

    # Communication compatibility (20% weight)
    communication_score = 80 if profile1.communication_style == profile2.communication_style else 60

    # Location score (10% weight) - default to 100 for now
    location_score = 100

    # Weighted total
    total_score = (
        personality_score * 0.4 +
        lifestyle_score * 0.3 +
        communication_score * 0.2 +
        location_score * 0.1
    )

    return round(total_score)
