from django.urls import path
from . import views

urlpatterns = [
    path('suggestions/', views.get_match_suggestions, name='match_suggestions'),
    path('accept/', views.accept_match, name='accept_match'),
    path('reject/', views.reject_match, name='reject_match'),
    path('compatibility/<int:user_id>/', views.get_compatibility, name='get_compatibility'),
]