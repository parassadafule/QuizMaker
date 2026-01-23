from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone

class UserProfile(models.Model):
    ROLE = [('admin', 'Admin'), ('student', 'Student')]
    GRADE = [('10th', '10th'), ('12th', '12th'), ('College', 'College')]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE, default='student')
    bio = models.TextField(blank=True, null=True)
    admin_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    student_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    grade = models.CharField(max_length=50, choices=GRADE, blank=True, null=True)
    institution = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.user.username

class Quiz(models.Model):
    GRADE = [('10th', '10th'), ('12th', '12th'), ('college', 'College')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quiz_for = models.CharField(max_length=255, choices=GRADE, blank=True, null=True)
    start_date_time = models.DateTimeField(blank=True, null=True)
    end_date_time = models.DateTimeField(blank=True, null=True)
    time_limit = models.IntegerField(help_text="Time limit in minutes", default=0)
    share_code = models.CharField(max_length=10, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_questions(self):  
        return self.questions.count()
    
    def total_marks(self):
        total = 0
        for question in self.questions.all():
            total=total+question.marks
        return total
    
    def total_attempts(self):
        return self.quiz_attempt.count()
    
    @property
    def current_status(self):
        now = timezone.now()
        if now < self.start_date_time:
            return 'upcoming'
        elif now >= self.end_date_time:
            return 'completed'
        else:
            return 'active'
    
    def __str__(self):
        return f"{self.title}"

class Question(models.Model):
    QUESTION_TYPE= [('mcq', 'Multiple Choice'), ('tf', 'True/False'), ('short_answer', 'Short Answer')]
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    marks = models.IntegerField(default=1)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE, default='mcq')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.text
   
class QuizAttempt(models.Model):
    STATUS= [('not_started', 'Not Started'), ('completed', 'Completed')]
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='quiz_attempt')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS, default='not_started')
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    result = models.IntegerField(blank=True, null=True)
    def __str__(self):
        score = f"{self.result}%" if self.result is not None else 'N/A'
        return f"{self.user.username}-{self.quiz.title}-{score}"
    class Meta:
        unique_together = ('quiz', 'user')
    
class Choice(models.Model):
    question = models.ForeignKey(Question, related_name='choices', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    def __str__(self):
        return self.text
    
class Answer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_choice = models.ForeignKey(Choice, blank=True, null=True, on_delete=models.CASCADE)
    text_answer = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(null=True, blank=True)    
    def __str__(self):
        choice_text = self.selected_choice.text if self.selected_choice else self.text_answer or 'No answer'
        return f"{self.attempt.user.username}-{self.question.text}-{choice_text}"
    class Meta:
        unique_together = ('attempt', 'question')
   