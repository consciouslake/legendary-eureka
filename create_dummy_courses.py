# This script is meant to be copied and pasted into the Django shell
import random
import os
import datetime
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from main.models import Course, Teacher, CourseCategory, Chapter
from django.conf import settings
from django.utils.text import slugify

def create_dummy_course(title, description, category_id, teacher_id, technologies, img_number=None):
    """
    Create a dummy course with chapters
    """
    # Check if course already exists to avoid duplicates
    if Course.objects.filter(title=title).exists():
        course = Course.objects.get(title=title)
        print(f"Course already exists: {title}")
        return course
    
    try:
        # Get the required objects
        teacher = Teacher.objects.get(id=teacher_id)
        category = CourseCategory.objects.get(id=category_id)
        
        # Create the course
        course = Course(
            title=title,
            description=description,
            category=category,
            teacher=teacher,
            technologies=technologies
        )
        
        # Handle featured image
        if img_number:
            # Use a placeholder image
            img_path = os.path.join(settings.MEDIA_ROOT, 'course_images', f'course{img_number}.jpg')
            
            # If the placeholder image doesn't exist, we'll skip adding an image
            if os.path.exists(img_path):
                with open(img_path, 'rb') as f:
                    course.featured_img.save(f'course{img_number}.jpg', ContentFile(f.read()))
            else:
                print(f"Warning: Image file course{img_number}.jpg not found. Skipping image for {title}")
        
        course.save()
        print(f"Added course: {title}")
        
        # Set some initial enrollment and ratings
        num_ratings = random.randint(0, 20)
        avg_rating = round(random.uniform(3.5, 5.0), 2) if num_ratings > 0 else 0
        
        course.total_ratings = num_ratings
        course.average_rating = avg_rating
        course.save()
        
        # Add some example chapters
        add_chapters_to_course(course)
        
        return course
    
    except Teacher.DoesNotExist:
        print(f"Error: Teacher with ID {teacher_id} does not exist")
    except CourseCategory.DoesNotExist:
        print(f"Error: Category with ID {category_id} does not exist")
    except Exception as e:
        print(f"Error creating course {title}: {str(e)}")
    
    return None

def add_chapters_to_course(course):
    """
    Add example chapters to a course
    """
    chapters_data = [
        {
            "title": "Introduction",
            "description": "Welcome to the course! This chapter will introduce you to the basic concepts and set expectations for what you'll learn."
        },
        {
            "title": "Getting Started",
            "description": "In this chapter, we'll set up our environment and tools needed for the course."
        },
        {
            "title": "Core Concepts",
            "description": "This chapter covers the fundamental principles and concepts you need to understand before diving deeper."
        },
        {
            "title": "Advanced Techniques",
            "description": "Now that you've mastered the basics, we'll explore more advanced techniques and strategies."
        },
        {
            "title": "Real-world Applications",
            "description": "In this chapter, we'll apply what we've learned to real-world scenarios and case studies."
        },
        {
            "title": "Best Practices",
            "description": "Learn the industry best practices and how to implement them in your projects."
        },
        {
            "title": "Course Project",
            "description": "Work on a comprehensive project that applies all the skills you've learned throughout the course."
        },
        {
            "title": "Next Steps",
            "description": "Congratulations on completing the course! This chapter suggests ways to continue your learning journey."
        }
    ]
    
    # Add 3-5 random chapters to each course
    num_chapters = random.randint(3, 5)
    selected_chapters = random.sample(chapters_data, num_chapters)
    
    for i, chapter_data in enumerate(selected_chapters):
        Chapter.objects.create(
            course=course,
            title=chapter_data["title"],
            description=chapter_data["description"],
            remarks=f"Chapter {i+1} of {num_chapters}"
        )
    
    print(f"Added {num_chapters} chapters to course: {course.title}")

# Main execution
print("Creating dummy courses for Knoology LMS...")

# Get available teachers and categories
try:
    teachers = list(Teacher.objects.all())
    categories = list(CourseCategory.objects.all())
    
    if not teachers:
        print("No teachers found in the database. Please create teachers first.")
        exit()
    
    if not categories:
        print("No course categories found in the database. Please create categories first.")
        exit()
    
    print(f"Found {len(teachers)} teachers and {len(categories)} categories")
    
    # List of courses to create
    courses_to_create = [
        {
            "title": "Python Programming for Beginners",
            "description": "Start your coding journey with Python, one of the most beginner-friendly programming languages. This course will teach you Python basics, data types, control structures, functions, and more. By the end, you'll have built several small applications and have a solid foundation in programming.",
            "category_id": next((c.id for c in categories if c.title == "Programming"), categories[0].id),
            "teacher_id": teachers[0].id,
            "technologies": "Python, VS Code, Git",
            "img_number": 1
        },
        {
            "title": "Web Development Fundamentals",
            "description": "Learn how to build modern websites from scratch using HTML, CSS, and JavaScript. This course covers responsive design principles, CSS frameworks, and basic JavaScript interactivity. You'll complete the course by building a portfolio website to showcase your new skills.",
            "category_id": next((c.id for c in categories if c.title == "Web Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "HTML, CSS, JavaScript, Bootstrap",
            "img_number": 2
        },
        {
            "title": "Data Science Essentials",
            "description": "Explore the world of data science and learn how to analyze and visualize data to extract meaningful insights. This course teaches you Python libraries like Pandas, NumPy, and Matplotlib, as well as basic statistical concepts for data analysis.",
            "category_id": next((c.id for c in categories if c.title == "Data Science"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Python, Pandas, NumPy, Matplotlib",
            "img_number": 3
        },
        {
            "title": "Full Stack JavaScript Development",
            "description": "Master both front-end and back-end web development using JavaScript. Learn React for building user interfaces, Node.js for server-side logic, and MongoDB for database storage. By the end of this course, you'll be able to build complete web applications from scratch.",
            "category_id": next((c.id for c in categories if c.title == "Web Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "JavaScript, React, Node.js, Express, MongoDB",
            "img_number": 1
        },
        {
            "title": "Machine Learning Fundamentals",
            "description": "Get started with machine learning and artificial intelligence. This course covers the mathematical foundations, key algorithms, and practical applications of ML. You'll work with scikit-learn and TensorFlow to build and train models on real-world datasets.",
            "category_id": next((c.id for c in categories if c.title == "Data Science"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Python, scikit-learn, TensorFlow, Pandas",
            "img_number": 2
        },
        {
            "title": "Mobile App Development with React Native",
            "description": "Build cross-platform mobile applications for iOS and Android using React Native. Learn component design, state management, native device features, and app deployment. By the end of the course, you'll have published your own app to the app stores.",
            "category_id": next((c.id for c in categories if c.title == "Mobile Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "JavaScript, React Native, Expo, Redux",
            "img_number": 3
        },
        {
            "title": "DevOps and CI/CD Pipelines",
            "description": "Learn the principles and practices of DevOps to streamline your development workflow. This course covers Docker, Kubernetes, Jenkins, and GitHub Actions for building robust CI/CD pipelines. You'll master automation tools that modern development teams use daily.",
            "category_id": next((c.id for c in categories if c.title == "DevOps"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Docker, Kubernetes, Jenkins, GitHub Actions",
            "img_number": 1
        },
        {
            "title": "Blockchain Development",
            "description": "Discover blockchain technology and learn to build decentralized applications. This course covers Ethereum, Solidity smart contracts, web3.js, and dApp architecture. You'll build your own cryptocurrency and NFT marketplace as part of the course projects.",
            "category_id": next((c.id for c in categories if c.title == "Blockchain"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Solidity, Ethereum, Web3.js, Truffle",
            "img_number": 2
        },
        {
            "title": "UX/UI Design Principles",
            "description": "Learn to create beautiful, functional, and user-friendly interfaces. This course teaches design thinking, wireframing, prototyping, and user testing. You'll use industry-standard tools like Figma to design responsive interfaces for web and mobile applications.",
            "category_id": next((c.id for c in categories if c.title == "Design"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Figma, Adobe XD, Sketch",
            "img_number": 3
        },
        {
            "title": "Cloud Computing with AWS",
            "description": "Master Amazon Web Services and learn to architect scalable cloud solutions. This course covers EC2, S3, Lambda, DynamoDB, and more. You'll deploy real applications to the cloud and implement best practices for security, scalability, and cost optimization.",
            "category_id": next((c.id for c in categories if c.title == "Cloud Computing"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "AWS, EC2, S3, Lambda, DynamoDB",
            "img_number": 1
        }
    ]
    
    # Create courses
    created_courses = []
    for course_data in courses_to_create:
        course = create_dummy_course(**course_data)
        if course:
            created_courses.append(course)
    
    print(f"\nCreated {len(created_courses)} dummy courses successfully!")
    print("You can now check the courses in your admin panel or through the API.")

except Exception as e:
    print(f"Error during course creation: {str(e)}")