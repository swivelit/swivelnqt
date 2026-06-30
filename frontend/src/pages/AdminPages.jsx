import { useEffect, useState, useCallback } from 'react';
import { courses as dashboardCourses, thumbEmoji } from '../data/data';
import { TrainersPage } from './PublicPages';
import { TrainerDashboard } from './TrainerPages';

// ── Shared API helpers (mirrors the pattern used in TrainerPages.jsx /
// StudentPages.jsx for live classes and quizzes) ──────────────────────────
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
});

// Course titles for the student-enrollment picker — fetched from the real
// `courses` table the admin manages on this same page, instead of the old
// hardcoded data.js list. Any role can hit GET /api/courses/titles.
function useCourseTitles() {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/courses/titles`, { headers: authHeaders() });
        const json = await res.json();
        if (!cancelled && res.ok) setTitles(json.titles || []);
      } catch {
        // leave empty rather than fall back to a stale hardcoded list
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { courseTitles: titles, loadingCourseTitles: loading };
}

export function AdminDashboard({ userName }) {
  const bars = [48, 62, 38, 75, 55, 82, 91, 70, 88, 65, 74, 96];
  const barColors = ['var(--sa-teal)', 'var(--sa-accent)', 'var(--sa-gold)'];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Admin Dashboard</div>
        <div className="page-sub">Platform overview · {userName}</div>
      </div>

      

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Enrollment trend <small>last 12 months</small></div>
          <div className="mini-chart" style={{ height: 80 }}>
            {bars.map((b, i) => (
              <div key={i} className="bar" style={{ height: `${b}%`, background: barColors[i % 3], opacity: 0.7 }} title={`${b * 30} enrollments`} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--sa-muted)', marginTop: 4 }}>
            <span>Feb</span><span>May</span><span>Aug</span><span>Jan</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Top performing courses</div>
          {dashboardCourses.slice(0, 4).map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 16 }}>{thumbEmoji[c.thumb]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--sa-text)' }}>{c.title}</div>
                <div className="progress-bar" style={{ marginTop: 3 }}>
                  <div className="progress-fill" style={{ width: `${Math.round(c.students / 14)}%` }} />
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{c.students}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT (students) — fully wired to the backend. Students now
// live in their own `students` table (separate from trainers/admins), so
// every single-record call includes ?role=student to tell the backend
// which table to use.
//   GET    /api/users?role=student              list
//   POST   /api/users                            create (role: 'student', name, email, password, courses[])
//   PUT    /api/users/:id?role=student           edit   (name, email, isActive, password?, courses[])
//   DELETE /api/users/:id?role=student           remove
// ════════════════════════════════════════════════════════════════════════════
function UserFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const { courseTitles: COURSE_TITLES, loadingCourseTitles } = useCourseTitles();
  const [name, setName]           = useState(initial?.name || '');
  const [email, setEmail]         = useState(initial?.email || '');
  const [password, setPassword]   = useState('');
  const [isActive, setIsActive]   = useState(initial?.is_active ?? true);
  const [selectedCourses, setSelectedCourses] = useState(initial?.courses || []);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);

  const toggleCourse = (title) =>
    setSelectedCourses((prev) => prev.includes(title) ? prev.filter((c) => c !== title) : [...prev, title]);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!isEdit && (!password || password.length < 6)) { setError('Password must be at least 6 characters.'); return; }
    if (isEdit && password && password.length < 6) { setError('New password must be at least 6 characters.'); return; }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      role: 'student',
      courses: selectedCourses,
    };
    if (!isEdit) payload.password = password;
    if (isEdit && password) payload.password = password;
    if (isEdit) payload.isActive = isActive;

    setSaving(true);
    try {
      const url = isEdit ? `${API}/users/${initial.id}?role=student` : `${API}/users`;
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save user');
      onSaved(json.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', zIndex: 200 }}>
      <div className="modal" style={{ width: 480, maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', padding: 24 }}>
        <div className="modal-title" style={{ textAlign: 'left' }}>{isEdit ? 'Edit Student' : 'Add Student'}</div>
        <div className="modal-sub" style={{ textAlign: 'left' }}>{isEdit ? 'Update this student\u2019s details. Leave password blank to keep it unchanged.' : 'This creates a real login the student can use right away.'}</div>

        {error && (
          <div style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 12, fontSize: 12, background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anjali Sharma" />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">{isEdit ? 'New Password (optional)' : 'Password *'}</label>
          <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEdit ? 'Leave blank to keep current password' : 'Minimum 6 characters'} />
        </div>
        {isEdit && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Enrolled Courses</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto', border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-md)', padding: 8 }}>
            {loadingCourseTitles && <div style={{ fontSize: 12, color: 'var(--sa-muted)' }}>Loading courses…</div>}
            {!loadingCourseTitles && COURSE_TITLES.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--sa-muted)' }}>No courses yet — add one in Course Management first.</div>
            )}
            {COURSE_TITLES.map((title) => (
              <label key={title} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedCourses.includes(title)} onChange={() => toggleCourse(title)} style={{ accentColor: 'var(--sa-teal)' }} />
                {title}
              </label>
            ))}
          </div>
        </div>

        <div className="modal-btns" style={{ marginTop: 16 }}>
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button className="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Student'}</button>
        </div>
      </div>
    </div>
  );
}

export function UserManagementPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [modalUser, setModalUser] = useState(undefined); // undefined = closed, null = add, object = edit

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/users?role=student`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load students');
      setUsers(json.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete student "${user.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/users/${user.id}?role=student`, { method: 'DELETE', headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete user');
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSaved = (savedUser) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === savedUser.id);
      return exists ? prev.map((u) => (u.id === savedUser.id ? savedUser : u)) : [savedUser, ...prev];
    });
    setModalUser(undefined);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => (name || '').split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      <div className="page-header">
        <div className="page-title">User Management</div>
        <div className="page-sub">Students you create here can log in immediately with the email and password you set</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="action-btn accent" onClick={() => setModalUser(null)}>+ Add User</button>
          <button className="action-btn" onClick={loadUsers}>↻ Refresh</button>
        </div>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input
          placeholder="Search students by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--sa-muted)' }}>⏳ Loading students…</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--sa-muted)' }}>
            {users.length === 0 ? 'No students yet. Click "+ Add User" to create the first one.' : 'No students match your search.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Enrolled In</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar av-a" style={{ width: 26, height: 26, fontSize: 10 }}>{initials(u.name)}</div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{u.email}</td>
                  <td style={{ fontSize: 11 }}>{(u.courses && u.courses.length > 0) ? u.courses.join(', ') : '—'}</td>
                  <td>
                    <span className={`status-pill status-${u.is_active ? 'active' : 'pending'}`}>{u.is_active ? 'active' : 'inactive'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setModalUser(u)}>✏️</button>
                      <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11, color: 'var(--sa-accent)' }} onClick={() => handleDeleteUser(u)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalUser !== undefined && (
        <UserFormModal initial={modalUser} onClose={() => setModalUser(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COURSE MANAGEMENT — fully wired to the backend. This is the single
// source of truth for course titles used everywhere else in the app
// (trainer's quiz form, trainer's live-class form, student enrollment
// picker) via GET /api/courses/titles.
//   GET    /api/courses             list (admin, includes live enrolled-student counts)
//   POST   /api/courses             create
//   PUT    /api/courses/:id         edit
//   DELETE /api/courses/:id         remove
// ════════════════════════════════════════════════════════════════════════════
const THUMB_OPTIONS = Object.keys(thumbEmoji);
const CATEGORY_OPTIONS = ['Web Dev', 'Data Science', 'Design', 'DevOps', 'Mobile', 'AI/ML', 'IT Support', 'General'];

function CourseFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [title, setTitle]             = useState(initial?.title || '');
  const [trainerName, setTrainerName] = useState(initial?.trainer_name || '');
  const [category, setCategory]       = useState(initial?.category || CATEGORY_OPTIONS[0]);
  const [price, setPrice]             = useState(initial?.price || '');
  const [thumb, setThumb]             = useState(initial?.thumb || THUMB_OPTIONS[0]);
  const [status, setStatus]           = useState(initial?.status || 'active');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) { setError('Course title is required.'); return; }

    const payload = {
      title: title.trim(),
      trainerName: trainerName.trim(),
      category,
      price: price.trim() || '₹0',
      thumb,
      status,
    };

    setSaving(true);
    try {
      const url = isEdit ? `${API}/courses/${initial.id}` : `${API}/courses`;
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save course');
      onSaved(json.course);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', zIndex: 200 }}>
      <div className="modal" style={{ width: 460, maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', padding: 24 }}>
        <div className="modal-title" style={{ textAlign: 'left' }}>{isEdit ? 'Edit Course' : 'Add Course'}</div>
        <div className="modal-sub" style={{ textAlign: 'left' }}>{isEdit ? 'Changing the title updates it everywhere this course is referenced.' : 'This course immediately becomes available in every quiz/live-class course picker.'}</div>

        {error && (
          <div style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 12, fontSize: 12, background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Course Title *</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full Stack Web Development" />
        </div>
        <div className="form-group">
          <label className="form-label">Trainer Name</label>
          <input className="form-input" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} placeholder="e.g. Pandeeswaran" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Icon</label>
            <select className="form-input" value={thumb} onChange={(e) => setThumb(e.target.value)}>
              {THUMB_OPTIONS.map((t) => <option key={t} value={t}>{thumbEmoji[t]} {t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Price</label>
            <input className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. ₹12,999" />
          </div>
          {isEdit && (
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Status</label>
              <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="modal-btns" style={{ marginTop: 16 }}>
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button className="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}</button>
        </div>
      </div>
    </div>
  );
}

export function CourseManagementPage() {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [modalCourse, setModalCourse] = useState(undefined); // undefined = closed, null = add, object = edit

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/courses`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load courses');
      setCourseList(json.courses || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? Existing quizzes/classes that reference this course title won't be removed, but it will disappear from every course picker.`)) return;
    try {
      const res = await fetch(`${API}/courses/${course.id}`, { method: 'DELETE', headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete course');
      setCourseList((prev) => prev.filter((c) => c.id !== course.id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSaved = (savedCourse) => {
    setCourseList((prev) => {
      const exists = prev.some((c) => c.id === savedCourse.id);
      return exists ? prev.map((c) => (c.id === savedCourse.id ? savedCourse : c)) : [savedCourse, ...prev];
    });
    setModalCourse(undefined);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Course Management</div>
        <div className="page-sub">Courses created here are immediately available in every quiz and live-class course picker, and in students' enrollment options</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="action-btn accent" onClick={() => setModalCourse(null)}>+ Add Course</button>
          <button className="action-btn" onClick={loadCourses}>↻ Refresh</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Trainer</th>
              <th>Category</th>
              <th>Students</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--sa-muted)' }}>⏳ Loading courses…</td></tr>
            ) : courseList.length > 0 ? (
              courseList.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{thumbEmoji[c.thumb] || '📘'}</span>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{c.title}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{c.trainer_name || '—'}</td>
                  <td style={{ fontSize: 11 }}>{c.category}</td>
                  <td style={{ fontSize: 12 }}>{c.students}</td>
                  <td style={{ fontSize: 12, fontWeight: 500 }}>{c.price}</td>
                  <td>
                    <span className={`status-pill status-${c.status === 'active' ? 'active' : 'pending'}`}>{c.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setModalCourse(c)}>✏️</button>
                      <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11, color: 'var(--sa-accent)' }} onClick={() => handleDeleteCourse(c)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No courses yet. Click "+ Add Course" to create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalCourse !== undefined && (
        <CourseFormModal initial={modalCourse} onClose={() => setModalCourse(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRAINER MANAGEMENT — fully wired to the backend. Trainers now live in
// their own `trainers` table (separate from students/admins), so every
// single-record call includes ?role=trainer to tell the backend which
// table to use.
//   GET    /api/users?role=trainer              list
//   POST   /api/users                            create (role: 'trainer', name, email, password, specialization)
//   PUT    /api/users/:id?role=trainer           edit   (name, email, isActive, specialization, password?)
//   DELETE /api/users/:id?role=trainer           remove
// ════════════════════════════════════════════════════════════════════════════
function TrainerFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [name, setName]                   = useState(initial?.name || '');
  const [email, setEmail]                 = useState(initial?.email || '');
  const [password, setPassword]           = useState('');
  const [specialization, setSpecialization] = useState(initial?.specialization || '');
  const [isActive, setIsActive]           = useState(initial?.is_active ?? true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!isEdit && (!password || password.length < 6)) { setError('Password must be at least 6 characters.'); return; }
    if (isEdit && password && password.length < 6) { setError('New password must be at least 6 characters.'); return; }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      role: 'trainer',
      specialization: specialization.trim(),
    };
    if (!isEdit) payload.password = password;
    if (isEdit && password) payload.password = password;
    if (isEdit) payload.isActive = isActive;

    setSaving(true);
    try {
      const url = isEdit ? `${API}/users/${initial.id}?role=trainer` : `${API}/users`;
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save trainer');
      onSaved(json.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', zIndex: 200 }}>
      <div className="modal" style={{ width: 440, maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', padding: 24 }}>
        <div className="modal-title" style={{ textAlign: 'left' }}>{isEdit ? 'Edit Trainer' : 'Add Trainer'}</div>
        <div className="modal-sub" style={{ textAlign: 'left' }}>{isEdit ? 'Update this trainer\u2019s details. Leave password blank to keep it unchanged.' : 'This creates a real login the trainer can use right away.'}</div>

        {error && (
          <div style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 12, fontSize: 12, background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pandeeswaran" />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="trainer@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">{isEdit ? 'New Password (optional)' : 'Password *'}</label>
          <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEdit ? 'Leave blank to keep current password' : 'Minimum 6 characters'} />
        </div>
        <div className="form-group">
          <label className="form-label">Specialization</label>
          <input className="form-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. React, Node.js, UI/UX" />
        </div>
        {isEdit && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="modal-btns" style={{ marginTop: 16 }}>
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button className="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Trainer'}</button>
        </div>
      </div>
    </div>
  );
}

export function TrainerManagementPage() {
  const [trainerList, setTrainerList] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [modalTrainer, setModalTrainer] = useState(undefined); // undefined = closed, null = add, object = edit

  const loadTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/users?role=trainer`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load trainers');
      setTrainerList(json.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTrainers(); }, [loadTrainers]);

  const handleDeleteTrainer = async (trainer) => {
    if (!window.confirm(`Delete trainer "${trainer.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/users/${trainer.id}?role=trainer`, { method: 'DELETE', headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete trainer');
      setTrainerList((prev) => prev.filter((t) => t.id !== trainer.id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSaved = (savedTrainer) => {
    setTrainerList((prev) => {
      const exists = prev.some((t) => t.id === savedTrainer.id);
      return exists ? prev.map((t) => (t.id === savedTrainer.id ? savedTrainer : t)) : [savedTrainer, ...prev];
    });
    setModalTrainer(undefined);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Trainer Management</div>
        <div className="page-sub">Trainers you create here can log in immediately with the email and password you set</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="action-btn accent" onClick={() => setModalTrainer(null)}>+ Add Trainer</button>
          <button className="action-btn" onClick={loadTrainers}>↻ Refresh</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--sa-muted)' }}>⏳ Loading trainers…</td></tr>
            ) : trainerList.length > 0 ? (
              trainerList.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{t.email}</td>
                  <td>{t.specialization || '—'}</td>
                  <td>
                    <span className={`status-pill status-${t.is_active ? 'active' : 'pending'}`}>{t.is_active ? 'active' : 'inactive'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setModalTrainer(t)}>✏️</button>
                      <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11, color: 'var(--sa-accent)' }} onClick={() => handleDeleteTrainer(t)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  No trainers yet. Click "+ Add Trainer" to create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalTrainer !== undefined && (
        <TrainerFormModal initial={modalTrainer} onClose={() => setModalTrainer(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}

export function AnalyticsPage() {
  const bars2 = [30, 55, 70, 45, 88, 62, 74, 50, 92, 78, 65, 95];
  const categories = [
    { label: 'Web Dev', pct: 34, color: 'var(--sa-teal)' },
    { label: 'Data Science', pct: 24, color: 'var(--sa-accent)' },
    { label: 'Design', pct: 18, color: 'var(--sa-gold)' },
    { label: 'DevOps', pct: 14, color: '#185fa5' },
    { label: 'AI/ML', pct: 10, color: '#993c1d' },
  ];
  const activity = [
    { icon: '👤', text: 'Divya Menon enrolled in React Native', time: '5m ago', color: 'var(--sa-teal)' },
    { icon: '🏆', text: 'Kiran Kumar earned a certificate', time: '12m ago', color: 'var(--sa-gold)' },
    { icon: '❓', text: 'Quiz "CSS Flexbox" completed by 34 students', time: '1h ago', color: 'var(--sa-accent)' },
    { icon: '⬆️', text: 'New lesson uploaded: State Management', time: '2h ago', color: '#185fa5' },
  ];

  return (
    <div>
      <div className="page-header"><div className="page-title">Analytics & Reports</div></div>

      <div className="grid-4">
        {[
          ['Completion Rate', '68%', '↑ 5% vs last month', 'metric-up'],
          ['Avg Quiz Score', '74%', '', ''],
          ['Active This Week', '4,820', '', ''],
          ['Dropout Rate', '12%', '↓ 2% improvement', 'metric-down'],
        ].map(([label, value, sub, cls]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            {sub && <div className={`metric-sub ${cls}`}>{sub}</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Monthly active students</div>
        <div className="mini-chart" style={{ height: 90 }}>
          {bars2.map((b, i) => (
            <div key={i} className="bar" style={{ height: `${b}%`, background: 'var(--sa-teal)', opacity: 0.5 + i * 0.04 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--sa-muted)', marginTop: 4 }}>
          <span>Feb 25</span><span>May 25</span><span>Aug 25</span><span>Jan 26</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Category breakdown</div>
          {categories.map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, color: 'var(--sa-text)' }}>{r.label}</div>
              <div className="progress-bar" style={{ width: 100 }}>
                <div className="progress-fill" style={{ width: `${r.pct * 2.9}%`, background: r.color }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--sa-muted)', width: 28, textAlign: 'right' }}>{r.pct}%</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Recent activity</div>
          {activity.map((a, i) => (
            <div key={i} className="notif-item">
              <span style={{ fontSize: 15, color: a.color, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
              <div className="notif-body"><div className="notif-title">{a.text}</div></div>
              <div className="notif-time">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



const colors = {
  bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #312e81 100%)",
  cardBg: "rgba(255, 255, 255, 0.85)",
  cardBorder: "rgba(255, 255, 255, 0.6)",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  accentBlueFrom: "#2563eb",
  accentBlueTo: "#4f46e5",
  accentRedFrom: "#ef4444",
  accentRedTo: "#b91c1c",
  border: "#e2e8f0",
  inputBg: "#f8fafc",
  focusRing: "#6366f1",
};

/* ---------- Toggle Switch (module-level so it doesn't remount each render) ---------- */
function Switch({ checked, onChange, label, id }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        padding: "10px 0",
      }}
    >
      <span style={{ fontSize: "14px", fontWeight: 500, color: colors.textPrimary }}>
        {label}
      </span>
      <span
        style={{
          position: "relative",
          width: "46px",
          height: "26px",
          flexShrink: 0,
        }}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{
            position: "absolute",
            opacity: 0,
            width: "100%",
            height: "100%",
            margin: 0,
            cursor: "pointer",
            zIndex: 1,
          }}
          aria-checked={checked}
          role="switch"
        />
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "999px",
            background: checked
              ? `linear-gradient(135deg, ${colors.accentBlueFrom}, ${colors.accentBlueTo})`
              : "#cbd5e1",
            transition: "background 0.25s ease",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: checked ? "23px" : "3px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
            transition: "left 0.25s ease",
          }}
        />
      </span>
    </label>
  );
}

/* ---------- Password Input with toggle (module-level so it doesn't remount each render) ---------- */
function PasswordField({
  name,
  placeholder,
  label,
  value,
  onChangeValue,
  error,
  visible,
  onToggleVisible,
  focusedInput,
  setFocusedInput,
  getInputStyle,
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: colors.textSecondary,
          marginBottom: "8px",
          letterSpacing: "0.01em",
        }}
        htmlFor={name}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={name}
          type={visible ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChangeValue}
          onFocus={() => setFocusedInput(name)}
          onBlur={() => setFocusedInput("")}
          style={{ ...getInputStyle(name, focusedInput), paddingRight: "44px" }}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px",
            lineHeight: 1,
          }}
        >
          {visible ? "🙈" : "👁️"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState({
    adminName: "Admin User",
    email: "admin@example.com",
    platformName: "Learning Management System",
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: true,
    smsVerification: true,
  });

  const [profilePic, setProfilePic] = useState(
    "https://via.placeholder.com/120"
  );

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [emailError, setEmailError] = useState("");

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [hoveredBtn, setHoveredBtn] = useState("");
  const [focusedInput, setFocusedInput] = useState("");
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);

      setSettings(parsed.settings);
      setProfilePic(parsed.profilePic);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "email") {
      validateEmail(value);
    }
  };

  const handleToggle = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("Email address is required");
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordFields = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordReset = () => {
    if (!validatePasswordFields()) {
      return;
    }

    alert("Password changed successfully");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  const handleForgotPassword = () => {
    alert(`Password reset link sent to ${settings.email}`);
  };

  const handleLogoutAllDevices = () => {
    const confirmLogout = window.confirm("Logout from all devices?");

    if (confirmLogout) {
      alert("Logged out from all devices");
    }
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "This action cannot be undone. Delete account permanently?"
    );

    if (confirmDelete) {
      localStorage.removeItem("adminSettings");

      alert("Account deleted successfully");
    }
  };

  const handleSave = () => {
    if (!validateEmail(settings.email)) {
      return;
    }

    if (!settings.adminName.trim()) {
      alert("Admin name cannot be empty");
      return;
    }

    localStorage.setItem(
      "adminSettings",
      JSON.stringify({
        settings,
        profilePic,
      })
    );

    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1500);
    alert("Settings saved successfully!");
  };

  /* ---------- Style tokens ---------- */

  const cardStyle = {
    background: colors.cardBg,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.12)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  };

  const cardHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    fontSize: "18px",
    fontWeight: 700,
    color: colors.textPrimary,
    letterSpacing: "-0.01em",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: "8px",
    letterSpacing: "0.01em",
  };

  const baseInputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${colors.border}`,
    borderRadius: "10px",
    background: colors.inputBg,
    fontSize: "14px",
    fontFamily: "inherit",
    color: colors.textPrimary,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  };

  const getInputStyle = (name, focusedName = focusedInput) => ({
    ...baseInputStyle,
    borderColor: focusedName === name ? colors.focusRing : colors.border,
    boxShadow:
      focusedName === name ? `0 0 0 4px rgba(99, 102, 241, 0.15)` : "none",
    background: focusedName === name ? "#ffffff" : colors.inputBg,
  });

  const errorTextStyle = {
    color: "#dc2626",
    fontSize: "12px",
    marginTop: "6px",
    fontWeight: 500,
  };

  const fieldWrapStyle = { marginBottom: "18px" };

  const pageStyle = {
    minHeight: "100vh",
    background: colors.bgGradient,
    padding: "40px 20px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const containerStyle = {
    maxWidth: "880px",
    margin: "0 auto",
  };

  const titleWrapStyle = {
    marginBottom: "32px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  };

  const titleStyle = {
    fontSize: "30px",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.02em",
    margin: 0,
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "rgba(255,255,255,0.65)",
    marginTop: "6px",
  };

  /* ---------- Buttons ---------- */

  const buttonBase = {
    border: "none",
    borderRadius: "10px",
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "inherit",
  };

  const getButtonStyle = (variant, key) => {
    const isHovered = hoveredBtn === key;
    if (variant === "primary") {
      return {
        ...buttonBase,
        color: "#fff",
        background: `linear-gradient(135deg, ${colors.accentBlueFrom}, ${colors.accentBlueTo})`,
        boxShadow: isHovered
          ? "0 10px 25px rgba(37, 99, 235, 0.4)"
          : "0 4px 14px rgba(37, 99, 235, 0.25)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      };
    }
    if (variant === "danger") {
      return {
        ...buttonBase,
        color: "#fff",
        background: `linear-gradient(135deg, ${colors.accentRedFrom}, ${colors.accentRedTo})`,
        boxShadow: isHovered
          ? "0 10px 25px rgba(239, 68, 68, 0.4)"
          : "0 4px 14px rgba(239, 68, 68, 0.25)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      };
    }
    // secondary - outlined
    return {
      ...buttonBase,
      color: colors.textPrimary,
      background: isHovered ? "#f1f5f9" : "#ffffff",
      border: `1.5px solid ${colors.border}`,
      boxShadow: isHovered ? "0 4px 12px rgba(15,23,42,0.08)" : "none",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    };
  };

  /* ---------- Password Input with toggle ---------- */

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={titleWrapStyle}>
          <div>
            <h1 style={titleStyle}>⚙️ Admin Settings</h1>
            <div style={subtitleStyle}>
              Manage your profile, platform, and security preferences
            </div>
          </div>
        </div>

        {/* Profile Picture */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span>🖼️</span> Profile Picture
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <img
              src={profilePic}
              alt="Profile avatar preview"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `4px solid #ffffff`,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
              }}
            />

            <div>
              <label
                htmlFor="profile-upload"
                style={{
                  ...getButtonStyle("secondary", "uploadPic"),
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredBtn("uploadPic")}
                onMouseLeave={() => setHoveredBtn("")}
              >
                📤 Upload New Photo
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                style={{ display: "none" }}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: colors.textSecondary,
                  marginTop: "10px",
                }}
              >
                JPG, PNG or GIF. Square images look best.
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span>👤</span> Profile Settings
          </div>

          <div style={fieldWrapStyle}>
            <label style={labelStyle} htmlFor="adminName">
              Admin Name
            </label>
            <input
              id="adminName"
              type="text"
              name="adminName"
              value={settings.adminName}
              onChange={handleChange}
              onFocus={() => setFocusedInput("adminName")}
              onBlur={() => setFocusedInput("")}
              style={getInputStyle("adminName")}
            />
          </div>

          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput("")}
              style={getInputStyle("email")}
            />
            {emailError && <div style={errorTextStyle}>{emailError}</div>}
          </div>
        </div>

        {/* Platform Settings */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span>🏷️</span> Platform Settings
          </div>

          <div style={fieldWrapStyle}>
            <label style={labelStyle} htmlFor="platformName">
              Platform Name
            </label>
            <input
              id="platformName"
              type="text"
              name="platformName"
              value={settings.platformName}
              onChange={handleChange}
              onFocus={() => setFocusedInput("platformName")}
              onBlur={() => setFocusedInput("")}
              style={getInputStyle("platformName")}
            />
          </div>

          <Switch
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={() => handleToggle("maintenanceMode")}
            label="Maintenance Mode"
          />
        </div>

        {/* Notification Settings */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span>📧</span> Notification Settings
          </div>

          <Switch
            id="emailNotifications"
            checked={settings.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
            label="Email Notifications"
          />
          <Switch
            id="pushNotifications"
            checked={settings.pushNotifications}
            onChange={() => handleToggle("pushNotifications")}
            label="Push Notifications"
          />
        </div>

        {/* Security Settings */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span>🛡️</span> Security Settings
          </div>

          <Switch
            id="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onChange={() => handleToggle("twoFactorAuth")}
            label="Email Two-Factor Authentication"
          />
          <Switch
            id="smsVerification"
            checked={settings.smsVerification}
            onChange={() => handleToggle("smsVerification")}
            label="SMS Verification"
          />
        </div>

        {/* Change Password */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span>🔒</span> Change Password
          </div>

          <PasswordField
            name="currentPassword"
            label="Current Password"
            placeholder="Enter current password"
            value={passwordData.currentPassword}
            onChangeValue={handlePasswordInput}
            error={passwordErrors.currentPassword}
            visible={showPasswords.currentPassword}
            onToggleVisible={() => toggleShowPassword("currentPassword")}
            focusedInput={focusedInput}
            setFocusedInput={setFocusedInput}
            getInputStyle={getInputStyle}
          />
          <PasswordField
            name="newPassword"
            label="New Password"
            placeholder="At least 8 characters"
            value={passwordData.newPassword}
            onChangeValue={handlePasswordInput}
            error={passwordErrors.newPassword}
            visible={showPasswords.newPassword}
            onToggleVisible={() => toggleShowPassword("newPassword")}
            focusedInput={focusedInput}
            setFocusedInput={setFocusedInput}
            getInputStyle={getInputStyle}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={passwordData.confirmPassword}
            onChangeValue={handlePasswordInput}
            error={passwordErrors.confirmPassword}
            visible={showPasswords.confirmPassword}
            onToggleVisible={() => toggleShowPassword("confirmPassword")}
            focusedInput={focusedInput}
            setFocusedInput={setFocusedInput}
            getInputStyle={getInputStyle}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "10px",
            }}
          >
            <button
              style={getButtonStyle("primary", "changePw")}
              onMouseEnter={() => setHoveredBtn("changePw")}
              onMouseLeave={() => setHoveredBtn("")}
              onClick={handlePasswordReset}
            >
              🔑 Change Password
            </button>

            <button
              style={getButtonStyle("secondary", "forgotPw")}
              onMouseEnter={() => setHoveredBtn("forgotPw")}
              onMouseLeave={() => setHoveredBtn("")}
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Session Management */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span>💻</span> Session Management
          </div>

          <button
            style={getButtonStyle("secondary", "logoutAll")}
            onMouseEnter={() => setHoveredBtn("logoutAll")}
            onMouseLeave={() => setHoveredBtn("")}
            onClick={handleLogoutAllDevices}
          >
            🚪 Logout From All Devices
          </button>
        </div>

        {/* Danger Zone */}
        <div
          style={{
            ...cardStyle,
            border: "1.5px solid rgba(239, 68, 68, 0.4)",
            background: "rgba(254, 242, 242, 0.85)",
          }}
        >
          <div style={{ ...cardHeaderStyle, color: "#dc2626" }}>
            <span>🚨</span> Danger Zone
          </div>

          <p style={{ color: "#7f1d1d", fontSize: "14px", marginBottom: "18px" }}>
            Permanently delete your account and all saved settings. This action
            cannot be undone.
          </p>

          <button
            style={getButtonStyle("danger", "deleteAcct")}
            onMouseEnter={() => setHoveredBtn("deleteAcct")}
            onMouseLeave={() => setHoveredBtn("")}
            onClick={handleDeleteAccount}
          >
            🗑️ Delete Account
          </button>
        </div>

        {/* Save Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "14px",
            paddingBottom: "20px",
          }}
        >
          {savedPulse && (
            <span style={{ color: "#86efac", fontSize: "13px", fontWeight: 600 }}>
              ✓ Saved
            </span>
          )}
          <button
            style={{
              ...getButtonStyle("primary", "saveAll"),
              padding: "14px 30px",
              fontSize: "15px",
            }}
            onMouseEnter={() => setHoveredBtn("saveAll")}
            onMouseLeave={() => setHoveredBtn("")}
            onClick={handleSave}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
export  function NotificationModule() {
  const [tab, setTab] = useState("push");
  const [push, setPush] = useState({ title: "", message: "" });
  const [email, setEmail] = useState({
    subject: "",
    recipients: "",
    content: "",
  });
  const [sms, setSms] = useState({
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState([]);

  const C = {
    primary: "#e94560",
    secondary: "#16a34a",
    text: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
  };

  const card = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    border: `1px solid ${C.border}`,
  };

  const label = {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    boxSizing: "border-box",
  };

  const btn = (bg = C.primary, color = "#fff") => ({
    background: bg,
    color,
    border: "none",
    padding: "10px 14px",
    borderRadius: 6,
    cursor: "pointer",
  });

  const INIT_COURSES = [
    { id: 1, name: "React Basics" },
    { id: 2, name: "Node.js Masterclass" },
    { id: 3, name: "Python Programming" },
  ];

  const send = (type, data) => {
    setSent((prev) => [
      {
        id: Date.now(),
        type,
        ...data,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const tabs = ["push", "email", "sms", "course", "payment"];
  const tabLabels = [
    "Push",
    "Email",
    "SMS",
    "Course Updates",
    "Payment Reminders",
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>🔔 Notifications</h2>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...btn(
                tab === t ? C.primary : "#f3f4f6",
                tab === t ? "#fff" : C.text
              ),
              borderRadius: 20,
              fontSize: 12,
            }}
          >
            {tabLabels[i]}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          {tab === "push" && (
            <div style={card}>
              <h3>Push Notification</h3>

              <div style={{ marginBottom: 12 }}>
                <label style={label}>Title</label>
                <input
                  style={inputStyle}
                  value={push.title}
                  onChange={(e) =>
                    setPush((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Message</label>
                <textarea
                  style={{ ...inputStyle, height: 80 }}
                  value={push.message}
                  onChange={(e) =>
                    setPush((p) => ({ ...p, message: e.target.value }))
                  }
                />
              </div>

              <button onClick={() => send("Push", push)} style={btn()}>
                Send Push
              </button>
            </div>
          )}

          {tab === "email" && (
            <div style={card}>
              <h3>Email Notification</h3>

              <div style={{ marginBottom: 12 }}>
                <label style={label}>Subject</label>
                <input
                  style={inputStyle}
                  value={email.subject}
                  onChange={(e) =>
                    setEmail((p) => ({ ...p, subject: e.target.value }))
                  }
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={label}>Recipients</label>
                <input
                  style={inputStyle}
                  value={email.recipients}
                  onChange={(e) =>
                    setEmail((p) => ({ ...p, recipients: e.target.value }))
                  }
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Content</label>
                <textarea
                  style={{ ...inputStyle, height: 100 }}
                  value={email.content}
                  onChange={(e) =>
                    setEmail((p) => ({ ...p, content: e.target.value }))
                  }
                />
              </div>

              <button onClick={() => send("Email", email)} style={btn()}>
                Send Email
              </button>
            </div>
          )}

          {tab === "sms" && (
            <div style={card}>
              <h3>SMS Alert</h3>

              <div style={{ marginBottom: 12 }}>
                <label style={label}>Phone Number</label>
                <input
                  style={inputStyle}
                  value={sms.phone}
                  onChange={(e) =>
                    setSms((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={label}>Message</label>
                <textarea
                  style={{ ...inputStyle, height: 80 }}
                  value={sms.message}
                  onChange={(e) =>
                    setSms((p) => ({ ...p, message: e.target.value }))
                  }
                />
              </div>

              <button onClick={() => send("SMS", sms)} style={btn()}>
                Send SMS
              </button>
            </div>
          )}

          {tab === "course" && (
            <div style={card}>
              <h3>Course Update</h3>

              <select style={inputStyle}>
                <option>All Courses</option>
                {INIT_COURSES.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>

              <button
                style={{ ...btn(), marginTop: 15 }}
                onClick={() => send("Course", { msg: "Course update" })}
              >
                Send Update
              </button>
            </div>
          )}

          {tab === "payment" && (
            <div style={card}>
              <h3>Payment Reminder</h3>

              <select style={inputStyle}>
                <option>All Pending Payments</option>
                <option>EMI Due This Week</option>
                <option>Overdue Students</option>
              </select>

              <button
                style={{ ...btn(), marginTop: 15 }}
                onClick={() =>
                  send("Payment", { msg: "Payment reminder" })
                }
              >
                Send Reminder
              </button>
            </div>
          )}
        </div>

        {sent.length > 0 && (
          <div style={{ width: 260 }}>
            <div style={card}>
              <h4 style={{ color: C.muted }}>SENT LOG</h4>

              {sent.map((s) => (
                <div
                  key={s.id}
                  style={{
                    marginBottom: 10,
                    paddingBottom: 10,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ fontWeight: 600, color: C.secondary }}>
                    {s.type} ✓
                  </div>
                  <div style={{ color: C.muted }}>{s.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}