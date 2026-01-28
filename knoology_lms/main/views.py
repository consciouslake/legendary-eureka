import json
import uuid
import random
import datetime
from django.db.models import Avg, Q, Count
from django.http import JsonResponse
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ParseError
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.flatpages.models import FlatPage
from django.contrib.sites.models import Site
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from .models import (
    Teacher, Course, CourseCategory, Chapter, Student, 
    StudentCourseEnrollment, CourseRating, StudentFavoriteCourse, 
    Assignment, Quiz, QuizQuestion, CourseQuiz, 
    StudentQuizAttempt, StudentQuizResponse, Notification, StudyMaterial,FAQ, ContactUs,
    PasswordResetToken, TeacherStudentChat, CoursePayment
)
import razorpay
from django.conf import settings
from .serializers import (
    TeacherSerializer, CourseSerializer, CategorySerializer, 
    ChapterSerializer, StudentSerializer, CourseRatingSerializer,
    AssignmentSerializer, QuizSerializer, QuizQuestionSerializer,
    QuizDetailSerializer, CourseQuizSerializer, StudentQuizAttemptSerializer,
    StudentQuizResponseSerializer, NotificationSerializer, StudyMaterialSerializer,
    StudentCourseEnrollmentSerializer,FaqSerializer, FlatPageSerializer, ContactUsSerializer,
    TeacherStudentChatSerializer
)

# Create your views here.
#class TeacherList(APIView):
#    def get(self, request):
 #       teachers = Teacher.objects.all()
 #       return Response(serializer.data)
    
class TeacherList(generics.ListCreateAPIView):
   queryset= Teacher.objects.all()
   serializer_class= TeacherSerializer
   #permission_classes = [permissions.IsAuthenticated]

# Copy this code and replace the TeacherDetail class in views.py
class TeacherDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        # Get the teacher instance
        instance = self.get_object()
        
        # First, handle direct file upload if present
        if 'profile_img' in request.FILES:
            # Save the file directly to the instance
            instance.profile_img = request.FILES['profile_img']
            instance.save(update_fields=['profile_img'])
            
        # Process the rest of the data with partial update
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': serializer.data
            })
        else:
            print("Serializer errors:", serializer.errors)
            return Response({
                'status': 'error',
                'message': 'Validation error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
@api_view(['POST'])
def teacher_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            try:
                teacher = Teacher.objects.get(email=email, password=password)
                
                # Check if the account is verified
                if not teacher.verify_status:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Account is not verified',
                        'teacher_id': teacher.id,
                        'verification_required': True
                    }, status=403)
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Login successful',
                    'teacher_id': teacher.id,
                    'full_name': teacher.full_name,
                    'email': teacher.email
                })
            except Teacher.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid email or password'
                }, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid data format'
            }, status=400)
    else:
        return JsonResponse({
            'status': 'error',
            'message': 'Only POST method is allowed'
        }, status=405)


class CategoryList(generics.ListCreateAPIView):
   queryset= CourseCategory.objects.all()
   serializer_class= CategorySerializer
   #permission_classes = [permissions.IsAuthenticated]

class CourseList(generics.ListCreateAPIView):
    queryset = Course.objects.select_related('teacher', 'category').all()
    serializer_class = CourseSerializer

    def create(self, request, *args, **kwargs):
        try:
            teacher_id = request.data.get('teacher')
            category_id = request.data.get('category')
            
            if not teacher_id:
                return Response({'message': 'Teacher ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not category_id:
                return Response({'message': 'Category ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Verify teacher and category exist
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                category = CourseCategory.objects.get(id=category_id)
            except (Teacher.DoesNotExist, CourseCategory.DoesNotExist):
                return Response({'message': 'Invalid teacher or category ID'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            # Fetch the created course with related data
            course = Course.objects.select_related('teacher', 'category').get(id=serializer.instance.id)
            return_serializer = self.get_serializer(course)
            return Response({'message': 'Course created successfully', 'data': return_serializer.data}, 
                          status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        teacher_id = self.request.data.get('teacher')
        category_id = self.request.data.get('category')
        teacher = Teacher.objects.get(id=teacher_id)
        category = CourseCategory.objects.get(id=category_id)
        serializer.save(teacher=teacher, category=category)

class CourseDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.select_related('teacher', 'category').all()
    serializer_class = CourseSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({'message': 'Course deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class TeacherCourseList(generics.ListAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        teacher_id = self.kwargs.get('teacher_id')
        return Course.objects.filter(teacher_id=teacher_id).select_related('teacher', 'category').prefetch_related('enrolled_students')

class ChapterList(generics.ListCreateAPIView):
    serializer_class = ChapterSerializer
    
    def get_queryset(self):
        return Chapter.objects.filter(course_id=self.kwargs.get('course_id'))
        
    def create(self, request, *args, **kwargs):
        course_id = self.kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
            
            # Add course_id to the data for validation
            data = request.data.copy()
            data['course'] = course_id
            
            # Handle text_content field from form data
            if 'text_content' in request.data:
                data['text_content'] = request.data.get('text_content')
            
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save(course=course)
                return Response({
                    'status': 'success',
                    'message': 'Chapter added successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'status': 'error',
                    'message': 'Validation error',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Course.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Course not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
            serializer.save(course=course)
        except Course.DoesNotExist:
            raise ValidationError('Invalid course ID')

class ChapterDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({'message': 'Chapter deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({'message': 'Chapter updated successfully', 'data': serializer.data})
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def course_chapter_list(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
        chapters = Chapter.objects.filter(course=course)
        serializer = ChapterSerializer(chapters, many=True)
        return Response({
            'course_title': course.title,
            'chapters': serializer.data
        })
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

class StudentRegistrationView(generics.CreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Auto-verify student (OTP disabled)
            student = serializer.save(verify_status=True)
            return Response({
                'status': 'success',
                'message': 'Student registration successful',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def student_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    try:
        student = Student.objects.get(username=username)
        
        # Try checking with Django's check_password first (for hashed passwords)
        password_valid = check_password(password, student.password)
        
        # If that fails, try direct comparison (for unhashed passwords)
        if not password_valid and student.password == password:
            password_valid = True
        
        if password_valid:
            # Check if the account is verified
            if not student.verify_status:
                return Response({
                    'status': 'error',
                    'message': 'Account is not verified',
                    'student_id': student.id,
                    'verification_required': True
                }, status=status.HTTP_403_FORBIDDEN)
                
            serializer = StudentSerializer(student, context={'request': request})
            return Response({
                'status': 'success',
                'message': 'Login successful',
                'student_id': student.id,
                'username': student.username,
                'fullname': student.fullname,
                'email': student.email
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def student_change_password(request, student_id):
    """
    Change student password. Requires current_password and new_password.
    """
    try:
        student = Student.objects.get(id=student_id)
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({
                'status': 'error',
                'message': 'Current password and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify current password using Django's check_password since student passwords are hashed
        if not check_password(current_password, student.password):
            return Response({
                'status': 'error',
                'message': 'Current password is incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # Update password with hashed version
        student.password = make_password(new_password)
        student.save()
        
        return Response({
            'status': 'success',
            'message': 'Password changed successfully'
        })
        
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def student_forgot_password(request):
    """
    Handle forgot password requests for students.
    """
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'status': 'error',
                'message': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        student = Student.objects.get(email=email)
        
        # Generate a unique token
        token = str(uuid.uuid4())
        expiry_time = timezone.now() + datetime.timedelta(hours=1)  # Token valid for 1 hour
        
        # Save the token in the database
        PasswordResetToken.objects.create(
            user=student,
            token=token,
            expiry_time=expiry_time
        )
        
        # Send email with reset link - Use path parameter instead of query parameter
        reset_link = f"http://localhost:3000/reset-password/{token}"  # Frontend URL with token in path
        send_mail(
            'Knoology LMS - Password Reset Request',
            f'Click the link below to reset your password:\n\n{reset_link}',
            'noreply@knoology.com',
            [email],
            fail_silently=False
        )
        
        return Response({
            'status': 'success',
            'message': 'Password reset link has been sent to your email'
        })
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student with this email does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def student_reset_password(request, token):
    """
    Handle password reset requests for students.
    """
    try:
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response({
                'status': 'error',
                'message': 'New password is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the token
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if the token has expired
        if timezone.now() > reset_token.expiry_time:
            return Response({
                'status': 'error',
                'message': 'Token has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the student's password
        student = reset_token.user
        student.password = make_password(new_password)
        student.save()
        
        # Delete the token after successful password reset
        reset_token.delete()
        
        return Response({
            'status': 'success',
            'message': 'Password has been reset successfully'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def teacher_forgot_password(request):
    """
    Handle forgot password requests for teachers.
    """
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'status': 'error',
                'message': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        teacher = Teacher.objects.get(email=email)
        
        # Generate a unique token
        token = str(uuid.uuid4())
        expiry_time = timezone.now() + datetime.timedelta(hours=1)  # Token valid for 1 hour
        
        # Save the token in the database
        PasswordResetToken.objects.create(
            user=teacher,
            token=token,
            expiry_time=expiry_time,
            is_teacher=True
        )
        
        # Send email with reset link
        reset_link = f"http://localhost:3000/teacher-reset-password/{token}"  # Frontend URL with token in path
        send_mail(
            'Knoology LMS - Password Reset Request',
            f'Click the link below to reset your password:\n\n{reset_link}',
            'noreply@knoology.com',
            [email],
            fail_silently=False
        )
        
        return Response({
            'status': 'success',
            'message': 'Password reset link has been sent to your email'
        })
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher with this email does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def teacher_reset_password(request):
    """
    Handle password reset requests for teachers.
    """
    try:
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not token or not new_password:
            return Response({
                'status': 'error',
                'message': 'Token and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the token
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_teacher=True)
        except PasswordResetToken.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if the token has expired
        if timezone.now() > reset_token.expiry_time:
            return Response({
                'status': 'error',
                'message': 'Token has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the teacher's password
        teacher = reset_token.user
        teacher.password = new_password  # Note: Not using make_password since teacher passwords seem to be stored as plaintext in this system
        teacher.save()
        
        # Delete the token after successful password reset
        reset_token.delete()
        
        return Response({
            'status': 'success',
            'message': 'Password has been reset successfully'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def teacher_dashboard_stats(request, teacher_id):
    """
    Provides statistics for the teacher dashboard:
    - Total number of courses taught by the teacher.
    - Total number of unique students enrolled in those courses.
    """
    try:
        # Count total courses for the teacher
        total_courses = Course.objects.filter(teacher_id=teacher_id).count()

        # Count unique students enrolled in the teacher's courses
        total_students = StudentCourseEnrollment.objects.filter(
            course__teacher_id=teacher_id
        ).values('student').distinct().count()
        
        # Optionally, fetch recent courses (can be done in a separate call if preferred)
        # recent_courses = Course.objects.filter(teacher_id=teacher_id).order_by('-id')[:3]
        # recent_courses_serializer = CourseSerializer(recent_courses, many=True)

        # Get course enrollment data for charts
        courses = Course.objects.filter(teacher_id=teacher_id)
        course_data = []
        for course in courses:
            enrollment_count = StudentCourseEnrollment.objects.filter(course=course).count()
            if enrollment_count > 0:
                course_data.append({
                    'title': course.title,
                    'enrollments': enrollment_count
                })

        return Response({
            'status': 'success',
            'total_courses': total_courses,
            'total_students': total_students,
            'course_data': course_data
        })
    except Teacher.DoesNotExist:
         return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def student_dashboard_stats(request, student_id):
    """
    Provides statistics for the student dashboard:
    - Quiz performance (marks obtained vs total marks)
    - Assignment completion status
    """
    try:
        student = Student.objects.get(id=student_id)
        
        # 1. Quiz Performance Data
        completed_quizzes = StudentQuizAttempt.objects.filter(
            student=student, 
            is_completed=True
        ).select_related('quiz')
        
        quiz_data = []
        for attempt in completed_quizzes:
            quiz_data.append({
                'title': attempt.quiz.title,
                'score': float(attempt.obtained_marks),
                'total': float(attempt.quiz.total_marks)
            })
            
        # 2. Assignment Status
        total_assignments = Assignment.objects.filter(student=student).count()
        completed_assignments = Assignment.objects.filter(
            student=student, 
            submission_date__isnull=False
        ).count()
        pending_assignments = total_assignments - completed_assignments
        
        assignment_data = {
            'completed': completed_assignments,
            'pending': pending_assignments
        }

        return Response({
            'status': 'success',
            'quiz_data': quiz_data,
            'assignment_data': assignment_data
        })
    except Student.DoesNotExist:
         return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def enroll_in_course(request):
    if not request.data.get('student_id') or not request.data.get('course_id'):
        return Response({
            'status': 'error',
            'message': 'Both student_id and course_id are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(id=request.data['student_id'])
        course = Course.objects.get(id=request.data['course_id'])
        
        # Check if already enrolled
        if StudentCourseEnrollment.objects.filter(student=student, course=course).exists():
            return Response({
                'status': 'error',
                'message': 'Student is already enrolled in this course'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create enrollment
        enrollment = StudentCourseEnrollment.objects.create(student=student, course=course)
        serializer = StudentCourseEnrollmentSerializer(enrollment)
        
        return Response({
            'status': 'success',
            'message': 'Successfully enrolled in the course',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Course.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def check_enrollment_status(request, student_id, course_id):
    try:
        enrollment = StudentCourseEnrollment.objects.filter(
            student_id=student_id,
            course_id=course_id
        ).exists()
        
        return Response({
            'is_enrolled': enrollment
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_enrolled_courses(request, student_id):
    try:
        # First check if the student exists
        if not Student.objects.filter(id=student_id).exists():
            return Response({
                'status': 'error',
                'message': f'Student with ID {student_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        enrollments = StudentCourseEnrollment.objects.filter(student_id=student_id)
        courses = [enrollment.course for enrollment in enrollments]
        
        # Add request to the serializer context
        serializer = CourseSerializer(courses, many=True, context={'request': request})
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        print(f"DEBUG: Error in get_enrolled_courses: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def unenroll_from_course(request):
    if not request.data.get('student_id') or not request.data.get('course_id'):
        return Response({
            'status': 'error',
            'message': 'Both student_id and course_id are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        enrollment = StudentCourseEnrollment.objects.get(
            student_id=request.data['student_id'],
            course_id=request.data['course_id']
        )
        enrollment.delete()
        
        return Response({
            'status': 'success',
            'message': 'Successfully unenrolled from the course'
        })
    except StudentCourseEnrollment.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def course_enrolled_students(request, course_id):
    try:
        enrollments = StudentCourseEnrollment.objects.filter(course_id=course_id)
        students = [enrollment.student for enrollment in enrollments]
        student_data = []
        for student in students:
            student_data.append({
                'id': student.id,
                'fullname': student.fullname,
                'email': student.email,
                'username': student.username
            })
        return Response({
            'status': 'success',
            'data': student_data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# Get all enrolled students across all courses
@api_view(['GET'])
def all_enrolled_students(request):
    try:
        # Get unique students from enrollments
        enrollments = StudentCourseEnrollment.objects.all()
        student_data = {}
        
        for enrollment in enrollments:
            student = enrollment.student
            if student.id not in student_data:
                student_data[student.id] = {
                    'id': student.id,
                    'fullname': student.fullname,
                    'email': student.email,
                    'username': student.username,
                    'courses': []
                }
            student_data[student.id]['courses'].append({
                'id': enrollment.course.id,
                'title': enrollment.course.title
            })
        
        return Response({
            'status': 'success',
            'data': list(student_data.values())
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def check_rating(request, student_id, course_id):
    try:
        rating = CourseRating.objects.get(
            student_id=student_id,
            course_id=course_id
        )
        serializer = CourseRatingSerializer(rating)
        return Response({
            'status': 'success',
            'rating': serializer.data
        })
    except CourseRating.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'No rating found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def rate_course(request):
    if not all(k in request.data for k in ('student_id', 'course_id', 'rating')):
        return Response({
            'status': 'error',
            'message': 'student_id, course_id and rating are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check if student is enrolled in the course
        enrollment = StudentCourseEnrollment.objects.filter(
            student_id=request.data['student_id'],
            course_id=request.data['course_id']
        ).exists()
        
        if not enrollment:
            return Response({
                'status': 'error',
                'message': 'Student must be enrolled in the course to rate it'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get or create rating
        rating, created = CourseRating.objects.get_or_create(
            student_id=request.data['student_id'],
            course_id=request.data['course_id'],
            defaults={
                'rating': request.data['rating'],
                'review': request.data.get('review', '')
            }
        )

        if not created:
            # Update existing rating
            rating.rating = request.data['rating']
            rating.review = request.data.get('review', rating.review)
            rating.save()

        # Get updated course rating stats
        course = Course.objects.get(id=request.data['course_id'])
        
        return Response({
            'status': 'success',
            'message': 'Rating submitted successfully',
            'average_rating': float(course.average_rating),
            'total_ratings': course.total_ratings
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def teacher_change_password(request, teacher_id):
    """
    Change teacher password. Requires current_password and new_password.
    """
    try:
        teacher = Teacher.objects.get(id=teacher_id)
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({
                'status': 'error',
                'message': 'Current password and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify current password
        if teacher.password != current_password:
            return Response({
                'status': 'error',
                'message': 'Current password is incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # Update password
        teacher.password = new_password
        teacher.save()
        
        return Response({
            'status': 'success',
            'message': 'Password changed successfully'
        })
        
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def recommended_courses(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
        
        # Get student's enrolled courses
        enrolled_courses = StudentCourseEnrollment.objects.filter(
            student=student
        ).values_list('course_id', flat=True)
        
        # Get student's interests
        interests = student.interested_categories.split(',') if student.interested_categories else []
        
        # Base query excluding enrolled courses
        base_query = Course.objects.exclude(id__in=enrolled_courses)
        
        # If student has interests, prioritize courses in those categories
        if interests:
            recommended = base_query.filter(
                Q(category__title__in=interests) |
                Q(technologies__icontains=interests[0])  # Match against technologies field
            ).distinct()
        else:
            recommended = base_query
        
        # Order by rating and limit to top 10
        recommended = recommended.annotate(
            avg_rating=Avg('ratings__rating')
        ).order_by('-avg_rating', '-total_ratings')[:10]
        
        serializer = CourseSerializer(recommended, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def check_favorite_status(request, student_id, course_id):
    """Check if a student has favorited a course"""
    try:
        is_favorite = StudentFavoriteCourse.objects.filter(
            student_id=student_id,
            course_id=course_id
        ).exists()
        
        return Response({
            'is_favorite': is_favorite
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def toggle_favorite(request):
    """Toggle favorite status of a course for a student"""
    if not request.data.get('student_id') or not request.data.get('course_id'):
        return Response({
            'status': 'error',
            'message': 'Both student_id and course_id are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(id=request.data['student_id'])
        course = Course.objects.get(id=request.data['course_id'])
        
        favorite, created = StudentFavoriteCourse.objects.get_or_create(
            student=student,
            course=course
        )
        
        if not created:
            favorite.delete()
            is_favorite = False
        else:
            is_favorite = True

        return Response({
            'status': 'success',
            'is_favorite': is_favorite,
            'message': 'Course added to favorites!' if is_favorite else 'Course removed from favorites!'
        })
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Course.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_favorite_courses(request, student_id):
    """Get all favorite courses for a student"""
    try:
        # First check if the student exists
        if not Student.objects.filter(id=student_id).exists():
            return Response({
                'status': 'error',
                'message': f'Student with ID {student_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        favorites = StudentFavoriteCourse.objects.filter(student_id=student_id)
        courses = [favorite.course for favorite in favorites]
        
        # Add request to the serializer context
        serializer = CourseSerializer(courses, many=True, context={'request': request})
        
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        print(f"DEBUG: Error in get_favorite_courses: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

class StudentDetail(generics.RetrieveUpdateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Student.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Student not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        try:
            # Handle profile image removal
            if request.data.get('remove_profile_img'):
                if instance.profile_img:
                    instance.profile_img.delete(save=True)
                    instance.profile_img = None
                    instance.save()
                return Response({
                    'status': 'success',
                    'message': 'Profile image removed successfully',
                    'data': self.get_serializer(instance).data
                })

            # Normal update with potential new profile image
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            try:
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response({
                    'status': 'success',
                    'message': 'Profile updated successfully',
                    'data': serializer.data
                })
            except serializers.ValidationError as e:
                return Response({
                    'status': 'error',
                    'message': 'Validation error',
                    'errors': e.detail
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

@api_view(['GET'])
def student_assignments(request, student_id):
    """Get all assignments for a student"""
    try:
        assignments = Assignment.objects.filter(student_id=student_id)
        serializer = AssignmentSerializer(assignments, many=True)
        return Response({
            'status': 'success',
            'student_name': assignments[0].student.fullname if assignments else '',
            'assignments': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_assignment(request, student_id):
    """Add a new assignment for a student"""
    try:
        # Verify the student is enrolled in the course
        enrollment = StudentCourseEnrollment.objects.filter(
            student_id=student_id,
            course_id=request.data.get('course')
        ).exists()
        
        if not enrollment:
            return Response({
                'status': 'error',
                'message': 'Student is not enrolled in this course'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Add student_id to the data
        data = request.data.copy()
        data['student'] = student_id
        
        # Handle the assignment file if provided
        if 'assignment_file' in request.FILES:
            data['assignment_file'] = request.FILES['assignment_file']
        
        serializer = AssignmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Assignment added successfully',
                'data': serializer.data
            })
        return Response({
            'status': 'error',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def submit_assignment(request, assignment_id):
    """Submit an assignment"""
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        
        if not request.FILES.get('submitted_file'):
            return Response({
                'status': 'error',
                'message': 'No file submitted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        assignment.submitted_file = request.FILES['submitted_file']
        assignment.submission_date = timezone.now()
        assignment.save()
        
        serializer = AssignmentSerializer(assignment)
        return Response({
            'status': 'success',
            'message': 'Assignment submitted successfully',
            'data': serializer.data
        })
    except Assignment.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Assignment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def grade_assignment(request, assignment_id):
    """Grade an assignment"""
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        
        # Get grade from request data
        grade = request.data.get('grade')
        if not grade:
            return Response({
                'status': 'error',
                'message': 'Grade is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate grade format
        valid_grades = ['A', 'B', 'C', 'D', 'F']
        if grade not in valid_grades:
            return Response({
                'status': 'error',
                'message': f'Invalid grade. Must be one of: {", ".join(valid_grades)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update grade
        assignment.grade = grade
        assignment.save()
        
        serializer = AssignmentSerializer(assignment)
        return Response({
            'status': 'success',
            'message': 'Assignment graded successfully',
            'data': serializer.data
        })
    except Assignment.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Assignment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def student_courses(request, student_id):
    """Get courses a student is enrolled in"""
    """Get courses a student is enrolled in"""
    print(f"DEBUG: student_courses called with student_id={student_id}")
    try:
        # First check if the student exists
        if not Student.objects.filter(id=student_id).exists():
            print(f"DEBUG: Student with ID {student_id} not found")
            return Response({
                'status': 'error',
                'message': f'Student with ID {student_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        print(f"DEBUG: Student exists, fetching enrollments")
        enrollments = StudentCourseEnrollment.objects.filter(student_id=student_id)
        print(f"DEBUG: Found {len(enrollments)} enrollments")
        courses = [enrollment.course for enrollment in enrollments]
        print(f"DEBUG: Extracted {len(courses)} courses")
        
        # Add request to serializer context
        serializer = CourseSerializer(courses, many=True, context={'request': request})
        print(f"DEBUG: Serialized data successfully")
        
        return Response({
            'status': 'success',
            'courses': serializer.data        })
    except Exception as e:
        print(f"ERROR in student_courses: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_assignment(request, assignment_id):
    """Update an assignment"""
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        
        # Validate required fields
        if not all(field in request.data for field in ['title', 'due_date']):
            return Response({
                'status': 'error',
                'message': 'Title and due date are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse the date string from frontend
            from datetime import datetime
            due_date = datetime.strptime(request.data['due_date'], '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update fields
        assignment.title = request.data['title']
        assignment.due_date = due_date
        assignment.description = request.data.get('description', assignment.description)
        
        # Handle file if provided
        if 'assignment_file' in request.FILES:
            assignment.assignment_file = request.FILES['assignment_file']
        
        assignment.save()
        
        serializer = AssignmentSerializer(assignment)
        return Response({
            'status': 'success',
            'message': 'Assignment updated successfully',
            'data': serializer.data
        })
    except Assignment.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Assignment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_assignment(request, assignment_id):
    """Delete an assignment"""
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        assignment.delete()
        return Response({
            'status': 'success',
            'message': 'Assignment deleted successfully'
        })
    except Assignment.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Assignment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# Quiz Views
class TeacherQuizList(generics.ListCreateAPIView):
    serializer_class = QuizSerializer

    def get_queryset(self):
        teacher_id = self.kwargs.get('teacher_id')
        return Quiz.objects.filter(teacher_id=teacher_id).annotate(
            question_count=Count('questions')).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        teacher_id = self.kwargs.get('teacher_id')
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            
            # Add teacher_id to request data
            data = request.data.copy()
            data['teacher'] = teacher_id
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            return Response({
                'status': 'success',
                'message': 'Quiz created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Teacher.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Teacher not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        teacher_id = self.kwargs.get('teacher_id')
        teacher = Teacher.objects.get(id=teacher_id)
        serializer.save(teacher=teacher)

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizDetailSerializer

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({
                'status': 'success',
                'message': 'Quiz updated successfully',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                'status': 'success',
                'message': 'Quiz deleted successfully'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class QuizQuestionCreateView(generics.CreateAPIView):
    serializer_class = QuizQuestionSerializer

    def create(self, request, *args, **kwargs):
        try:
            quiz_id = self.kwargs.get('quiz_id')
            # Check if quiz exists
            quiz = Quiz.objects.get(id=quiz_id)
            
            # Add quiz_id to the data
            data = request.data.copy()
            data['quiz'] = quiz_id
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'message': 'Quiz question added successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Quiz.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Quiz not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class QuizQuestionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({
                'status': 'success',
                'message': 'Quiz question updated successfully',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                'status': 'success',
                'message': 'Quiz question deleted successfully'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def quiz_questions(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        questions = QuizQuestion.objects.filter(quiz=quiz)
        serializer = QuizQuestionSerializer(questions, many=True)
        return Response({
            'status': 'success',
            'quiz_title': quiz.title,
            'questions': serializer.data
        })
    except Quiz.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Quiz not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def assign_quiz_to_course(request):
    if not request.data.get('quiz_id') or not request.data.get('course_id'):
        return Response({
            'status': 'error',
            'message': 'Both quiz_id and course_id are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        quiz = Quiz.objects.get(id=request.data['quiz_id'])
        course = Course.objects.get(id=request.data['course_id'])
        
        # Check if already assigned
        if CourseQuiz.objects.filter(quiz=quiz, course=course).exists():
            return Response({
                'status': 'error',
                'message': 'Quiz is already assigned to this course'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create assignment
        course_quiz = CourseQuiz.objects.create(quiz=quiz, course=course)
        serializer = CourseQuizSerializer(course_quiz)
        
        # Send notifications to enrolled students
        enrolled_students = StudentCourseEnrollment.objects.filter(course=course)
        for enrollment in enrolled_students:
            Notification.objects.create(
                recipient_student=enrollment.student,
                notification_type='quiz_assigned',
                title='New Quiz Available',
                message=f'A new quiz "{quiz.title}" has been assigned to the course "{course.title}"',
                related_quiz=quiz,
                related_course=course
            )
        
        return Response({
            'status': 'success',
            'message': f'Quiz assigned to course successfully. {enrolled_students.count()} students notified.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Quiz.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Quiz not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Course.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Course not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_quiz_from_course(request, course_quiz_id):
    try:
        course_quiz = CourseQuiz.objects.get(id=course_quiz_id)
        course_quiz.delete()
        return Response({
            'status': 'success',
            'message': 'Quiz removed from course successfully'
        })
    except CourseQuiz.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Course quiz assignment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def course_assigned_quizzes(request, course_id):
    try:
        course_quizzes = CourseQuiz.objects.filter(course_id=course_id)
        serializer = CourseQuizSerializer(course_quizzes, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def student_available_quizzes(request, student_id):
    try:
        # Get courses the student is enrolled in
        enrolled_courses = StudentCourseEnrollment.objects.filter(
            student_id=student_id
        ).values_list('course_id', flat=True)
        
        # Get quizzes assigned to these courses
        course_quizzes = CourseQuiz.objects.filter(
            course_id__in=enrolled_courses
        ).select_related('quiz', 'course')
        
        # Check which quizzes the student has already attempted
        attempted_quizzes = StudentQuizAttempt.objects.filter(
            student_id=student_id,
            is_completed=True
        ).values_list('quiz_id', flat=True)
        
        # Prepare data for response
        quiz_data = []
        for course_quiz in course_quizzes:
            quiz_data.append({
                'id': course_quiz.id,
                'course_id': course_quiz.course.id,
                'course_title': course_quiz.course.title,
                'quiz_id': course_quiz.quiz.id,
                'quiz_title': course_quiz.quiz.title,
                'total_questions': course_quiz.quiz.questions.count(),
                'total_marks': course_quiz.quiz.total_marks,
                'assigned_at': course_quiz.assigned_at,
                'already_attempted': course_quiz.quiz.id in attempted_quizzes
            })
        
        return Response({
            'status': 'success',
            'data': quiz_data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_quiz_for_attempt(request, quiz_id, student_id, course_id):
    try:
        # Check if student is enrolled in the course
        if not StudentCourseEnrollment.objects.filter(
            student_id=student_id, course_id=course_id
        ).exists():
            return Response({
                'status': 'error',
                'message': 'Student is not enrolled in this course'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the quiz is assigned to the course
        if not CourseQuiz.objects.filter(
            quiz_id=quiz_id, course_id=course_id
        ).exists():
            return Response({
                'status': 'error',
                'message': 'This quiz is not assigned to the course'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if student has already completed this quiz
        if StudentQuizAttempt.objects.filter(
            student_id=student_id, quiz_id=quiz_id, course_id=course_id, is_completed=True
        ).exists():
            return Response({
                'status': 'error',
                'message': 'You have already completed this quiz'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get quiz details with questions
        quiz = Quiz.objects.get(id=quiz_id)
        questions = list(QuizQuestion.objects.filter(quiz=quiz).values(
            'id', 'question_text', 'ans1', 'ans2', 'ans3', 'ans4'
        ))
        
        # Start or get an existing incomplete attempt
        attempt, created = StudentQuizAttempt.objects.get_or_create(
            student_id=student_id,
            quiz_id=quiz_id,
            course_id=course_id,
            is_completed=False,
            defaults={
                'total_questions': len(questions)
            }
        )
        
        return Response({
            'status': 'success',
            'quiz': {
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'total_marks': quiz.total_marks,
                'total_questions': len(questions)
            },
            'questions': questions,
            'attempt_id': attempt.id
        })
    except Quiz.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Quiz not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def submit_quiz_attempt(request, attempt_id):
    try:
        # Get the attempt
        attempt = StudentQuizAttempt.objects.get(id=attempt_id)
        
        if attempt.is_completed:
            return Response({
                'status': 'error',
                'message': 'This quiz attempt has already been submitted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get submitted answers
        answers = request.data.get('answers', [])
        if not answers:
            return Response({
                'status': 'error',
                'message': 'No answers submitted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process answers
        correct_count = 0
        
        for ans in answers:
            question_id = ans.get('question_id')
            selected_answer = ans.get('selected_answer')
            
            try:
                question = QuizQuestion.objects.get(id=question_id, quiz=attempt.quiz)
                is_correct = question.right_ans == selected_answer
                
                if is_correct:
                    correct_count += 1
                
                # Save response
                StudentQuizResponse.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_answer=selected_answer,
                    is_correct=is_correct
                )
                
            except QuizQuestion.DoesNotExist:
                continue
        
        # Calculate score
        marks_per_question = attempt.quiz.total_marks / attempt.total_questions if attempt.total_questions > 0 else 0
        obtained_marks = correct_count * marks_per_question
        
        # Update attempt
        attempt.correct_answers = correct_count
        attempt.obtained_marks = obtained_marks
        attempt.is_completed = True
        attempt.save()
        
        # Create notification for teacher
        Notification.objects.create(
            recipient_teacher=attempt.quiz.teacher,
            notification_type='quiz_completed',
            title='Quiz Completed',
            message=f'Student {attempt.student.fullname} has completed the quiz "{attempt.quiz.title}" with score {obtained_marks}/{attempt.quiz.total_marks}',
            related_quiz=attempt.quiz,
            related_course=attempt.course
        )
        
        return Response({
            'status': 'success',
            'message': 'Quiz submitted successfully',
            'result': {
                'total_questions': attempt.total_questions,
                'correct_answers': correct_count,
                'obtained_marks': float(obtained_marks),
                'total_marks': attempt.quiz.total_marks
            }
        })
    except StudentQuizAttempt.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Quiz attempt not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def student_quiz_results(request, student_id):
    try:
        attempts = StudentQuizAttempt.objects.filter(
            student_id=student_id,
            is_completed=True
        ).select_related('quiz', 'course')
        
        results = []
        for attempt in attempts:
            results.append({
                'attempt_id': attempt.id,
                'quiz_id': attempt.quiz.id,
                'quiz_title': attempt.quiz.title,
                'course_id': attempt.course.id,
                'course_title': attempt.course.title,
                'total_questions': attempt.total_questions,
                'correct_answers': attempt.correct_answers,
                'obtained_marks': float(attempt.obtained_marks),
                'total_marks': attempt.quiz.total_marks,
                'percentage': float(attempt.obtained_marks) / attempt.quiz.total_marks * 100 if attempt.quiz.total_marks > 0 else 0,
                'attempted_at': attempt.attempted_at
            })
        
        return Response({
            'status': 'success',
            'data': results
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def student_quiz_attempt_detail(request, attempt_id):
    try:
        attempt = StudentQuizAttempt.objects.get(id=attempt_id)
        
        # Get responses with correct answers
        responses = StudentQuizResponse.objects.filter(attempt=attempt).select_related('question')
        response_data = []
        
        for response in responses:
            response_data.append({
                'question_text': response.question.question_text,
                'ans1': response.question.ans1,
                'ans2': response.question.ans2,
                'ans3': response.question.ans3,
                'ans4': response.question.ans4,
                'selected_answer': response.selected_answer,
                'right_answer': response.question.right_ans,
                'is_correct': response.is_correct
            })
        
        return Response({
            'status': 'success',
            'attempt': {
                'quiz_title': attempt.quiz.title,
                'course_title': attempt.course.title,
                'total_questions': attempt.total_questions,
                'correct_answers': attempt.correct_answers,
                'obtained_marks': float(attempt.obtained_marks),
                'total_marks': attempt.quiz.total_marks,
                'percentage': float(attempt.obtained_marks) / attempt.quiz.total_marks * 100 if attempt.quiz.total_marks > 0 else 0,
                'attempted_at': attempt.attempted_at
            },
            'responses': response_data
        })
    except StudentQuizAttempt.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Quiz attempt not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def course_quiz_results(request, course_id, quiz_id):
    try:
        # Get all attempts for this quiz in this course
        attempts = StudentQuizAttempt.objects.filter(
            course_id=course_id,
            quiz_id=quiz_id,
            is_completed=True
        ).select_related('student')
        
        results = []
        for attempt in attempts:
            results.append({
                'attempt_id': attempt.id,
                'student_id': attempt.student.id,
                'student_name': attempt.student.fullname,
                'total_questions': attempt.total_questions,
                'correct_answers': attempt.correct_answers,
                'obtained_marks': float(attempt.obtained_marks),
                'total_marks': attempt.quiz.total_marks,
                'percentage': float(attempt.obtained_marks) / attempt.quiz.total_marks * 100 if attempt.quiz.total_marks > 0 else 0,
                'attempted_at': attempt.attempted_at
            })
        
        # Get quiz and course details
        quiz = Quiz.objects.get(id=quiz_id)
        course = Course.objects.get(id=course_id)
        
        return Response({
            'status': 'success',
            'quiz_title': quiz.title,
            'course_title': course.title,
            'total_students': len(results),
            'results': results
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def student_quiz_attempts(request, student_id):
    """
    Retrieve all quiz attempts for a specific student with detailed analytics
    """
    try:
        # Verify student exists
        student = Student.objects.get(id=student_id)
        
        # Get all completed quiz attempts by this student
        attempts = StudentQuizAttempt.objects.filter(
            student_id=student_id,
            is_completed=True
        ).select_related('quiz', 'course', 'student')
        
        # Transform data for frontend visualization
        result_data = []
        for attempt in attempts:
            # Get question-by-question responses
            responses = StudentQuizResponse.objects.filter(attempt=attempt).select_related('question')
            questions_data = []
            
            for response in responses:
                questions_data.append({
                    'question_text': response.question.question_text,
                    'selected_option': response.selected_answer,
                    'correct_option': response.question.right_ans,
                    'is_correct': response.is_correct
                })
            
            # Calculate percentage score
            percentage = (attempt.obtained_marks / attempt.quiz.total_marks * 100) if attempt.quiz.total_marks > 0 else 0
            
            result_data.append({
                'id': attempt.id,
                'student': attempt.student.id,
                'student_name': attempt.student.fullname,
                'username': attempt.student.username,
                'quiz': attempt.quiz.id,
                'quiz_title': attempt.quiz.title,
                'course': attempt.course.id,
                'course_title': attempt.course.title,
                'total_questions': attempt.total_questions,
                'total_score': attempt.correct_answers,
                'obtained_marks': float(attempt.obtained_marks),
                'total_marks': float(attempt.quiz.total_marks),
                'percentage': float(percentage),
                'created_at': attempt.attempted_at,
                'questions_data': json.dumps(questions_data)
            })
        
        return Response({
            'status': 'success',
            'data': result_data
        })
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def all_quiz_attempts(request):
    """
    Retrieve all quiz attempts with detailed analytics for all students
    """
    try:
        # Get all completed quiz attempts
        attempts = StudentQuizAttempt.objects.filter(
            is_completed=True
        ).select_related('quiz', 'course', 'student')
        
        # Transform data for frontend visualization
        result_data = []
        for attempt in attempts:
            # Calculate percentage score
            percentage = (attempt.obtained_marks / attempt.quiz.total_marks * 100) if attempt.quiz.total_marks > 0 else 0
            
            result_data.append({
                'id': attempt.id,
                'student': attempt.student.id,
                'student_name': attempt.student.fullname,
                'username': attempt.student.username,
                'quiz': attempt.quiz.id,
                'quiz_title': attempt.quiz.title,
                'course': attempt.course.id,
                'course_title': attempt.course.title,
                'total_questions': attempt.total_questions,
                'total_score': attempt.correct_answers,
                'obtained_marks': float(attempt.obtained_marks),
                'total_marks': float(attempt.quiz.total_marks),
                'percentage': float(percentage),
                'created_at': attempt.attempted_at
            })
        
        return Response({
            'status': 'success',
            'data': result_data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_notifications(request, user_type, user_id):
    try:
        if user_type == 'teacher':
            notifications = Notification.objects.filter(
                recipient_teacher_id=user_id
            )
        elif user_type == 'student':
            notifications = Notification.objects.filter(
                recipient_student_id=user_id
            )
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid user type. Must be "teacher" or "student"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()
        return Response({
            'status': 'success',
            'message': 'Notification marked as read'
        })
    except Notification.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Notification not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_unread_notification_count(request, user_type, user_id):
    try:
        if user_type == 'teacher':
            count = Notification.objects.filter(
                recipient_teacher_id=user_id,
                is_read=False
            ).count()
        elif user_type == 'student':
            count = Notification.objects.filter(
                recipient_student_id=user_id,
                is_read=False
            ).count()
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid user type. Must be "teacher" or "student"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'status': 'success',
            'count': count
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def search_courses(request):
    try:
        query = request.GET.get('q', '')
        if not query:
            return Response({
                'status': 'error',
                'message': 'Search query is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Search in title, description, and technologies
        # Sanitize the query to avoid any potential issues
        # This prevents issues with special characters in the search query
        sanitized_query = query.strip()
        
        courses = Course.objects.filter(
            Q(title__icontains=sanitized_query) |
            Q(description__icontains=sanitized_query) |
            Q(technologies__icontains=sanitized_query)
        ).select_related('teacher', 'category').distinct()

        serializer = CourseSerializer(courses, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        # Log the error for debugging
        print(f"Search error for query '{query}': {str(e)}")
        # Always return an empty result set instead of error for better user experience
        return Response({
            'status': 'success',
            'data': []
        })

# Study Material views
class StudyMaterialList(generics.ListCreateAPIView):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer
    
    def get_queryset(self):
        # If course_id is provided, filter materials for specific course
        course_id = self.kwargs.get('course_id')
        if course_id:
            return StudyMaterial.objects.filter(course=course_id)
        return StudyMaterial.objects.all()

class StudyMaterialDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer

class CourseStudyMaterialList(generics.ListAPIView):
    serializer_class = StudyMaterialSerializer
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return StudyMaterial.objects.filter(course_id=course_id)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

@csrf_exempt
def notify_new_study_material(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=400)
    
    import json
    data = json.loads(request.body)
    course_id = data.get('course_id')
    material_id = data.get('material_id')
    material_title = data.get('material_title', 'New study material')
    
    if not course_id or not material_id:
        return JsonResponse({'error': 'Course ID and Material ID are required'}, status=400)
    
    try:
        course = Course.objects.get(id=course_id)
        study_material = StudyMaterial.objects.get(id=material_id)
        
        # Get all students enrolled in this course
        enrolled_students = StudentCourseEnrollment.objects.filter(course=course).values_list('student', flat=True)
        
        # Create notification for each enrolled student
        for student_id in enrolled_students:
            student = Student.objects.get(id=student_id)
            notification = Notification(
                recipient_student=student,
                notification_type='study_material_added',
                title=f'New study material added: {material_title}',
                message=f'A new study material "{study_material.title}" has been added to your course "{course.title}"',
                related_course=course,
                is_read=False
            )
            notification.save()
        
        return JsonResponse({'success': True, 'message': f'Notifications sent to {len(enrolled_students)} students'})
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)
    except StudyMaterial.DoesNotExist:
        return JsonResponse({'error': 'Study material not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def get_top_course_ratings(request):
    """
    Retrieve top 3 course ratings with the highest ratings and non-empty reviews
    for use in testimonials.
    """
    try:
        # Get ratings that have non-empty reviews and sort by rating value
        top_ratings = CourseRating.objects.exclude(review='').order_by('-rating')[:4]
        
        # Prepare data with student name, course title, and review
        ratings_data = []
        for rating in top_ratings:
            ratings_data.append({
                'id': rating.id,
                'student_name': rating.student.fullname,
                'course_title': rating.course.title,
                'rating': rating.rating,
                'review': rating.review
            })
        
        return Response({
            'status': 'success',
            'data': ratings_data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def teacher_enrolled_students(request, teacher_id):
    """Get students enrolled in courses taught by a specific teacher"""
    try:
        # Verify the teacher exists
        teacher = Teacher.objects.get(id=teacher_id)
        
        # Get IDs of all courses taught by this teacher
        teacher_course_ids = Course.objects.filter(teacher_id=teacher_id).values_list('id', flat=True)
        
        # Get enrollments for these courses
        enrollments = StudentCourseEnrollment.objects.filter(course_id__in=teacher_course_ids)
        
        # Collect unique students with their enrolled courses (taught by this teacher)
        student_data = {}
        for enrollment in enrollments:
            student = enrollment.student
            if student.id not in student_data:
                student_data[student.id] = {
                    'id': student.id,
                    'fullname': student.fullname,
                    'email': student.email,
                    'username': student.username,
                    'courses': []
                }
            student_data[student.id]['courses'].append({
                'id': enrollment.course.id,
                'title': enrollment.course.title
            })
        
        return Response({
            'status': 'success',
            'data': list(student_data.values())
        })
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def teacher_assignments(request, teacher_id):
    """Get all assignments for students enrolled in courses taught by a specific teacher"""
    try:
        # Verify the teacher exists
        teacher = Teacher.objects.get(id=teacher_id)
        
        # Get IDs of all courses taught by this teacher
        teacher_course_ids = Course.objects.filter(teacher_id=teacher_id).values_list('id', flat=True)
        
        # Get enrollments for these courses to get the students
        student_ids = StudentCourseEnrollment.objects.filter(
            course_id__in=teacher_course_ids
        ).values_list('student_id', flat=True).distinct()
        
        # Get all assignments for these students in the teacher's courses
        assignments = Assignment.objects.filter(
            student_id__in=student_ids,
            course_id__in=teacher_course_ids
        ).select_related('student', 'course')
        
        # Prepare the assignment data with formatted dates
        assignment_data = []
        for assignment in assignments:
            due_date_formatted = assignment.due_date.strftime('%Y-%m-%d') if assignment.due_date else None
            submission_date_formatted = assignment.submission_date.strftime('%Y-%m-%d %H:%M') if assignment.submission_date else None
            
            assignment_data.append({
                'id': assignment.id,
                'title': assignment.title,
                'description': assignment.description,
                'due_date': assignment.due_date,
                'due_date_formatted': due_date_formatted,
                'submission_date': assignment.submission_date,
                'submission_date_formatted': submission_date_formatted,
                'grade': assignment.grade,
                'student': assignment.student.id,
                'student_name': assignment.student.fullname,
                'course': assignment.course.id,
                'course_title': assignment.course.title,
            })
        
        return Response({
            'status': 'success',
            'assignments': assignment_data
        })
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def teacher_all_quiz_attempts(request, teacher_id):
    """Get all quiz attempts for a teacher's students"""
    try:
        # Verify teacher exists
        teacher = Teacher.objects.get(id=teacher_id)
        
        # Get all quizzes created by this teacher
        teacher_quiz_ids = Quiz.objects.filter(teacher_id=teacher_id).values_list('id', flat=True)
        
        # Get all courses taught by this teacher
        teacher_course_ids = Course.objects.filter(teacher_id=teacher_id).values_list('id', flat=True)
        
        # Get all quiz attempts for quizzes created by this teacher
        # or attempts for quizzes assigned to courses taught by this teacher
        attempts = StudentQuizAttempt.objects.filter(
            Q(quiz_id__in=teacher_quiz_ids) | Q(course_id__in=teacher_course_ids),
            is_completed=True
        ).select_related('quiz', 'course', 'student')
        
        # Transform data for frontend visualization
        result_data = []
        for attempt in attempts:
            # Get question-by-question responses
            responses = StudentQuizResponse.objects.filter(attempt=attempt).select_related('question')
            questions_data = []
            
            for response in responses:
                questions_data.append({
                    'question_text': response.question.question_text,
                    'selected_option': response.selected_answer,
                    'correct_option': response.question.right_ans,
                    'is_correct': response.is_correct
                })
            
            # Calculate percentage score
            percentage = (attempt.obtained_marks / attempt.quiz.total_marks * 100) if attempt.quiz.total_marks > 0 else 0
            
            result_data.append({
                'id': attempt.id,
                'student': attempt.student.id,
                'student_name': attempt.student.fullname,
                'username': attempt.student.username,
                'quiz': attempt.quiz.id,
                'quiz_title': attempt.quiz.title,
                'course': attempt.course.id,
                'course_title': attempt.course.title,
                'total_questions': attempt.total_questions,
                'total_score': attempt.correct_answers,
                'obtained_marks': float(attempt.obtained_marks),
                'total_marks': float(attempt.quiz.total_marks),
                'percentage': float(percentage),
                'created_at': attempt.attempted_at,
                'questions_data': json.dumps(questions_data)
            })
        
        return Response({
            'status': 'success',
            'data': result_data
        })
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def teacher_student_quiz_attempts(request, teacher_id, student_id):
    """Get all quiz attempts for a specific student in courses taught by a teacher"""
    try:
        # Verify teacher exists
        teacher = Teacher.objects.get(id=teacher_id)
        
        # Verify student exists
        student = Student.objects.get(id=student_id)
        
        # Get all courses taught by this teacher
        teacher_course_ids = Course.objects.filter(teacher_id=teacher_id).values_list('id', flat=True)
        
        # Verify the student is enrolled in at least one of the teacher's courses
        student_enrolled = StudentCourseEnrollment.objects.filter(
            student_id=student_id,
            course_id__in=teacher_course_ids
        ).exists()
        
        if not student_enrolled:
            return Response({
                'status': 'error',
                'message': 'Student is not enrolled in any courses taught by this teacher'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all quiz attempts by this student in courses taught by this teacher
        attempts = StudentQuizAttempt.objects.filter(
            student_id=student_id,
            course_id__in=teacher_course_ids,
            is_completed=True
        ).select_related('quiz', 'course', 'student')
        
        # Transform data for frontend visualization
        result_data = []
        for attempt in attempts:
            # Get question-by-question responses
            responses = StudentQuizResponse.objects.filter(attempt=attempt).select_related('question')
            questions_data = []
            
            for response in responses:
                questions_data.append({
                    'question_text': response.question.question_text,
                    'selected_option': response.selected_answer,
                    'correct_option': response.question.right_ans,
                    'is_correct': response.is_correct
                })
            
            # Calculate percentage score
            percentage = (attempt.obtained_marks / attempt.quiz.total_marks * 100) if attempt.quiz.total_marks > 0 else 0
            
            result_data.append({
                'id': attempt.id,
                'student': attempt.student.id,
                'student_name': attempt.student.fullname,
                'username': attempt.student.username,
                'quiz': attempt.quiz.id,
                'quiz_title': attempt.quiz.title,
                'course': attempt.course.id,
                'course_title': attempt.course.title,
                'total_questions': attempt.total_questions,
                'total_score': attempt.correct_answers,
                'obtained_marks': float(attempt.obtained_marks),
                'total_marks': float(attempt.quiz.total_marks),
                'percentage': float(percentage),
                'created_at': attempt.attempted_at,
                'questions_data': json.dumps(questions_data)
            })
        
        return Response({
            'status': 'success',
            'data': result_data
        })
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FaqList(generics.ListAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FaqSerializer

# FlatPage views
class FlatPageList(generics.ListAPIView):
    queryset = FlatPage.objects.all()
    serializer_class = FlatPageSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
def get_flatpage_by_url(request, url):
    try:
        # Get the current site
        site = Site.objects.get_current()
        
        # Format the URL properly for querying
        # First, ensure it starts with a slash
        if not url.startswith('/'):
            url = '/' + url
        
        try:
            # Try to get the page with the current URL format
            flatpage = FlatPage.objects.get(url=url, sites=site)
        except FlatPage.DoesNotExist:
            # If not found, try with a trailing slash if it doesn't have one already
            if not url.endswith('/'):
                try:
                    flatpage = FlatPage.objects.get(url=url + '/', sites=site)
                except FlatPage.DoesNotExist:
                    # If still not found, try without slash if it has one
                    if url != '/' and url.endswith('/'):
                        flatpage = FlatPage.objects.get(url=url[:-1], sites=site)
                    else:
                        raise
        
        serializer = FlatPageSerializer(flatpage)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except FlatPage.DoesNotExist:
        return Response({
            'status': 'error',
            'message': f'FlatPage with URL {url} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Site.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Site configuration error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_contact_form(request):
    """
    Handle contact form submissions.
    Saves the message to the database and sends an email notification.
    """
    try:
        serializer = ContactUsSerializer(data=request.data)
        if serializer.is_valid():
            # Save the contact message to the database
            contact_message = serializer.save()
            
            # Send email notification
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                
                subject = f"New Contact Message: {contact_message.subject}"
                message_body = f"""
                Name: {contact_message.name}
                Email: {contact_message.email}
                Subject: {contact_message.subject}
                
                Message:
                {contact_message.message}
                
                Received on: {contact_message.created_at}
                """
                
                # Send email from the site's support email to admin
                recipient_list = [settings.ADMIN_EMAIL] if hasattr(settings, 'ADMIN_EMAIL') else ['admin@example.com']
                send_mail(
                    subject,
                    message_body,
                    settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@knoology.com',
                    recipient_list,
                    fail_silently=True,  # Do not raise exception if email sending fails
                )
                
                # Also send a confirmation email to the user
                user_subject = "Thank you for contacting Knoology LMS"
                user_message = f"""
                Dear {contact_message.name},
                
                Thank you for contacting Knoology LMS. We have received your message.
                One of our team members will get back to you as soon as possible.
                
                Your message details:
                Subject: {contact_message.subject}
                
                Best regards,
                The Knoology LMS Team
                """
                
                send_mail(
                    user_subject,
                    user_message,
                    settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@knoology.com',
                    [contact_message.email],
                    fail_silently=True,
                )
                
                email_sent = True
            except Exception as email_error:
                print(f"Failed to send email: {str(email_error)}")
                email_sent = False
            
            # Return success response
            return Response({
                'status': 'success',
                'message': 'Your message has been sent successfully. We will get back to you soon.',
                'email_notification_sent': email_sent
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid form data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin API to get all contact messages
@api_view(['GET'])
def get_contact_messages(request):
    """
    Get all contact messages (for admin)
    """
    try:
        messages = ContactUs.objects.all().order_by('-created_at')
        serializer = ContactUsSerializer(messages, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API to mark contact message as read
@api_view(['PATCH'])
def mark_contact_message_read(request, message_id):
    """
    Mark a contact message as read (for admin)
    """
    try:
        message = ContactUs.objects.get(id=message_id)
        message.is_read = True
        message.save()
        serializer = ContactUsSerializer(message)
        return Response({
            'status': 'success',
            'message': 'Message marked as read',
            'data': serializer.data
        })
    except ContactUs.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Message not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def verify_teacher_otp(request, teacher_id):
    try:
        otp_digit = request.data.get('otp_digit')
        
        if not otp_digit:
            return Response({
                'status': 'error',
                'message': 'OTP is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the OTP
        teacher = Teacher.objects.get(id=teacher_id)
        
        if teacher.verify_status:
            return Response({
                'status': 'success',
                'message': 'Account is already verified',
                'teacher_id': teacher.id
            })
        
        if teacher.otp_digit != otp_digit:
            return Response({
                'status': 'error',
                'message': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as verified and update OTP
        teacher.verify_status = True
        teacher.otp_digit = None  # Clear OTP after verification
        teacher.save()
        
        return Response({
            'status': 'success',
            'message': 'Account verified successfully',
            'teacher_id': teacher.id
        })
        
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def verify_student_otp(request, student_id):
    try:
        otp_digit = request.data.get('otp_digit')
        
        if not otp_digit:
            return Response({
                'status': 'error',
                'message': 'OTP is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the OTP
        student = Student.objects.get(id=student_id)
        
        if student.verify_status:
            return Response({
                'status': 'success',
                'message': 'Account is already verified',
                'student_id': student.id
            })
        
        if student.otp_digit != otp_digit:
            return Response({
                'status': 'error',
                'message': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as verified and update OTP
        student.verify_status = True
        student.otp_digit = None  # Clear OTP after verification
        student.save()
        
        return Response({
            'status': 'success',
            'message': 'Account verified successfully',
            'student_id': student.id
        })
        
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def resend_otp(request):
    """Resend OTP for verification"""
    user_type = request.data.get('user_type')  # 'teacher' or 'student'
    user_id = request.data.get('user_id')
    
    if not user_type or not user_id:
        return Response({
            'status': 'error',
            'message': 'user_type and user_id are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        import random
        new_otp = str(random.randint(100000, 999999))
        
        if user_type == 'teacher':
            user = Teacher.objects.get(id=user_id)
        elif user_type == 'student':
            user = Student.objects.get(id=user_id)
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid user_type. Must be "teacher" or "student".'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update OTP
        user.otp_digit = new_otp
        user.save()
        
        # Send email with new OTP
        send_mail(
            f'Verify Your Knoology LMS {user_type.capitalize()} Account',
            'Please verify your account',
            'knoologylms@gmail.com',
            [user.email],
            fail_silently=False,
            html_message=f'<p>Your new OTP is </p><p>{new_otp}</p>'
        )
        
        return Response({
            'status': 'success',
            'message': 'OTP has been resent to your email'
        })
    except (Teacher.DoesNotExist, Student.DoesNotExist):
        return Response({
            'status': 'error',
            'message': f'{user_type.capitalize()} not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Chat API endpoints
@api_view(['POST'])
def send_message(request):
    """
    Send a message from a teacher to a student or vice versa
    """
    try:
        teacher_id = request.data.get('teacher_id')
        student_id = request.data.get('student_id')
        message = request.data.get('message')
        message_from = request.data.get('message_from')
        
        if not teacher_id or not student_id or not message or not message_from:
            return Response({
                'status': 'error',
                'message': 'teacher_id, student_id, message, and message_from are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Validate message_from value
        if message_from not in ['teacher', 'student']:
            return Response({
                'status': 'error',
                'message': 'message_from must be either "teacher" or "student"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert IDs to integers if they're strings
        if isinstance(teacher_id, str) and teacher_id.isdigit():
            teacher_id = int(teacher_id)
        if isinstance(student_id, str) and student_id.isdigit():
            student_id = int(student_id)
            
        # Verify that teacher and student exist
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({
                'status': 'error',
                'message': f'Teacher with ID {teacher_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({
                'status': 'error',
                'message': f'Student with ID {student_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create the chat message
        chat = TeacherStudentChat(
            teacher=teacher,
            student=student,
            message=message,
            message_from=message_from
        )
        
        # Enhanced retry mechanism for database locks
        import time
        from django.db.utils import OperationalError
        
        max_retries = 5  # Increase max retries
        retry_count = 0
        success = False
        last_error = None
        
        while retry_count < max_retries and not success:
            try:
                chat.save()
                success = True
            except OperationalError as e:
                last_error = e
                if "database is locked" in str(e).lower():
                    retry_count += 1
                    if retry_count < max_retries:
                        # Exponential backoff with jitter
                        sleep_time = (0.1 * (2 ** retry_count)) + (0.1 * random.random())
                        print(f"Database locked, retrying in {sleep_time:.2f}s (attempt {retry_count}/{max_retries})")
                        time.sleep(sleep_time)
                    else:
                        print(f"Failed to save message after {max_retries} attempts due to database lock")
                else:
                    raise
            except Exception as e:
                last_error = e
                raise
        
        if not success:
            if last_error:
                return Response({
                    'status': 'error',
                    'message': f'Failed to save message after {max_retries} attempts: {str(last_error)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({
                    'status': 'error',
                    'message': f'Failed to save message after {max_retries} attempts'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Create a notification for the recipient - with retry logic
        retry_count = 0
        success = False
        
        while retry_count < max_retries and not success:
            try:
                if message_from == 'teacher':
                    recipient = student
                    Notification.objects.create(
                        recipient_student=recipient,
                        notification_type='general',
                        title='New Message',
                        message=f'You have a new message from {teacher.full_name}',
                        is_read=False
                    )
                else:  # message from student
                    recipient = teacher
                    Notification.objects.create(
                        recipient_teacher=recipient,
                        notification_type='general',
                        title='New Message',
                        message=f'You have a new message from {student.fullname}',
                        is_read=False
                    )
                success = True
            except OperationalError as e:
                if "database is locked" in str(e).lower():
                    retry_count += 1
                    if retry_count < max_retries:
                        # Exponential backoff with jitter
                        sleep_time = (0.1 * (2 ** retry_count)) + (0.1 * random.random())
                        print(f"Database locked when creating notification, retrying in {sleep_time:.2f}s (attempt {retry_count}/{max_retries})")
                        time.sleep(sleep_time)
                    else:
                        print(f"Failed to create notification after {max_retries} attempts due to database lock")
                        # We continue anyway since the message was saved - notification failure is not fatal
                        break
                else:
                    raise
        
        # Serialize the message for the response
        serializer = TeacherStudentChatSerializer(chat)
        
        # Return success response with the newly created message
        return Response({
            'status': 'success',
            'message': 'Message sent successfully',
            'data': serializer.data
        })
        
    except Exception as e:
        import traceback
        print("Error in send_message:", str(e))
        print(traceback.format_exc())
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_chat_messages(request, user_type, user_id, other_user_id):
    """
    Get chat messages between a teacher and a student
    user_type: 'teacher' or 'student'
    user_id: ID of the user requesting messages
    other_user_id: ID of the other user in the conversation
    """
    try:
        # Convert string IDs to integers if needed
        if isinstance(user_id, str) and user_id.isdigit():
            user_id = int(user_id)
        if isinstance(other_user_id, str) and other_user_id.isdigit():
            other_user_id = int(other_user_id)
            
        if user_type == 'teacher':
            teacher_id = user_id
            student_id = other_user_id
            
            # Check if users exist first
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                student = Student.objects.get(id=student_id)
                
                # Mark notifications as read - with retry logic for database lock
                max_retries = 3
                retry_count = 0
                success = False
                
                while retry_count < max_retries and not success:
                    try:
                        Notification.objects.filter(
                            recipient_teacher_id=teacher_id,
                            is_read=False,
                            notification_type='general',
                            message__contains=f"from {student.fullname}"
                        ).update(is_read=True)
                        success = True
                    except django.db.utils.OperationalError as e:
                        if "database is locked" in str(e).lower():
                            retry_count += 1
                            import time
                            time.sleep(0.5)  # Wait a moment before retrying
                        else:
                            raise  # Re-raise if it's a different error
                
            except (Teacher.DoesNotExist, Student.DoesNotExist) as e:
                return Response({
                    'status': 'error',
                    'message': f'User not found: {str(e)}'
                }, status=status.HTTP_404_NOT_FOUND)
                
        elif user_type == 'student':
            teacher_id = other_user_id
            student_id = user_id
            
            # Check if users exist first
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                student = Student.objects.get(id=student_id)
                
                # Mark notifications as read - with retry logic for database lock
                max_retries = 3
                retry_count = 0
                success = False
                
                while retry_count < max_retries and not success:
                    try:
                        Notification.objects.filter(
                            recipient_student_id=student_id,
                            is_read=False,
                            notification_type='general',
                            message__contains=f"from {teacher.full_name}"
                        ).update(is_read=True)
                        success = True
                    except django.db.utils.OperationalError as e:
                        if "database is locked" in str(e).lower():
                            retry_count += 1
                            import time
                            time.sleep(0.5)  # Wait a moment before retrying
                        else:
                            raise  # Re-raise if it's a different error
                
            except (Teacher.DoesNotExist, Student.DoesNotExist) as e:
                return Response({
                    'status': 'error',
                    'message': f'User not found: {str(e)}'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid user type. Must be "teacher" or "student"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all messages between this teacher and student - with retry logic
        max_retries = 3
        retry_count = 0
        messages = None
        
        while retry_count < max_retries and messages is None:
            try:
                messages = TeacherStudentChat.objects.filter(
                    teacher_id=teacher_id,
                    student_id=student_id
                ).order_by('timestamp')
            except django.db.utils.OperationalError as e:
                if "database is locked" in str(e).lower():
                    retry_count += 1
                    import time
                    time.sleep(0.5)  # Wait a moment before retrying
                else:
                    raise  # Re-raise if it's a different error
        
        if messages is None:
            return Response({
                'status': 'error',
                'message': 'Database was locked and could not be accessed after multiple retries.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        serializer = TeacherStudentChatSerializer(messages, many=True)
        
        # Get user details to return with the messages
        if user_type == 'teacher':
            other_user_data = {
                'id': student.id,
                'name': student.fullname,
                'username': student.username,
                'email': student.email,
                'profile_img': student.profile_img.url if student.profile_img else None
            }
        else:
            other_user_data = {
                'id': teacher.id,
                'name': teacher.full_name,
                'email': teacher.email,
                'profile_img': None  # Add profile image if available in teacher model
            }
            
        return Response({
            'status': 'success',
            'data': {
                'messages': serializer.data,
                'other_user': other_user_data
            }
        })
        
    except Exception as e:
        # Log the full exception details for debugging
        import traceback
        print("Error in get_chat_messages:", str(e))
        print(traceback.format_exc())
        
        return Response({
            'status': 'error',
            'message': f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_chat_users(request, user_type, user_id):
    """
    Get all users that the current user has chatted with
    user_type: 'teacher' or 'student'
    user_id: ID of the user requesting chat users
    """
    try:
        if user_type == 'teacher':
            # Get all students who have chatted with this teacher
            student_ids = TeacherStudentChat.objects.filter(
                teacher_id=user_id
            ).values_list('student_id', flat=True).distinct()
            
            students = Student.objects.filter(id__in=student_ids)
            users_data = []
            
            for student in students:
                # Get the latest message
                latest_message = TeacherStudentChat.objects.filter(
                    teacher_id=user_id,
                    student_id=student.id
                ).order_by('-timestamp').first()
                
                # Count unread messages
                unread_count = Notification.objects.filter(
                    recipient_teacher_id=user_id,
                    is_read=False,
                    notification_type='general',
                    message__contains=f"from {student.fullname}"
                ).count()
                
                users_data.append({
                    'id': student.id,
                    'name': student.fullname,
                    'username': student.username,
                    'email': student.email,
                    'unread_count': unread_count,
                    'last_message': latest_message.message if latest_message else '',
                    'last_message_time': latest_message.timestamp if latest_message else None,
                    'profile_img': student.profile_img.url if student.profile_img else None
                })
                
        elif user_type == 'student':
            # Get all teachers who have chatted with this student
            teacher_ids = TeacherStudentChat.objects.filter(
                student_id=user_id
            ).values_list('teacher_id', flat=True).distinct()
            
            teachers = Teacher.objects.filter(id__in=teacher_ids)
            users_data = []
            
            for teacher in teachers:
                # Get the latest message
                latest_message = TeacherStudentChat.objects.filter(
                    teacher_id=teacher.id,
                    student_id=user_id
                ).order_by('-timestamp').first()
                
                # Count unread messages
                unread_count = Notification.objects.filter(
                    recipient_student_id=user_id,
                    is_read=False,
                    notification_type='general',
                    message__contains=f"from {teacher.full_name}"
                ).count()
                
                users_data.append({
                    'id': teacher.id,
                    'name': teacher.full_name,
                    'email': teacher.email,
                    'unread_count': unread_count,
                    'last_message': latest_message.message if latest_message else '',
                    'last_message_time': latest_message.timestamp if latest_message else None,
                    'profile_img': None  # Add profile image if available in teacher model
                })
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid user type. Must be "teacher" or "student"'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Sort by last message time, most recent first
        users_data = sorted(
            users_data,
            key=lambda x: x['last_message_time'] if x['last_message_time'] else timezone.now(),
            reverse=True
        )
            
        return Response({
            'status': 'success',
            'data': users_data
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_conversation(request, teacher_id, student_id):
    """
    Delete all chat messages between a specific teacher and student
    """
    try:
        # Verify teacher and student exist
        teacher = Teacher.objects.get(id=teacher_id)
        student = Student.objects.get(id=student_id)
        
        # Delete all messages between this teacher and student
        messages = TeacherStudentChat.objects.filter(
            teacher_id=teacher_id,
            student_id=student_id
        )
        
        count = messages.count()
        messages.delete()
        
        return Response({
            'status': 'success',
            'message': f'Successfully deleted {count} messages',
        })
        
    except Teacher.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Teacher not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Student.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Student not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to get all teachers for a student's enrolled courses
@api_view(['GET'])
def student_enrolled_teachers(request, student_id):
    """
    Get all teachers associated with courses that a student is enrolled in
    """
    try:
        # Get student or return 404
        student = get_object_or_404(Student, id=student_id)
        
        # Get all enrollments for the student
        enrollments = StudentCourseEnrollment.objects.filter(student=student)
        
        # Get unique teachers from the enrolled courses
        teachers_dict = {}
        
        for enrollment in enrollments:
            course = enrollment.course
            teacher = course.teacher
            
            # If teacher already exists in our dict, add this course to their courses list
            if teacher.id in teachers_dict:
                teachers_dict[teacher.id]['courses'].append({
                    'id': course.id,
                    'title': course.title
                })
            # Otherwise, add the teacher with their first course
            else:
                teachers_dict[teacher.id] = {
                    'id': teacher.id,
                    'full_name': teacher.full_name,
                    'email': teacher.email,
                    'qualification': teacher.qualification,
                    'skills': teacher.skills,
                    'courses': [{
                        'id': course.id,
                        'title': course.title
                    }]
                }
        
        # Convert the dictionary to a list
        teachers_list = list(teachers_dict.values())
        
        return Response({
            'status': 'success',
            'data': teachers_list
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def checkout(request):
    try:
        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')
        
        student = Student.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)
        
        if StudentCourseEnrollment.objects.filter(student=student, course=course).exists():
             return Response({
                'status': 'error',
                'message': 'Already enrolled'
            })
            
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        payment = client.order.create({
            "amount": int(course.price * 100), 
            "currency": "INR", 
            "payment_capture": "1"
        })
        
        course_payment = CoursePayment.objects.create(
            course=course, 
            student=student, 
            order_id=payment['id'],
            amount=course.price
        )
        
        return Response({
            'status': 'success',
            'order_id': payment['id'],
            'amount': payment['amount'],
            'currency': payment['currency'],
            'key_id': settings.RAZORPAY_KEY_ID
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@csrf_exempt
def verify_payment(request):
    try:
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        check = client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        if check:
            payment = CoursePayment.objects.get(order_id=razorpay_order_id)
            payment.payment_id = razorpay_payment_id
            payment.status = True
            payment.save()
            
            StudentCourseEnrollment.objects.get_or_create(
                student=payment.student,
                course=payment.course
            )
            
            return Response({
                'status': 'success',
                'message': 'Payment verification successful'
            })
        else:
             return Response({
                'status': 'error',
                'message': 'Payment verification failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# Certificate Generation View
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.http import HttpResponse

@api_view(['GET'])
@permission_classes([AllowAny])
def generate_certificate(request, student_id, course_id):
    try:
        # Check enrollment
        enrollment = StudentCourseEnrollment.objects.filter(
            student_id=student_id, 
            course_id=course_id
        ).first()
        
        if not enrollment:
            return Response({
                'status': 'error',
                'message': 'Student is not enrolled in this course.'
            }, status=status.HTTP_404_NOT_FOUND)
            
    # Native ReportLab Implementation for pixel-perfect layout
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import landscape, A4
        from reportlab.lib import colors
        from reportlab.lib.units import cm, inch
        from reportlab.lib.utils import ImageReader
        
        # Verify Course Completion
        student = Student.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)
        
        # Late import to avoid circular dependency
        from .models import StudentChapterProgress, Chapter
        
        total_chapters = Chapter.objects.filter(course=course).count()
        completed_chapters = StudentChapterProgress.objects.filter(student=student, course=course).count()
        
        is_completed = (enrollment.completed_at is not None) or (total_chapters > 0 and completed_chapters >= total_chapters)
        
        if total_chapters == 0:
             is_completed = True 

        if not is_completed:
             return Response({'status': 'error', 'message': 'Course not verified as completed.'}, status=403)

        # Update completion status
        if not enrollment.completed_at:
            enrollment.completed_at = timezone.now()
            enrollment.save()

        # Logo Path
        logo_path = r"C:\Users\LENOVO\.gemini\antigravity\brain\39b064d9-3a21-42b0-81fb-f8efecedc2ba\uploaded_media_1_1769490860861.png"

        # Create PDF Response
        response = HttpResponse(content_type='application/pdf')
        filename = f"Certificate_{student.fullname.replace(' ', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        # Canvas Setup
        c = canvas.Canvas(response, pagesize=landscape(A4))
        width, height = landscape(A4)
        
        # --- Design Implementation ---
        
        # 1. Double Border
        c.setStrokeColor(colors.HexColor('#2c3e50')) # Navy
        c.setLineWidth(10)
        c.rect(1*cm, 1*cm, width - 2*cm, height - 2*cm)
        
        c.setStrokeColor(colors.HexColor('#deb887')) # Gold
        c.setLineWidth(3)
        c.rect(1.3*cm, 1.3*cm, width - 2.6*cm, height - 2.6*cm)

        # 2. Header
        c.setFillColor(colors.HexColor('#2c3e50'))
        c.setFont("Times-Bold", 40)
        c.drawCentredString(width / 2, height - 4*cm, "CERTIFICATE")
        
        c.setFillColor(colors.HexColor('#deb887'))
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(width / 2, height - 5*cm, "OF COMPLETION")

        # 3. Logo
        try:
            # Draw logo centered
            logo_width = 5*cm
            logo_height = 3*cm  # Aspect ratio will depend on image, but we constrain box
            # Calculate x position to center
            c.drawImage(logo_path, (width - logo_width) / 2, height - 8.5*cm, width=logo_width, height=logo_height, mask='auto', preserveAspectRatio=True)
        except Exception as e:
            print(f"Logo error: {e}")
            c.setFont("Helvetica", 12)
            c.drawCentredString(width / 2, height - 7*cm, "[Knoology Logo]")

        # 4. Content Text
        c.setFillColor(colors.HexColor('#7f8c8d')) # Grey
        c.setFont("Times-Italic", 14)
        c.drawCentredString(width / 2, height - 10*cm, "This is to certify that")

        # Student Name
        c.setFillColor(colors.HexColor('#d35400')) # Burnt Orange
        c.setFont("Times-Bold", 36)
        c.drawCentredString(width / 2, height - 12*cm, student.fullname)
        
        # Underline Name
        c.setStrokeColor(colors.HexColor('#ddd'))
        c.setLineWidth(1)
        c.line((width/2) - 5*cm, height - 12.2*cm, (width/2) + 5*cm, height - 12.2*cm)

        c.setFillColor(colors.HexColor('#7f8c8d'))
        c.setFont("Helvetica", 12)
        c.drawCentredString(width / 2, height - 13.5*cm, "has successfully completed the course")

        # Course Title
        c.setFillColor(colors.HexColor('#2c3e50'))
        c.setFont("Times-Bold", 24)
        c.drawCentredString(width / 2, height - 15*cm, course.title)

        # 5. Footer / Signatures strategy
        # Left: Date, Right: Auth
        footer_y = 3*cm
        
        # Date
        date_str = enrollment.completed_at.strftime('%B %d, %Y')
        c.setFillColor(colors.HexColor('#2c3e50'))
        c.setFont("Helvetica", 10)
        c.drawCentredString(width/4, footer_y + 0.5*cm, date_str)
        c.setStrokeColor(colors.HexColor('#2c3e50'))
        c.line(width/4 - 2*cm, footer_y + 0.3*cm, width/4 + 2*cm, footer_y + 0.3*cm)
        c.drawCentredString(width/4, footer_y - 0.2*cm, "Date Issued")

        # Seal (Center Bottom)
        c.setStrokeColor(colors.HexColor('#deb887'))
        c.setLineWidth(2)
        c.circle(width/2, footer_y + 0.5*cm, 1.2*cm)
        c.setFillColor(colors.HexColor('#deb887'))
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(width/2, footer_y + 0.7*cm, "VERIFIED")
        c.drawCentredString(width/2, footer_y + 0.3*cm, "SECURE")

        # Signature
        c.setFillColor(colors.HexColor('#2c3e50'))
        c.setFont("Helvetica", 10)
        c.drawCentredString(3*width/4, footer_y + 0.5*cm, "Knoology LMS")
        c.setStrokeColor(colors.HexColor('#2c3e50'))
        c.line(3*width/4 - 2*cm, footer_y + 0.3*cm, 3*width/4 + 2*cm, footer_y + 0.3*cm)
        c.drawCentredString(3*width/4, footer_y - 0.2*cm, "Authorized Signature")

        # 6. Validation ID
        valid_id = f"CERT-{student_id}-{course_id}-{int(enrollment.completed_at.timestamp())}"
        verify_url = request.build_absolute_uri(f"/verify-certificate/{student_id}/{course_id}/")
        
        c.setFillColor(colors.HexColor('#95a5a6'))
        c.setFont("Helvetica", 7)
        c.drawString(2*cm, 1*cm, f"ID: {valid_id}")
        c.drawRightString(width - 2*cm, 1*cm, f"Verify: {verify_url}")

        c.showPage()
        c.save()
        
        return response

    except Exception as e:
        print(f"Certificate Error: {e}")
        return Response({'status': 'error', 'message': str(e)}, status=500)

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def mark_chapter_complete(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student_id = data.get('student_id')
            course_id = data.get('course_id')
            chapter_id = data.get('chapter_id')
            
            from .models import Student, Course, Chapter, StudentChapterProgress, StudentCourseEnrollment
            
            student = Student.objects.get(id=student_id)
            course = Course.objects.get(id=course_id)
            chapter = Chapter.objects.get(id=chapter_id)
            
            StudentChapterProgress.objects.get_or_create(
                student=student,
                course=course,
                chapter=chapter
            )
            
            # Check if all chapters are completed
            total_chapters = Chapter.objects.filter(course=course).count()
            completed_chapters = StudentChapterProgress.objects.filter(student=student, course=course).count()
            
            if total_chapters > 0 and completed_chapters >= total_chapters:
                enrollment = StudentCourseEnrollment.objects.filter(student=student, course=course).first()
                if enrollment and not enrollment.completed_at:
                    enrollment.completed_at = timezone.now()
                    enrollment.save()
                    
            return JsonResponse({'status': 'success', 'message': 'Chapter marked as complete'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

@csrf_exempt
def get_completed_chapters(request, student_id, course_id):
    try:
        from .models import Student, Course, StudentChapterProgress
        student = Student.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)
        completed_chapters = StudentChapterProgress.objects.filter(student=student, course=course).values_list('chapter_id', flat=True)
        return JsonResponse({'status': 'success', 'completed_chapters': list(completed_chapters)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
