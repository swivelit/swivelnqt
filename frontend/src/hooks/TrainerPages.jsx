import { students, lessonList } from '../data/data';

export function TrainerDashboard({ userName, navigate }) {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Trainer Dashboard</div>
        <div className="page-sub">Welcome, {userName}!</div>
      </div>

      <div className="grid-4">
        {[
          ['My Courses', '6', '', ''],
          ['Total Students', '2,430', '↑ 45 this week', 'metric-up'],
          ['Assignments Pending', '18', 'needs review', 'metric-down'],
          ['Avg Completion', '64%', '', ''],
        ].map(([label, value, sub, cls]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            {sub && <div className={`metric-sub ${cls}`}>{sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Student Progress</div>
          <table className="data-table">
            <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className={`avatar ${s.av}`} style={{ width: 24, height: 24, fontSize: 10 }}>{s.initials}</div>
                      {s.name}
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{s.course}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span style={{ fontSize: 11 }}>{s.progress}%</span>
                    </div>
                  </td>
                  <td><span className={`status-pill status-${s.status}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['⬆️ Upload New Video', 'trainer-content'],
              ['❓ Create Quiz', 'trainer-quiz'],
              ['📅 Mark Attendance', 'trainer-attendance'],
              ['🔔 Send Notification', 'student-notifications'],
            ].map(([label, page]) => (
              <button key={label} className="action-btn" style={{ justifyContent: 'flex-start' }} onClick={() => navigate(page)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrainerContentPage({ activeTab, setTab }) {
  return (
    <div>
      <div className="page-header"><div className="page-title">Course Content Manager</div></div>
      <div className="tab-group">
        {['Videos', 'Assignments', 'Notes & PDFs'].map((label, i) => (
          <button key={i} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{label}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-title">
          Upload New Content
          <button className="action-btn accent" style={{ fontSize: 11 }}>+ Upload</button>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Course</label>
            <select className="form-input"><option>Full Stack Web Development</option><option>React Native Mobile Dev</option></select>
          </div>
          <div className="form-group">
            <label className="form-label">Section / Module</label>
            <select className="form-input"><option>Module 1: Foundations</option><option>Module 2: Advanced</option></select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Lesson Title</label>
          <input className="form-input" placeholder="e.g. Introduction to React Hooks" readOnly />
        </div>
        <div style={{ border: '1.5px dashed var(--sa-border)', borderRadius: 'var(--border-radius-md)', padding: 24, textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 24 }}>⬆️</div>
          <div style={{ fontSize: 13, color: 'var(--sa-muted)', marginTop: 8 }}>Drag & drop video file or click to browse</div>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 4 }}>MP4, MOV up to 2GB · Stored via Cloudinary</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label className="form-label">Lesson Type</label>
            <select className="form-input"><option>Free Preview</option><option>Locked (Enrolled Only)</option></select>
          </div>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label className="form-label">Duration (min)</label>
            <input className="form-input" placeholder="e.g. 25" type="number" readOnly />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Uploaded Lessons</div>
        {lessonList.map((l, i) => (
          <div key={i} className="lesson-item">
            <div className="lesson-num">{String(i + 1).padStart(2, '0')}</div>
            <div className={`lesson-icon ${l.free ? 'free' : 'locked'}`}>{l.free ? '▶' : '🔒'}</div>
            <div className="lesson-title">{l.title}</div>
            <span className={`lesson-tag ${l.free ? 'tag-free' : 'tag-locked'}`}>{l.free ? 'Free' : 'Locked'}</span>
            <div className="lesson-dur">{l.dur}</div>
            <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px' }}>✏️</button>
            <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--sa-accent)' }}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttendancePage() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const rows = [
    { name: 'Arjun S.', initials: 'AS', av: 'av-a', att: ['P', 'P', 'P', 'A', 'P', 'P', 'L'] },
    { name: 'Preethi N.', initials: 'PN', av: 'av-b', att: ['P', 'P', 'A', 'P', 'P', 'P', 'P'] },
    { name: 'Kiran K.', initials: 'KK', av: 'av-c', att: ['P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { name: 'Divya M.', initials: 'DM', av: 'av-d', att: ['A', 'P', 'P', 'P', 'L', 'P', 'P'] },
  ];
  const attClass = { P: 'att-present', A: 'att-absent', L: 'att-leave', '': 'att-none' };

  return (
    <div>
      <div className="page-header"><div className="page-title">Attendance Management</div></div>
      <div className="card">
        <div className="card-title">Week of Jan 6 – 12, 2026</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 500 }}>
            <thead>
              <tr>
                <th>Student</th>
                {days.map((d, i) => <th key={i} style={{ textAlign: 'center' }}>{d}</th>)}
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className={`avatar ${r.av}`} style={{ width: 24, height: 24, fontSize: 10 }}>{r.initials}</div>
                      {r.name}
                    </div>
                  </td>
                  {r.att.map((a, i) => (
                    <td key={i}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className={`att-cell ${attClass[a]}`} style={{ width: 24, height: 24 }}>{a}</div>
                      </div>
                    </td>
                  ))}
                  <td>{Math.round(r.att.filter((a) => a === 'P').length / r.att.length * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 11 }}>
          {[['att-present', 'P', 'Present'], ['att-absent', 'A', 'Absent'], ['att-leave', 'L', 'Leave']].map(([cls, letter, label]) => (
            <span key={label}>
              <span className={`att-cell ${cls}`} style={{ width: 14, height: 14, display: 'inline-flex', marginRight: 4, borderRadius: 2 }}>{letter}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreateQuizPage() {
  return (
    <div>
      <div className="page-header"><div className="page-title">Create Quiz</div></div>
      <div className="card">
        <div className="form-group">
          <label className="form-label">Quiz Title</label>
          <input className="form-input" placeholder="e.g. React Fundamentals Quiz" readOnly />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Course</label>
            <select className="form-input"><option>Full Stack Web Development</option></select>
          </div>
          <div className="form-group">
            <label className="form-label">Time Limit (min)</label>
            <input className="form-input" placeholder="15" type="number" readOnly />
          </div>
        </div>
        <div className="divider" />
        <div className="card-title">Question 1</div>
        <div className="form-group">
          <label className="form-label">Question</label>
          <input className="form-input" defaultValue="Which hook is used for side effects in React?" readOnly />
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Option A</label><input className="form-input" defaultValue="useState" readOnly /></div>
          <div className="form-group">
            <label className="form-label">Option B ✓</label>
            <input className="form-input" defaultValue="useEffect" readOnly style={{ borderColor: 'var(--sa-teal)' }} />
          </div>
          <div className="form-group"><label className="form-label">Option C</label><input className="form-input" defaultValue="useRef" readOnly /></div>
          <div className="form-group"><label className="form-label">Option D</label><input className="form-input" defaultValue="useMemo" readOnly /></div>
        </div>
        <button className="action-btn" style={{ marginBottom: 12 }}>+ Add Question</button>
        <div className="divider" />
        <button className="action-btn accent">✓ Publish Quiz</button>
      </div>
    </div>
  );
}
