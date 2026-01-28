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
        },
        {
            "title": "Advanced Theory",
            "description": "Dive deeper into theoretical concepts and academic foundations of the subject."
        },
        {
            "title": "Troubleshooting",
            "description": "Learn how to diagnose and fix common problems you might encounter in real-world situations."
        },
        {
            "title": "Industry Insights",
            "description": "Hear from industry experts about current trends, challenges, and opportunities in the field."
        },
        {
            "title": "Optimization Techniques",
            "description": "Learn how to make your solutions more efficient, scalable, and performant."
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
print("Creating 20 more dummy courses for Knoology LMS...")

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
    
    # List of 20 more courses to create
    courses_to_create = [
        {
            "title": "Cybersecurity Fundamentals",
            "description": "Protect digital assets and information systems from threats with this comprehensive cybersecurity course. Learn about common vulnerabilities, encryption, network security, and ethical hacking techniques. You'll also explore security frameworks and best practices for creating secure systems.",
            "category_id": next((c.id for c in categories if c.title == "Security"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Kali Linux, Wireshark, Metasploit, Burp Suite",
            "img_number": 1
        },
        {
            "title": "Artificial Intelligence Ethics",
            "description": "Explore the ethical implications of AI technologies and algorithms. This course examines bias in AI systems, privacy concerns, algorithmic transparency, and the socioeconomic impacts of automation. You'll learn frameworks for responsible AI development and governance.",
            "category_id": next((c.id for c in categories if c.title == "Artificial Intelligence"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Python, TensorFlow, Ethics Frameworks",
            "img_number": 2
        },
        {
            "title": "Graphic Design Masterclass",
            "description": "Develop professional graphic design skills using industry-standard software. This course covers composition principles, typography, color theory, and branding. You'll create a portfolio showcasing your designs for print and digital media.",
            "category_id": next((c.id for c in categories if c.title == "Design"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Adobe Photoshop, Illustrator, InDesign",
            "img_number": 3
        },
        {
            "title": "Game Development with Unity",
            "description": "Create interactive games using the Unity engine and C#. This course teaches game physics, level design, animation, and user interface implementation. By the end, you'll have developed a playable game that you can add to your portfolio.",
            "category_id": next((c.id for c in categories if c.title == "Game Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Unity, C#, Blender",
            "img_number": 1
        },
        {
            "title": "Flutter App Development",
            "description": "Build beautiful cross-platform mobile applications with Flutter and Dart. Learn to create responsive UIs, implement state management, integrate APIs, and deploy to app stores. This course is perfect for developers looking to enter mobile app development.",
            "category_id": next((c.id for c in categories if c.title == "Mobile Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Flutter, Dart, Firebase",
            "img_number": 2
        },
        {
            "title": "SQL for Data Analysis",
            "description": "Master SQL for querying and analyzing large datasets. This course covers database design, complex joins, subqueries, window functions, and optimization techniques. You'll work with real-world datasets to extract actionable insights for business decisions.",
            "category_id": next((c.id for c in categories if c.title == "Data Science"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "PostgreSQL, MySQL, SQL Server",
            "img_number": 3
        },
        {
            "title": "Serverless Architecture",
            "description": "Build scalable applications without managing server infrastructure. This course explores AWS Lambda, Azure Functions, event-driven architectures, and microservices. Learn to design, deploy, and monitor serverless applications for optimal performance and cost.",
            "category_id": next((c.id for c in categories if c.title == "Cloud Computing"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "AWS Lambda, API Gateway, DynamoDB, Serverless Framework",
            "img_number": 1
        },
        {
            "title": "Advanced CSS and Sass",
            "description": "Take your CSS skills to the next level with advanced techniques and Sass preprocessing. Learn about CSS architecture, animations, grid systems, and responsive design patterns. This course will help you write maintainable and scalable CSS for complex projects.",
            "category_id": next((c.id for c in categories if c.title == "Web Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "CSS3, Sass, BEM, CSS Grid",
            "img_number": 2
        },
        {
            "title": "Natural Language Processing",
            "description": "Learn to process and analyze human language with machine learning. This course covers text preprocessing, sentiment analysis, topic modeling, and building conversational AI. You'll implement NLP models to solve real-world language processing challenges.",
            "category_id": next((c.id for c in categories if c.title == "Artificial Intelligence"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Python, NLTK, spaCy, Transformers",
            "img_number": 3
        },
        {
            "title": "Docker and Containerization",
            "description": "Master container technology for consistent application deployment. This course teaches Docker fundamentals, multi-container applications with Docker Compose, and container orchestration with Kubernetes. You'll learn to containerize applications for any environment.",
            "category_id": next((c.id for c in categories if c.title == "DevOps"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Docker, Docker Compose, Kubernetes",
            "img_number": 1
        },
        {
            "title": "Advanced JavaScript Patterns",
            "description": "Deepen your JavaScript knowledge with advanced design patterns and architectural approaches. This course explores functional programming, prototypal inheritance, asynchronous patterns, and module systems. You'll write cleaner, more maintainable JavaScript code.",
            "category_id": next((c.id for c in categories if c.title == "Programming"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "JavaScript, ES6+, Design Patterns",
            "img_number": 2
        },
        {
            "title": "iOS Development with Swift",
            "description": "Create native iOS applications using Swift and UIKit. Learn to design intuitive UIs, implement navigation flows, store data locally, and integrate with web services. By the end of the course, you'll publish your own app to the App Store.",
            "category_id": next((c.id for c in categories if c.title == "Mobile Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Swift, UIKit, Core Data, Xcode",
            "img_number": 3
        },
        {
            "title": "Penetration Testing",
            "description": "Learn how to identify and exploit vulnerabilities in computer systems and networks. This course covers reconnaissance, vulnerability assessment, exploitation, and reporting. You'll practice ethical hacking in a controlled lab environment.",
            "category_id": next((c.id for c in categories if c.title == "Security"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Kali Linux, Nmap, Metasploit, Burp Suite",
            "img_number": 1
        },
        {
            "title": "Vue.js for Frontend Development",
            "description": "Build reactive user interfaces with Vue.js framework. This course covers Vue components, directives, Vuex for state management, and Vue Router for single-page applications. You'll create a complete frontend application with modern best practices.",
            "category_id": next((c.id for c in categories if c.title == "Web Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Vue.js, Vuex, Vue Router, JavaScript",
            "img_number": 2
        },
        {
            "title": "Digital Marketing Analytics",
            "description": "Measure and optimize digital marketing campaigns using data analytics. This course teaches web analytics, conversion tracking, A/B testing, and marketing attribution models. You'll learn to derive actionable insights from marketing data.",
            "category_id": next((c.id for c in categories if c.title == "Marketing"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Google Analytics, Google Tag Manager, Facebook Pixel",
            "img_number": 3
        },
        {
            "title": "Java Enterprise Applications",
            "description": "Develop enterprise-grade applications using Java EE. This course covers Servlets, JSP, JPA for persistence, and enterprise JavaBeans. You'll build robust, scalable applications using industry-standard Java technologies.",
            "category_id": next((c.id for c in categories if c.title == "Programming"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Java EE, Spring, Hibernate, Maven",
            "img_number": 1
        },
        {
            "title": "Computer Vision Applications",
            "description": "Create applications that can interpret and understand visual information from images and videos. This course covers image processing, object detection, facial recognition, and motion analysis. You'll implement computer vision projects using popular libraries.",
            "category_id": next((c.id for c in categories if c.title == "Artificial Intelligence"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "OpenCV, TensorFlow, Python, CNNs",
            "img_number": 2
        },
        {
            "title": "Advanced Database Design",
            "description": "Master the art of designing efficient and scalable databases. This course covers normalization, indexing strategies, query optimization, and data modeling for different use cases. You'll learn how to architect databases for high-performance applications.",
            "category_id": next((c.id for c in categories if c.title == "Database"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "PostgreSQL, MongoDB, Redis, Database Design",
            "img_number": 3
        },
        {
            "title": "Augmented Reality Development",
            "description": "Create immersive AR experiences for mobile devices. This course teaches 3D modeling, spatial mapping, gesture recognition, and AR frameworks. You'll build augmented reality applications that blend virtual content with the real world.",
            "category_id": next((c.id for c in categories if c.title == "Mobile Development"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "ARKit, ARCore, Unity, C#",
            "img_number": 1
        },
        {
            "title": "Rust Programming Language",
            "description": "Learn Rust, a modern systems programming language focused on safety and performance. This course covers ownership model, pattern matching, concurrency without data races, and low-level system programming. You'll build efficient and reliable software with Rust.",
            "category_id": next((c.id for c in categories if c.title == "Programming"), categories[0].id),
            "teacher_id": random.choice(teachers).id,
            "technologies": "Rust, Cargo, WebAssembly",
            "img_number": 2
        }
    ]
    
    # Create courses
    created_courses = []
    for course_data in courses_to_create:
        course = create_dummy_course(**course_data)
        if course:
            created_courses.append(course)
    
    print(f"\nCreated {len(created_courses)} more dummy courses successfully!")
    print("You can now check the courses in your admin panel or through the API.")

except Exception as e:
    print(f"Error during course creation: {str(e)}")