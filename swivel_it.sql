BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    dob VARCHAR(50) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'trainer', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    fee NUMERIC(10,2),
    trainer_name VARCHAR(100),
    trainer_email VARCHAR(150),
    gmeet_link TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enquiries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enquiry_status VARCHAR(20) DEFAULT 'pending' CHECK (enquiry_status IN ('pending', 'approved', 'rejected')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    enquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS exam_applications (
    id BIGSERIAL PRIMARY KEY,
    user_email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(15) NOT NULL,
    whatsapp VARCHAR(15),
    college VARCHAR(200),
    qualification VARCHAR(100),
    passed_out_year INTEGER CHECK (passed_out_year BETWEEN 1900 AND 2100),
    district VARCHAR(100),
    pincode VARCHAR(10),
    reference_name VARCHAR(150),
    address TEXT,
    course_name VARCHAR(150),
    fees NUMERIC(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id BIGSERIAL PRIMARY KEY,
    exam_attempt_id BIGINT NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    nqt_id VARCHAR(50),
    role VARCHAR(50),
    total_questions INTEGER DEFAULT 0,
    attempted_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    exam_status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (exam_status IN ('IN_PROGRESS', 'COMPLETED', 'TERMINATED')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_violations (
    id BIGSERIAL PRIMARY KEY,
    exam_attempt_id BIGINT NOT NULL UNIQUE REFERENCES exam_attempts(id) ON DELETE CASCADE,
    user_email VARCHAR(150),
    full_name VARCHAR(150),
    nqt_id VARCHAR(50),
    violation_count INTEGER DEFAULT 1,
    violation_types TEXT,
    last_violation_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nqt_training_videos (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_videos (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_email ON exam_attempts(user_email);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_status ON exam_attempts(exam_status);
CREATE INDEX IF NOT EXISTS idx_course_videos_course_name ON course_videos(course_name);

INSERT INTO users (
    id, full_name, email, dob, mobile, password, role, status, created_at
) VALUES (
    3,
    'Santhiya',
    'santhiya1813@gmail.com',
    '2026-03-11',
    '9080642054',
    '$2b$10$/T3s9k2o338UYfcKnJLp0e00deXmbMnZg1Yg/hwJJuaOdvc475O4m',
    'trainer',
    'active',
    '2026-03-13 05:34:01+00'
)
ON CONFLICT DO NOTHING;

INSERT INTO exam_applications (
    id, user_email, full_name, age, gender, phone, whatsapp, college,
    qualification, passed_out_year, district, pincode, reference_name,
    address, course_name, fees, payment_status, created_at
) VALUES (
    1,
    'santhiya1813@gmail.com',
    'Santhiya M',
    25,
    'Female',
    '9080642054',
    '9080642054',
    'Vels university',
    'BE',
    2022,
    'Chennai',
    '600078',
    '',
    'No.13 gandhi st , choolaipallam , M.G.R nagar chennai-78',
    'NQT Exam',
    1000.00,
    'pending',
    '2026-03-13 05:47:33+00'
)
ON CONFLICT DO NOTHING;

INSERT INTO exam_attempts (
    id, exam_attempt_id, user_email, full_name, nqt_id, role,
    total_questions, attempted_questions, correct_answers, score,
    exam_status, started_at, ended_at, created_at
) VALUES (
    1,
    3,
    'santhiya1813@gmail.com',
    'Santhiya M',
    NULL,
    'CANDIDATE',
    5,
    5,
    3,
    3,
    'COMPLETED',
    '2026-03-13 13:01:46+00',
    '2026-03-13 13:02:02+00',
    '2026-03-13 07:31:46+00'
)
ON CONFLICT DO NOTHING;

INSERT INTO exam_violations (
    id, exam_attempt_id, user_email, full_name, nqt_id,
    violation_count, violation_types, last_violation_at, created_at
) VALUES (
    1,
    1,
    'santhiya1813@gmail.com',
    'Santhiya M',
    NULL,
    1,
    'Face not detected',
    '2026-03-13 13:02:00+00',
    '2026-03-13 07:32:00+00'
)
ON CONFLICT DO NOTHING;

INSERT INTO nqt_training_videos (
    id, title, video_url, created_at
) VALUES (
    1,
    'Day 1',
    'assets/videos/1773391827172_Swivel IT _ Login & Signup - Screencastify - February 18, 2026 10_36 AM.webm',
    '2026-03-13 08:50:27+00'
)
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval(pg_get_serial_sequence('courses', 'id'), COALESCE((SELECT MAX(id) FROM courses), 1), true);
SELECT setval(pg_get_serial_sequence('course_enquiries', 'id'), COALESCE((SELECT MAX(id) FROM course_enquiries), 1), true);
SELECT setval(pg_get_serial_sequence('exam_applications', 'id'), COALESCE((SELECT MAX(id) FROM exam_applications), 1), true);
SELECT setval(pg_get_serial_sequence('exam_attempts', 'id'), COALESCE((SELECT MAX(id) FROM exam_attempts), 1), true);
SELECT setval(pg_get_serial_sequence('exam_violations', 'id'), COALESCE((SELECT MAX(id) FROM exam_violations), 1), true);
SELECT setval(pg_get_serial_sequence('nqt_training_videos', 'id'), COALESCE((SELECT MAX(id) FROM nqt_training_videos), 1), true);
SELECT setval(pg_get_serial_sequence('course_videos', 'id'), COALESCE((SELECT MAX(id) FROM course_videos), 1), true);

COMMIT;