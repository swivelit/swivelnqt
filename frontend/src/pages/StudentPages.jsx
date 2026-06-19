import { courses, notifs } from '../data/data';
import { CourseCard, NotifItem } from '../components/UI';
import { thumbEmoji } from '../data/data';
import { useState, useEffect, useCallback } from 'react';

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

// ════════════════════════════════════════════════════════════════════════════
// LIVE CLASSES PAGE (Student view)
// Reads the same `trainer_live_classes` localStorage key that the trainer's
// "Schedule Live Class" page writes to. Whatever the trainer schedules,
// edits, or cancels there shows up here automatically — filtered down to
// only the courses this student is enrolled in.
// ════════════════════════════════════════════════════════════════════════════
const LIVE_CLASSES_STORAGE_KEY = 'trainer_live_classes';

const LIVE_STATUS_META = {
  scheduled: { label: 'Scheduled',   bg: '#E6F1FB', color: '#0C447C' },
  live:      { label: '🔴 Live Now', bg: '#DCFCE7', color: '#14532D' },
  completed: { label: 'Completed',   bg: '#EAF3DE', color: '#3B6D11' },
  cancelled: { label: 'Cancelled',   bg: '#FCEBEB', color: '#A32D2D' },
};

const LIVE_PLATFORM_EMOJI = { 'Zoom': '📹', 'Google Meet': '📅', 'Microsoft Teams': '🟦', 'Jitsi Meet': '🔗', 'Custom Link': '🔗' };

function readLiveClasses() {
  try {
    const saved = localStorage.getItem(LIVE_CLASSES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Recompute each class's status from the current wall-clock time, exactly
// like the trainer page does — so "live" / "completed" never drift out of
// sync between the two views. Cancelled / manually-ended classes are left as-is.
function computeLiveStatus(cls) {
  if (cls.status === 'cancelled' || cls.manuallyEnded) return cls;
  try {
    const now   = new Date();
    const start = new Date(`${cls.date}T${cls.time}`);
    const end   = new Date(start.getTime() + (Number(cls.duration) || 60) * 60_000);
    const auto  = now < start ? 'scheduled' : now <= end ? 'live' : 'completed';
    return { ...cls, status: auto };
  } catch {
    return cls;
  }
}

function useLiveClasses() {
  const [classes, setClasses] = useState(() => readLiveClasses());

  const refresh = useCallback(() => setClasses(readLiveClasses()), []);

  useEffect(() => {
    // Pick up changes made by the trainer in another tab/window
    const onStorage = (e) => { if (e.key === LIVE_CLASSES_STORAGE_KEY) refresh(); };
    window.addEventListener('storage', onStorage);

    // Pick up changes made in the same tab (e.g. a demo trainer view),
    // and re-derive scheduled → live → completed as time passes.
    const poll = setInterval(refresh, 15_000);

    return () => { window.removeEventListener('storage', onStorage); clearInterval(poll); };
  }, [refresh]);

  return classes.map(computeLiveStatus);
}

export function StudentLiveClassesPage({ studentCourses }) {
  const allClasses = useLiveClasses();

  // Only show classes for courses this student is actually enrolled in.
  // `courses` entries carry a `title`; trainer-side classes store the
  // course as that same title string.
  const enrolledTitles = new Set((studentCourses ?? courses).map((c) => c.title));
  const myClasses = allClasses.filter((c) => enrolledTitles.has(c.course));

  const [filterStat, setFilterStat] = useState('all');

  const filtered = myClasses.filter((c) => filterStat === 'all' || c.status === filterStat);

  const liveCount      = myClasses.filter((c) => c.status === 'live').length;
  const scheduledCount = myClasses.filter((c) => c.status === 'scheduled').length;
  const completedCount = myClasses.filter((c) => c.status === 'completed').length;
  const cancelCount    = myClasses.filter((c) => c.status === 'cancelled').length;

  const StatusBadge = ({ status }) => {
    const m = LIVE_STATUS_META[status] || LIVE_STATUS_META.scheduled;
    return (
      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, fontWeight: 600, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
        {m.label}
      </span>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Live Classes</div>
        <div className="page-sub">Sessions scheduled by your trainers for your enrolled courses</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['🔴 Live Now',  liveCount,      liveCount > 0 ? 'join now' : 'none running'],
          ['📅 Scheduled', scheduledCount, 'upcoming'],
          ['✅ Completed', completedCount, ''],
          ['📚 Courses',   enrolledTitles.size, 'enrolled'],
        ].map(([label, val, sub]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{val}</div>
            {sub && <div className="metric-sub">{sub}</div>}
          </div>
        ))}
      </div>

      {liveCount > 0 && (
        <div className="live-banner">
          <span className="live-dot" />
          <div style={{ flex: 1 }}>
            <div className="live-banner-title">
              {liveCount} Class{liveCount > 1 ? 'es' : ''} Live Right Now
            </div>
            <div className="live-banner-sub">
              {myClasses.filter((c) => c.status === 'live').map((c) => c.title).join(' · ')}
            </div>
          </div>
          <button className="action-btn" style={{ fontSize: 12, background: '#16a34a', color: '#fff', border: 'none' }} onClick={() => setFilterStat('live')}>
            View Live →
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          ['all',       'All'],
          ['live',      '🔴 Live'],
          ['scheduled', 'Scheduled'],
          ['completed', 'Completed'],
        ].map(([key, lbl]) => (
          <button
            key={key}
            onClick={() => setFilterStat(key)}
            style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
              border: '0.5px solid var(--sa-border)',
              background: filterStat === key ? 'var(--sa-teal)' : 'var(--sa-surface)',
              color: filterStat === key ? '#fff' : 'var(--sa-text)',
              fontWeight: filterStat === key ? 600 : 400,
            }}
          >
            {lbl} ({myClasses.filter((c) => key === 'all' ? true : c.status === key).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--sa-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No live classes found</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Your trainer hasn't scheduled any sessions matching this filter yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((cls) => (
            <div
              key={cls.id}
              className="live-class-card"
              style={{ borderLeft: cls.status === 'live' ? '4px solid #16a34a' : cls.status === 'cancelled' ? '4px solid #dc2626' : '4px solid var(--sa-teal)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: cls.status === 'live' ? '#DCFCE7' : 'var(--sa-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  border: `1px solid ${cls.status === 'live' ? '#86efac' : 'var(--sa-border)'}`,
                }}>
                  {LIVE_PLATFORM_EMOJI[cls.platform] || '🔗'}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{cls.title}</span>
                    <StatusBadge status={cls.status} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginBottom: 8 }}>{cls.course}</div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--sa-muted)', flexWrap: 'wrap' }}>
                    <span>📅 {cls.date}</span>
                    <span>⏰ {cls.time} IST</span>
                    <span>⏱️ {cls.duration} min</span>
                    <span>💻 {cls.platform}</span>
                    <span>👤 {cls.host}</span>
                  </div>
                  {cls.description && (
                    <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginTop: 6, lineHeight: 1.5 }}>{cls.description}</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  {cls.status === 'live' && (
                    <a
                      href={cls.link} target="_blank" rel="noreferrer"
                      className="action-btn"
                      style={{ fontSize: 12, background: '#16a34a', color: '#fff', border: 'none', textDecoration: 'none', textAlign: 'center' }}
                    >
                      🔴 Join Now
                    </a>
                  )}
                  {cls.status === 'scheduled' && (
                    <a
                      href={cls.link} target="_blank" rel="noreferrer"
                      className="action-btn"
                      style={{ fontSize: 12, textDecoration: 'none', textAlign: 'center' }}
                    >
                      🔗 Open Link
                    </a>
                  )}
                  {cls.status === 'completed' && (
                    <span style={{ fontSize: 11, color: 'var(--sa-muted)', textAlign: 'center' }}>Session ended</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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