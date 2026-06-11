import { useState } from 'react';
import { courses, students } from '../data/data';
import { thumbEmoji } from '../data/data';
import { TrainersPage } from './PublicPages';
import { TrainerDashboard } from './TrainerPages';

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
  const [users, setUsers] = useState([
    ...students,
    {
      name: "Pandeeswaran",
      email: "pandi@swivel.ac",
      role: "Trainer",
      course: "—",
      status: "active",
      initials: "PS",
      av: "av-b",
    },
  ]);

  const [search, setSearch] = useState("");

  // CREATE
  const handleAddUser = () => {
    const name = prompt("Enter user name");
    if (!name) return;

    const email = prompt("Enter email");
    if (!email) return;

    const newUser = {
      name,
      email,
      role: "Student",
      course: "New Course",
      status: "active",
      initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      av: "av-a",
    };

    setUsers([...users, newUser]);
  };

  // UPDATE
  const handleEditUser = (index) => {
    const user = users[index];

    const updatedName = prompt("Edit name", user.name);
    if (!updatedName) return;

    const updatedEmail = prompt("Edit email", user.email);

    const updatedUsers = [...users];
    updatedUsers[index] = {
      ...user,
      name: updatedName,
      email: updatedEmail,
      initials: updatedName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    };

    setUsers(updatedUsers);
  };

  // DELETE
  const handleDeleteUser = (index) => {
    if (!window.confirm("Delete this user?")) return;

    setUsers(users.filter((_, i) => i !== index));
  };

  // SEARCH
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">User Management</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            className="action-btn accent"
            onClick={handleAddUser}
          >
            + Add User
          </button>
          <button className="action-btn">⬇ Export</button>
        </div>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input
          placeholder="Search users by name, email, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Enrolled In</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((s, index) => (
              <tr key={s.email}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      className={`avatar ${s.av}`}
                      style={{
                        width: 26,
                        height: 26,
                        fontSize: 10,
                      }}
                    >
                      {s.initials}
                    </div>
                    {s.name}
                  </div>
                </td>

                <td
                  style={{
                    fontSize: 11,
                    color: "var(--sa-muted)",
                  }}
                >
                  {s.email}
                </td>

                <td>
                  <span
                    className={`role-badge ${
                      s.role === "Trainer"
                        ? "role-trainer"
                        : "role-student"
                    }`}
                  >
                    {s.role}
                  </span>
                </td>

                <td style={{ fontSize: 11 }}>
                  {s.course}
                </td>

                <td>
                  <span
                    className={`status-pill status-${s.status}`}
                  >
                    {s.status}
                  </span>
                </td>

                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      className="action-btn"
                      style={{
                        padding: "3px 8px",
                        fontSize: 11,
                      }}
                      onClick={() => handleEditUser(index)}
                    >
                      ✏️
                    </button>

                    <button
                      className="action-btn"
                      style={{
                        padding: "3px 8px",
                        fontSize: 11,
                        color: "var(--sa-accent)",
                      }}
                      onClick={() => handleDeleteUser(index)}
                    >
                      🗑️
                    </button>
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

export function CourseManagementPage() {
  const [courseList, setCourseList] = useState(courses);

  // CREATE
  const handleAddCourse = () => {
    const title = prompt('Course Title');
    if (!title) return;

    const trainer = prompt('Trainer Name');
    const category = prompt('Category');

    const newCourse = {
      id: Date.now(),
      title,
      trainer: trainer || 'Unknown',
      category: category || 'General',
      students: 0,
      price: '$0',
      thumb: 'code',
    };

    setCourseList([...courseList, newCourse]);
  };

  // UPDATE
  const handleEditCourse = (id) => {
    const course = courseList.find((c) => c.id === id);

    const updatedTitle = prompt('Edit Course Title', course.title);
    if (!updatedTitle) return;

    const updatedTrainer = prompt('Edit Trainer', course.trainer);
    const updatedCategory = prompt('Edit Category', course.category);

    setCourseList(
      courseList.map((c) =>
        c.id === id
          ? {
              ...c,
              title: updatedTitle,
              trainer: updatedTrainer,
              category: updatedCategory,
            }
          : c
      )
    );
  };

  // DELETE
  const handleDeleteCourse = (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this course?'
    );

    if (!confirmDelete) return;

    setCourseList(courseList.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Course Management</div>

        <div style={{ marginTop: 8 }}>
          <button
            className="action-btn accent"
            onClick={handleAddCourse}
          >
            + Add Course
          </button>
        </div>
      </div>

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
            {courseList.map((c) => (
              <tr key={c.id}>
                <td>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>
                      {thumbEmoji[c.thumb]}
                    </span>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {c.title}
                    </div>
                  </div>
                </td>

                <td
                  style={{
                    fontSize: 11,
                    color: 'var(--sa-muted)',
                  }}
                >
                  {c.trainer}
                </td>

                <td style={{ fontSize: 11 }}>
                  {c.category}
                </td>

                <td style={{ fontSize: 12 }}>
                  {c.students}
                </td>

                <td
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {c.price}
                </td>

                <td>
                  <span className="status-pill status-active">
                    active
                  </span>
                </td>

                <td>
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                    }}
                  >
                    <button
                      className="action-btn"
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                      }}
                      onClick={() => handleEditCourse(c.id)}
                    >
                      ✏️
                    </button>

                    <button
                      className="action-btn"
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        color: 'var(--sa-accent)',
                      }}
                      onClick={() => handleDeleteCourse(c.id)}
                    >
                      🗑️
                    </button>
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

export function TrainerManagementPage() {
  const [trainerList, setTrainerList] = useState(TrainersPage);

  // CREATE
  const handleAddTrainer = () => {
    const name = prompt('Trainer Name');
    if (!name) return;

    const email = prompt('Trainer Email');
    const specialization = prompt('Specialization');

    const newTrainer = {
      id: Date.now(),
      name,
      email: email || '',
      specialization: specialization || 'General',
      courses: 0,
      status: 'active',
    };

    setTrainerList([...trainerList, newTrainer]);
  };

  // UPDATE
  const handleEditTrainer = (id) => {
    const trainer = trainerList.find((t) => t.id === id);

    const updatedName = prompt('Edit Trainer Name', trainer.name);
    if (!updatedName) return;

    const updatedEmail = prompt('Edit Email', trainer.email);
    const updatedSpecialization = prompt(
      'Edit Specialization',
      trainer.specialization
    );

    setTrainerList((prev) =>
  prev.map((t) =>
    t.id === id
      ? {
          ...t,
          name: updatedName,
          email: updatedEmail,
          specialization: updatedSpecialization,
        }
      : t
  )
);

if (confirmDelete) {
  setTrainerList((prev) =>
    prev.filter((t) => t.id !== id)
  );
}
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          Trainer Management
        </div>

        <div style={{ marginTop: 8 }}>
          <button
            className="action-btn accent"
            onClick={handleAddTrainer}
          >
            + Add Trainer
          </button>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Courses</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {trainerList.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>

                <td
                  style={{
                    fontSize: 11,
                    color: 'var(--sa-muted)',
                  }}
                >
                  {t.email}
                </td>

                <td>{t.specialization}</td>

                <td>{t.courses}</td>

                <td>
                  <span
                    className={`status-pill status-${t.status}`}
                  >
                    {t.status}
                  </span>
                </td>

                <td>
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                    }}
                  >
                    <button
                      className="action-btn"
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                      }}
                      onClick={() =>
                        handleEditTrainer(t.id)
                      }
                    >
                      ✏️
                    </button>

                    <button
                      className="action-btn"
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        color: 'var(--sa-accent)',
                      }}
                      onClick={() =>
                        handleDeleteTrainer(t.id)
                      }
                    >
                      🗑️
                    </button>
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

export  function SettingsPage() {
  const [settings, setSettings] = useState({
    adminName: "Admin User",
    email: "admin@example.com",
    platformName: "Learning Management System",
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: true,
  },);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    console.log("Saved Settings:", settings);
    alert("Settings saved successfully!");
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    marginTop: "6px",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#111827",
            margin: 0,
          }}
        >
          Admin Settings
        </h1>
        <p
          style={{
            color: "#6b7280",
            marginTop: "6px",
          }}
        >
          Manage platform settings and preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <div style={cardStyle}>
        <h2
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Profile Settings
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Admin Name</label>
          <input
            type="text"
            name="adminName"
            value={settings.adminName}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Platform Settings */}
      <div style={cardStyle}>
        <h2
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Platform Settings
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Platform Name</label>
          <input
            type="text"
            name="platformName"
            value={settings.platformName}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            name="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={handleChange}
          />
          Maintenance Mode
        </label>
      </div>

      {/* Notification Settings */}
      <div style={cardStyle}>
        <h2
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Notification Settings
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />
            Email Notifications
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name="pushNotifications"
              checked={settings.pushNotifications}
              onChange={handleChange}
            />
            Push Notifications
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div style={cardStyle}>
        <h2
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Security Settings
        </h2>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            name="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onChange={handleChange}
          />
          Enable Two-Factor Authentication
        </label>
      </div>

      {/* Save Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleSave}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}