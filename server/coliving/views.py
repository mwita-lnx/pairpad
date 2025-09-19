from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from .models import LivingSpace, Task, Expense

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard(request):
    """Get co-living dashboard data"""
    # For demo - return mock data
    return Response({
        'tasks': [
            {
                'id': 1,
                'title': 'Clean kitchen after dinner',
                'assignee': request.user.username,
                'completed': False,
                'due_date': '2024-01-20',
                'category': 'cleaning'
            },
            {
                'id': 2,
                'title': 'Buy groceries for the week',
                'assignee': 'Alice',
                'completed': True,
                'due_date': '2024-01-19',
                'category': 'groceries'
            }
        ],
        'expenses': [
            {
                'id': 1,
                'description': 'Electricity bill',
                'amount': 120.00,
                'paid_by': request.user.username,
                'split_between': [request.user.username, 'Alice'],
                'date': '2024-01-15',
                'category': 'utilities'
            },
            {
                'id': 2,
                'description': 'Groceries - weekly shopping',
                'amount': 85.00,
                'paid_by': 'Alice',
                'split_between': [request.user.username, 'Alice'],
                'date': '2024-01-18',
                'category': 'groceries'
            }
        ],
        'balance': {
            'you_owe': 60.0,
            'others_owe': 25.0
        }
    })

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Mock implementation - return empty for now
        return Task.objects.none()

    def list(self, request):
        return Response([])

    def create(self, request):
        return Response({'message': 'Task created'}, status=status.HTTP_201_CREATED)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Task.objects.all()

class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.none()

    def list(self, request):
        return Response([])

    def create(self, request):
        return Response({'message': 'Expense created'}, status=status.HTTP_201_CREATED)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
