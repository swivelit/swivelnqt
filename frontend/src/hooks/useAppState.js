import { useState } from 'react';
import { loginDefs } from '../data/data';

export function useAppState() {
  const [state, setState] = useState({
    role: null,
    userName: '',
    page: 'home',
    activeTab: 0,
    quizAnswers: {},
    showModal: false,
    courseView: null,
    activeFilter: 'All',
    loginModalOpen: false,
  });

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  const navigate = (page) => update({ page, activeTab: 0, showModal: false });

  const goPublic = (page) => update({ page, showModal: false });

  // Accepts a user object from the DB: { id, name, email, role }
  // Also supports legacy string role for backwards compatibility
  const login = (userOrRole) => {
    let role, userName;

    if (typeof userOrRole === 'string') {
      // Legacy: role string passed directly
      role = userOrRole;
      const def = loginDefs[role];
      userName = def?.name || role;
    } else {
      // DB user object: { id, name, email, role }
      role = userOrRole.role;
      userName = userOrRole.name;
    }

    const defaultPages = {
      student: 'student-dashboard',
      trainer: 'trainer-dashboard',
      admin: 'admin-dashboard',
    };

    setState((s) => ({
      ...s,
      role,
      userName,
      page: defaultPages[role] || 'home',
      showModal: false,
      loginModalOpen: false,
    }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    update({ role: null, userName: '', page: 'home', loginModalOpen: false });
  };

  const showLogin = () => update({ loginModalOpen: true });

  const closeLoginModal = () => update({ loginModalOpen: false });

  const openCourse = (course) => update({ courseView: course, page: 'courseDetail' });

  const setFilter = (f) => update({ activeFilter: f });

  const setTab = (i) => update({ activeTab: i });

  const setShowModal = (v) => update({ showModal: v });

  const answerQuiz = (qIdx, optIdx) =>
    setState((s) => ({ ...s, quizAnswers: { ...s.quizAnswers, [qIdx]: optIdx } }));

  return {
    state,
    navigate,
    goPublic,
    login,
    logout,
    showLogin,
    closeLoginModal,
    openCourse,
    setFilter,
    setTab,
    setShowModal,
    answerQuiz,
  };
}
