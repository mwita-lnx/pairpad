from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()

class LivingSpace(models.Model):
    SPACE_TYPES = [
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('condo', 'Condo'),
        ('dorm', 'Dormitory'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    space_type = models.CharField(max_length=20, choices=SPACE_TYPES, default='apartment')
    address = models.TextField(blank=True)

    # Members of this living space
    members = models.ManyToManyField(User, through='LivingSpaceMember', related_name='living_spaces')

    # Created by the first member
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_spaces')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.space_type})"

    class Meta:
        indexes = [
            models.Index(fields=['created_by']),
            models.Index(fields=['is_active']),
        ]

class LivingSpaceMember(models.Model):
    MEMBER_ROLES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('guest', 'Guest'),
    ]

    living_space = models.ForeignKey(LivingSpace, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='space_memberships')
    role = models.CharField(max_length=20, choices=MEMBER_ROLES, default='member')

    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['living_space', 'user']

    def __str__(self):
        return f"{self.user.username} in {self.living_space.name} ({self.role})"

class Task(models.Model):
    TASK_CATEGORIES = [
        ('cleaning', 'Cleaning'),
        ('maintenance', 'Maintenance'),
        ('groceries', 'Groceries'),
        ('bills', 'Bills'),
        ('other', 'Other'),
    ]

    TASK_STATUS = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]

    RECURRENCE_TYPES = [
        ('none', 'One-time'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    living_space = models.ForeignKey(LivingSpace, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=TASK_CATEGORIES, default='other')

    # Assignment
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')

    # Scheduling
    due_date = models.DateTimeField(null=True, blank=True)
    recurrence = models.CharField(max_length=20, choices=RECURRENCE_TYPES, default='none')

    # Status
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='pending')
    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date', 'created_at']
        indexes = [
            models.Index(fields=['living_space', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.title} - {self.living_space.name}"

class Expense(models.Model):
    EXPENSE_CATEGORIES = [
        ('rent', 'Rent'),
        ('utilities', 'Utilities'),
        ('groceries', 'Groceries'),
        ('supplies', 'Supplies'),
        ('maintenance', 'Maintenance'),
        ('internet', 'Internet'),
        ('other', 'Other'),
    ]

    SPLIT_TYPES = [
        ('equal', 'Split Equally'),
        ('custom', 'Custom Split'),
        ('percentage', 'Percentage Split'),
    ]

    living_space = models.ForeignKey(LivingSpace, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=EXPENSE_CATEGORIES, default='other')

    # Amount and payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paid_expenses')

    # Split configuration
    split_type = models.CharField(max_length=20, choices=SPLIT_TYPES, default='equal')
    participants = models.ManyToManyField(User, through='ExpenseSplit', related_name='shared_expenses')

    # Receipt/proof
    receipt_image = models.ImageField(upload_to='expense_receipts/', blank=True, null=True)

    # Dates
    expense_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date']
        indexes = [
            models.Index(fields=['living_space', 'expense_date']),
            models.Index(fields=['paid_by', 'expense_date']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.title} - ${self.amount} ({self.living_space.name})"

class ExpenseSplit(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_splits')

    # Amount this user owes for this expense
    amount_owed = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])

    # Payment tracking
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    paid_at = models.DateTimeField(null=True, blank=True)
    is_settled = models.BooleanField(default=False)

    class Meta:
        unique_together = ['expense', 'user']

    def __str__(self):
        return f"{self.user.username} owes ${self.amount_owed} for {self.expense.title}"

    @property
    def remaining_amount(self):
        return self.amount_owed - self.amount_paid

class HouseRules(models.Model):
    living_space = models.OneToOneField(LivingSpace, on_delete=models.CASCADE, related_name='house_rules')

    # Quiet hours
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    # Guest policies
    overnight_guests_allowed = models.BooleanField(default=True)
    max_consecutive_guest_nights = models.IntegerField(default=3)
    guest_notification_required = models.BooleanField(default=True)

    # Cleaning policies
    cleaning_schedule = models.TextField(blank=True)
    shared_chores_rotation = models.BooleanField(default=True)

    # Other rules
    smoking_allowed = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)
    alcohol_allowed = models.BooleanField(default=True)

    # Custom rules
    custom_rules = models.TextField(blank=True, help_text="Additional house rules")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"House Rules for {self.living_space.name}"

    class Meta:
        verbose_name = "House Rules"
        verbose_name_plural = "House Rules"
