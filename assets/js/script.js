/* ========= PAGE PROTECTION ========= */
(function protectPage() {
    const role = localStorage.getItem("role");
    const currentPage = window.location.pathname.split("/").pop();

    const publicPages = ["login.html", "index.html", ""];

    if (!role && !publicPages.includes(currentPage)) {
        window.location.href = "login.html";
    }
})();

const API_BASE = window.location.origin;

/* ===== INDEX PAGE REDIRECT ===== */
function autoRedirect() {
    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
}

/* ========= LOGOUT ========= */
function logout() {
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("full_name");
    localStorage.removeItem("user_id");

    fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST"
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(() => {
            console.log("Logout API error");
        })
        .finally(() => {
            window.location.href = "login.html";
        });
}

function apply() {
    window.location.href = "application.html";
}

function nqttraining() {
    window.location.href = "nqt_training.html";
}

function training() {
    window.location.href = "training.html";
}

function instruction() {
    window.location.href = "instruction.html";
}

function dashboard() {
    window.location.href = "dashboard.html";
}

function toggleProfileMenu() {
    document.getElementById("profileMenu").classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", async function () {
    const email = localStorage.getItem("email");
    const fullName = localStorage.getItem("full_name");

    if (!email) return;

    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");
    const scoreEl = document.getElementById("profileScore");

    if (nameEl && fullName) nameEl.textContent = fullName;
    if (emailEl) emailEl.textContent = email;

    try {
        const res = await fetch(`${API_BASE}/api/exam/profile?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (data && data.score !== null && scoreEl) {
            scoreEl.style.display = "block";
            scoreEl.textContent = `Score ${data.score}/${data.total}`;
        }
    } catch (err) {
        console.log("Profile load error", err);
    }
});

function hidePasswordBeforeSubmit() {
    const pwd = document.getElementById("loginPassword");
    if (pwd) {
        pwd.type = "password";
    }
}

function showSignup() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("signupForm").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
}

function signupUser(event) {
    event.preventDefault();

    const inputs = document.querySelectorAll("#signupForm input");

    const data = {
        fullName: inputs[0].value,
        dob: inputs[1].value,
        email: inputs[2].value,
        mobile: inputs[3].value,
        password: inputs[4].value
    };

    fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => {
            alert(res.message);
            showLogin();
        })
        .catch(() => alert("Signup failed"));
}

function loginRedirect(event) {
    event.preventDefault();

    const email = document.querySelector("#loginForm input[type=email]").value;
    const password = document.getElementById("loginPassword").value;

    fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(res => {
            if (res.message === "Login successful") {
                localStorage.setItem("role", res.role);
                localStorage.setItem("email", res.email);
                localStorage.setItem("full_name", res.full_name);
                localStorage.setItem("user_id", res.user_id);
                window.location.href = "dashboard.html";
            } else {
                alert(res.message);
            }
        })
        .catch(() => alert("Login failed"));
}

function examApplication(event) {
    event.preventDefault();

    const inputs = event.target.querySelectorAll("input, select, textarea");

    const data = {
        fullName: inputs[0].value,
        age: inputs[1].value,
        gender: inputs[2].value,
        email: inputs[3].value,
        phone: inputs[4].value,
        whatsapp: inputs[5].value,
        college: inputs[6].value,
        qualification: inputs[7].value,
        passedOutYear: inputs[8].value,
        district: inputs[9].value,
        pincode: inputs[10].value,
        reference: inputs[11].value,
        address: inputs[12].value
    };

    fetch(`${API_BASE}/api/application/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => {
            alert(res.message);
            window.location.href = "/dashboard";
        })
        .catch(() => alert("Application submission failed"));
}

document.addEventListener("DOMContentLoaded", function () {
    const role = localStorage.getItem("role");
    const addCourseLink = document.getElementById("addCourseLink");

    if (addCourseLink) {
        addCourseLink.style.display = "none";
    }

    if (role === "admin" && addCourseLink) {
        addCourseLink.style.display = "block";
    }
});