import { courses, notifs } from '../data/data';
import { CourseCard, NotifItem } from '../components/UI';
import { thumbEmoji } from '../data/data';

export function StudentDashboard({ userName, navigate }) {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Student Dashboard</div>
        <div className="page-sub">Welcome back, {userName}!</div>
      </div>

      <div className="grid-4">
        {[
          ['Enrolled Courses', '4', '↑ 1 this month', 'metric-up'],
          ['Completed', '1', 'of 4 courses', ''],
          ['Avg Progress', '58%', '↑ 12% this week', 'metric-up'],
          ['Certificates', '1', 'earned', ''],
        ].map(([label, value, sub, cls]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            <div className={`metric-sub ${cls}`}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Continue Learning</div>
          {courses.filter((c) => c.progress > 0).slice(0, 2).map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
              <div className={`course-thumb ${c.thumb}`} style={{ width: 44, height: 44, borderRadius: 8, fontSize: 18, flexShrink: 0 }}>
                {thumbEmoji[c.thumb]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sa-text)', marginBottom: 4 }}>{c.title}</div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${c.progress}%` }} /></div>
                <div className="progress-label">{c.progress}% complete</div>
              </div>
              <button className="action-btn" style={{ fontSize: 11 }}>▶</button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Recent Notifications</div>
          {notifs.slice(0, 3).map((n, i) => <NotifItem key={i} notif={n} />)}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Upcoming Assignments</div>
        <table className="data-table">
          <thead>
            <tr><th>Assignment</th><th>Course</th><th>Due Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>React Hooks Exercise</td><td>Full Stack Web Dev</td><td>Jan 15, 2026</td><td><span className="status-pill status-pending">Due Soon</span></td></tr>
            <tr><td>Data Visualization Lab</td><td>Data Science & ML</td><td>Jan 20, 2026</td><td><span className="status-pill status-active">Open</span></td></tr>
            <tr><td>Wireframe Design</td><td>UI/UX Design</td><td>Jan 25, 2026</td><td><span className="status-pill status-active">Open</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MyCoursesPage({ activeTab, setTab, onOpenCourse }) {
  return (
    <div>
      <div className="page-header"><div className="page-title">My Courses</div></div>
      <div className="tab-group">
        {['All Enrolled', 'In Progress', 'Completed'].map((label, i) => (
          <button key={i} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{label}</button>
        ))}
      </div>
      <div className="grid-3">
        {courses.filter((c) => c.progress > 0).map((c) => (
          <CourseCard key={c.id} course={c} showProgress onOpen={onOpenCourse} />
        ))}
      </div>
    </div>
  );
}

export function QuizPage({ quizAnswers, answerQuiz, navigate }) {
  const question = {
    q: 'Which hook is used for side effects in React?',
    opts: ['useState', 'useEffect', 'useRef', 'useMemo'],
    correct: 1,
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Quiz: React Fundamentals</div>
        <div className="page-sub">Question 1 of 8 · 15 min remaining</div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="progress-bar" style={{ flex: 1, height: 6, marginRight: 12 }}>
            <div className="progress-fill" style={{ width: '12%' }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--sa-muted)' }}>1/8</span>
        </div>
        <div className="quiz-q">{question.q}</div>
        {question.opts.map((opt, i) => {
          const selected = quizAnswers[0] === i;
          const cls = selected ? (i === question.correct ? 'selected' : 'wrong') : '';
          return (
            <div key={i} className={`quiz-option ${cls}`} onClick={() => answerQuiz(0, i)}>
              <div className={`radio-dot ${selected ? 'filled' : ''}`} />
              {opt}
            </div>
          );
        })}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="action-btn">← Previous</button>
          <button className="action-btn accent" onClick={() => navigate('student-certificates')}>
            Submit Answer →
          </button>
        </div>
      </div>
    </div>
  );
}

export function CertificatesPage({ userName }) {
  return (
    <div>
      <div className="page-header"><div className="page-title">My Certificates</div></div>
      <div className="cert-card">
        <div className="cert-top">Certificate of Completion</div>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginBottom: 4 }}>This certifies that</div>
        <div className="cert-name">{userName || 'Arjun Sharma'}</div>
        <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginBottom: 4 }}>has successfully completed</div>
        <div className="cert-course">UI/UX Design Masterclass</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--sa-muted)' }}>Instructor: Ananya Krishnan</span>
        </div>
        <div className="cert-issued">Issued on: January 8, 2026</div>
        <div className="cert-id">CERT-SWVL-2026-78432</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="action-btn">⬇ Download PDF</button>
          <button className="action-btn">↗ Share</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-title">Pending Certificates</div>
        {courses.filter((c) => c.progress > 0 && c.progress < 100).map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div className={`course-thumb ${c.thumb}`} style={{ width: 36, height: 36, borderRadius: 6, fontSize: 16, flexShrink: 0 }}>
              {thumbEmoji[c.thumb]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sa-text)' }}>{c.title}</div>
              <div className="progress-bar" style={{ marginTop: 4 }}><div className="progress-fill" style={{ width: `${c.progress}%` }} /></div>
              <div className="progress-label">{c.progress}% — complete to earn certificate</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotificationsPage() {
  return (
    <div>
      <div className="page-header"><div className="page-title">Notifications</div></div>
      <div className="card">
        {notifs.map((n, i) => <NotifItem key={i} notif={n} />)}
      </div>
    </div>
  );
}
