from rest_framework import serializers
from .models import PersonalityProfile, AssessmentQuestion, AssessmentResponse

class PersonalityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalityProfile
        fields = [
            'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
            'cleanliness_level', 'social_level', 'quiet_hours', 'pets_allowed', 'smoking_allowed',
            'communication_style', 'completed_at', 'updated_at'
        ]
        read_only_fields = ['completed_at', 'updated_at']

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = [
            'id', 'question_text', 'trait', 'question_type', 'reverse_scored', 'order'
        ]

class AssessmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResponse
        fields = ['question', 'response_value', 'response_boolean', 'response_text']

    def validate(self, attrs):
        question = attrs['question']

        if question.question_type == 'scale':
            if attrs.get('response_value') is None or not (1 <= attrs['response_value'] <= 5):
                raise serializers.ValidationError("Scale questions require a response value between 1 and 5")

        elif question.question_type == 'boolean':
            if attrs.get('response_boolean') is None:
                raise serializers.ValidationError("Boolean questions require a true/false response")

        return attrs

class PersonalityAssessmentSubmissionSerializer(serializers.Serializer):
    responses = AssessmentResponseSerializer(many=True)
    lifestyle_preferences = serializers.DictField(required=False)
    communication_style = serializers.ChoiceField(
        choices=PersonalityProfile.COMMUNICATION_STYLES,
        default='diplomatic'
    )

    def validate_responses(self, value):
        if len(value) < 5:  # At least one question per Big Five trait
            raise serializers.ValidationError("At least 5 responses are required")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        responses = validated_data['responses']
        lifestyle_prefs = validated_data.get('lifestyle_preferences', {})
        communication_style = validated_data.get('communication_style', 'diplomatic')

        # Calculate personality scores
        trait_scores = self.calculate_personality_scores(responses)

        # Create or update personality profile
        profile, created = PersonalityProfile.objects.get_or_create(
            user=user,
            defaults={
                **trait_scores,
                'cleanliness_level': lifestyle_prefs.get('cleanliness', 50),
                'social_level': lifestyle_prefs.get('socialLevel', 50),
                'quiet_hours': lifestyle_prefs.get('quietHours', False),
                'pets_allowed': lifestyle_prefs.get('pets', False),
                'smoking_allowed': lifestyle_prefs.get('smoking', False),
                'communication_style': communication_style,
            }
        )

        if not created:
            # Update existing profile
            for field, value in trait_scores.items():
                setattr(profile, field, value)

            profile.cleanliness_level = lifestyle_prefs.get('cleanliness', profile.cleanliness_level)
            profile.social_level = lifestyle_prefs.get('socialLevel', profile.social_level)
            profile.quiet_hours = lifestyle_prefs.get('quietHours', profile.quiet_hours)
            profile.pets_allowed = lifestyle_prefs.get('pets', profile.pets_allowed)
            profile.smoking_allowed = lifestyle_prefs.get('smoking', profile.smoking_allowed)
            profile.communication_style = communication_style
            profile.save()

        # Save individual responses
        AssessmentResponse.objects.filter(user=user).delete()  # Clear old responses

        response_objects = []
        for response_data in responses:
            response_objects.append(AssessmentResponse(
                user=user,
                question_id=response_data['question'].id if hasattr(response_data['question'], 'id') else response_data['question'],
                response_value=response_data.get('response_value', 0),
                response_boolean=response_data.get('response_boolean'),
                response_text=response_data.get('response_text', '')
            ))

        AssessmentResponse.objects.bulk_create(response_objects)

        return profile

    def calculate_personality_scores(self, responses):
        trait_totals = {
            'openness': [],
            'conscientiousness': [],
            'extraversion': [],
            'agreeableness': [],
            'neuroticism': []
        }

        for response_data in responses:
            question_id = response_data['question'].id if hasattr(response_data['question'], 'id') else response_data['question']

            try:
                question = AssessmentQuestion.objects.get(id=question_id)
                if question.trait in trait_totals:
                    score = response_data.get('response_value', 0)

                    # Apply reverse scoring if needed
                    if question.reverse_scored:
                        score = 6 - score

                    trait_totals[question.trait].append(score)
            except AssessmentQuestion.DoesNotExist:
                continue

        # Calculate averages and convert to 0-100 scale
        trait_scores = {}
        for trait, scores in trait_totals.items():
            if scores:
                avg_score = sum(scores) / len(scores)
                trait_scores[trait] = min(100, max(0, int((avg_score - 1) * 25)))  # Convert 1-5 scale to 0-100
            else:
                trait_scores[trait] = 50  # Default middle value

        return trait_scores