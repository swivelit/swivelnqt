import { useState, useRef, useCallback } from "react";

// ─── LMS API Layer ───────────────────────────────────────────────────────────
// Replace these with your real API base URL and auth token.
const LMS_BASE = import.meta.env.VITE_LMS_BASE_URL ?? "https://api.yourlms.com/v1";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("lms_token") ?? ""}`,
});

const lmsApi = {
  // Dashboard
  async getDashboardStats() {
    const res = await fetch(`${LMS_BASE}/trainer/dashboard/stats`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load dashboard stats");
    return res.json();
  },
  async getStudentProgress() {
    const res = await fetch(`${LMS_BASE}/trainer/students/progress`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load student progress");
    return res.json();
  },

  // Content
  async getCourses() {
    const res = await fetch(`${LMS_BASE}/trainer/courses`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load courses");
    return res.json();
  },
  async getLessons(courseId) {
    const res = await fetch(`${LMS_BASE}/trainer/courses/${courseId}/lessons`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load lessons");
    return res.json();
  },
  async uploadLesson(formData) {
    // formData is a FormData object containing file + metadata
    const res = await fetch(`${LMS_BASE}/trainer/lessons/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("lms_token") ?? ""}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  async deleteLesson(lessonId) {
    const res = await fetch(`${LMS_BASE}/trainer/lessons/${lessonId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Delete failed");
    return res.json();
  },

  // Attendance
  async getAttendance(weekStart) {
    const res = await fetch(`${LMS_BASE}/trainer/attendance?week=${weekStart}`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load attendance");
    return res.json();
  },
  async saveAttendance(payload) {
    const res = await fetch(`${LMS_BASE}/trainer/attendance`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save attendance");
    return res.json();
  },

  // Quiz
  async publishQuiz(payload) {
    const res = await fetch(`${LMS_BASE}/trainer/quizzes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to publish quiz");
    return res.json();
  },
};

// ─── Shared hook: async data fetch with loading/error state ──────────────────
function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const run = useCallback(async (fn, successMsg = "Saved!") => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fn();
      setSuccess(successMsg);
      setTimeout(() => setSuccess(null), 3000);
      return result;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, run };
}

// ─── Inline status banner ────────────────────────────────────────────────────
function StatusBanner({ error, success }) {
  if (!error && !success) return null;
  const isErr = !!error;
  return (
    <div style={{
      padding: "10px 14px",
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 13,
      background: isErr ? "#fff0f0" : "#f0fff4",
      border: `1px solid ${isErr ? "#fca5a5" : "#86efac"}`,
      color: isErr ? "#b91c1c" : "#15803d",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      {isErr ? "⚠️" : "✅"} {error || success}
    </div>
  );
}

// ─── Field-level error ───────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return <span style={{ fontSize: 11, color: "#dc2626", marginTop: 3, display: "block" }}>{msg}</span>;
}

// ════════════════════════════════════════════════════════════════════════════
// 1.  TRAINER DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
export function TrainerDashboard({ userName, navigate }) {
  const [stats, setStats] = useState({
    myCourses: "—",
    totalStudents: "—",
    assignmentsPending: "—",
    avgCompletion: "—",
    studentsDelta: "",
  });
  const [students, setStudents] = useState([]);
  const { loading, error, run } = useAsyncAction();

  // Load on mount
  useState(() => {
    run(async () => {
      const [s, prog] = await Promise.all([lmsApi.getDashboardStats(), lmsApi.getStudentProgress()]);
      setStats(s);
      setStudents(prog);
    }, null);
  }, []);

  const metrics = [
    ["My Courses", stats.myCourses, "", ""],
    ["Total Students", stats.totalStudents, stats.studentsDelta, "metric-up"],
    ["Assignments Pending", stats.assignmentsPending, stats.assignmentsPending !== "—" && stats.assignmentsPending > 0 ? "needs review" : "", "metric-down"],
    ["Avg Completion", stats.avgCompletion, "", ""],
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Trainer Dashboard</div>
        <div className="page-sub">Welcome, {userName}!</div>
      </div>

      {error && <StatusBanner error={error} />}
      {loading && <div style={{ fontSize: 12, color: "var(--sa-muted)", marginBottom: 12 }}>⏳ Loading dashboard…</div>}

      <div className="grid-4">
        {metrics.map(([label, value, sub, cls]) => (
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
            <thead>
              <tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th></tr>
            </thead>
            <tbody>
              {students.length === 0 && !loading && (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--sa-muted)", fontSize: 12 }}>No data</td></tr>
              )}
              {students.map((s) => (
                <tr key={s.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className={`avatar ${s.av}`} style={{ width: 24, height: 24, fontSize: 10 }}>{s.initials}</div>
                      {s.name}
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--sa-muted)" }}>{s.course}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["⬆️ Upload New Video", "trainer-content"],
              ["❓ Create Quiz", "trainer-quiz"],
              ["📅 Mark Attendance", "trainer-attendance"],
              ["🔔 Send Notification", "student-notifications"],
            ].map(([label, page]) => (
              <button key={label} className="action-btn" style={{ justifyContent: "flex-start" }} onClick={() => navigate(page)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2.  TRAINER CONTENT PAGE
// ════════════════════════════════════════════════════════════════════════════
const ALLOWED_TYPES = ["video/mp4", "video/quicktime"];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

function validateContentForm(form, file) {
  const errs = {};
  if (!form.courseId) errs.courseId = "Please select a course.";
  if (!form.moduleId) errs.moduleId = "Please select a module.";
  if (!form.lessonTitle.trim()) errs.lessonTitle = "Lesson title is required.";
  if (!file) {
    errs.file = "Please select a video file (MP4 or MOV).";
  } else {
    if (!ALLOWED_TYPES.includes(file.type)) errs.file = "Only MP4 or MOV files are allowed.";
    if (file.size > MAX_FILE_SIZE) errs.file = "File must be under 2 GB.";
  }
  if (!form.duration || isNaN(form.duration) || Number(form.duration) <= 0)
    errs.duration = "Enter a valid duration in minutes (> 0).";
  return errs;
}

export function TrainerContentPage({ activeTab, setTab }) {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ courseId: "", moduleId: "", lessonTitle: "", lessonType: "free", duration: "" });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(null); // 0-100 or null
  const fileInputRef = useRef();
  const { loading, error, success, run } = useAsyncAction();

  // Load courses on mount
  useState(() => {
    run(async () => {
      const c = await lmsApi.getCourses();
      setCourses(c);
      if (c.length > 0) {
        setForm((f) => ({ ...f, courseId: c[0].id, moduleId: c[0].modules?.[0]?.id ?? "" }));
        const l = await lmsApi.getLessons(c[0].id);
        setLessons(l);
      }
    }, null);
  }, []);

  const handleCourseChange = async (courseId) => {
    setForm((f) => ({ ...f, courseId, moduleId: "" }));
    await run(async () => {
      const l = await lmsApi.getLessons(courseId);
      setLessons(l);
    }, null);
  };

  const handleFile = (f) => {
    setFile(f);
    setFieldErrors((e) => ({ ...e, file: undefined }));
    // Auto-fill duration hint if possible
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    const errs = validateContentForm(form, file);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});

    await run(async () => {
      const fd = new FormData();
      fd.append("courseId", form.courseId);
      fd.append("moduleId", form.moduleId);
      fd.append("lessonTitle", form.lessonTitle);
      fd.append("lessonType", form.lessonType);
      fd.append("duration", form.duration);
      fd.append("file", file);

      // Simulate upload progress with XHR for real progress events
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${LMS_BASE}/trainer/lessons/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("lms_token") ?? ""}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          setUploadProgress(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            const newLesson = JSON.parse(xhr.responseText);
            setLessons((prev) => [...prev, newLesson]);
            setForm((f) => ({ ...f, lessonTitle: "", duration: "" }));
            setFile(null);
            resolve();
          } else {
            reject(new Error("Upload failed: " + xhr.statusText));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(fd);
      });
    }, "Lesson uploaded successfully!");
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    await run(async () => {
      await lmsApi.deleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    }, "Lesson deleted.");
  };

  const selectedCourse = courses.find((c) => c.id === form.courseId);

  return (
    <div>
      <div className="page-header"><div className="page-title">Course Content Manager</div></div>
      <div className="tab-group">
        {["Videos", "Assignments", "Notes & PDFs"].map((label, i) => (
          <button key={i} className={`tab-btn ${activeTab === i ? "active" : ""}`} onClick={() => setTab(i)}>{label}</button>
        ))}
      </div>

      <StatusBanner error={error} success={success} />

      <div className="card">
        <div className="card-title">Upload New Content</div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Course *</label>
            <select
              className="form-input"
              value={form.courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              <option value="">— Select course —</option>
              <option value="fullstack">Full Stack</option>
              <option value="stack">mern Stack</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <FieldError msg={fieldErrors.courseId} />
          </div>
          <div className="form-group">
            <label className="form-label">Section / Module *</label>
            <select
              className="form-input"
              value={form.moduleId}
              onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
            >
              <option value="">— Select module —</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              {(selectedCourse?.modules ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <FieldError msg={fieldErrors.moduleId} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Lesson Title *</label>
          <input
            className="form-input"
            placeholder="e.g. Introduction to React Hooks"
            value={form.lessonTitle}
            onChange={(e) => setForm((f) => ({ ...f, lessonTitle: e.target.value }))}
          />
          <FieldError msg={fieldErrors.lessonTitle} />
        </div>

        {/* Drag & drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${dragOver ? "var(--sa-teal)" : fieldErrors.file ? "#dc2626" : "var(--sa-border)"}`,
            borderRadius: "var(--border-radius-md)",
            padding: 24,
            textAlign: "center",
            marginBottom: 6,
            cursor: "pointer",
            background: dragOver ? "rgba(0,200,180,0.04)" : undefined,
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: 24 }}>⬆️</div>
          {file ? (
            <div style={{ fontSize: 13, marginTop: 8 }}>
              <strong>{file.name}</strong>
              <span style={{ color: "var(--sa-muted)", marginLeft: 8 }}>({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: "var(--sa-muted)", marginTop: 8 }}>Drag & drop video file or click to browse</div>
              <div style={{ fontSize: 11, color: "var(--sa-muted)", marginTop: 4 }}>MP4, MOV up to 2GB · Stored via Cloudinary</div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime"
            style={{ display: "none" }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>
        <FieldError msg={fieldErrors.file} />

        {/* Upload progress bar */}
        {uploadProgress !== null && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--sa-muted)", marginBottom: 4 }}>Uploading… {uploadProgress}%</div>
            <div className="progress-bar" style={{ width: "100%", height: 6 }}>
              <div className="progress-fill" style={{ width: `${uploadProgress}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label className="form-label">Lesson Type *</label>
            <select
              className="form-input"
              value={form.lessonType}
              onChange={(e) => setForm((f) => ({ ...f, lessonType: e.target.value }))}
            >
              <option value="free">Free Preview</option>
              <option value="locked">Locked (Enrolled Only)</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label className="form-label">Duration (min) *</label>
            <input
              className="form-input"
              placeholder="e.g. 25"
              type="number"
              min="1"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            />
            <FieldError msg={fieldErrors.duration} />
          </div>
        </div>

        <button
          className="action-btn accent"
          onClick={handleSubmit}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Uploading…" : "⬆️ Upload Lesson"}
        </button>
      </div>

      <div className="card">
        <div className="card-title">Uploaded Lessons ({lessons.length})</div>
        {lessons.length === 0 && !loading && (
          <div style={{ fontSize: 12, color: "var(--sa-muted)", padding: "12px 0" }}>No lessons yet.</div>
        )}
        {lessons.map((l, i) => (
          <div key={l.id ?? i} className="lesson-item">
            <div className="lesson-num">{String(i + 1).padStart(2, "0")}</div>
            <div className={`lesson-icon ${l.free || l.lessonType === "free" ? "free" : "locked"}`}>
              {l.free || l.lessonType === "free" ? "▶" : "🔒"}
            </div>
            <div className="lesson-title">{l.title ?? l.lessonTitle}</div>
            <span className={`lesson-tag ${l.free || l.lessonType === "free" ? "tag-free" : "tag-locked"}`}>
              {l.free || l.lessonType === "free" ? "Free" : "Locked"}
            </span>
            <div className="lesson-dur">{l.dur ?? `${l.duration} min`}</div>
            <button className="action-btn" style={{ fontSize: 11, padding: "4px 8px" }}>✏️</button>
            <button
              className="action-btn"
              style={{ fontSize: 11, padding: "4px 8px", color: "var(--sa-accent)" }}
              onClick={() => handleDelete(l.id)}
            >🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3.  ATTENDANCE PAGE
// ════════════════════════════════════════════════════════════════════════════
const WEEK_START = "2026-01-06";
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ATT_CYCLE = ["", "P", "A", "L"]; // toggle order

function validateAttendance(rows) {
  for (const r of rows) {
    if (r.att.some((a) => a === "")) return "Please mark attendance for all cells before saving.";
  }
  return null;
}

export function AttendancePage() {
  const [rows, setRows] = useState([]);
  const [saved, setSaved] = useState(false);
  const { loading, error, success, run } = useAsyncAction();
  const [validationError, setValidationError] = useState(null);
  const attClass = { P: "att-present", A: "att-absent", L: "att-leave", "": "att-none" };

  // Load attendance on mount
  useState(() => {
    run(async () => {
      const data = await lmsApi.getAttendance(WEEK_START);
      setRows(data);
    }, null);
  }, []);

  const toggle = (rowIdx, dayIdx) => {
    setRows((prev) =>
      prev.map((r, ri) =>
        ri !== rowIdx
          ? r
          : {
              ...r,
              att: r.att.map((a, di) => {
                if (di !== dayIdx) return a;
                const next = ATT_CYCLE[(ATT_CYCLE.indexOf(a) + 1) % ATT_CYCLE.length];
                return next;
              }),
            }
      )
    );
    setSaved(false);
    setValidationError(null);
  };

  const handleSave = async () => {
    const err = validateAttendance(rows);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    await run(
      () => lmsApi.saveAttendance({ weekStart: WEEK_START, rows }),
      "Attendance saved successfully!"
    );
    setSaved(true);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Attendance Management</div>
        <div style={{ fontSize: 11, color: "var(--sa-muted)", marginTop: 2 }}>
          Click any cell to cycle: — → P → A → L
        </div>
      </div>

      <StatusBanner error={error || validationError} success={success} />

      <div className="card">
        <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Week of Jan 6 – 12, 2026</span>
          <button
            className="action-btn accent"
            onClick={handleSave}
            disabled={loading || saved}
            style={{ fontSize: 11, opacity: loading || saved ? 0.6 : 1 }}
          >
            {loading ? "Saving…" : saved ? "✓ Saved" : "💾 Save Attendance"}
          </button>
        </div>

        {loading && rows.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--sa-muted)", padding: "12px 0" }}>Loading…</div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: 500 }}>
            <thead>
              <tr>
                <th>Student</th>
                {DAY_LABELS.map((d, i) => <th key={i} style={{ textAlign: "center" }}>{d}</th>)}
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={r.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className={`avatar ${r.av}`} style={{ width: 24, height: 24, fontSize: 10 }}>{r.initials}</div>
                      {r.name}
                    </div>
                  </td>
                  {r.att.map((a, di) => (
                    <td key={di}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <div
                          className={`att-cell ${attClass[a]}`}
                          style={{ width: 28, height: 28, cursor: "pointer", userSelect: "none", borderRadius: 4, transition: "background 0.15s" }}
                          title="Click to toggle"
                          onClick={() => toggle(ri, di)}
                        >
                          {a || "—"}
                        </div>
                      </div>
                    </td>
                  ))}
                  <td>
                    {r.att.filter(Boolean).length > 0
                      ? `${Math.round(r.att.filter((a) => a === "P").length / r.att.filter(Boolean).length * 100)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 11 }}>
          {[["att-present", "P", "Present"], ["att-absent", "A", "Absent"], ["att-leave", "L", "Leave"]].map(([cls, letter, label]) => (
            <span key={label}>
              <span className={`att-cell ${cls}`} style={{ width: 14, height: 14, display: "inline-flex", marginRight: 4, borderRadius: 2 }}>{letter}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4.  CREATE QUIZ PAGE
// ════════════════════════════════════════════════════════════════════════════
const BLANK_QUESTION = () => ({ text: "", options: ["", "", "", ""], correctIndex: null });

function validateQuiz(title, timeLimit, questions) {
  const errs = {};
  if (!title.trim()) errs.title = "Quiz title is required.";
  if (!timeLimit || isNaN(timeLimit) || Number(timeLimit) <= 0) errs.timeLimit = "Enter a valid time limit (> 0 min).";
  if (questions.length === 0) errs.questions = "Add at least one question.";

  const qErrs = questions.map((q, qi) => {
    const e = {};
    if (!q.text.trim()) e.text = "Question text is required.";
    const filledOptions = q.options.filter((o) => o.trim());
    if (filledOptions.length < 2) e.options = "Provide at least 2 options.";
    if (q.correctIndex === null) e.correctIndex = "Mark the correct answer.";
    return Object.keys(e).length ? e : null;
  });

  return { errs, qErrs };
}

export function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState([BLANK_QUESTION()]);
  const [courses, setCourses] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [questionErrors, setQuestionErrors] = useState([]);
  const { loading, error, success, run } = useAsyncAction();

  useState(() => {
    run(async () => {
      const c = await lmsApi.getCourses();
      setCourses(c);
      if (c.length > 0) setCourseId(c[0].id);
    }, null);
  }, []);

  const updateQuestion = (qi, field, value) => {
    setQuestions((prev) => prev.map((q, i) => i !== qi ? q : { ...q, [field]: value }));
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi ? q : { ...q, options: q.options.map((o, j) => j !== oi ? o : value) }
      )
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, BLANK_QUESTION()]);

  const removeQuestion = (qi) => setQuestions((prev) => prev.filter((_, i) => i !== qi));

  const handlePublish = async () => {
    const { errs, qErrs } = validateQuiz(title, timeLimit, questions);
    if (Object.keys(errs).length > 0 || qErrs.some(Boolean)) {
      setFieldErrors(errs);
      setQuestionErrors(qErrs);
      return;
    }
    setFieldErrors({});
    setQuestionErrors([]);

    await run(
      () => lmsApi.publishQuiz({ title, courseId, timeLimitMinutes: Number(timeLimit), questions }),
      "Quiz published successfully!"
    );
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">Create Quiz</div></div>

      <StatusBanner error={error} success={success} />

      <div className="card">
        <div className="form-group">
          <label className="form-label">Quiz Title *</label>
          <input
            className="form-input"
            placeholder="e.g. React Fundamentals Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FieldError msg={fieldErrors.title} />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Course *</label>
            <select className="form-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">— Select —</option>
              <option value="technical">Technical</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Time Limit (min) *</label>
            <input
              className="form-input"
              placeholder="15"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
            <FieldError msg={fieldErrors.timeLimit} />
          </div>
        </div>

        <FieldError msg={fieldErrors.questions} />

        {questions.map((q, qi) => {
          const qErr = questionErrors[qi] ?? {};
          return (
            <div key={qi}>
              <div className="divider" />
              <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Question {qi + 1}</span>
                {questions.length > 1 && (
                  <button
                    className="action-btn"
                    style={{ fontSize: 11, padding: "3px 8px", color: "var(--sa-accent)" }}
                    onClick={() => removeQuestion(qi)}
                  >✕ Remove</button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Question *</label>
                <input
                  className="form-input"
                  placeholder="Enter question text…"
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                />
                <FieldError msg={qErr.text} />
              </div>

              <div className="grid-2">
                {q.options.map((opt, oi) => (
                  <div className="form-group" key={oi}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctIndex === oi}
                        onChange={() => updateQuestion(qi, "correctIndex", oi)}
                        style={{ accentColor: "var(--sa-teal)" }}
                      />
                      Option {String.fromCharCode(65 + oi)}
                      {q.correctIndex === oi && (
                        <span style={{ fontSize: 10, color: "var(--sa-teal)", fontWeight: 600 }}>✓ Correct</span>
                      )}
                    </label>
                    <input
                      className="form-input"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      style={q.correctIndex === oi ? { borderColor: "var(--sa-teal)" } : undefined}
                    />
                  </div>
                ))}
              </div>
              <FieldError msg={qErr.options} />
              <FieldError msg={qErr.correctIndex} />
            </div>
          );
        })}

        <div className="divider" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="action-btn" style={{ marginBottom: 0 }} onClick={addQuestion}>
            + Add Question
          </button>
          <button
            className="action-btn accent"
            onClick={handlePublish}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Publishing…" : "✓ Publish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
