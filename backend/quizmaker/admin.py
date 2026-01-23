from django.contrib import admin
from .models import UserProfile, Quiz, Question, QuizAttempt, Choice, Answer

admin.site.register(UserProfile)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(QuizAttempt)
admin.site.register(Choice)
admin.site.register(Answer)