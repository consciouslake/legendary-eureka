from rest_framework import serializers
from .models import (Teacher, Course, CourseCategory, Chapter, Student, 
                   StudentCourseEnrollment, CourseRating, Assignment, 
                   Quiz, QuizQuestion, CourseQuiz, 
                   StudentQuizAttempt, StudentQuizResponse, Notification, StudyMaterial, FAQ, ContactUs,
                   TeacherStudentChat)
from django.contrib.flatpages.models import FlatPage

class TeacherSerializer(serializers.ModelSerializer):
    profile_img_url = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'email', 'mobile_number', 'password', 'qualification', 'skills', 'bio', 'profile_img', 'profile_img_url']
        extra_kwargs = {
            'password': {'write_only': True},
            'profile_img': {'required': False}
        }
    
    def get_profile_img_url(self, obj):
        if obj.profile_img:
            return self.context['request'].build_absolute_uri(obj.profile_img.url)
        return None
    
    def update(self, instance, validated_data):
        # Handle password update only if it's provided
        if 'password' in validated_data:
            if validated_data['password']:  # Only update if password is not empty
                validated_data['password'] = validated_data['password']  # Teacher passwords are stored as plaintext
            else:
                validated_data.pop('password')  # Remove empty password from update
            
        # Handle profile image - don't overwrite with None if no file is uploaded
        if 'profile_img' in validated_data and validated_data['profile_img'] is None:
            validated_data.pop('profile_img')
            
        return super().update(instance, validated_data)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ['id', 'title', 'description']

class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    total_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'category', 'teacher', 'title', 'description', 'featured_img', 'technologies', 'price', 'average_rating', 'total_ratings', 'total_enrolled']
    
    def get_total_enrolled(self, obj):
        # Count the number of students enrolled in this course
        return obj.enrolled_students.count()

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'course', 'title', 'description', 'video', 'video_url', 'text_content', 'remarks']

class StudentSerializer(serializers.ModelSerializer):
    profile_img_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'fullname', 'username', 'email', 'password', 'interested_categories', 'profile_img', 'profile_img_url']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'profile_img': {'required': False}
        }
    
    def get_profile_img_url(self, obj):
        if obj.profile_img:
            return self.context['request'].build_absolute_uri(obj.profile_img.url)
        return None

    def update(self, instance, validated_data):
        # Handle password update only if it's provided
        if 'password' in validated_data:
            if validated_data['password']:  # Only hash if password is not empty
                from django.contrib.auth.hashers import make_password
                validated_data['password'] = make_password(validated_data['password'])
            else:
                validated_data.pop('password')  # Remove empty password from update
            
        # Handle profile image
        if 'profile_img' in validated_data and validated_data['profile_img'] is None:
            validated_data.pop('profile_img')
            
        return super().update(instance, validated_data)

class StudentCourseEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCourseEnrollment
        fields = ['id', 'student', 'course', 'enrolled_at']

class CourseRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRating
        fields = ['id', 'course', 'student', 'rating', 'review', 'created_at', 'updated_at']

class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_name = serializers.CharField(source='student.fullname', read_only=True)
    submission_date_formatted = serializers.SerializerMethodField()
    due_date_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'course', 'course_title', 'student', 'student_name', 'title', 'description', 
                 'due_date', 'due_date_formatted', 'assignment_file', 'submitted_file', 'submission_date', 'submission_date_formatted',
                 'grade', 'created_at', 'updated_at']
        read_only_fields = ['submission_date', 'grade']

    def get_submission_date_formatted(self, obj):
        if obj.submission_date:
            return obj.submission_date.strftime('%Y-%m-%d %H:%M:%S')
        return None

    def get_due_date_formatted(self, obj):
        if obj.due_date:
            return obj.due_date.strftime('%Y-%m-%d')
        return None

class QuizSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    total_questions = serializers.SerializerMethodField()
    class Meta:
        model = Quiz
        fields = ['id', 'teacher', 'teacher_name', 'title', 'description', 
                 'total_marks', 'total_questions', 'created_at', 'updated_at']
    
    def get_total_questions(self, obj):
        return obj.questions.count()

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'quiz', 'question_text', 'ans1', 'ans2', 'ans3', 'ans4', 'right_ans', 'created_at']

class QuizDetailSerializer(QuizSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = QuizSerializer.Meta.fields + ['questions']

class CourseQuizSerializer(serializers.ModelSerializer):
    quiz_details = QuizSerializer(source='quiz', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = CourseQuiz
        fields = ['id', 'course', 'course_title', 'quiz', 'quiz_details', 'assigned_at']

class StudentQuizResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = StudentQuizResponse
        fields = ['id', 'attempt', 'question', 'question_text', 'selected_answer', 'is_correct', 'created_at']

class StudentQuizAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.fullname', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    responses = StudentQuizResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentQuizAttempt
        fields = ['id', 'student', 'student_name', 'quiz', 'quiz_title', 'course', 
                 'course_title', 'total_questions', 'correct_answers', 'obtained_marks', 
                 'attempted_at', 'is_completed', 'responses']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient_teacher', 'recipient_student', 'notification_type', 
                 'title', 'message', 'related_quiz', 'related_course', 'is_read', 'created_at']

class StudyMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyMaterial
        fields = ['id', 'teacher', 'course', 'title', 'description', 'file', 'remarks', 'created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super(StudyMaterialSerializer, self).__init__(*args, **kwargs)
        request = self.context.get('request')
        self.Meta.depth = 0
        if request and request.method == 'GET':
            self.Meta.depth = 1

class FaqSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'created_at', 'updated_at']

class FlatPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlatPage
        fields = ['id', 'url', 'title', 'content', 'sites']

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']
        read_only_fields = ['created_at', 'is_read']

class TeacherStudentChatSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    student_name = serializers.CharField(source='student.fullname', read_only=True)
    
    class Meta:
        model = TeacherStudentChat
        fields = ['id', 'teacher', 'teacher_name', 'student', 'student_name', 'message', 'message_from', 'timestamp']



