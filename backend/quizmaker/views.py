from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import UserProfile, Quiz, Question, Choice, QuizAttempt, Answer
from .serializer import RegisterSerializer, UserProfileSerializer, QuizSerializer, QuestionSerializer, ChoiceSerializer, QuizAttemptSerializer, AnswerSerializer
import string
import random
from django.utils import timezone

def generate_share_code():
    while True:
        code = ''.join(random.choices(string.ascii_uppercase+string.digits,k=6))
        if not Quiz.objects.filter(share_code=code).exists():
            return code

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profiles(request):
    profile = UserProfile.objects.get(user=request.user)
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quizzes(request):
    quizzes = Quiz.objects.filter(created_by=request.user)
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)

@api_view(['GET', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_quiz_by_id(request,quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        quiz.delete()
        return Response({"message": "Quiz deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    if request.method == 'PATCH':
        serializer = QuizSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        attempt = QuizAttempt.objects.get(
            quiz=quiz,
            user=request.user,
            status='not_started'
        )
        serializer = QuizSerializer(quiz)
        quiz_data = serializer.data
        quiz_data['attempt_started_at'] = attempt.started_at.isoformat()
    except QuizAttempt.DoesNotExist:
        serializer = QuizSerializer(quiz)
        quiz_data = serializer.data

    return Response(quiz_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request):
    data = request.data.copy()
    data['created_by'] = request.user.id
    data['share_code'] = generate_share_code()

    serializer = QuizSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_question(request,quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['quiz'] = quiz.id

    serializer = QuestionSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_choice(request,question_id):
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    data['question'] = question.id

    serializer = ChoiceSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_questions_by_quiz(request,quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        question_id = request.data.get('question_id')
        if not question_id:
            return Response({"error": "question_id required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            question = Question.objects.get(id=question_id, quiz=quiz)
            question.delete()
            return Response({"message": "Question deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

    questions = Question.objects.filter(quiz=quiz)
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_choices_by_question(request,question_id):
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
    
    choices = Choice.objects.filter(question=question)
    serializer = ChoiceSerializer(choices, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_quiz_detail(request,quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = QuizSerializer(quiz, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_question(request,question_id):
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = QuestionSerializer(question, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_choice(request,choice_id):
    try:
        choice = Choice.objects.get(id=choice_id)
    except Choice.DoesNotExist:
        return Response({"error": "Choice not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ChoiceSerializer(choice, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def join_quiz(request, share_code):
    try:
        quiz = Quiz.objects.get(share_code=share_code)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.grade.lower()!=quiz.quiz_for.lower():
            return Response({"error": f"This quiz is for {quiz.quiz_for} grade students only"}, status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if quiz.current_status != 'active':
        return Response({"error": "Quiz is not currently active"}, status=status.HTTP_400_BAD_REQUEST)
    
    attempt, created = QuizAttempt.objects.get_or_create(
        quiz=quiz,
        user=request.user,
        defaults={'status': 'not_started'}
    )

    if created:
        attempt.started_at = timezone.now()
        attempt.save()

    serializer = QuizSerializer(quiz)
    quiz_data = serializer.data
    quiz_data['attempt_started_at'] = attempt.started_at.isoformat()

    return Response(quiz_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_attempt(request,quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        attempt = QuizAttempt.objects.get(
            quiz=quiz,
            user=request.user,
            status='not_started'
        )
    except QuizAttempt.DoesNotExist:
        return Response({"error": "No active attempt found for this quiz"}, status=status.HTTP_400_BAD_REQUEST)

    attempt.status = 'completed'
    attempt.completed_at = timezone.now()
    attempt.save()

    #process answers
    answers_data=request.data.get('answers', [])
    for answer_data in answers_data:
        question_id=answer_data.get('question')
        answer_text=answer_data.get('answer')

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            continue

        answer_dict = {
            'attempt': attempt.id,
            'question': question.id,
            'is_correct': False
        }

        if question.question_type in ['mcq', 'tf']:
            try:
                selected_choice = Choice.objects.get(question=question, text=answer_text)
                answer_dict['selected_choice']=selected_choice.id
                answer_dict['is_correct']=selected_choice.is_correct
            except Choice.DoesNotExist:
                pass
        else:
            answer_dict['text_answer']=answer_text
            answer_dict['is_correct']=None

        answer_serializer = AnswerSerializer(data=answer_dict)
        if answer_serializer.is_valid():
            answer_serializer.save()

    #calculate attempt result
    total_marks = quiz.total_marks()
    obtained_marks = 0
    for answer in attempt.answers.all():
        if answer.is_correct is True:
            obtained_marks += answer.question.marks
    attempt.result = int((obtained_marks/total_marks)*100) if total_marks>0 else 0
    attempt.save()

    serializer = QuizAttemptSerializer(attempt)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_result(request,quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        attempt = QuizAttempt.objects.filter(
            quiz=quiz,
            user=request.user,
            status='completed'
        ).latest('completed_at')
    except QuizAttempt.DoesNotExist:
        return Response({"error": "No completed attempt found for this quiz"}, status=status.HTTP_404_NOT_FOUND)

    try:
        total_questions = quiz.questions.count()
        correct_answers = attempt.answers.filter(is_correct=True).count()

        # calculate marks-based score
        total_marks = quiz.total_marks()
        obtained_marks = 0
        pending_count = 0
        analysis = []
        for answer in attempt.answers.all():
            status = 'correct' if answer.is_correct is True else 'incorrect' if answer.is_correct is False else 'pending'
            if status == 'pending':
                pending_count += 1
            if answer.is_correct is True:
                obtained_marks += answer.question.marks
            analysis.append({
                'question_id': answer.question.id,
                'question_text': answer.question.text,
                'question_type': answer.question.question_type,
                'student_answer': answer.text_answer if answer.question.question_type == 'short_answer' else (answer.selected_choice.text if answer.selected_choice else ''),
                'status': status,
                'marks': answer.question.marks if answer.is_correct else 0,
                'total_marks': answer.question.marks
            })

        score = int((obtained_marks / total_marks) * 100) if total_marks > 0 else 0

        result_data = {
            'score': score,
            'obtained_marks': obtained_marks,
            'total_marks': total_marks,
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'pending_answers': pending_count,
            'analysis': analysis,
            'feedback': 'Your quiz has been submitted. Some answers are pending evaluation.' if pending_count > 0 else 'All answers have been submitted.'
        }

        return Response(result_data)
    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_attempts_by_quiz(request,quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)
    attempts = QuizAttempt.objects.filter(quiz=quiz, user=request.user)
    serializer = QuizAttemptSerializer(attempts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_results(request):
    attempts = QuizAttempt.objects.filter(user=request.user).select_related('quiz')
    results = []
    for attempt in attempts:
        # compute marks-based score
        total_marks = attempt.quiz.total_marks()
        obtained_marks = 0
        for ans in attempt.answers.all():
            if ans.is_correct is True:
                obtained_marks += ans.question.marks

        score_percent = int((obtained_marks / total_marks) * 100) if total_marks > 0 else 0

        results.append({
            'quiz_id': attempt.quiz.id,
            'quiz_title': attempt.quiz.title,
            'score': score_percent,
            'obtained_marks': obtained_marks,
            'total_marks': total_marks,
            'total_questions': attempt.quiz.total_questions(),
            'date': attempt.completed_at.date().isoformat() if attempt.completed_at else (attempt.started_at.date().isoformat() if attempt.started_at else None),
            'status': attempt.status,
        })
    return Response(results)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def evaluate_answer(request, answer_id):
    try:
        answer = Answer.objects.get(id=answer_id)
    except Answer.DoesNotExist:
        return Response({"error": "Answer not found"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return Response({"error": "Only admins can evaluate answers"}, status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
    is_correct = request.data.get('is_correct')
    if is_correct is None:
        return Response({"error": "is_correct field is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    answer.is_correct = is_correct
    answer.save()
    
    #recalculate the score
    attempt = answer.attempt
    total_marks = attempt.quiz.total_marks()
    obtained_marks = 0
    for ans in attempt.answers.all():
        if ans.is_correct is True:
            obtained_marks=obtained_marks+ans.question.marks
    attempt.result = int((obtained_marks/total_marks)*100) if total_marks>0 else 0
    attempt.save()

    serializer = QuizAttemptSerializer(attempt)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_answers(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return Response({"error": "Only admins can view pending answers"}, status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
    
    pending_answers = Answer.objects.filter(
        is_correct__isnull=True,
        question__question_type='short_answer'
    ).select_related('attempt__user', 'attempt__quiz', 'question')
    
    results = []
    for answer in pending_answers:
        results.append({
            'id': answer.id,
            'quiz_title': answer.attempt.quiz.title,
            'student_name': answer.attempt.user.username,
            'question_text': answer.question.text,
            'student_answer': answer.text_answer,
            'marks': answer.question.marks,
            'submitted_at': answer.attempt.completed_at,
        })
    
    return Response(results)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)