# This script is meant to be copied and pasted into the Django shell
from django.contrib.flatpages.models import FlatPage
from django.contrib.sites.models import Site

# Get the default site
site, created = Site.objects.get_or_create(id=1, defaults={'domain': 'localhost:8000', 'name': 'Knoology LMS'})
print(f"Using site: {site.domain}")

# About Us content
about_content = """
<div class="about-section">
    <h2>Welcome to Knoology LMS</h2>
    <p>
        Knoology LMS is a cutting-edge Learning Management System designed to provide an exceptional 
        educational experience for both students and educators. Our platform offers a comprehensive 
        suite of tools to facilitate effective learning and teaching in today's digital world.
    </p>
    
    <h3>Our Mission</h3>
    <p>
        At Knoology, we believe that education should be accessible, engaging, and empowering. 
        Our mission is to provide a platform that connects learners with quality educational content 
        and instructors with powerful tools to deliver their expertise.
    </p>
    
    <h3>Our Features</h3>
    <div class="features">
        <ul>
            <li><strong>Rich Course Content:</strong> Access diverse courses with multimedia resources.</li>
            <li><strong>Interactive Learning:</strong> Engage with quizzes, assignments, and discussion forums.</li>
            <li><strong>Progress Tracking:</strong> Monitor your educational journey with detailed analytics.</li>
            <li><strong>Expert Instructors:</strong> Learn from qualified teachers in various fields.</li>
            <li><strong>Certification:</strong> Earn certificates to validate your skills and knowledge.</li>
        </ul>
    </div>
    
    <h3>Our Team</h3>
    <p>
        Knoology LMS is brought to you by a dedicated team of educators, developers, and learning specialists 
        who are passionate about transforming the educational landscape. Together, we strive to create an 
        environment where knowledge flourishes and learners thrive.
    </p>
</div>
"""

# Contact Us content
contact_content = """
<div class="contact-section">
    <p>
        We're here to help! If you have any questions, feedback, or inquiries, 
        please don't hesitate to reach out to us using the contact form or through 
        the following channels:
    </p>
    
    <div class="contact-info mt-4">
        <div class="mb-3">
            <h4><i class="bi bi-geo-alt-fill me-2"></i>Address</h4>
            <p>123 Education Avenue, Learning City<br>Knowledge State, 54321</p>
        </div>
        
        <div class="mb-3">
            <h4><i class="bi bi-telephone-fill me-2"></i>Phone</h4>
            <p>+1 (555) 123-4567</p>
        </div>
        
        <div class="mb-3">
            <h4><i class="bi bi-envelope-fill me-2"></i>Email</h4>
            <p>info@knoologylms.com<br>support@knoologylms.com</p>
        </div>
        
        <div class="mb-3">
            <h4><i class="bi bi-clock-fill me-2"></i>Hours</h4>
            <p>Monday-Friday: 9:00 AM - 5:00 PM<br>Saturday: 10:00 AM - 2:00 PM<br>Sunday: Closed</p>
        </div>
    </div>
    
    <div class="social-links mt-4">
        <h4>Connect With Us</h4>
        <div class="d-flex gap-3 mt-2">
            <a href="#" class="text-decoration-none">
                <i class="bi bi-facebook fs-4"></i>
            </a>
            <a href="#" class="text-decoration-none">
                <i class="bi bi-twitter fs-4"></i>
            </a>
            <a href="#" class="text-decoration-none">
                <i class="bi bi-linkedin fs-4"></i>
            </a>
            <a href="#" class="text-decoration-none">
                <i class="bi bi-instagram fs-4"></i>
            </a>
        </div>
    </div>
</div>
"""

# Create About Us page
about_page, created = FlatPage.objects.get_or_create(
    url='/about/',
    defaults={
        'title': 'About Us',
        'content': about_content,
    }
)
if not created:
    about_page.content = about_content
    about_page.save()
about_page.sites.add(site)
print(f"{'Created' if created else 'Updated'} About Us page")

# Create Contact Us page
contact_page, created = FlatPage.objects.get_or_create(
    url='/contact/',
    defaults={
        'title': 'Contact Us',
        'content': contact_content,
    }
)
if not created:
    contact_page.content = contact_content
    contact_page.save()
contact_page.sites.add(site)
print(f"{'Created' if created else 'Updated'} Contact Us page")

# Create versions without trailing slashes for flexibility
about_page_alt, created = FlatPage.objects.get_or_create(
    url='/about',
    defaults={
        'title': 'About Us',
        'content': about_content,
    }
)
about_page_alt.sites.add(site)
print(f"{'Created' if created else 'Updated'} alternate About Us page")

contact_page_alt, created = FlatPage.objects.get_or_create(
    url='/contact',
    defaults={
        'title': 'Contact Us',
        'content': contact_content,
    }
)
contact_page_alt.sites.add(site)
print(f"{'Created' if created else 'Updated'} alternate Contact Us page")

print("FlatPages setup complete!")