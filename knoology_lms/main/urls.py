from django.urls import path
from . import views

urlpatterns = [
    # OTP Verification URLs
    path('verify-teacher-otp/<int:teacher_id>/', views.verify_teacher_otp, name='verify-teacher-otp'),
    path('verify-student-otp/<int:student_id>/', views.verify_student_otp, name='verify-student-otp'),
    path('resend-otp/', views.resend_otp, name='resend-otp'),

    # Forgot Password URLs
    path('student/forgot-password/', views.student_forgot_password, name='student-forgot-password'),
    path('student/reset-password/<str:token>/', views.student_reset_password, name='student-reset-password'),
    path('teacher/forgot-password/', views.teacher_forgot_password, name='teacher-forgot-password'),
    path('teacher/reset-password/<str:token>/', views.teacher_reset_password, name='teacher-reset-password'),

    #Course Category URLs
    path('category/', views.CategoryList.as_view(), name='category-list'),
    path('course/', views.CourseList.as_view(), name='course-list'),
    path('course/<int:pk>/', views.CourseDetail.as_view(), name='course-detail'),
    #teacher URLs
    path('teacher/', views.TeacherList.as_view(), name='teacher-list'),
    path('teacher/<int:pk>/', views.TeacherDetail.as_view(), name='teacher-detail'),
    path('teacher-login/', views.teacher_login, name='teacher_login'),
    path('teacher-dashboard-stats/<int:teacher_id>/', views.teacher_dashboard_stats, name='teacher_dashboard_stats'), # New dashboard stats endpoint
    path('teacher-courses/<int:teacher_id>/', views.TeacherCourseList.as_view(), name='teacher-courses'),
    path('teacher-enrolled-students/<int:teacher_id>/', views.teacher_enrolled_students, name='teacher-enrolled-students'),
    path('teacher-assignments/<int:teacher_id>/', views.teacher_assignments, name='teacher-assignments'),
    path('teacher-all-quiz-attempts/<int:teacher_id>/', views.teacher_all_quiz_attempts, name='teacher-all-quiz-attempts'),
    path('teacher-student-quiz-attempts/<int:teacher_id>/<int:student_id>/', views.teacher_student_quiz_attempts, name='teacher-student-quiz-attempts'),
    path('categories/', views.CategoryList.as_view(), name='category_list'),
    #chapter URLs
    path('course/<int:course_id>/chapters/', views.ChapterList.as_view(), name='chapter-list'),
    path('course-chapters/<int:course_id>/', views.course_chapter_list, name='course_chapter_list'),
    path('chapter/<int:pk>/', views.ChapterDetail.as_view(), name='chapter-detail'),
    #student URLs
    path('student/register/', views.StudentRegistrationView.as_view(), name='student_register'),
    path('student/login/', views.student_login, name='student_login'),
    path('student/<int:pk>/', views.StudentDetail.as_view(), name='student-detail'),
    path('student-dashboard-stats/<int:student_id>/', views.student_dashboard_stats, name='student_dashboard_stats'),
    path('student-enrolled-teachers/<int:student_id>/', views.student_enrolled_teachers, name='student-enrolled-teachers'),
    #enrollment URLs
    path('course-enroll/', views.enroll_in_course, name='course-enroll'),
    path('course-unenroll/', views.unenroll_from_course, name='course-unenroll'),
    path('check-enrollment/<int:student_id>/<int:course_id>/', views.check_enrollment_status, name='check-enrollment'),
    path('enrolled-courses/<int:student_id>/', views.get_enrolled_courses, name='enrolled-courses'),
    path('course-enrolled-students/<int:course_id>/', views.course_enrolled_students, name='course-enrolled-students'),
    path('all-enrolled-students/', views.all_enrolled_students, name='all-enrolled-students'),
    path('check-rating/<int:student_id>/<int:course_id>/', views.check_rating, name='check-rating'),
    path('rate-course/', views.rate_course, name='rate-course'),
    path('teacher-change-password/<int:teacher_id>/', views.teacher_change_password, name='teacher-change-password'),
    path('student-change-password/<int:student_id>/', views.student_change_password, name='student-change-password'),
    path('recommended-courses/<int:student_id>/', views.recommended_courses, name='recommended-courses'),

    # Course favorite endpoints
    path('check-favorite/<int:student_id>/<int:course_id>/', views.check_favorite_status, name='check-favorite'),
    path('toggle-favorite/', views.toggle_favorite, name='toggle-favorite'),
    path('favorite-courses/<int:student_id>/', views.get_favorite_courses, name='favorite-courses'),

    # Assignment URLs
    path('student-assignments/<int:student_id>/', views.student_assignments, name='student-assignments'),
    path('add-assignment/<int:student_id>/', views.add_assignment, name='add-assignment'),
    path('submit-assignment/<int:assignment_id>/', views.submit_assignment, name='submit-assignment'),
    path('grade-assignment/<int:assignment_id>/', views.grade_assignment, name='grade-assignment'),
    path('update-assignment/<int:assignment_id>/', views.update_assignment, name='update-assignment'),
    path('delete-assignment/<int:assignment_id>/', views.delete_assignment, name='delete-assignment'),
    path('student-courses/<int:student_id>/', views.student_courses, name='student-courses'),

    # Quiz System URLs
    path('teacher-quizzes/<int:teacher_id>/', views.TeacherQuizList.as_view(), name='teacher-quizzes'),
    path('quiz-detail/<int:pk>/', views.QuizDetailView.as_view(), name='quiz-detail'),
    path('quiz-questions/<int:quiz_id>/', views.quiz_questions, name='quiz-questions'),
    path('add-quiz-question/<int:quiz_id>/', views.QuizQuestionCreateView.as_view(), name='add-quiz-question'),
    path('quiz-question-detail/<int:pk>/', views.QuizQuestionDetail.as_view(), name='quiz-question-detail'),
    path('assign-quiz-to-course/', views.assign_quiz_to_course, name='assign-quiz-to-course'),
    path('remove-quiz-from-course/<int:course_quiz_id>/', views.remove_quiz_from_course, name='remove-quiz-from-course'),
    path('course-assigned-quizzes/<int:course_id>/', views.course_assigned_quizzes, name='course-assigned-quizzes'),
    path('student-available-quizzes/<int:student_id>/', views.student_available_quizzes, name='student-available-quizzes'),
    path('get-quiz-for-attempt/<int:quiz_id>/<int:student_id>/<int:course_id>/', views.get_quiz_for_attempt, name='get-quiz-for-attempt'),
    path('submit-quiz-attempt/<int:attempt_id>/', views.submit_quiz_attempt, name='submit-quiz-attempt'),
    path('student-quiz-results/<int:student_id>/', views.student_quiz_results, name='student-quiz-results'),
    path('quiz-attempt-detail/<int:attempt_id>/', views.student_quiz_attempt_detail, name='quiz-attempt-detail'),
    path('course-quiz-results/<int:course_id>/<int:quiz_id>/', views.course_quiz_results, name='course-quiz-results'),
    path('student-quiz-attempts/<int:student_id>/', views.student_quiz_attempts, name='student-quiz-attempts'),
    path('all-quiz-attempts/', views.all_quiz_attempts, name='all-quiz-attempts'),
    
    # Notification URLs
    path('notifications/<str:user_type>/<int:user_id>/', views.get_notifications, name='notifications'),
    path('mark-notification-read/<int:notification_id>/', views.mark_notification_read, name='mark-notification-read'),
    path('unread-notification-count/<str:user_type>/<int:user_id>/', views.get_unread_notification_count, name='unread-notification-count'),

    # Search endpoint
    path('search-courses/', views.search_courses, name='search-courses'),

    # Study Material URLs
    path('study-materials/', views.StudyMaterialList.as_view(), name='study-materials'),
    path('study-materials/<int:course_id>/', views.StudyMaterialList.as_view(), name='study-materials-by-course'),
    path('study-material-detail/<int:pk>/', views.StudyMaterialDetail.as_view(), name='study-material-detail'),
    path('notify-new-study-material/', views.notify_new_study_material, name='notify-new-study-material'),

    # Top Course Ratings endpoint
    path('get-top-course-ratings/', views.get_top_course_ratings, name='get_top_course_ratings'),
    
    # FAQ endpoint
    path('faq-list/', views.FaqList.as_view(), name='faq-list'),

    # FlatPage URLs
    path('flatpages/', views.FlatPageList.as_view(), name='flatpage-list'),
    path('flatpage/<str:url>/', views.get_flatpage_by_url, name='get-flatpage-by-url'),
    
    # Contact Form URLs
    path('contact-form/submit/', views.submit_contact_form, name='contact-form-submit'),
    path('contact-messages/', views.get_contact_messages, name='get-contact-messages'),
    path('contact-message/read/<int:message_id>/', views.mark_contact_message_read, name='mark-contact-message-read'),

    # Chat System URLs
    path('send-message/', views.send_message, name='send-message'),
    path('chat-messages/<str:user_type>/<int:user_id>/<int:other_user_id>/', views.get_chat_messages, name='chat-messages'),
    path('chat-users/<str:user_type>/<int:user_id>/', views.get_chat_users, name='chat-users'),
    path('delete-conversation/<int:teacher_id>/<int:student_id>/', views.delete_conversation, name='delete-conversation'),

    # Payment URLs
    path('checkout/', views.checkout, name='checkout'),
    path('verify-payment/', views.verify_payment, name='verify-payment'),
    path('generate-certificate/<int:student_id>/<int:course_id>/', views.generate_certificate, name='generate-certificate'),
    path('mark-chapter-complete/', views.mark_chapter_complete, name='mark-chapter-complete'),
    path('get-completed-chapters/<int:student_id>/<int:course_id>/', views.get_completed_chapters, name='get-completed-chapters'),
]
