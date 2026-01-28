import os
import django
import random
from faker import Faker

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'knoology_lms.settings')
django.setup()

# Import models after setting up Django
from main.models import Student, Teacher, CourseCategory

# Initialize Faker
fake = Faker()

# Get all course categories for student interests
categories = list(CourseCategory.objects.all().values_list('id', flat=True))
if not categories:
    print("Warning: No course categories found. Creating a default category.")
    CourseCategory.objects.create(title="General", description="General category for courses")
    categories = list(CourseCategory.objects.all().values_list('id', flat=True))

# Function to generate random interests
def get_random_interests():
    if not categories:
        return "1"  # Default if no categories
    selected = random.sample(categories, min(len(categories), random.randint(1, 3)))
    return ','.join(map(str, selected))

# Create 5 Students
print("Creating 5 students...")
for i in range(1, 6):
    try:
        username = f"student{i}"
        email = f"student{i}@example.com"
        
        # Check if student with this username or email already exists
        if Student.objects.filter(username=username).exists() or Student.objects.filter(email=email).exists():
            print(f"Student {username} or email {email} already exists. Skipping.")
            continue
            
        student = Student.objects.create(
            fullname=fake.name(),
            username=username,
            email=email,
            password="password123",  # In production, would use proper hashing
            interested_categories=get_random_interests(),
            verify_status=True  # Set to true to avoid OTP verification
        )
        print(f"Created student: {student.fullname} ({student.username})")
    except Exception as e:
        print(f"Error creating student {i}: {str(e)}")

# Create 10 Teachers
print("\nCreating 10 teachers...")
for i in range(1, 11):
    try:
        email = f"teacher{i}@example.com"
        mobile = f"123456789{i}" if i < 10 else "1234567890"
        
        # Check if teacher with this email or mobile already exists
        if Teacher.objects.filter(email=email).exists() or Teacher.objects.filter(mobile_number=mobile).exists():
            print(f"Teacher with email {email} or mobile {mobile} already exists. Skipping.")
            continue
            
        qualifications = random.choice([
            "Ph.D. in Computer Science",
            "Masters in Data Science",
            "Bachelor in Software Engineering",
            "Masters in Information Technology",
            "Ph.D. in Artificial Intelligence"
        ])
        
        skills = random.choice([
            "Python, Django, Machine Learning",
            "JavaScript, React, Node.js",
            "Data Analysis, SQL, Tableau",
            "Java, Spring Boot, Microservices",
            "Cloud Computing, AWS, DevOps"
        ])
        
        teacher = Teacher.objects.create(
            full_name=fake.name(),
            email=email,
            mobile_number=mobile,
            password="password123",  # In production, would use proper hashing
            qualification=qualifications,
            skills=skills,
            bio=fake.text(max_nb_chars=200),
            verify_status=True  # Set to true to avoid OTP verification
        )
        print(f"Created teacher: {teacher.full_name} ({teacher.email})")
    except Exception as e:
        print(f"Error creating teacher {i}: {str(e)}")

print("\nDummy users creation completed!")