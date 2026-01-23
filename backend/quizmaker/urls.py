from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from . import views

urlpatterns = [
    #GET
    path('user-profile/', views.get_user_profiles),
    path('quizzes/', views.get_quizzes),
    path('quizzes/<str:quiz_id>/questions/', views.get_questions_by_quiz),
    path('questions/<int:question_id>/choices/', views.get_choices_by_question),
    path('student-results/', views.get_student_results),

    #POST
    path('register/', views.register_user),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', views.logout_user),
    path('quizzes/create/', views.create_quiz),
    path('quizzes/<str:quiz_id>/questions/create/', views.create_question),
    path('questions/<int:question_id>/choices/create/', views.create_choice),

    #PATCH
    path('quiz-detail/<str:quiz_id>/update/', views.update_quiz_detail),
    path('question/<int:question_id>/update/', views.update_question),
    path('choice/<int:choice_id>/update/', views.update_choice),
    path('user-profile/update/', views.update_user_profile),

    
    path('quizzes/<str:quiz_id>/', views.get_quiz_by_id),
    path('quizzes/join/<str:share_code>/', views.join_quiz),
    path('quizzes/<str:quiz_id>/attempts/', views.get_attempts_by_quiz),
    path('quizzes/<str:quiz_id>/submit/', views.submit_quiz_attempt),
    path('quizzes/<str:quiz_id>/result/', views.get_quiz_result),
    path('answers/<int:answer_id>/evaluate/', views.evaluate_answer),
    path('answers/pending/', views.get_pending_answers),
]