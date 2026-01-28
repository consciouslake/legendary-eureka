from django.db import models
from django.db.models import Avg
from django.utils import timezone
from django.core.validators import FileExtensionValidator

# Create your models here.

#Teacher model

class Teacher(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    mobile_number = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    skills = models.TextField()
    bio = models.TextField(blank=True, null=True)  # New field
    profile_img = models.ImageField(upload_to='teacher_images/', null=True, blank=True)
    verify_status = models.BooleanField(default=False)
    otp_digit = models.CharField(max_length=10, null=True, blank=True)
    
    def __str__(self):
     return self.full_name
    class Meta:
        verbose_name_plural = "1. Teachers"
        ordering = ['full_name']
    
    def save(self, *args, **kwargs):
        # Generate OTP for new users
        import random
        if self.pk is None:
            self.otp_digit = str(random.randint(100000, 999999))
            
            # Send email with OTP
            from django.core.mail import send_mail
            send_mail(
                'Verify Your Knoology LMS Teacher Account',
                'Please verify your account',
                'knoologylms@gmail.com',
                [self.email],
                fail_silently=False,
                html_message=f'<p>Your OTP is </p><p>{self.otp_digit}</p>'
            )
        return super().save(*args, **kwargs)
    
#Course Category Model
class CourseCategory(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        verbose_name_plural = "2. Course Categories"
    def __str__(self):
        return self.title

#Course Model
class Course(models.Model):
    category = models.ForeignKey(CourseCategory, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    featured_img = models.ImageField(upload_to='course_images/', null=True)
    technologies = models.TextField(default='')  # Adding default empty string
    price = models.IntegerField(default=0)
    #created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name_plural = "3. Courses"
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_ratings = models.IntegerField(default=0)
    
    def __str__(self):
        return self.title

#Chapter Model
class Chapter(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=100)
    description = models.TextField()
    video = models.FileField(upload_to='chapter_videos/', null=True, blank=True)
    video_url = models.URLField(null=True, blank=True)
    text_content = models.TextField(null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "4. Chapters"
        ordering = ['id']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

#Student Model
class Student(models.Model):
    fullname = models.CharField(max_length=100)
    username = models.CharField(max_length=50, unique=True, default='default_user')
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    interested_categories = models.TextField()
    profile_img = models.ImageField(upload_to='student_images/', null=True, blank=True)
    verify_status = models.BooleanField(default=False)
    otp_digit = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.fullname
    class Meta: 
        verbose_name_plural = "5. Students"
        ordering = ['fullname']
        
    def save(self, *args, **kwargs):
        # Generate OTP for new users
        import random
        if self.pk is None:
            self.otp_digit = str(random.randint(100000, 999999))
            
            # Send email with OTP
            from django.core.mail import send_mail
            send_mail(
                'Verify Your Knoology LMS Student Account',
                'Please verify your account',
                'knoologylms@gmail.com',
                [self.email],
                fail_silently=False,
                html_message=f'<p>Your OTP is </p><p>{self.otp_digit}</p>'
            )
        return super().save(*args, **kwargs)

class StudentCourseEnrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrolled_courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'course')
        verbose_name_plural = "6. Student Course Enrollments"

    def __str__(self):
        return f"{self.student.fullname} enrolled in {self.course.title}"

class StudentChapterProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='chapter_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'chapter')
        verbose_name_plural = "22. Student Chapter Progress"

    def __str__(self):
        return f"{self.student.fullname} completed {self.chapter.title}"

class CourseRating(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ratings')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='course_ratings')
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('course', 'student')
        ordering = ['-updated_at']
        verbose_name_plural = "7. Course Ratings"

    def __str__(self):
        return f"{self.student.fullname}'s {self.rating}-star rating for {self.course.title}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update course average rating
        course = self.course
        ratings = CourseRating.objects.filter(course=course)
        course.total_ratings = ratings.count()
        course.average_rating = ratings.aggregate(Avg('rating'))['rating__avg'] or 0
        course.save()

class StudentFavoriteCourse(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='favorite_courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='favorited_by')
    date_added = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_added']
        unique_together = ('student', 'course')
        verbose_name_plural = "8. Student Favorite Courses"

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateField()
    assignment_file = models.FileField(upload_to='assignment_files/', null=True, blank=True)
    submitted_file = models.FileField(upload_to='assignment_submissions/', null=True, blank=True)
    submission_date = models.DateTimeField(null=True, blank=True)
    grade = models.CharField(max_length=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "9. Assignments"

    def __str__(self):
        return f"{self.title} - {self.student.fullname}"

class Quiz(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='created_quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField()
    total_marks = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Quizzes"
        ordering = ['-created_at']
        verbose_name_plural = "10. Quizzes"


    def __str__(self):
        return self.title

class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    ans1 = models.CharField(max_length=200)
    ans2 = models.CharField(max_length=200)
    ans3 = models.CharField(max_length=200)
    ans4 = models.CharField(max_length=200)
    right_ans = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "11. Quiz Questions"
        

    def __str__(self):
        return self.question_text[:50]

class CourseQuiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assigned_quizzes')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='assigned_courses')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'quiz')
        verbose_name_plural = "12. Course Quizzes"

    def __str__(self):
        return f"{self.quiz.title} assigned to {self.course.title}"

class StudentQuizAttempt(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='student_attempts')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quiz_attempts')
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    obtained_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    attempted_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'quiz', 'course')
        ordering = ['-attempted_at']
        verbose_name_plural = "13. Student Quiz Attempts"

    def __str__(self):
        return f"{self.student.fullname}'s attempt at {self.quiz.title}"

class StudentQuizResponse(models.Model):
    attempt = models.ForeignKey(StudentQuizAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='student_responses')
    selected_answer = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "14. Student Quiz Responses"
        

    def __str__(self):
        return f"Response to {self.question.question_text[:30]}"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('quiz_assigned', 'Quiz Assigned'),
        ('quiz_completed', 'Quiz Completed'),
        ('general', 'General'),
    )

    recipient_teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True, related_name='received_notifications')
    recipient_student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='received_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, null=True, blank=True)
    related_course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "15. Notifications"

    def __str__(self):
        recipient = self.recipient_teacher.full_name if self.recipient_teacher else self.recipient_student.fullname
        return f"Notification for {recipient}: {self.title}"

class StudyMaterial(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='study_materials')
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to='study_materials/')
    remarks = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "16. Study Materials"

    def __str__(self):
        return self.title
    

#FAQ Model
class FAQ(models.Model):
    question = models.CharField(max_length=200)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "17. FAQs"

    def __str__(self):
        return self.question
    
class ContactUs(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, default='')  # Added subject field
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # Added field to track if message has been read

    class Meta:
        verbose_name_plural = "18. Contact Us Messages"

    def __str__(self):
        return f"Message from {self.name}: {self.subject}"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_time = models.DateTimeField()
    is_teacher = models.BooleanField(default=False)
    
    class Meta:
        verbose_name_plural = "19. Password Reset Tokens"
        
    def __str__(self):
        user_type = "Teacher" if self.is_teacher else "Student"
        user_name = self.user.full_name if self.is_teacher else self.user.fullname
        return f"{user_type} Reset Token for {user_name}"
        
    @property
    def is_expired(self):
        return timezone.now() > self.expiry_time
    

class TeacherStudentChat(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='teacher_student_chats')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='teacher_student_chats')
    message= models.TextField()
    message_from= models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
        verbose_name_plural = "20. Teacher-Student Chats"

    def __str__(self):
        return f"Chat between {self.teacher.full_name} and {self.student.fullname}"

class CoursePayment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=100)
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.BooleanField(default=False) # True = Success
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "21. Course Payments"

    def __str__(self):
        return f'{self.student.fullname} - {self.course.title}'
