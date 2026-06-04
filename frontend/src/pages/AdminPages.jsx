import { courses, students } from '../data/data';
import { thumbEmoji } from '../data/data';

export function AdminDashboard({ userName }) {
  const bars = [48, 62, 38, 75, 55, 82, 91, 70, 88, 65, 74, 96];
  const barColors = ['var(--sa-teal)', 'var(--sa-accent)', 'var(--sa-gold)'];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Admin Dashboard</div>
        <div className="page-sub">Platform overview · {userName}</div>
      </div>

      <div className="grid-4">
        {[
          ['Total Users', '18,420', '↑ 230 this week', 'metric-up'],
          ['Active Courses', '120', '↑ 4 new', 'metric-up'],
          ['Enrollments', '31,400', '↑ 580 this month', 'metric-up'],
          ['Certificates Issued', '9,200', '↑ 120 this week', 'metric-up'],
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
          {courses.slice(0, 4).map((c) => (
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

export function UserManagementPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">User Management</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="action-btn accent">+ Add User</button>
          <button className="action-btn">⬇ Export</button>
        </div>
      </div>
      <div className="search-bar">
        <span>🔍</span>
        <input placeholder="Search users by name, email, role..." />
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Enrolled In</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.name}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className={`avatar ${s.av}`} style={{ width: 26, height: 26, fontSize: 10 }}>{s.initials}</div>
                    {s.name}
                  </div>
                </td>
                <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{s.email}</td>
                <td><span className="role-badge role-student">Student</span></td>
                <td style={{ fontSize: 11 }}>{s.course}</td>
                <td><span className={`status-pill status-${s.status}`}>{s.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11 }}>✏️</button>
                    <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11, color: 'var(--sa-accent)' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar av-b" style={{ width: 26, height: 26, fontSize: 10 }}>PS</div>
                  Priya Sharma
                </div>
              </td>
              <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>priya@swivel.ac</td>
              <td><span className="role-badge role-trainer">Trainer</span></td>
              <td style={{ fontSize: 11 }}>—</td>
              <td><span className="status-pill status-active">active</span></td>
              <td><button className="action-btn" style={{ padding: '3px 8px', fontSize: 11 }}>✏️</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CourseManagementPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Course Management</div>
        <div style={{ marginTop: 8 }}><button className="action-btn accent">+ Add Course</button></div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Course</th><th>Trainer</th><th>Category</th><th>Students</th><th>Price</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{thumbEmoji[c.thumb]}</span>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{c.title}</div>
                  </div>
                </td>
                <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{c.trainer}</td>
                <td style={{ fontSize: 11 }}>{c.category}</td>
                <td style={{ fontSize: 12 }}>{c.students}</td>
                <td style={{ fontSize: 12, fontWeight: 500 }}>{c.price}</td>
                <td><span className="status-pill status-active">active</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11 }}>✏️</button>
                    <button className="action-btn" style={{ padding: '3px 8px', fontSize: 11, color: 'var(--sa-accent)' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
