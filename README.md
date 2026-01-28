# 🎓 Legendary Eureka - Learning Management System (LMS)

**Legendary Eureka** is a full-featured Learning Management System built to bridge the gap between Instructors and Learners. It features a robust **Django** backend, a dynamic **React** frontend, and integrates secure payments via **Razorpay**.

## 🚀 Key Features

### For Students 👨‍🎓
*   **Course Discovery**: Browse courses by category, popularity, and ratings.
*   **Interactive Player**: Single-page learning experience with Sidebar navigation, Video player, and Rich Text content.
*   **Progress Tracking**: Real-time tracking of completed chapters with a visual progress bar.
*   **Secure Enrollment**: Integrated Razorpay payment gateway for buying premium courses.
*   **Certificate of Completion**: Auto-generated PDF certificates upon 100% course completion.
*   **User Dashboard**: Manage enrolled courses, favorite lists, and recommended content.

### For Teachers 👩‍🏫
*   **Course Creation**: Intuitive dashboard to create courses, upload thumbnails, and set pricing.
*   **Curriculum Management**: Add chapters, study materials, and upload videos.
*   **Student Analytics**: View enrolled students and their progress.
*   **Assignment System**: Issue assignments and review student submissions.

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18) | Component-based UI, Hooks for state management. |
| **Styling** | Bootstrap 5 | Responsive grid and modern UI components. |
| **Backend** | Django 4.x | Python web framework handling business logic and ORM. |
| **API** | Django REST Framework | RESTful API endpoints for client-server communication. |
| **Database** | PostgreSQL | Robust relational database for data persistence. |
| **Payments** | Razorpay | Secure payment processing integration. |
| **PDF Engine** | ReportLab | Backend library for generating certificates. |

## ⚙️ Installation & Setup

### Prerequisites
*   Python 3.8+
*   Node.js 16+
*   PostgreSQL
*   Git

### 1. Backend Setup (Django)

```bash
# Clone the repository
git clone https://github.com/consciouslake/legendary-eureka.git
cd legendary-eureka

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file and add:
# SECRET_KEY=your_secret_key
# DEBUG=True
# DATABASE_URL=postgres://user:password@localhost:5432/lms_db

# Run Migrations
python manage.py migrate

# Create Superuser (Admin)
python manage.py createsuperuser

# Start Server
python manage.py runserver
```

### 2. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd lms_frontend

# Install node modules
npm install

# Start Development Server
npm start
```
The app will launch at `http://localhost:3000` connected to the API at `http://localhost:8000`.

## 📂 Project Structure

```
legendary-eureka/
├── main/                   # Django App (Backend Logic)
│   ├── models.py           # Database Schema (Teacher, Student, Course)
│   ├── serializers.py      # API Data Conversion
│   ├── views.py            # API Endpoints
│   └── urls.py             # Routing
├── lms_frontend/           # React Application
│   ├── src/components/     # UI Components (CourseDetail, Dashboard)
│   ├── public/             # Static Assets
│   └── package.json        # JS Dependencies
├── media/                  # User Uploads (Images, Videos)
└── manage.py               # Django Entry Point
```

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
Built with ❤️ by the **Conscious Lake** Team.
