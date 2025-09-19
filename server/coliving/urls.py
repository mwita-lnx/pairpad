from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.get_dashboard, name='coliving_dashboard'),
    path('tasks/', views.TaskListCreateView.as_view(), name='tasks'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task_detail'),
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expenses'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense_detail'),
]