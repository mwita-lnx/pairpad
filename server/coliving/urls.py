from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'living-spaces', views.LivingSpaceViewSet, basename='livingspace')
router.register(r'rooms', views.RoomViewSet, basename='room')
router.register(r'room-applications', views.RoomApplicationViewSet, basename='roomapplication')
router.register(r'reviews', views.LivingSpaceReviewViewSet, basename='livingspacereview')
router.register(r'images', views.LivingSpaceImageViewSet, basename='livingspaceimage')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.get_dashboard, name='coliving_dashboard'),
    path('search/', views.search_spaces, name='search_spaces'),
    path('tasks/', views.TaskListCreateView.as_view(), name='tasks'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task_detail'),
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expenses'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense_detail'),
]