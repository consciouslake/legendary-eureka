
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'knoology_lms.settings')
django.setup()

from django.contrib.flatpages.models import FlatPage
from django.contrib.sites.models import Site

def populate():
    # Ensure site exists
    site, created = Site.objects.get_or_create(id=1, defaults={'domain': 'example.com', 'name': 'example.com'})
    print(f"Site: {site.domain}")

    pages = [
        {
            'url': '/about/',
            'title': 'About Us',
            'content': '''
            <p>Welcome to <strong>Knoology LMS</strong>, a cutting-edge learning management system designed to empower educators and students worldwide.</p>
            <h3>Our Mission</h3>
            <p>To democratize education by providing a robust, accessible, and feature-rich platform for knowledge sharing.</p>
            <h3>Our Vision</h3>
            <p>A world where quality education is within reach of everyone, regardless of geographical or economic barriers.</p>
            <h3>Our Team</h3>
            <p>We are a dedicated team of developers, educators, and innovators passionate about transforming the way people learn and teach online.</p>
            '''
        },
        {
            'url': '/privacy-policy/',
            'title': 'Privacy Policy',
            'content': '''
            <p>At Knoology LMS, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
            <h3>Information Collection</h3>
            <p>We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us.</p>
            <h3>Use of Information</h3>
            <p>We use your information to provide, maintain, and improve our services, communicate with you, and personalize your learning experience.</p>
            <h3>Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access or disclosure.</p>
            '''
        },
        {
            'url': '/terms-of-service/',
            'title': 'Terms of Service',
            'content': '''
            <p>Welcome to Knoology LMS. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
            <h3>Account Responsibilities</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            <h3>Content Usage</h3>
            <p>Course content is provided for educational purposes only. Unauthorized distribution or commercial use of content is prohibited.</p>
            <h3>User Conduct</h3>
            <p>You agree not to engage in any activity that interferes with or disrupts the services or servers connected to Knoology LMS.</p>
            '''
        },
        {
            'url': '/cookie-policy/',
            'title': 'Cookie Policy',
            'content': '''
            <p>This Cookie Policy explains how Knoology LMS uses cookies and similar technologies to enhance your browsing experience.</p>
            <h3>What are Cookies?</h3>
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve site functionality.</p>
            <h3>How We Use Cookies</h3>
            <p>We use cookies for authentication, session management, analytics, and to personalize content.</p>
            <h3>Managing Cookies</h3>
            <p>You can control and manage cookies through your browser settings. Please note that disabling cookies may affect certain features of our platform.</p>
            '''
        },
        {
            'url': '/contact/',
            'title': 'Contact Us',
            'content': '''
            <p>Have questions or need assistance? We're here to help! Reach out to our support team using the form below or through our contact information.</p>
            <div class="contact-info">
                <h5>Our Office</h5>
                <p>123 Learning Street, Knowledge City, Education State 54321</p>
                <h5>Contact Details</h5>
                <ul>
                    <li><i class="bi bi-envelope-fill"></i> <a href="mailto:support@knoology.lms">support@knoology.lms</a></li>
                    <li><i class="bi bi-telephone-fill"></i> +1 (555) 123-4567</li>
                </ul>
                <h5>Social Media</h5>
                <p>Follow us on <a href="#">Twitter</a>, <a href="#">Facebook</a>, and <a href="#">LinkedIn</a> for updates.</p>
            </div>
            '''
        }
    ]

    for p_data in pages:
        fp, created = FlatPage.objects.get_or_create(url=p_data['url'], defaults={
            'title': p_data['title'],
            'content': p_data['content']
        })
        
        if not created:
            fp.title = p_data['title']
            fp.content = p_data['content']
            fp.save()
            print(f"Updated: {fp.url}")
        else:
            print(f"Created: {fp.url}")
            
        fp.sites.add(site)
        print(f"Added site {site.domain} to {fp.url}")

if __name__ == '__main__':
    populate()
