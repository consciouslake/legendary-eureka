import Home from './Home.js';
import Header from './Header.js';
import Footer from './Footer.js';
import FlatPage from './FlatPage.js';
//user imports
import MyTeachers from './User/MyTeachers.js';
import CourseDetail from './CourseDetail.js';
import Login from './User/Login.js';
import Register from './User/Register.js';
import Dashboard from './User/Dashboard.js';
import React from 'react';
import RecommendedCourses from './User/RecommendedCourses.js';
import FavouriteCourses from './User/FavouriteCourses.js';
import MyCourses from './User/MyCourses.js';
import StudentAssignments from './User/StudentAssignments.js';
import ProfileSetting from './User/ProfileSetting.js';
import ChangePassword from './User/ChangePassword.js';
import Logout from './User/Logout.js';
import StudentAvailableQuizzes from './User/StudentAvailableQuizzes.js';
import AttemptQuiz from './User/AttemptQuiz.js';
import StudentQuizResults from './User/StudentQuizResults.js';
import StudyMaterials from './User/StudyMaterials.js';
import CourseStudyMaterials from './User/CourseStudyMaterials.js';
import VerifyStudentOtp from './User/VerifyStudentOtp.js';
import ForgotPassword from './User/ForgotPassword.js';
import ResetPassword from './User/ResetPassword.js';
import StudentChatPanel from './Student/StudentChat/StudentChatPanel.js';

//teacher imports
import TeacherRegister from './Teacher/TeacherRegister.js';
import TeacherLogin from './Teacher/TeacherLogin.js';
import TeacherLogout from './Teacher/TeacherLogout.js';
import TeacherDashboard from './Teacher/TeacherDashboard.js';
import TeacherCourses from './Teacher/TeacherCourses.js';
import CourseChapter from './Teacher/CourseChapter.js';
import EditCourse from './Teacher/EditCourse.js';
import AddCourses from './Teacher/AddCourses.js';
import TeacherUserList from './Teacher/UserList.js';
import TeacherProfileSetting from './Teacher/TeacherProfileSetting.js';
import TeacherChangePassword from './Teacher/TeacherChangePassword.js';
import TeacherDetail from './TeacherDetail.js';
import AddChapter from './Teacher/AddChapter.js';
import CheckAssignments from './Teacher/CheckAssignments.js';
import AddAssignment from './Teacher/AddAssignment.js';
import TeacherAssignments from './Teacher/TeacherAssignments.js';
import TeacherQuizzes from './Teacher/TeacherQuizzes.js';
import AddQuizQuestion from './Teacher/AddQuizQuestion.js';
import AssignQuiz from './Teacher/AssignQuiz.js';
import TeacherStudyMaterials from './Teacher/StudyMaterials.js';
import TeacherStudentQuizResults from './Teacher/StudentQuizResults.js';
import VerifyTeacherOtp from './Teacher/VerifyTeacherOtp.js';
import TeacherForgotPassword from './Teacher/TeacherForgotPassword.js';
import TeacherResetPassword from './Teacher/TeacherResetPassword.js';
import TeacherChatPanel from './Teacher/TeacherChat/TeacherChatPanel.js';

import NotFound from './NotFound.js';
import AllCourses from './AllCourses.js';
import PopularCourses from './PopularCourses.js';
import PopularTeachers from './PopularTeachers.js';
import CourseCategories from './CourseCategories.js';
import CategoryCourses from './CategoryCourses.js';
import SkillCourses from './SkillCourses.js';
import SearchResults from './SearchResults.js';
import { Routes, Route } from 'react-router-dom';
import FAQ from './FAQ.js';
import ContactUs from './ContactUs.js';

function Main() {
    return (
        <div>
            <Header />
            <Routes>
                {/* User routes here */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<FlatPage slug="about" />} />
                <Route path="/privacy-policy" element={<FlatPage slug="privacy-policy" />} />
                <Route path="/terms-of-service" element={<FlatPage slug="terms-of-service" />} />
                <Route path="/cookie-policy" element={<FlatPage slug="cookie-policy" />} />
                <Route path="/detail/:id" element={<CourseDetail />} />
                <Route path="/courses/skill/:skill" element={<SkillCourses />} />
                <Route path="/user-login" element={<Login />} />
                <Route path="/user-register" element={<Register />} />
                <Route path="/user-dashboard" element={<Dashboard />} />
                <Route path="/recommended-courses" element={<RecommendedCourses />} />
                <Route path="/favourite-courses" element={<FavouriteCourses />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/my-teachers" element={<MyTeachers />} />
                <Route path="/my-assignments" element={<StudentAssignments />} />
                <Route path="/profile-setting" element={<ProfileSetting />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/user-logout" element={<Logout />} />
                <Route path="/student-available-quizzes" element={<StudentAvailableQuizzes />} />
                <Route path="/attempt-quiz/:quiz_id/:student_id/:course_id" element={<AttemptQuiz />} />
                <Route path="/student-quiz-results" element={<StudentQuizResults />} />
                <Route path="/study-materials" element={<StudyMaterials />} />
                <Route path="/course-study-materials/:course_id" element={<CourseStudyMaterials />} />
                <Route path="/search-results" element={<SearchResults />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/student-chat" element={<StudentChatPanel />} />

                {/* Teacher routes here */}
                <Route path="/teacher-register" element={<TeacherRegister />} />
                <Route path="/teacher-login" element={<TeacherLogin />} />
                <Route path="/teacher-logout" element={<TeacherLogout />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher-user-list" element={<TeacherUserList />} />
                <Route path="/teacher-courses" element={<TeacherCourses />} />
                <Route path="/teacher-course-chapters/:course_id" element={<CourseChapter />} />
                <Route path="/edit-course/:courseId" element={<EditCourse />} />
                <Route path="/teacher-profile-setting" element={<TeacherProfileSetting />} />
                <Route path="/teacher-change-password" element={<TeacherChangePassword />} />
                <Route path="/teacher-assignments" element={<TeacherAssignments />} />
                <Route path="/teacher-quizzes" element={<TeacherQuizzes />} />
                <Route path="/add-quiz-question/:quiz_id" element={<AddQuizQuestion />} />
                <Route path="/assign-quiz/:quiz_id" element={<AssignQuiz />} />
                <Route path="/add-courses" element={<AddCourses />} />
                <Route path="/add-chapter/:course_id" element={<AddChapter />} />
                <Route path="/teacher-detail/:teacher_id" element={<TeacherDetail />} />
                <Route path="/check-assignments/:studentId" element={<CheckAssignments />} />
                <Route path="/add-assignment/:studentId" element={<AddAssignment />} />
                <Route path="/teacher-study-materials/:course_id" element={<TeacherStudyMaterials />} />
                <Route path="/quiz-attempt-detail/:student_id" element={<TeacherStudentQuizResults />} />
                <Route path="/view-student-quiz-results" element={<TeacherStudentQuizResults />} />
                <Route path="/teacher-forgot-password" element={<TeacherForgotPassword />} />
                <Route path="/teacher-reset-password/:token" element={<TeacherResetPassword />} />
                <Route path="/teacher-chat" element={<TeacherChatPanel />} />

                {/* List pages */}
                <Route path="/all-courses" element={<AllCourses />} />
                <Route path="/popular-courses" element={<PopularCourses />} />
                <Route path="/popular-teachers" element={<PopularTeachers />} />
                <Route path="/course-categories" element={<CourseCategories />} />
                <Route path="/category/:category_slug" element={<CategoryCourses />} />

                {/* Footer routes */}
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact-us" element={<ContactUs />} />

                {/* OTP verification routes */}
                <Route path="/verify-student/:student_id" element={<VerifyStudentOtp />} />
                <Route path="/verify-teacher/:teacher_id" element={<VerifyTeacherOtp />} />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </div>
    );
}

export default Main;