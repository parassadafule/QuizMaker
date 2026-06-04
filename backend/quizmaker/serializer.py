from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, Quiz, Question, Choice, QuizAttempt, Answer

class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = UserProfile
        fields = '__all__'

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        return super().update(instance, validated_data)

class RegisterSerializer(serializers.ModelSerializer):
    cnf_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('admin', 'Admin'), ('student', 'Student')], default='student')
    bio = serializers.CharField(required=False, allow_blank=True)
    grade = serializers.ChoiceField(choices=[('10th', '10th'), ('12th', '12th'), ('College', 'College')], required=False)
    institution = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['first_name','last_name','username','email','password','cnf_password', 'role', 'bio', 'grade', 'institution']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['cnf_password']:
            raise serializers.ValidationError("Password and Confirm Password do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('cnf_password')

        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        role = validated_data.get('role', 'student')
        bio = validated_data.get('bio', '')
        grade = validated_data.get('grade', '')
        institution = validated_data.get('institution', '')

        if grade == '':
            grade = None
        if institution == '':
            institution = None

        profile = UserProfile.objects.create(
            user=user,
            role=role,
            bio=bio,
            grade=grade,
            institution=institution,
        )

        if profile.role == 'admin':
            profile.admin_id = user.username
        else:
            profile.student_id = user.username

        profile.save()
        return user

class QuizSerializer(serializers.ModelSerializer):
    total_questions = serializers.IntegerField(read_only=True)
    total_marks = serializers.IntegerField(read_only=True)
    total_attempts = serializers.IntegerField(read_only=True)
    current_status = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = '__all__'

class QuizAttemptSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    score = serializers.IntegerField(source='result', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = '__all__'

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'