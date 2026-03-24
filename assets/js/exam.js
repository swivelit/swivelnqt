const API_BASE = window.location.origin;

let examStarted = false;
let violations = 0;
const MAX_VIOLATIONS = 3;

let current = 0;
let selected = null;
let score = 0;
let time = 3 * 60 * 60;

let examAttemptId = null;

const questions = Array.from({ length: 5 }, (_, i) => ({
    q: `Question ${i + 1}: What is ${i + 1} + ${i + 1}?`,
    options: [(i + 1) * 2, i + 1, i, i + 2].sort(() => Math.random() - 0.5),
    answer: (i + 1) * 2
}));

const camera = document.getElementById("camera");
const qCount = document.getElementById("qCount");
const question = document.getElementById("question");
const optionsDiv = document.getElementById("options");
const timerEl = document.getElementById("timer");
const violationCountEl = document.getElementById("violationCount");
const examSection = document.getElementById("examSection");
const finishSection = document.getElementById("finishSection");
const finalScoreEl = document.getElementById("finalScore");

let detectionInterval;

async function checkExamPermission() {
    const email = localStorage.getItem("email");

    if (!email) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/application/all`);
        const applications = await res.json();

        const allowed = applications.some(app => app.user_email === email);

        if (!allowed) {
            alert("❌ You have not applied for this exam");
            window.location.href = "dashboard.html";
            return;
        }

        startExam(email);
    } catch (err) {
        console.error(err);
        alert("Unable to verify exam permission");
    }
}

async function startExam(email) {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
            "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
        );
        await faceapi.nets.faceLandmark68Net.loadFromUri(
            "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
        );

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        camera.srcObject = stream;
        examStarted = true;

        stream.getVideoTracks()[0].onended = () => {
            if (examStarted) registerViolation("Camera turned OFF");
        };

        detectionInterval = setInterval(detectHeadTurn, 1000);

        const res = await fetch(`${API_BASE}/api/exam/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                total_questions: questions.length
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Exam not allowed");
            window.location.href = "dashboard.html";
            return;
        }

        examAttemptId = data.exam_attempt_id;

        loadQuestion();
        startTimer();
    } catch (err) {
        console.error(err);
        alert("Camera permission is required!");
    }
}

async function detectHeadTurn() {
    const detections = await faceapi
        .detectSingleFace(camera, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

    if (!detections) {
        registerViolation("Face not detected");
        return;
    }

    const landmarks = detections.landmarks;
    const nose = landmarks.getNose()[0];
    const leftEye = landmarks.getLeftEye()[0];
    const rightEye = landmarks.getRightEye()[3];

    const eyeDistance = rightEye.x - leftEye.x;
    const nosePosition = (nose.x - leftEye.x) / eyeDistance;

    if (nosePosition < 0.35 || nosePosition > 0.65) {
        registerViolation("Head turned left/right");
    }
}

function loadQuestion() {
    const q = questions[current];
    qCount.innerText = `Question ${current + 1} / ${questions.length}`;
    question.innerText = q.q;
    optionsDiv.innerHTML = "";

    q.options.forEach(opt => {
        const label = document.createElement("label");
        label.className = "option";
        label.innerHTML = `
            <input type="radio" name="opt" onclick="selectOption(this, ${opt})"> ${opt}
        `;
        optionsDiv.appendChild(label);
    });
}

function selectOption(el, val) {
    selected = val;
    document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
    el.parentElement.classList.add("selected");
}

function nextQuestion() {
    if (selected === questions[current].answer) score++;
    selected = null;
    current++;
    current >= questions.length ? finishExam() : loadQuestion();
}

function startTimer() {
    setInterval(() => {
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = time % 60;

        timerEl.innerText =
            `${String(h).padStart(2, "0")}:` +
            `${String(m).padStart(2, "0")}:` +
            `${String(s).padStart(2, "0")}`;

        time--;
        if (time < 0) finishExam();
    }, 1000);
}

function registerViolation(reason) {
    violations++;
    violationCountEl.innerText = `Violations: ${violations}/3`;

    const banner = document.createElement("div");
    banner.className = "violation-banner";
    banner.innerText = `Violation ${violations}/3: ${reason}`;
    document.querySelector(".proctor-box").appendChild(banner);

    setTimeout(() => banner.remove(), 3000);

    if (examAttemptId) {
        fetch(`${API_BASE}/api/exam/violation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                exam_attempt_id: examAttemptId,
                violation_type: reason
            })
        });
    }

    if (violations >= MAX_VIOLATIONS) terminateExam(reason);
}

function finishExam() {
    examStarted = false;
    examSection.style.display = "none";
    finishSection.style.display = "block";
    finalScoreEl.innerText = `${score} / ${questions.length}`;

    if (examAttemptId) {
        fetch(`${API_BASE}/api/exam/finish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                exam_attempt_id: examAttemptId,
                attempted: questions.length,
                correct: score,
                score
            })
        });
    }
}

function terminateExam(reason) {
    examStarted = false;
    clearInterval(detectionInterval);

    if (examAttemptId) {
        fetch(`${API_BASE}/api/exam/terminate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                exam_attempt_id: examAttemptId
            })
        });
    }

    document.body.innerHTML = `
        <div class="container text-center mt-5">
            <h2 class="text-danger">Exam Terminated</h2>
            <p>${reason}</p>
            <p>No re-attempt allowed</p>
        </div>
    `;
}

window.addEventListener("blur", () => {
    if (examStarted) registerViolation("Tab switched");
});