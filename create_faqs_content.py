# This script is meant to be copied and pasted into the Django shell
from main.models import FAQ

def add_faq(question, answer):
    # Check if FAQ already exists to avoid duplicates
    if not FAQ.objects.filter(question=question).exists():
        faq = FAQ(question=question, answer=answer)
        faq.save()
        print(f"Added FAQ: {question}")
    else:
        faq = FAQ.objects.get(question=question)
        faq.answer = answer  # Update the answer in case it has changed
        faq.save()
        print(f"Updated FAQ: {question}")

print("Adding FAQs to Knoology LMS database...")

# General FAQs about the platform
add_faq(
    "What is Knoology LMS?",
    "Knoology LMS is an advanced Learning Management System designed to facilitate online education. It provides tools for teachers to create courses, assignments, quizzes, and for students to enroll in courses and track their learning progress."
)

add_faq(
    "How do I create an account on Knoology LMS?",
    "To create an account, visit the registration page and choose whether you want to register as a student or a teacher. Fill in the required information including your name, email, password, and other details specific to your role."
)

# Teacher FAQs
add_faq(
    "How do I create a new course as a teacher?",
    "After logging in as a teacher, navigate to your dashboard and click on 'Create New Course'. Fill in the course details such as title, description, category, and optionally upload a featured image. You can also specify the technologies covered in the course."
)

add_faq(
    "How do I add chapters to my course?",
    "From your teacher dashboard, select the course you want to add chapters to. Navigate to the 'Chapters' section and click 'Add New Chapter'. Provide a title, description, and optionally upload a video for the chapter. You can add remarks for additional information."
)

add_faq(
    "How do I create a quiz for my course?",
    "From your teacher dashboard, go to the 'Quizzes' section and click 'Create New Quiz'. Enter the quiz title, description, and total marks. After creating the quiz, you can add questions with multiple choice answers. Once the quiz is ready, you can assign it to specific courses."
)

add_faq(
    "How do I track student performance in my courses?",
    "As a teacher, you can view enrollment statistics, quiz attempts, and assignment submissions from your dashboard. You can see individual student performance, grade assignments, and monitor overall course engagement."
)

add_faq(
    "How do I add study materials for my course?",
    "From your teacher dashboard, select the course and navigate to 'Study Materials'. Click 'Add Study Material', provide a title, description, and upload the file. You can add optional remarks. Students enrolled in the course will be notified when new study materials are added."
)

# Student FAQs
add_faq(
    "How do I enroll in a course?",
    "After logging in as a student, you can browse available courses from the course catalog. When you find a course you're interested in, click on it to view details and click the 'Enroll' button. Once enrolled, the course will appear in your dashboard."
)

add_faq(
    "How do I take a quiz?",
    "From your student dashboard, select the enrolled course and navigate to the 'Quizzes' section. You'll see a list of available quizzes for that course. Click on a quiz to start it. Answer all questions and submit to complete the quiz. Your results will be available immediately after submission."
)

add_faq(
    "How do I submit an assignment?",
    "From your student dashboard, select the course and navigate to the 'Assignments' section. Find the assignment you want to submit, click on it, and use the file upload option to submit your work. Make sure to submit before the due date."
)

add_faq(
    "Can I access course materials after completing a course?",
    "Yes, you will continue to have access to all course materials, including chapters, videos, and study materials even after completing the course, as long as your account remains active."
)

add_faq(
    "How do I mark a course as favorite?",
    "When viewing a course, click on the 'Add to Favorites' or heart icon to mark it as a favorite. You can view all your favorite courses from your student dashboard in the 'Favorites' section."
)

# Technical FAQs
add_faq(
    "What file formats are supported for assignment submissions?",
    "Knoology LMS supports a variety of file formats for assignment submissions, including PDF, DOCX, XLSX, PPTX, ZIP, and common image formats. The maximum file size for uploads is typically 25MB, but this may vary based on system settings."
)

add_faq(
    "How are course recommendations generated?",
    "Course recommendations are based on your selected interests, previously enrolled courses, and courses marked as favorites. Our system analyzes these patterns to suggest relevant courses that match your learning preferences."
)

add_faq(
    "What should I do if I encounter technical issues?",
    "If you encounter technical issues, first try refreshing the page or logging out and back in. Clear your browser cache if problems persist. For continued issues, please contact support with details of the problem, including any error messages you received."
)

add_faq(
    "Is my personal information secure on Knoology LMS?",
    "Yes, Knoology LMS takes data security seriously. We use encryption for sensitive data, implement secure authentication practices, and never share your personal information with third parties without your consent."
)

# Platform-specific FAQs
add_faq(
    "How do ratings and reviews work?",
    "After enrolling in a course, you can rate it on a scale of 1-5 stars and leave a written review. Your rating contributes to the course's average rating. This helps other students make informed decisions when choosing courses."
)

add_faq(
    "How do I change my password?",
    "To change your password, go to your profile settings and select 'Change Password'. You'll need to enter your current password for verification, then enter and confirm your new password."
)

add_faq(
    "How do notifications work?",
    "Knoology LMS sends notifications for important events such as new quiz assignments, new study materials, graded assignments, and system announcements. You can view all your notifications from the notifications icon in the navigation bar."
)

add_faq(
    "Can I download study materials for offline use?",
    "Yes, most study materials can be downloaded for offline use. When viewing a study material, look for the download button or icon to save it to your device."
)

print(f"Total FAQs added/updated: {FAQ.objects.count()}")
print("FAQs have been added successfully!")