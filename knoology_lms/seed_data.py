
import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'knoology_lms.settings')
django.setup()

from main.models import (
    Teacher, CourseCategory, Course, Chapter, Student, 
    StudentCourseEnrollment, CourseRating, StudentFavoriteCourse, CoursePayment
)

def clean_data():
    print("Cleaning existing data...")
    StudentCourseEnrollment.objects.all().delete()
    CoursePayment.objects.all().delete()
    CourseRating.objects.all().delete()
    StudentFavoriteCourse.objects.all().delete()
    Chapter.objects.all().delete()
    Course.objects.all().delete()
    Student.objects.all().delete()
    Teacher.objects.all().delete()
    CourseCategory.objects.all().delete()
    print("Data cleaned.")

def create_categories():
    categories = [
        ("Web Development", "Learn to build websites and web apps."),
        ("Data Science", "Master data analysis, visualization, and ML."),
        ("Digital Marketing", "Grow your business with online marketing strategies."),
        ("Business Finance", "Understand financial markets and investment."),
        ("Graphic Design", "Master Photoshop, Illustrator, and UI/UX."),
    ]
    objs = [CourseCategory(title=t, description=d) for t, d in categories]
    return CourseCategory.objects.bulk_create(objs)

def create_teachers():
    teachers_data = [
        ("Dr. Rajesh Kumar", "rajesh.kumar@example.com", "9876500001", "Ph.D. in Computer Science", "Python, AI, ML"),
        ("Sneha Gupta", "sneha.gupta@example.com", "9876500002", "M.Tech in Web Technologies", "React, Node.js, Django"),
        ("Amitabh Bachan", "amitabh@example.com", "9876500003", "MBA Finance", "Stock Market, Investing"),
        ("Priya Sharma", "priya.sharma@example.com", "9876500004", "B.Des from NID", "UI/UX, Figma, Adobe XD"),
        ("Vikram Singh", "vikram.singh@example.com", "9876500005", "Certified Digital Marketer", "SEO, Facebook Ads"),
    ]
    teachers = []
    for name, email, mobile, qual, skills in teachers_data:
        t = Teacher.objects.create(
            full_name=name,
            email=email,
            mobile_number=mobile,
            password="password123", # Plain text for demo; in real app should be hashed if using custom auth
            qualification=qual,
            skills=skills,
            verify_status=True,
            otp_digit="123456",
            bio=f"Hi, I am {name}. I have 10+ years of experience in {skills}."
        )
        teachers.append(t)
    return teachers

def create_students():
    students_data = [
        ("Arjun Reddy", "arjun", "arjun@example.com"),
        ("Anjali Menon", "anjali", "anjali@example.com"),
        ("Rohan Das", "rohan", "rohan@example.com"),
        ("Kavya Iyer", "kavya", "kavya@example.com"),
        ("Ishaan Khatter", "ishaan", "ishaan@example.com"),
    ]
    students = []
    for name, user, email in students_data:
        s = Student.objects.create(
            fullname=name,
            username=user,
            email=email,
            password="password123", # Plain text for demo
            interested_categories="Web Development, Data Science",
            verify_status=True,
            otp_digit="123456"
        )
        students.append(s)
    return students

def create_courses(teachers, categories):
    courses_data = [
        # Teacher: Sneha (Web Dev)
        (teachers[1], categories[0], "Full Stack Web Development with React & Django", 4999, "react, django, python, javascript"),
        (teachers[1], categories[0], "Mastering JavaScript: From Basics to Advanced", 1999, "javascript, es6, frontend"),
        
        # Teacher: Rajesh (Data Science)
        (teachers[0], categories[1], "Python for Data Science and Machine Learning Bootcamp", 5999, "python, pandas, numpy, sklearn"),
        (teachers[0], categories[1], "Deep Learning A-Z: Neural Networks in Python", 6999, "deep learning, pytorch, ai"),
        
        # Teacher: Amitabh (Finance)
        (teachers[2], categories[3], "Complete Financial Analyst Course 2024", 2499, "finance, accounting, excel"),
        
        # Teacher: Priya (Design)
        (teachers[3], categories[4], "UI/UX Design Masterclass using Figma", 1499, "figma, ui, ux, design"),
        
        # Teacher: Vikram (Marketing)
        (teachers[4], categories[2], "The Complete Digital Marketing Course", 999, "seo, marketing, social media"),
    ]
    
    courses = []
    for teacher, category, title, price, techs in courses_data:
        c = Course.objects.create(
            teacher=teacher,
            category=category,
            title=title,
            description=f"This is a comprehensive course on {title}. Learn from industry experts.",
            price=price,
            technologies=techs,
            featured_img=None # Placeholder
        )
        courses.append(c)
    return courses

def create_chapters(courses):
    for course in courses:
        for i in range(1, 6): # 5 chapters per course
            Chapter.objects.create(
                course=course,
                title=f"Chapter {i}: Introduction to {course.title.split()[0]}",
                description=f"In this chapter, we will cover the basics of {course.title}.",
                text_content=f"<h1>Welcome to Chapter {i}</h1><p>This is the content for chapter {i}.</p>"
            )

def enroll_students(students, courses):
    # Enroll each student in random 2 courses
    for student in students:
        enrolled = random.sample(courses, 2)
        for course in enrolled:
            # Create Payment Record
            CoursePayment.objects.create(
                course=course,
                student=student,
                order_id=f"ORDER_{random.randint(1000,9999)}",
                payment_id=f"PAY_{random.randint(1000,9999)}",
                amount=course.price,
                status=True
            )
            # Create Enrollment
            StudentCourseEnrollment.objects.create(
                student=student,
                course=course
            )
            # Add Rating
            CourseRating.objects.create(
                course=course,
                student=student,
                rating=random.randint(3, 5),
                review="Excellent course! Highly recommended."
            )

if __name__ == '__main__':
    print("Starting seeding process...")
    # clean_data() # Uncomment if you want to wipe data first. Warning: Deletes everything.
    
    # Check if data already exists to avoid duplication if run multiple times without clean
    if CourseCategory.objects.count() == 0:
        cats = create_categories()
        print(f"Created {len(cats)} categories.")
        
        teachers = create_teachers()
        print(f"Created {len(teachers)} teachers.")
        
        students = create_students()
        print(f"Created {len(students)} students.")
        
        courses = create_courses(teachers, cats)
        print(f"Created {len(courses)} courses.")
        
        create_chapters(courses)
        print("Created chapters for all courses.")
        
        enroll_students(students, courses)
        print("Enrolled students and added ratings.")
        
        print("Seeding complete successfully!")
    else:
        print("Database already contains data. Skipping seeding to prevent duplication.")
