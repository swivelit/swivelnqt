import './index.css';
import { useAppState } from './hooks/useAppState';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import { HomePage, CoursesPage, TrainersPage, AboutPage } from './pages/PublicPages';
import CourseDetailPage from './pages/CourseDetailPage';
import { StudentDashboard, MyCoursesPage, QuizPage, CertificatesPage, NotificationsPage } from './pages/StudentPages';
import {
  TrainerDashboard, TrainerContentPage, AttendancePage, CreateQuizPage,
  ScheduleLiveClassPage, AssignmentManagerPage, TrainerNotificationsPage,
} from './pages/TrainerPages';
import { AdminDashboard, UserManagementPage, TrainerManagementPage, CourseManagementPage, AnalyticsPage , SettingsPage ,NotificationsPage} from './pages/AdminPages';

function renderPage(page, state, actions) {
  const { role, userName, courseView, activeTab, activeFilter, quizAnswers } = state;
  const { navigate, goPublic, openCourse, setFilter, setTab, setShowModal, answerQuiz, showLogin } = actions;

  const map = {
    home:                    <HomePage onOpenCourse={openCourse} onShowLogin={showLogin} onGoCourses={() => goPublic('courses')} />,
    courses:                 <CoursesPage activeFilter={activeFilter} setFilter={setFilter} onOpenCourse={openCourse} />,
    trainers:                <TrainersPage />,
    about:                   <AboutPage />,
    courseDetail:            <CourseDetailPage courseView={courseView} role={role} onBack={() => goPublic('courses')} onShowLogin={showLogin} onShowLockedModal={() => setShowModal(true)} />,
    'student-dashboard':     <StudentDashboard userName={userName} navigate={navigate} />,
    'student-mycourses':     <MyCoursesPage activeTab={activeTab} setTab={setTab} onOpenCourse={openCourse} />,
    'student-quiz':          <QuizPage quizAnswers={quizAnswers} answerQuiz={answerQuiz} navigate={navigate} />,
    'student-certificates':  <CertificatesPage userName={userName} />,
    'student-notifications': <NotificationsPage />,
    'trainer-dashboard':     <TrainerDashboard userName={userName} navigate={navigate} />,
    'trainer-content':       <TrainerContentPage activeTab={activeTab} setTab={setTab} />,
    'trainer-attendance':    <AttendancePage />,
    'trainer-quiz':          <CreateQuizPage />,
    'trainer-live':          <ScheduleLiveClassPage navigate={navigate} />,
    'trainer-assignments':   <AssignmentManagerPage />,
    'trainer-notifications': <TrainerNotificationsPage />,
    'admin-dashboard':       <AdminDashboard userName={userName} />,
    'admin-users':           <UserManagementPage />,
    'admin-courses':         <CourseManagementPage />,
    'admin-trainers':        <TrainerManagementPage />,
    'admin-analytics':       <AnalyticsPage />,
    'admin-settings': <SettingsPage />,
    'admin-notifications': <NotificationsPage />  };

  return map[page] ?? map['home'];
}

export default function App() {
  const { state, navigate, goPublic, login, logout, showLogin, closeLoginModal, openCourse, setFilter, setTab, setShowModal, answerQuiz } = useAppState();
  const actions = { navigate, goPublic, openCourse, setFilter, setTab, setShowModal, answerQuiz, showLogin };

  return (
    <div className="app">
      <Navbar state={state} goPublic={goPublic} showLogin={showLogin} logout={logout} />
      <div className="main">
        {state.role && <Sidebar role={state.role} page={state.page} navigate={navigate} />}
        <div className="content">{renderPage(state.page, state, actions)}</div>
      </div>
      {state.loginModalOpen && <LoginModal onLogin={login} onClose={closeLoginModal} />}
      {state.showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
            <div className="modal-title">Continue Learning</div>
            <div className="modal-sub">This lesson is locked. Please login or register to access all {state.courseView?.lessons || 42} lessons.</div>
            <div className="modal-btns"><button onClick={showLogin}>Login</button></div>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--sa-muted)', cursor: 'pointer' }}>Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
