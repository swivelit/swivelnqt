import { students, lessonList } from '../data/data';
import { useState, useRef, useCallback, useEffect } from 'react';

// ─── API helpers ──────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
});

// Generic async hook with loading / error / success state
function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  const run = useCallback(async (fn, successMsg = 'Saved!') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fn();
      if (successMsg) {
        setSuccess(successMsg);
        setTimeout(() => setSuccess(null), 3000);
      }
      return result;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, run };
}

// ─── Status Banner ────────────────────────────────────────────────────────────
function StatusBanner({ error, success }) {
  if (!error && !success) return null;
  const isErr = !!error;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13,
      background: isErr ? '#fff0f0' : '#f0fff4',
      border: `1px solid ${isErr ? '#fca5a5' : '#86efac'}`,
      color: isErr ? '#b91c1c' : '#15803d',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {isErr ? '⚠️' : '✅'} {error || success}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 1. TRAINER DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
export function TrainerDashboard({ userName, navigate }) {
  // Static metrics (extend later with a real /api/trainer/stats endpoint)
  const totalCourses   = 6;
  const totalStudents  = 2430;
  const pendingReviews = 18;
  const avgCompletion  = 64;

  const liveNow         = [];   // from future live-class endpoint
  const upcomingClasses = [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Trainer Dashboard</div>
        <div className="page-sub">Welcome back, {userName}!</div>
      </div>

      {/* Top Metrics */}
      <div className="grid-4">
        {[
          ['My Courses',          totalCourses,            '',                             ''],
          ['Total Students',      totalStudents.toLocaleString(), '↑ 45 this week',       'metric-up'],
          ['Assignments Pending', pendingReviews,          pendingReviews > 0 ? 'needs review' : 'all reviewed', pendingReviews > 0 ? 'metric-down' : ''],
          ['Avg Completion',      `${avgCompletion}%`,     '',                             ''],
        ].map(([label, value, sub, cls]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            {sub && <div className={`metric-sub ${cls}`}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Live Classes Banner */}
      {liveNow.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#dcfce7 0%,#bbf7d0 100%)', border: '1px solid #86efac', borderRadius: 'var(--border-radius-md)', padding: '12px 16px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔴</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#14532d' }}>{liveNow.length} Class{liveNow.length > 1 ? 'es' : ''} Live Right Now</div>
            <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>{liveNow.map((c) => c.title).join(' · ')}</div>
          </div>
          <button className="action-btn" style={{ fontSize: 12, background: '#16a34a', color: '#fff', border: 'none' }} onClick={() => navigate('trainer-courses')}>View Classes →</button>
        </div>
      )}

      <div className="grid-2">
        {/* Student Progress */}
        <div className="card">
          <div className="card-title">Student Progress</div>
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th></tr>
            </thead>
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

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['⬆️ Upload New Video',   'trainer-content'],
                ['❓ Create Quiz',         'trainer-quiz'],
                ['📅 Mark Attendance',     'trainer-attendance'],
                ['🔔 Send Notification',   'student-notifications'],
              ].map(([label, page]) => (
                <button key={label} className="action-btn" style={{ justifyContent: 'flex-start' }} onClick={() => navigate(page)}>{label}</button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. TRAINER CONTENT PAGE  (Videos / Assignments / Notes)
// ════════════════════════════════════════════════════════════════════════════
export function TrainerContentPage({ activeTab, setTab }) {
  // ── Shared selectors ───────────────────────────────────────────────────────
  const COURSE_OPTIONS = [
    { id: 'full', title: 'Full Stack Web Development' },
    { id: 'ai',   title: 'Python with AI'             },
    { id: 'react',title: 'Advanced React'             },
  ];
  const MODULE_OPTIONS = {
    full:  [{ id: 'mod1', title: 'Module 1: Foundations' }, { id: 'mod2', title: 'Module 2: JavaScript' }],
    ai:    [{ id: 'mod3', title: 'Module 1: Python Basics' }],
    react: [{ id: 'mod4', title: 'Module 1: Hooks & Context' }],
  };

  const [selectedCourse,  setSelectedCourse]  = useState('');
  const [selectedModule,  setSelectedModule]  = useState('');
  const filteredModules = MODULE_OPTIONS[selectedCourse] ?? [];

  const handleCourseChange = (id) => { setSelectedCourse(id); setSelectedModule(''); };

  // ── Tab 0 – Videos ─────────────────────────────────────────────────────────
  const [lessonTitle,     setLessonTitle]     = useState('');
  const [duration,        setDuration]        = useState('');
  const [lessonType,      setLessonType]      = useState('Free Preview');
  const [videoFile,       setVideoFile]       = useState(null);
  const [videoPreview,    setVideoPreview]    = useState(null);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [uploadStatus,    setUploadStatus]    = useState('idle');
  const [uploadedChunks,  setUploadedChunks]  = useState(0);
  const [totalChunks,     setTotalChunks]     = useState(0);
  const [uploadedLessons, setUploadedLessons] = useState([]);
  const [editingId,       setEditingId]       = useState(null);

  const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB
  const abortRef   = useRef(false);

  const handleVideoSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setUploadProgress(0); setUploadStatus('idle'); setUploadedChunks(0);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setUploadProgress(0); setUploadStatus('idle'); setUploadedChunks(0);
  };

  const handleUploadLesson = async () => {
    if (!selectedCourse || !selectedModule) { alert('Please select a Course and Module.'); return; }
    if (!lessonTitle.trim())                { alert('Please enter a lesson title.');        return; }
    if (!videoFile)                         { alert('Please select a video file.');         return; }

    const chunks = Math.ceil(videoFile.size / CHUNK_SIZE);
    setTotalChunks(chunks); setUploadedChunks(0); setUploadProgress(0); setUploadStatus('uploading');
    abortRef.current = false;

    for (let i = 0; i < chunks; i++) {
      if (abortRef.current) { setUploadStatus('paused'); return; }

      const start    = i * CHUNK_SIZE;
      const end      = Math.min(start + CHUNK_SIZE, videoFile.size);
      const blob     = videoFile.slice(start, end);
      const formData = new FormData();
      formData.append('chunkIndex',  i);
      formData.append('totalChunks', chunks);
      formData.append('fileName',    videoFile.name);
      formData.append('courseId',    selectedCourse);
      formData.append('moduleId',    selectedModule);
      formData.append('title',       lessonTitle);
      formData.append('lessonType',  lessonType);
      formData.append('duration',    duration);
      formData.append('chunk',       blob);

      try {
        await fetch(`${API}/lessons/upload-chunk`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
          body: formData,
        });
      } catch {
        // Network not yet wired — simulate locally so UI still works
        await new Promise((r) => setTimeout(r, 80));
      }

      const done = i + 1;
      setUploadedChunks(done);
      setUploadProgress(Math.round((done / chunks) * 100));
    }

    setUploadStatus('done');
    const newLesson = {
      id:         `l-${Date.now()}`,
      title:      lessonTitle,
      course:     selectedCourse,
      module:     selectedModule,
      dur:        duration ? `${duration} min` : '—',
      free:       lessonType === 'Free Preview',
      fileName:   videoFile.name,
      fileSize:   (videoFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      chunks,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setUploadedLessons((prev) => [newLesson, ...prev]);

    setTimeout(() => {
      setLessonTitle(''); setDuration(''); setLessonType('Free Preview');
      handleRemoveVideo(); setUploadStatus('idle'); setUploadProgress(0);
      setUploadedChunks(0); setTotalChunks(0);
    }, 1200);
  };

  const handlePauseResume = () => {
    if (uploadStatus === 'uploading') { abortRef.current = true; }
    else if (uploadStatus === 'paused') { handleUploadLesson(); }
  };

  const handleCancelUpload = () => {
    abortRef.current = true;
    setUploadStatus('idle'); setUploadProgress(0); setUploadedChunks(0); setTotalChunks(0);
  };

  const handleEditLesson = (lesson) => {
    setEditingId(lesson.id);
    setLessonTitle(lesson.title);
    setDuration(lesson.dur.replace(' min', ''));
    setLessonType(lesson.free ? 'Free Preview' : 'Locked (Enrolled Only)');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEdit = async () => {
    try {
      await fetch(`${API}/lessons/${editingId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ title: lessonTitle, duration, lessonType }),
      });
    } catch { /* local fallback */ }
    setUploadedLessons((prev) =>
      prev.map((l) => l.id === editingId ? { ...l, title: lessonTitle, dur: duration ? `${duration} min` : '—', free: lessonType === 'Free Preview' } : l)
    );
    setEditingId(null);
    setLessonTitle(''); setDuration(''); setLessonType('Free Preview');
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await fetch(`${API}/lessons/${id}`, { method: 'DELETE', headers: authHeaders() });
    } catch { /* local fallback */ }
    setUploadedLessons((prev) => prev.filter((l) => l.id !== id));
  };

  // ── Tab 1 – Assignments ────────────────────────────────────────────────────
  const [assignmentTitle,     setAssignmentTitle]     = useState('');
  const [assignmentDesc,      setAssignmentDesc]      = useState('');
  const [dueDate,             setDueDate]             = useState('');
  const [maxMarks,            setMaxMarks]            = useState('');
  const [assignmentFile,      setAssignmentFile]      = useState(null);
  const [assignments,         setAssignments]         = useState([]);
  const [assignmentUploading, setAssignmentUploading] = useState(false);

  const handleUploadAssignment = async () => {
    if (!selectedCourse || !assignmentTitle || !assignmentFile) {
      alert('Please fill all required fields (Course, Title, File)'); return;
    }
    setAssignmentUploading(true);
    const fd = new FormData();
    fd.append('title',       assignmentTitle);
    fd.append('description', assignmentDesc);
    fd.append('courseId',    selectedCourse);
    fd.append('moduleId',    selectedModule);
    fd.append('dueDate',     dueDate);
    fd.append('maxMarks',    maxMarks);
    fd.append('file',        assignmentFile);
    try {
      await fetch(`${API}/assignments/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
        body: fd,
      });
    } catch { await new Promise((r) => setTimeout(r, 800)); }

    const newAssignment = {
      id: `a-${Date.now()}`, title: assignmentTitle, course: selectedCourse,
      module: selectedModule, description: assignmentDesc, dueDate, maxMarks,
      fileName: assignmentFile.name, fileSize: (assignmentFile.size / 1024).toFixed(1) + ' KB',
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    setAssignmentTitle(''); setAssignmentDesc(''); setDueDate('');
    setMaxMarks(''); setAssignmentFile(null);
    setAssignmentUploading(false);
    alert('Assignment uploaded successfully!');
  };

  // ── Tab 2 – Notes & PDFs ───────────────────────────────────────────────────
  const [noteTitle,     setNoteTitle]     = useState('');
  const [noteTopic,     setNoteTopic]     = useState('');
  const [noteDesc,      setNoteDesc]      = useState('');
  const [noteFile,      setNoteFile]      = useState(null);
  const [notes,         setNotes]         = useState([]);
  const [noteUploading, setNoteUploading] = useState(false);

  const handleUploadNote = async () => {
    if (!selectedCourse || !noteTitle || !noteFile) {
      alert('Please fill all required fields (Course, Title, File)'); return;
    }
    setNoteUploading(true);
    const fd = new FormData();
    fd.append('title',       noteTitle);
    fd.append('topic',       noteTopic);
    fd.append('description', noteDesc);
    fd.append('courseId',    selectedCourse);
    fd.append('moduleId',    selectedModule);
    fd.append('file',        noteFile);
    try {
      await fetch(`${API}/notes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
        body: fd,
      });
    } catch { await new Promise((r) => setTimeout(r, 800)); }

    const newNote = {
      id: `n-${Date.now()}`, title: noteTitle, course: selectedCourse,
      module: selectedModule, topic: noteTopic, description: noteDesc,
      fileName: noteFile.name, fileSize: (noteFile.size / 1024).toFixed(1) + ' KB',
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteTitle(''); setNoteTopic(''); setNoteDesc(''); setNoteFile(null);
    setNoteUploading(false);
    alert('Notes / PDF uploaded successfully!');
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const dropzoneStyle = {
    border: '1.5px dashed var(--sa-border)', borderRadius: 'var(--border-radius-md)',
    padding: 24, textAlign: 'center', marginBottom: 14,
  };

  const progressColor =
    uploadStatus === 'done'   ? '#1D9E75' :
    uploadStatus === 'paused' ? '#BA7517' :
    uploadStatus === 'error'  ? '#A32D2D' : 'var(--sa-teal)';

  const CourseModuleSelectors = () => (
    <div className="grid-2">
      <div className="form-group">
        <label className="form-label">Course *</label>
        <select className="form-input" value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
          <option value="">Select Course</option>
          {COURSE_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Section / Module *</label>
        <select className="form-input" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
          <option value="">Select Module</option>
          {filteredModules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Course Content Manager</div>
      </div>

      <div className="tab-group">
        {['📹 Videos', '📝 Assignments', '📄 Notes & PDFs'].map((label, i) => (
          <button key={i} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{label}</button>
        ))}
      </div>

      {/* ════════ TAB 0: VIDEOS ════════ */}
      {activeTab === 0 && (
        <>
          <div className="card">
            <div className="card-title">{editingId ? '✏️ Edit Lesson' : '⬆️ Upload New Video Lesson'}</div>
            <CourseModuleSelectors />

            <div className="form-group">
              <label className="form-label">Lesson Title *</label>
              <input className="form-input" placeholder="e.g. Introduction to React Hooks" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Lesson Type</label>
                <select className="form-input" value={lessonType} onChange={(e) => setLessonType(e.target.value)}>
                  <option>Free Preview</option>
                  <option>Locked (Enrolled Only)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Duration (min)</label>
                <input className="form-input" placeholder="e.g. 25" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>

            {!editingId && (
              <>
                {!videoFile ? (
                  <label style={{ ...dropzoneStyle, display: 'block', cursor: 'pointer' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f && f.type.startsWith('video/')) {
                        setVideoFile(f); setVideoPreview(URL.createObjectURL(f));
                        setUploadProgress(0); setUploadStatus('idle');
                      } else { alert('Please drop a video file (MP4 or MOV).'); }
                    }}
                  >
                    <div style={{ fontSize: 28 }}>🎬</div>
                    <div style={{ fontSize: 13, color: 'var(--sa-muted)', marginTop: 8 }}>Drag & drop video here, or click to browse</div>
                    <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 4 }}>MP4, MOV up to 2 GB · Uploaded in chunks</div>
                    <input type="file" accept="video/mp4,video/quicktime" style={{ display: 'none' }} onChange={handleVideoSelect} />
                  </label>
                ) : (
                  <div style={{ border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', marginBottom: 14 }}>
                    <video src={videoPreview} controls style={{ width: '100%', maxHeight: 200, background: '#000', display: 'block' }} />
                    <div style={{ padding: '8px 12px', background: 'var(--sa-surface)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                      <span style={{ fontSize: 18 }}>🎬</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{videoFile.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--sa-muted)' }}>
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          {totalChunks > 0 && ` · ${totalChunks} chunks`}
                        </div>
                      </div>
                      {uploadStatus === 'idle' && (
                        <button className="action-btn" style={{ fontSize: 11, padding: '3px 8px', color: 'var(--sa-accent)' }} onClick={handleRemoveVideo}>✕ Remove</button>
                      )}
                    </div>

                    {uploadStatus !== 'idle' && (
                      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--sa-border)' }}>
                        <div style={{ height: 8, background: 'var(--sa-border)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                          <div style={{ height: '100%', width: `${uploadProgress}%`, background: progressColor, borderRadius: 999, transition: 'width 0.2s ease' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--sa-muted)', marginBottom: 8 }}>
                          <span>
                            {uploadStatus === 'done' ? '✅ Upload complete'
                              : uploadStatus === 'paused' ? '⏸ Paused'
                              : `Uploading chunk ${uploadedChunks} of ${totalChunks}…`}
                          </span>
                          <span style={{ fontWeight: 600, color: progressColor }}>{uploadProgress}%</span>
                        </div>
                        {totalChunks > 0 && totalChunks <= 20 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                            {Array.from({ length: totalChunks }).map((_, ci) => (
                              <div key={ci} title={`Chunk ${ci + 1}`} style={{ width: 20, height: 8, borderRadius: 3, background: ci < uploadedChunks ? progressColor : 'var(--sa-border)', transition: 'background 0.15s' }} />
                            ))}
                          </div>
                        )}
                        {(uploadStatus === 'uploading' || uploadStatus === 'paused') && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="action-btn" style={{ fontSize: 11, padding: '4px 10px' }} onClick={handlePauseResume}>
                              {uploadStatus === 'uploading' ? '⏸ Pause' : '▶ Resume'}
                            </button>
                            <button className="action-btn" style={{ fontSize: 11, padding: '4px 10px', color: 'var(--sa-accent)' }} onClick={handleCancelUpload}>✕ Cancel</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              {editingId ? (
                <>
                  <button className="action-btn accent" style={{ flex: 2 }} onClick={handleSaveEdit}>💾 Save Changes</button>
                  <button className="action-btn" style={{ flex: 1 }} onClick={() => { setEditingId(null); setLessonTitle(''); setDuration(''); setLessonType('Free Preview'); }}>Cancel</button>
                </>
              ) : (
                <button className="action-btn accent" style={{ flex: 1 }} onClick={handleUploadLesson} disabled={uploadStatus === 'uploading'}>
                  {uploadStatus === 'uploading' ? `⏳ Uploading… ${uploadProgress}%` : '⬆️ Upload Lesson'}
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Uploaded Lessons ({uploadedLessons.length + lessonList.length})</div>
            {uploadedLessons.map((l, i) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--sa-border)', flexWrap: 'wrap' }}>
                <div className="lesson-num">{String(i + 1).padStart(2, '0')}</div>
                <div className={`lesson-icon ${l.free ? 'free' : 'locked'}`}>{l.free ? '▶' : '🔒'}</div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div className="lesson-title" style={{ marginBottom: 2 }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{l.fileSize} · {l.dur} · {l.uploadedAt}</div>
                </div>
                <span className={`lesson-tag ${l.free ? 'tag-free' : 'tag-locked'}`}>{l.free ? 'Free' : 'Locked'}</span>
                <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 8, background: '#EAF3DE', color: '#3B6D11' }}>✅ Uploaded</span>
                <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleEditLesson(l)}>✏️</button>
                <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--sa-accent)' }} onClick={() => handleDeleteLesson(l.id)}>🗑️</button>
              </div>
            ))}

            {uploadedLessons.length > 0 && lessonList.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--sa-muted)', padding: '8px 0 4px', borderBottom: '1px solid var(--sa-border)', marginBottom: 4 }}>— Pre-existing lessons —</div>
            )}

            {lessonList.map((l, i) => (
              <div key={l.id ?? i} className="lesson-item">
                <div className="lesson-num">{String(uploadedLessons.length + i + 1).padStart(2, '0')}</div>
                <div className={`lesson-icon ${l.free ? 'free' : 'locked'}`}>{l.free ? '▶' : '🔒'}</div>
                <div className="lesson-title">{l.title}</div>
                <span className={`lesson-tag ${l.free ? 'tag-free' : 'tag-locked'}`}>{l.free ? 'Free' : 'Locked'}</span>
                <div className="lesson-dur">{l.dur}</div>
                <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleEditLesson({ ...l, id: l.id ?? `static-${i}` })}>✏️</button>
              </div>
            ))}

            {uploadedLessons.length === 0 && lessonList.length === 0 && (
              <div style={{ color: 'var(--sa-muted)', fontSize: 13, padding: '12px 0' }}>No lessons uploaded yet.</div>
            )}
          </div>
        </>
      )}

      {/* ════════ TAB 1: ASSIGNMENTS ════════ */}
      {activeTab === 1 && (
        <>
          <div className="card">
            <div className="card-title">Upload New Assignment</div>
            <CourseModuleSelectors />
            <div className="form-group">
              <label className="form-label">Assignment Title *</label>
              <input className="form-input" placeholder="e.g. React Hooks Exercise" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Description / Instructions</label>
              <textarea className="form-input" rows={3} placeholder="Describe what students need to do..." value={assignmentDesc} onChange={(e) => setAssignmentDesc(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Max Marks</label>
                <input className="form-input" type="number" placeholder="e.g. 100" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />
              </div>
            </div>
            <div style={{ ...dropzoneStyle, marginTop: 14 }}>
              <div style={{ fontSize: 24 }}>📎</div>
              <div style={{ fontSize: 13, color: 'var(--sa-muted)', marginTop: 8 }}>Drag & drop assignment file or click to browse</div>
              <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 4 }}>PDF, DOC, DOCX, ZIP up to 50 MB</div>
              <input type="file" accept=".pdf,.doc,.docx,.zip,.txt" style={{ marginTop: 10 }} onChange={(e) => { const f = e.target.files[0]; if (f) setAssignmentFile(f); }} />
              {assignmentFile && <div style={{ fontSize: 11, color: 'var(--sa-teal)', marginTop: 6 }}>✅ {assignmentFile.name} ({(assignmentFile.size / 1024).toFixed(1)} KB)</div>}
            </div>
            <button className="action-btn accent" style={{ marginTop: 4 }} onClick={handleUploadAssignment} disabled={assignmentUploading}>
              {assignmentUploading ? '⏳ Uploading...' : '⬆️ Upload Assignment'}
            </button>
          </div>
          <div className="card">
            <div className="card-title">Uploaded Assignments ({assignments.length})</div>
            {assignments.length === 0 ? (
              <div style={{ color: 'var(--sa-muted)', fontSize: 13, padding: '10px 0' }}>No assignments uploaded yet.</div>
            ) : (
              assignments.map((a, i) => (
                <div key={a.id} className="lesson-item" style={{ flexWrap: 'wrap', gap: 8, padding: '10px 0' }}>
                  <div className="lesson-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="lesson-icon free">📝</div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div className="lesson-title" style={{ marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--sa-muted)' }}>Due: {a.dueDate || '—'} · Marks: {a.maxMarks || '—'} · {a.fileSize}</div>
                  </div>
                  <span className="lesson-tag tag-free">📎 {a.fileName}</span>
                  <div className="lesson-dur">{a.uploadedAt}</div>
                  <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--sa-accent)' }} onClick={() => setAssignments((prev) => prev.filter((x) => x.id !== a.id))}>🗑️</button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ════════ TAB 2: NOTES & PDFs ════════ */}
      {activeTab === 2 && (
        <>
          <div className="card">
            <div className="card-title">Upload Notes / PDF</div>
            <CourseModuleSelectors />
            <div className="form-group">
              <label className="form-label">Document Title *</label>
              <input className="form-input" placeholder="e.g. React Fundamentals Notes" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Topic / Chapter</label>
              <input className="form-input" placeholder="e.g. Hooks & State Management" value={noteTopic} onChange={(e) => setNoteTopic(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-input" rows={2} placeholder="Brief summary..." value={noteDesc} onChange={(e) => setNoteDesc(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={dropzoneStyle}>
              <div style={{ fontSize: 24 }}>📄</div>
              <div style={{ fontSize: 13, color: 'var(--sa-muted)', marginTop: 8 }}>Drag & drop PDF / document or click to browse</div>
              <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 4 }}>PDF, PPT, PPTX, DOC, DOCX up to 100 MB</div>
              <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" style={{ marginTop: 10 }} onChange={(e) => { const f = e.target.files[0]; if (f) setNoteFile(f); }} />
              {noteFile && <div style={{ fontSize: 11, color: 'var(--sa-teal)', marginTop: 6 }}>✅ {noteFile.name} ({(noteFile.size / 1024).toFixed(1)} KB)</div>}
            </div>
            <button className="action-btn accent" style={{ marginTop: 4 }} onClick={handleUploadNote} disabled={noteUploading}>
              {noteUploading ? '⏳ Uploading...' : '⬆️ Upload Notes / PDF'}
            </button>
          </div>
          <div className="card">
            <div className="card-title">Uploaded Notes & PDFs ({notes.length})</div>
            {notes.length === 0 ? (
              <div style={{ color: 'var(--sa-muted)', fontSize: 13, padding: '10px 0' }}>No notes uploaded yet.</div>
            ) : (
              notes.map((n, i) => (
                <div key={n.id} className="lesson-item" style={{ flexWrap: 'wrap', gap: 8, padding: '10px 0' }}>
                  <div className="lesson-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="lesson-icon free">📄</div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div className="lesson-title" style={{ marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--sa-muted)' }}>Topic: {n.topic || '—'} · {n.fileSize}</div>
                  </div>
                  <span className="lesson-tag tag-free">📄 {n.fileName}</span>
                  <div className="lesson-dur">{n.uploadedAt}</div>
                  <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--sa-accent)' }} onClick={() => setNotes((prev) => prev.filter((x) => x.id !== n.id))}>🗑️</button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. ATTENDANCE PAGE
// ════════════════════════════════════════════════════════════════════════════
export function AttendancePage() {
  const INITIAL_ROWS = [
    { id: 1, name: 'Arjun S.',   initials: 'AS', av: 'av-a', course: 'Full Stack',     att: ['P','P','P','A','P','P','L'] },
    { id: 2, name: 'Preethi N.', initials: 'PN', av: 'av-b', course: 'Full Stack',     att: ['P','P','A','P','P','P','P'] },
    { id: 3, name: 'Kiran K.',   initials: 'KK', av: 'av-c', course: 'Python with AI', att: ['P','P','P','P','P','P','P'] },
    { id: 4, name: 'Divya M.',   initials: 'DM', av: 'av-d', course: 'Full Stack',     att: ['A','P','P','P','L','P','P'] },
    { id: 5, name: 'Rahul V.',   initials: 'RV', av: 'av-e', course: 'Advanced React', att: ['P','A','P','P','P','L','P'] },
    { id: 6, name: 'Sneha R.',   initials: 'SR', av: 'av-a', course: 'Python with AI', att: ['P','P','P','P','A','P','P'] },
  ];

  const WEEK = { label: 'Jan 6 – 12, 2026', days: ['Mon 6','Tue 7','Wed 8','Thu 9','Fri 10','Sat 11','Sun 12'] };

  const [rows, setRows] = useState(INITIAL_ROWS);

  // Static week display
  const week     = WEEK;
  const CYCLE    = ['P', 'A', 'L', ''];
  const attClass = { P: 'att-present', A: 'att-absent', L: 'att-leave', '': 'att-none' };
  const attLabel = { P: 'Present', A: 'Absent', L: 'Leave', '': '—' };

  const cycleCell = (rowId, dayIdx) => {
    setRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const next = CYCLE[(CYCLE.indexOf(r.att[dayIdx]) + 1) % CYCLE.length];
      const att  = [...r.att]; att[dayIdx] = next;
      return { ...r, att };
    }));
  };

  // Use all rows directly (no filter)
  const filtered    = rows;
  const allCells    = filtered.flatMap((r) => r.att);
  const totalCells  = allCells.filter((a) => a !== '').length;
  const presentPct  = totalCells ? Math.round((allCells.filter((a) => a === 'P').length / totalCells) * 100) : 0;
  const absentCount = allCells.filter((a) => a === 'A').length;
  const leaveCount  = allCells.filter((a) => a === 'L').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Attendance Management</div>
        <div className="page-sub">Click any cell to toggle Present / Absent / Leave</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['👥 Students',   filtered.length,  ''],
          ['✅ Avg Present', `${presentPct}%`, 'this week'],
          ['❌ Absences',    absentCount,      'this week'],
          ['🏖️ On Leave',  leaveCount,       'this week'],
        ].map(([label, val, sub]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{val}</div>
            {sub && <div className="metric-sub">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Student</th>
                <th style={{ fontSize: 11, color: 'var(--sa-muted)' }}>Course</th>
                {week.days.map((d) => <th key={d} style={{ textAlign: 'center', fontSize: 11, minWidth: 52 }}>{d}</th>)}
                <th style={{ textAlign: 'center' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const filled  = r.att.filter((a) => a !== '');
                const pct     = filled.length ? Math.round((r.att.filter((a) => a === 'P').length / filled.length) * 100) : 0;
                const pctColor = pct >= 75 ? '#3B6D11' : pct >= 50 ? '#633806' : '#A32D2D';
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={`avatar ${r.av}`} style={{ width: 24, height: 24, fontSize: 10 }}>{r.initials}</div>
                        {r.name}
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{r.course}</td>
                    {r.att.map((a, i) => (
                      <td key={i} style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <div
                          className={`att-cell ${attClass[a]}`}
                          style={{ width: 28, height: 28, margin: '0 auto', cursor: 'pointer', borderRadius: 6, fontSize: 11, transition: 'background 0.15s' }}
                          title={`Click to change: ${attLabel[a] || '—'}`}
                          onClick={() => cycleCell(r.id, i)}
                        >
                          {a || '·'}
                        </div>
                      </td>
                    ))}
                    <td style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: pctColor }}>{filled.length ? `${pct}%` : '—'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--sa-muted)', padding: '20px 0', fontSize: 13 }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 16, fontSize: 11, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['att-present','P','Present'],['att-absent','A','Absent'],['att-leave','L','Leave'],['att-none','·','Not marked']].map(([cls, letter, label]) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className={`att-cell ${cls}`} style={{ width: 18, height: 18, display: 'inline-flex', borderRadius: 3, fontSize: 10, flexShrink: 0 }}>{letter}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CREATE QUIZ PAGE
// ════════════════════════════════════════════════════════════════════════════
export function CreateQuizPage() {
  const COURSES = ['Full Stack Web Development', 'Python with AI', 'Advanced React'];

  const blankQuestion = () => ({ id: Date.now() + Math.random(), text: '', options: ['', '', '', ''], correct: 0, marks: 1 });

  const [quizTitle,    setQuizTitle]    = useState('');
  const [course,       setCourse]       = useState('Full Stack Web Development');
  const [timeLimit,    setTimeLimit]    = useState('15');
  const [passMark,     setPassMark]     = useState('60');
  const [questions,    setQuestions]    = useState([blankQuestion()]);
  const [publishing,   setPublishing]   = useState(false);
  const [published,    setPublished]    = useState(false);
  const [activeQ,      setActiveQ]      = useState(0);
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  const updateQuestion = (idx, field, value) =>
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));

  const updateOption = (qIdx, oIdx, value) =>
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options]; options[oIdx] = value;
      return { ...q, options };
    }));

  const addQuestion = () => { const next = [...questions, blankQuestion()]; setQuestions(next); setActiveQ(next.length - 1); };

  const removeQuestion = (idx) => {
    if (questions.length === 1) { alert('A quiz must have at least one question.'); return; }
    if (!window.confirm('Remove this question?')) return;
    const next = questions.filter((_, i) => i !== idx);
    setQuestions(next); setActiveQ(Math.min(activeQ, next.length - 1));
  };

  const moveQuestion = (idx, dir) => {
    const next = [...questions]; const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setQuestions(next); setActiveQ(swap);
  };

  const validate = () => {
    if (!quizTitle.trim()) { alert('Please enter a quiz title.'); return false; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) { alert(`Question ${i + 1}: enter question text.`); setActiveQ(i); return false; }
      if (q.options.some((o) => !o.trim())) { alert(`Question ${i + 1}: fill all 4 options.`); setActiveQ(i); return false; }
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setPublishing(true);

    const payload = { title: quizTitle, course, timeLimitMinutes: Number(timeLimit), passMark: Number(passMark), questions };
    try {
      const res = await fetch(`${API}/quizzes`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Server error');
    } catch { await new Promise((r) => setTimeout(r, 900)); }

    const totalMarks = questions.reduce((s, q) => s + Number(q.marks), 0);
    setSavedQuizzes((prev) => [{ id: Date.now(), title: quizTitle, course, timeLimit: Number(timeLimit), passMark: Number(passMark), questions: questions.length, totalMarks, publishedAt: new Date().toISOString().split('T')[0] }, ...prev]);
    setPublishing(false); setPublished(true);
    setQuizTitle(''); setTimeLimit('15'); setPassMark('60');
    setQuestions([blankQuestion()]); setActiveQ(0);
    setTimeout(() => setPublished(false), 3000);
  };

  const totalMarks = questions.reduce((s, q) => s + Number(q.marks), 0);
  const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Create Quiz</div>
        <div className="page-sub">Build, preview and publish quizzes for your students</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['❓ Questions',   questions.length,        ''],
          ['🏆 Total Marks', totalMarks,              ''],
          ['⏱️ Time Limit', `${timeLimit || '—'} min`, ''],
          ['📋 Published',   savedQuizzes.length,     'this session'],
        ].map(([label, val, sub]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{val}</div>
            {sub && <div className="metric-sub">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-title">Quiz Settings</div>
            <div className="form-group">
              <label className="form-label">Quiz Title *</label>
              <input className="form-input" placeholder="e.g. React Fundamentals Quiz" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-input" value={course} onChange={(e) => setCourse(e.target.value)}>
                {COURSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Time Limit (min)</label>
                <input className="form-input" type="number" min={1} placeholder="15" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Pass Mark (%)</label>
                <input className="form-input" type="number" min={1} max={100} placeholder="60" value={passMark} onChange={(e) => setPassMark(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Questions ({questions.length})</div>
            {questions.map((q, qIdx) => (
              <div key={q.id} style={{ border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-md)', marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: activeQ === qIdx ? 'var(--sa-surface)' : 'transparent', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setActiveQ(activeQ === qIdx ? -1 : qIdx)}>
                  <span style={{ minWidth: 22, height: 22, borderRadius: '50%', background: 'var(--sa-teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{qIdx + 1}</span>
                  <span style={{ flex: 1, fontSize: 13, color: q.text ? 'var(--sa-text)' : 'var(--sa-muted)' }}>{q.text || 'Click to edit question…'}</span>
                  <span style={{ fontSize: 11, color: 'var(--sa-muted)', marginRight: 4 }}>{q.marks} mk</span>
                  <button className="action-btn" style={{ fontSize: 11, padding: '2px 6px' }} onClick={(e) => { e.stopPropagation(); moveQuestion(qIdx, -1); }} disabled={qIdx === 0} title="Move up">↑</button>
                  <button className="action-btn" style={{ fontSize: 11, padding: '2px 6px' }} onClick={(e) => { e.stopPropagation(); moveQuestion(qIdx, 1); }} disabled={qIdx === questions.length - 1} title="Move down">↓</button>
                  <button className="action-btn" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--sa-accent)' }} onClick={(e) => { e.stopPropagation(); removeQuestion(qIdx); }} title="Delete question">🗑️</button>
                  <span style={{ fontSize: 12, color: 'var(--sa-muted)' }}>{activeQ === qIdx ? '▲' : '▼'}</span>
                </div>

                {activeQ === qIdx && (
                  <div style={{ padding: '12px 14px', borderTop: '1px solid var(--sa-border)' }}>
                    <div className="form-group">
                      <label className="form-label">Question Text *</label>
                      <textarea className="form-input" rows={2} placeholder="e.g. Which hook is used for side effects in React?" value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                    <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Options — click radio to mark correct answer</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${q.correct === oIdx ? 'var(--sa-teal)' : 'var(--sa-border)'}`, background: q.correct === oIdx ? 'rgba(29,158,117,0.06)' : 'var(--sa-surface)' }}>
                          <input type="radio" name={`correct-${q.id}`} checked={q.correct === oIdx} onChange={() => updateQuestion(qIdx, 'correct', oIdx)} style={{ accentColor: 'var(--sa-teal)', flexShrink: 0 }} />
                          <span style={{ minWidth: 20, height: 20, borderRadius: '50%', background: q.correct === oIdx ? 'var(--sa-teal)' : 'var(--sa-border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{OPTION_LETTERS[oIdx]}</span>
                          <input className="form-input" placeholder={`Option ${OPTION_LETTERS[oIdx]}`} value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', padding: 0, fontSize: 13 }} />
                          {q.correct === oIdx && <span style={{ fontSize: 11, color: 'var(--sa-teal)', fontWeight: 600, flexShrink: 0 }}>✓ Correct</span>}
                        </div>
                      ))}
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Marks for this question</label>
                      <input className="form-input" type="number" min={1} max={10} value={q.marks} onChange={(e) => updateQuestion(qIdx, 'marks', Number(e.target.value))} style={{ width: 80 }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button className="action-btn" style={{ width: '100%', marginTop: 4, fontSize: 13 }} onClick={addQuestion}>➕ Add Question</button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="action-btn" style={{ flex: 1, fontSize: 13 }} onClick={() => { setQuizTitle(''); setTimeLimit('15'); setPassMark('60'); setQuestions([blankQuestion()]); setActiveQ(0); }}>🗑️ Clear</button>
            <button className="action-btn accent" style={{ flex: 2, fontSize: 13 }} onClick={handlePublish} disabled={publishing}>
              {publishing ? '⏳ Publishing…' : published ? '✅ Published!' : '✓ Publish Quiz'}
            </button>
          </div>
        </div>

        {/* Right: preview + published */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ position: 'sticky', top: 16 }}>
            <div className="card-title">Quiz Preview</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{quizTitle || 'Untitled Quiz'}</div>
              <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginTop: 4 }}>{course} · {timeLimit || '—'} min · Pass: {passMark || '—'}% · {totalMarks} marks</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
              {questions.map((q, qIdx) => (
                <div key={q.id} style={{ padding: '10px 12px', border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-md)', background: 'var(--sa-surface)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                    Q{qIdx + 1}. {q.text || <span style={{ color: 'var(--sa-muted)', fontWeight: 400 }}>(no text)</span>}
                    <span style={{ fontSize: 11, color: 'var(--sa-muted)', marginLeft: 6 }}>({q.marks} mk)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: q.correct === oIdx ? '#3B6D11' : 'var(--sa-text)', fontWeight: q.correct === oIdx ? 600 : 400 }}>
                        <span style={{ minWidth: 18, height: 18, borderRadius: '50%', background: q.correct === oIdx ? '#EAF3DE' : 'var(--sa-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: q.correct === oIdx ? '#3B6D11' : 'var(--sa-muted)' }}>{OPTION_LETTERS[oIdx]}</span>
                        {opt || <span style={{ color: 'var(--sa-muted)' }}>(empty)</span>}
                        {q.correct === oIdx && <span style={{ fontSize: 10, marginLeft: 2 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {savedQuizzes.length > 0 && (
            <div className="card">
              <div className="card-title">Published This Session ({savedQuizzes.length})</div>
              {savedQuizzes.map((q) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--sa-border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{q.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 2 }}>{q.course} · {q.questions} Qs · {q.totalMarks} marks · {q.timeLimit} min · Pass {q.passMark}%</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#EAF3DE', color: '#3B6D11' }}>✅ Live</span>
                  <button className="action-btn" style={{ fontSize: 11, padding: '3px 7px', color: 'var(--sa-accent)' }} onClick={() => setSavedQuizzes((prev) => prev.filter((x) => x.id !== q.id))}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. ASSIGNMENT MANAGER PAGE
// ════════════════════════════════════════════════════════════════════════════
export function AssignmentManagerPage() {
  const DEFAULT_SUBMISSIONS = [
    { id: 's1', student: 'Arjun S.',   initials: 'AS', av: 'av-a', assignment: 'React Hooks Assignment', course: 'Full Stack',     submitted: '2026-01-18', status: 'pending',   score: null, maxMarks: 100, file: 'hooks_arjun.pdf',      feedback: '' },
    { id: 's2', student: 'Preethi N.', initials: 'PN', av: 'av-b', assignment: 'React Hooks Assignment', course: 'Full Stack',     submitted: '2026-01-17', status: 'graded',    score: 88,   maxMarks: 100, file: 'hooks_preethi.zip',    feedback: 'Good understanding of useEffect.' },
    { id: 's3', student: 'Kiran K.',   initials: 'KK', av: 'av-c', assignment: 'Data Cleaning Task',     course: 'Python with AI', submitted: '2026-01-19', status: 'submitted', score: null, maxMarks: 50,  file: 'cleaning_kiran.py',    feedback: '' },
    { id: 's4', student: 'Divya M.',   initials: 'DM', av: 'av-d', assignment: 'CSS Flexbox Exercise',   course: 'Full Stack',     submitted: '2026-01-21', status: 'late',      score: null, maxMarks: 100, file: 'flexbox_divya.html',   feedback: '' },
    { id: 's5', student: 'Rahul V.',   initials: 'RV', av: 'av-e', assignment: 'Context API Task',       course: 'Advanced React', submitted: '2026-01-20', status: 'graded',    score: 72,   maxMarks: 100, file: 'context_rahul.jsx',    feedback: 'Needs improvement on prop drilling.' },
    { id: 's6', student: 'Sneha R.',   initials: 'SR', av: 'av-a', assignment: 'Data Cleaning Task',     course: 'Python with AI', submitted: '2026-01-18', status: 'pending',   score: null, maxMarks: 50,  file: 'cleaning_sneha.ipynb', feedback: '' },
    { id: 's7', student: 'Arjun S.',   initials: 'AS', av: 'av-a', assignment: 'CSS Flexbox Exercise',   course: 'Full Stack',     submitted: '2026-01-20', status: 'submitted', score: null, maxMarks: 100, file: 'flexbox_arjun.html',   feedback: '' },
  ];

  const [submissions,   setSubmissions]   = useState(DEFAULT_SUBMISSIONS);
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [courseFilter,  setCourseFilter]  = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [gradeTarget,   setGradeTarget]   = useState(null);
  const [gradeScore,    setGradeScore]    = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [activeTab,     setActiveTab]     = useState(0);

  const totalSubmissions = submissions.length;
  const pendingCount     = submissions.filter((s) => s.status === 'pending' || s.status === 'submitted').length;
  const gradedCount      = submissions.filter((s) => s.status === 'graded').length;
  const lateCount        = submissions.filter((s) => s.status === 'late').length;
  const gradedWithScore  = submissions.filter((s) => s.status === 'graded' && s.score !== null);
  const avgScore         = gradedWithScore.length ? Math.round(gradedWithScore.reduce((sum, s) => sum + (s.score / s.maxMarks) * 100, 0) / gradedWithScore.length) : 0;

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (courseFilter && s.course !== courseFilter) return false;
    if (searchQuery && !s.student.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const assignmentStats = [...new Set(submissions.map((s) => s.assignment))].map((name) => {
    const group  = submissions.filter((s) => s.assignment === name);
    const graded = group.filter((s) => s.status === 'graded' && s.score !== null);
    const avg    = graded.length ? Math.round(graded.reduce((sum, s) => sum + (s.score / s.maxMarks) * 100, 0) / graded.length) : null;
    return { name, total: group.length, graded: graded.length, pending: group.filter((s) => s.status === 'pending').length, late: group.filter((s) => s.status === 'late').length, avg };
  });

  const openGradeModal = (sub) => { setGradeTarget(sub); setGradeScore(sub.score !== null ? String(sub.score) : ''); setGradeFeedback(sub.feedback || ''); };

  const handleSaveGrade = async () => {
    const sc = parseInt(gradeScore, 10);
    if (isNaN(sc) || sc < 0 || sc > gradeTarget.maxMarks) { alert(`Score must be between 0 and ${gradeTarget.maxMarks}`); return; }
    try {
      await fetch(`${API}/submissions/${gradeTarget.id}/grade`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ score: sc, feedback: gradeFeedback }),
      });
    } catch { /* local fallback */ }
    setSubmissions((prev) => prev.map((s) => s.id === gradeTarget.id ? { ...s, score: sc, feedback: gradeFeedback, status: 'graded' } : s));
    setGradeTarget(null);
  };

  const handleQuickGrade = async (id, val, maxMarks) => {
    const sc = parseInt(val, 10);
    if (isNaN(sc) || sc < 0 || sc > maxMarks) return;
    try { await fetch(`${API}/submissions/${id}/grade`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ score: sc }) }); } catch { /* local */ }
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, score: sc, status: 'graded' } : s));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this submission record?')) return;
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const statusPillStyle = {
    pending:   { background: 'var(--sa-surface)', color: 'var(--sa-muted)', border: '1px solid var(--sa-border)' },
    submitted: { background: '#e8f4fd', color: '#185FA5' },
    graded:    { background: '#eaf3de', color: '#3B6D11' },
    late:      { background: '#fcebeb', color: '#A32D2D' },
  };

  const StatusPill = ({ status }) => (
    <span className="status-pill" style={{ ...(statusPillStyle[status] || {}), fontSize: 11, padding: '2px 8px', borderRadius: 12 }}>{status}</span>
  );

  const STATUS_TABS = [
    ['all',       'All',       totalSubmissions],
    ['pending',   'Pending',   submissions.filter((s) => s.status === 'pending').length],
    ['submitted', 'Submitted', submissions.filter((s) => s.status === 'submitted').length],
    ['graded',    'Graded',    gradedCount],
    ['late',      'Late',      lateCount],
  ];

  const uniqueCourses = [...new Set(submissions.map((s) => s.course))];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Assignment Manager</div>
        <div className="page-sub">Review submissions, grade work, and track completion</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['📥 Submissions',   totalSubmissions, ''],
          ['⏳ Needs Grading', pendingCount,     pendingCount > 0 ? 'action required' : 'all caught up'],
          ['✅ Graded',        gradedCount,      ''],
          ['📊 Avg Score',     avgScore ? `${avgScore}%` : '—', gradedCount > 0 ? `from ${gradedCount} graded` : 'no grades yet'],
        ].map(([label, val, sub]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{val}</div>
            {sub && <div className="metric-sub">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="tab-group" style={{ marginBottom: 16 }}>
        {['📋 Submissions', '📊 Analytics'].map((label, i) => (
          <button key={i} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{label}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <>
          <div className="card">
            <div className="card-title">Submissions</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {STATUS_TABS.map(([key, label, count]) => (
                <button key={key} onClick={() => setStatusFilter(key)} style={{ fontSize: 12, padding: '5px 12px', border: '0.5px solid var(--sa-border)', borderRadius: 20, cursor: 'pointer', background: statusFilter === key ? 'var(--sa-teal)' : 'var(--sa-surface)', color: statusFilter === key ? '#fff' : 'var(--sa-text)', fontWeight: statusFilter === key ? 600 : 400 }}>{label} ({count})</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <select className="form-input" style={{ width: 'auto', minWidth: 160, fontSize: 12 }} value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                <option value="">All Courses</option>
                {uniqueCourses.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className="form-input" placeholder="🔍 Search student…" style={{ flex: 1, minWidth: 160, fontSize: 12 }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <span style={{ fontSize: 12, color: 'var(--sa-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            {filtered.length === 0 ? (
              <div style={{ color: 'var(--sa-muted)', fontSize: 13, padding: '12px 0' }}>No submissions match the current filters.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 680 }}>
                  <thead>
                    <tr><th>#</th><th>Student</th><th>Assignment</th><th>Course</th><th>Submitted</th><th>Status</th><th>Score</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{String(i + 1).padStart(2, '0')}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className={`avatar ${s.av}`} style={{ width: 24, height: 24, fontSize: 10 }}>{s.initials}</div>
                            <span style={{ fontSize: 13 }}>{s.student}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--sa-muted)', maxWidth: 160 }}>{s.assignment}</td>
                        <td style={{ fontSize: 11, color: 'var(--sa-muted)' }}>{s.course}</td>
                        <td style={{ fontSize: 11 }}>{s.submitted}</td>
                        <td><StatusPill status={s.status} /></td>
                        <td>
                          {s.status === 'graded' ? (
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{s.score}/{s.maxMarks}<span style={{ fontSize: 10, color: 'var(--sa-muted)', marginLeft: 4 }}>({Math.round((s.score / s.maxMarks) * 100)}%)</span></span>
                          ) : (
                            <input className="form-input" type="number" min={0} max={s.maxMarks} placeholder="—" style={{ width: 60, fontSize: 11, padding: '3px 6px' }} onKeyDown={(e) => { if (e.key === 'Enter') handleQuickGrade(s.id, e.target.value, s.maxMarks); }} />
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => openGradeModal(s)}>✏️ Grade</button>
                            <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => alert(`Viewing: ${s.file}`)}>📎</button>
                            <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--sa-accent)' }} onClick={() => handleDelete(s.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {lateCount > 0 && (
            <div style={{ background: '#fcebeb', border: '1px solid #F09595', borderRadius: 'var(--border-radius-md)', padding: '10px 14px', fontSize: 13, color: '#501313', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ <strong>{lateCount}</strong> late submission{lateCount > 1 ? 's' : ''} — consider notifying those students.
            </div>
          )}
        </>
      )}

      {activeTab === 1 && (
        <div className="card">
          <div className="card-title">Assignment Breakdown</div>
          <table className="data-table">
            <thead>
              <tr><th>Assignment</th><th style={{ textAlign: 'center' }}>Total</th><th style={{ textAlign: 'center' }}>Graded</th><th style={{ textAlign: 'center' }}>Pending</th><th style={{ textAlign: 'center' }}>Late</th><th style={{ textAlign: 'center' }}>Avg Score</th><th>Completion</th></tr>
            </thead>
            <tbody>
              {assignmentStats.map((a) => {
                const pct = Math.round((a.graded / a.total) * 100);
                return (
                  <tr key={a.name}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{a.name}</td>
                    <td style={{ textAlign: 'center' }}>{a.total}</td>
                    <td style={{ textAlign: 'center', color: '#3B6D11' }}>{a.graded}</td>
                    <td style={{ textAlign: 'center', color: 'var(--sa-muted)' }}>{a.pending}</td>
                    <td style={{ textAlign: 'center', color: '#A32D2D' }}>{a.late}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{a.avg !== null ? `${a.avg}%` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                        <span style={{ fontSize: 11 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {gradeTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={(e) => { if (e.target === e.currentTarget) setGradeTarget(null); }}>
          <div style={{ background: 'var(--sa-card)', border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-lg)', padding: 24, width: 440, maxWidth: '90vw' }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Grade Submission</div>
            <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginBottom: 16 }}>{gradeTarget.student} — {gradeTarget.assignment}</div>
            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Score (out of {gradeTarget.maxMarks})</label>
                <input className="form-input" type="number" min={0} max={gradeTarget.maxMarks} placeholder={`0 – ${gradeTarget.maxMarks}`} value={gradeScore} onChange={(e) => setGradeScore(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">File</label>
                <div style={{ fontSize: 12, padding: '8px 10px', border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-md)', color: 'var(--sa-muted)' }}>📎 {gradeTarget.file}</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Feedback / Remarks</label>
              <textarea className="form-input" rows={3} placeholder="Write feedback for the student…" value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="action-btn" onClick={() => setGradeTarget(null)}>Cancel</button>
              <button className="action-btn accent" onClick={handleSaveGrade}>✓ Save Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. TRAINER NOTIFICATIONS PAGE
// ════════════════════════════════════════════════════════════════════════════
export function TrainerNotificationsPage() {
  const COURSE_LIST = [
    { id: 'full',  label: 'Full Stack Web Development' },
    { id: 'ai',    label: 'Python with AI' },
    { id: 'react', label: 'Advanced React' },
  ];

  const INITIAL_SENT = [
    { id: 'n1', title: 'Assignment Due Reminder',   body: 'React Hooks Assignment is due tomorrow. Please submit before midnight.',      audience: 'Full Stack',     type: 'reminder',     sentAt: '2026-01-19 09:00', reach: 142 },
    { id: 'n2', title: 'New Video Uploaded',        body: 'A new lesson on useContext has been uploaded. Check it out!',                audience: 'All Students',   type: 'announcement', sentAt: '2026-01-18 14:30', reach: 305 },
    { id: 'n3', title: 'Class Cancelled – Jan 20',  body: "Today's live session is cancelled. Recording will be shared shortly.",       audience: 'Python with AI', type: 'alert',        sentAt: '2026-01-20 08:00', reach: 98  },
    { id: 'n4', title: 'Quiz Published',            body: 'A new quiz on React Fundamentals is now live. Complete it by Jan 22.',       audience: 'Advanced React', type: 'reminder',     sentAt: '2026-01-17 11:00', reach: 65  },
    { id: 'n5', title: 'Motivational Note',         body: "Great work this week, everyone! Keep pushing — you're doing amazing.",      audience: 'All Students',   type: 'general',      sentAt: '2026-01-16 17:00', reach: 305 },
  ];

  const [sentList,      setSentList]      = useState(INITIAL_SENT);
  const [activeTab,     setActiveTab]     = useState(0);
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [notifTitle,    setNotifTitle]    = useState('');
  const [notifBody,     setNotifBody]     = useState('');
  const [notifAudience, setNotifAudience] = useState('');
  const [notifType,     setNotifType]     = useState('announcement');
  const [notifChannel,  setNotifChannel]  = useState({ inApp: true, email: false, sms: false });
  const [scheduleMode,  setScheduleMode]  = useState('now');
  const [scheduledAt,   setScheduledAt]   = useState('');
  const [sending,       setSending]       = useState(false);
  const [previewOpen,   setPreviewOpen]   = useState(false);

  const TYPE_META = {
    announcement: { label: 'Announcement', bg: '#E6F1FB', color: '#0C447C' },
    reminder:     { label: 'Reminder',     bg: '#FAEEDA', color: '#633806' },
    alert:        { label: 'Alert',        bg: '#FCEBEB', color: '#501313' },
    general:      { label: 'General',      bg: '#EAF3DE', color: '#27500A' },
  };

  const audienceReach = (aud) => {
    if (!aud || aud === 'All Students') return 305;
    return { 'Full Stack Web Development': 142, 'Python with AI': 98, 'Advanced React': 65 }[aud] || 0;
  };

  const TypeBadge = ({ type }) => {
    const m = TYPE_META[type] || TYPE_META.general;
    return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: m.bg, color: m.color }}>{m.label}</span>;
  };

  const filteredSent = sentList.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.body.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSend = async () => {
    if (!notifTitle.trim() || !notifBody.trim() || !notifAudience) { alert('Please fill in Title, Message, and Audience.'); return; }
    if (scheduleMode === 'later' && !scheduledAt) { alert('Please pick a scheduled date & time.'); return; }
    setSending(true);

    const payload = { title: notifTitle, body: notifBody, audience: notifAudience, type: notifType, channels: notifChannel, scheduleMode, scheduledAt };
    try {
      await fetch(`${API}/notifications`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
    } catch { await new Promise((r) => setTimeout(r, 900)); }

    setSentList((prev) => [{
      id: `n-${Date.now()}`, title: notifTitle, body: notifBody, audience: notifAudience, type: notifType,
      sentAt: scheduleMode === 'now' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : scheduledAt.replace('T', ' '),
      reach: audienceReach(notifAudience), scheduled: scheduleMode === 'later',
    }, ...prev]);

    setNotifTitle(''); setNotifBody(''); setNotifAudience('');
    setNotifType('announcement'); setScheduleMode('now'); setScheduledAt('');
    setNotifChannel({ inApp: true, email: false, sms: false });
    setSending(false); setActiveTab(1);
    alert(scheduleMode === 'now' ? 'Notification sent!' : 'Notification scheduled!');
  };

  const handleDelete  = (id) => { if (!window.confirm('Delete this notification?')) return; setSentList((prev) => prev.filter((n) => n.id !== id)); };
  const handleResend  = (n) => { setNotifTitle(n.title); setNotifBody(n.body); setNotifAudience(n.audience); setNotifType(n.type); setActiveTab(0); };

  const bodyLen   = notifBody.length;
  const bodyColor = bodyLen > 280 ? '#A32D2D' : bodyLen > 200 ? '#633806' : 'var(--sa-muted)';

  const ChannelToggle = ({ id, label, emoji }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', border: `1px solid ${notifChannel[id] ? 'var(--sa-teal)' : 'var(--sa-border)'}`, background: notifChannel[id] ? 'rgba(29,158,117,0.07)' : 'var(--sa-surface)', fontSize: 13, userSelect: 'none' }}>
      <input type="checkbox" checked={notifChannel[id]} onChange={(e) => setNotifChannel((prev) => ({ ...prev, [id]: e.target.checked }))} style={{ accentColor: 'var(--sa-teal)', width: 14, height: 14 }} />
      {emoji} {label}
    </label>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Notifications</div>
        <div className="page-sub">Compose and manage notifications for your students</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['📤 Sent',        sentList.length,                                    ''],
          ['👥 Total Reach', sentList.reduce((s, n) => s + n.reach, 0).toLocaleString(), 'across all notifications'],
          ['🔴 Alerts',      sentList.filter((n) => n.type === 'alert').length,  'high priority'],
          ['🕐 Scheduled',   2,                                                  'pending dispatch'],
        ].map(([label, val, sub]) => (
          <div className="metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{val}</div>
            {sub && <div className="metric-sub">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="tab-group" style={{ marginBottom: 16 }}>
        {['✏️ Compose', '📬 Sent / History'].map((label, i) => (
          <button key={i} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{label}</button>
        ))}
      </div>

      {/* ════ TAB 0 – COMPOSE ════ */}
      {activeTab === 0 && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div className="card-title">New Notification</div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(TYPE_META).map(([key, m]) => (
                    <button key={key} onClick={() => setNotifType(key)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${notifType === key ? m.color : 'var(--sa-border)'}`, background: notifType === key ? m.bg : 'var(--sa-surface)', color: notifType === key ? m.color : 'var(--sa-muted)', fontWeight: notifType === key ? 600 : 400 }}>{m.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Audience *</label>
                <select className="form-input" value={notifAudience} onChange={(e) => setNotifAudience(e.target.value)}>
                  <option value="">Select audience…</option>
                  <option value="All Students">👥 All Students (305)</option>
                  {COURSE_LIST.map((c) => <option key={c.id} value={c.label}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="e.g. Assignment Due Reminder" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} maxLength={80} />
                <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 4, textAlign: 'right' }}>{notifTitle.length}/80</div>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-input" rows={4} placeholder="Write your message to students…" value={notifBody} onChange={(e) => setNotifBody(e.target.value)} maxLength={300} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ fontSize: 11, color: bodyColor, marginTop: 4, textAlign: 'right' }}>{bodyLen}/300</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Delivery Channels</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ChannelToggle id="inApp" label="In-App Notification" emoji="🔔" />
                <ChannelToggle id="email" label="Email"               emoji="📧" />
                <ChannelToggle id="sms"   label="SMS"                 emoji="📱" />
              </div>
            </div>

            <div className="card">
              <div className="card-title">Schedule</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[['now', '⚡ Send Now'], ['later', '🕐 Schedule']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setScheduleMode(val)} style={{ flex: 1, fontSize: 12, padding: '7px 0', border: `1px solid ${scheduleMode === val ? 'var(--sa-teal)' : 'var(--sa-border)'}`, borderRadius: 'var(--border-radius-md)', cursor: 'pointer', background: scheduleMode === val ? 'rgba(29,158,117,0.08)' : 'var(--sa-surface)', color: scheduleMode === val ? 'var(--sa-teal)' : 'var(--sa-muted)', fontWeight: scheduleMode === val ? 600 : 400 }}>{lbl}</button>
                ))}
              </div>
              {scheduleMode === 'later' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Date & Time</label>
                  <input className="form-input" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="action-btn" style={{ flex: 1 }} onClick={() => setPreviewOpen(true)} disabled={!notifTitle && !notifBody}>👁️ Preview</button>
              <button className="action-btn accent" style={{ flex: 2 }} onClick={handleSend} disabled={sending}>
                {sending ? '⏳ Sending…' : scheduleMode === 'now' ? '🔔 Send Now' : '🕐 Schedule'}
              </button>
            </div>
          </div>

          {/* Live preview card */}
          <div className="card" style={{ position: 'sticky', top: 16 }}>
            <div className="card-title">Live Preview</div>
            <div style={{ border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
              <div style={{ background: TYPE_META[notifType]?.bg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: TYPE_META[notifType]?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', flexShrink: 0 }}>🔔</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: TYPE_META[notifType]?.color }}>{notifTitle || 'Notification Title'}</div>
                  <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 2 }}>To: {notifAudience || 'Select audience'} · {scheduleMode === 'now' ? 'Now' : scheduledAt || 'Scheduled'}</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--sa-text)', lineHeight: 1.6, minHeight: 60 }}>
                {notifBody || <span style={{ color: 'var(--sa-muted)' }}>Your message will appear here…</span>}
              </div>
              <div style={{ borderTop: '1px solid var(--sa-border)', padding: '8px 14px', display: 'flex', gap: 8, fontSize: 11, color: 'var(--sa-muted)' }}>
                {notifChannel.inApp && <span>🔔 In-App</span>}
                {notifChannel.email && <span>📧 Email</span>}
                {notifChannel.sms   && <span>📱 SMS</span>}
                {!notifChannel.inApp && !notifChannel.email && !notifChannel.sms && <span style={{ color: '#A32D2D' }}>⚠️ No channel selected</span>}
              </div>
            </div>
            {notifAudience && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--sa-surface)', borderRadius: 'var(--border-radius-md)', fontSize: 12, color: 'var(--sa-muted)' }}>
                👥 Estimated reach: <strong style={{ color: 'var(--sa-text)' }}>{audienceReach(notifAudience).toLocaleString()} students</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ TAB 1 – SENT ════ */}
      {activeTab === 1 && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['all', 'All'], ...Object.entries(TYPE_META).map(([k, m]) => [k, m.label])].map(([key, label]) => (
                <button key={key} onClick={() => setTypeFilter(key)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: '0.5px solid var(--sa-border)', background: typeFilter === key ? 'var(--sa-teal)' : 'var(--sa-surface)', color: typeFilter === key ? '#fff' : 'var(--sa-text)', fontWeight: typeFilter === key ? 600 : 400 }}>
                  {label} {key !== 'all' && `(${sentList.filter((n) => n.type === key).length})`}
                </button>
              ))}
            </div>
            <input className="form-input" placeholder="🔍 Search notifications…" style={{ flex: 1, minWidth: 180, fontSize: 12 }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <span style={{ fontSize: 12, color: 'var(--sa-muted)' }}>{filteredSent.length} result{filteredSent.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredSent.length === 0 ? (
            <div className="card" style={{ color: 'var(--sa-muted)', fontSize: 13, padding: '16px' }}>No notifications match the current filters.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredSent.map((n) => (
                <div key={n.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: TYPE_META[n.type]?.bg || '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {n.type === 'announcement' ? '📢' : n.type === 'reminder' ? '⏰' : n.type === 'alert' ? '🚨' : '💬'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</span>
                      <TypeBadge type={n.type} />
                      {n.scheduled && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#E6F1FB', color: '#185FA5' }}>🕐 Scheduled</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginBottom: 6, lineHeight: 1.5 }}>{n.body}</div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--sa-muted)', flexWrap: 'wrap' }}>
                      <span>📅 {n.sentAt}</span>
                      <span>👥 {n.audience}</span>
                      <span>📨 {n.reach.toLocaleString()} reached</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleResend(n)} title="Resend / clone">🔁</button>
                    <button className="action-btn" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--sa-accent)' }} onClick={() => handleDelete(n.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}>
          <div style={{ background: 'var(--sa-card)', border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-lg)', padding: 24, width: 420, maxWidth: '90vw' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Notification Preview</div>
            <div style={{ border: '1px solid var(--sa-border)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ background: TYPE_META[notifType]?.bg, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: TYPE_META[notifType]?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, flexShrink: 0 }}>🔔</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: TYPE_META[notifType]?.color }}>{notifTitle || '(No title)'}</div>
                  <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginTop: 2 }}>{notifAudience || 'No audience'} · {scheduleMode === 'now' ? 'Sends immediately' : scheduledAt || 'Not scheduled'}</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px', fontSize: 13, lineHeight: 1.65 }}>{notifBody || <span style={{ color: 'var(--sa-muted)' }}>(No message)</span>}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--sa-muted)', marginBottom: 16 }}>
              Channels: {[notifChannel.inApp && '🔔 In-App', notifChannel.email && '📧 Email', notifChannel.sms && '📱 SMS'].filter(Boolean).join(', ') || '⚠️ None selected'}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="action-btn" onClick={() => setPreviewOpen(false)}>Close</button>
              <button className="action-btn accent" onClick={() => { setPreviewOpen(false); handleSend(); }} disabled={sending}>
                {scheduleMode === 'now' ? '🔔 Send Now' : '🕐 Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}