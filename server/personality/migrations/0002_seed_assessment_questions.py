# Generated manually to seed assessment questions

from django.db import migrations

def create_assessment_questions(apps, schema_editor):
    AssessmentQuestion = apps.get_model('personality', 'AssessmentQuestion')

    questions = [
        # Openness to Experience
        {'order': 1, 'trait': 'openness', 'question_text': 'I enjoy trying new and unusual experiences', 'question_type': 'scale', 'reverse_scored': False},
        {'order': 2, 'trait': 'openness', 'question_text': 'I prefer routine and familiar activities', 'question_type': 'scale', 'reverse_scored': True},
        {'order': 3, 'trait': 'openness', 'question_text': 'I appreciate art, music, and creative expression', 'question_type': 'scale', 'reverse_scored': False},

        # Conscientiousness
        {'order': 4, 'trait': 'conscientiousness', 'question_text': 'I am always prepared and organized', 'question_type': 'scale', 'reverse_scored': False},
        {'order': 5, 'trait': 'conscientiousness', 'question_text': 'I often leave things until the last minute', 'question_type': 'scale', 'reverse_scored': True},
        {'order': 6, 'trait': 'conscientiousness', 'question_text': 'I pay attention to details', 'question_type': 'scale', 'reverse_scored': False},

        # Extraversion
        {'order': 7, 'trait': 'extraversion', 'question_text': 'I enjoy being around people and social gatherings', 'question_type': 'scale', 'reverse_scored': False},
        {'order': 8, 'trait': 'extraversion', 'question_text': 'I prefer spending time alone rather than with others', 'question_type': 'scale', 'reverse_scored': True},
        {'order': 9, 'trait': 'extraversion', 'question_text': 'I feel energized by social interactions', 'question_type': 'scale', 'reverse_scored': False},

        # Agreeableness
        {'order': 10, 'trait': 'agreeableness', 'question_text': 'I try to be helpful and considerate to others', 'question_type': 'scale', 'reverse_scored': False},
        {'order': 11, 'trait': 'agreeableness', 'question_text': 'I often put my needs before others', 'question_type': 'scale', 'reverse_scored': True},
        {'order': 12, 'trait': 'agreeableness', 'question_text': 'I trust others easily', 'question_type': 'scale', 'reverse_scored': False},

        # Neuroticism
        {'order': 13, 'trait': 'neuroticism', 'question_text': 'I often feel anxious or stressed', 'question_type': 'scale', 'reverse_scored': False},
        {'order': 14, 'trait': 'neuroticism', 'question_text': 'I remain calm under pressure', 'question_type': 'scale', 'reverse_scored': True},
        {'order': 15, 'trait': 'neuroticism', 'question_text': 'I worry about things frequently', 'question_type': 'scale', 'reverse_scored': False},
    ]

    for question_data in questions:
        AssessmentQuestion.objects.create(**question_data)

def reverse_questions(apps, schema_editor):
    AssessmentQuestion = apps.get_model('personality', 'AssessmentQuestion')
    AssessmentQuestion.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('personality', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_assessment_questions, reverse_questions),
    ]