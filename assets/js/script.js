/* ========= PAGE PROTECTION ========= */
(function protectPage() {

    const role = localStorage.getItem("role");
    const currentPage = window.location.pathname.split("/").pop();

    // Pages that don't require login
    const publicPages = ["login.html", "index.html", ""];

    if (!role && !publicPages.includes(currentPage)) {
        window.location.href = "login.html";
    }

})();

/* ===== INDEX PAGE REDIRECT ===== */
function autoRedirect() {
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

/* ========= LOGOUT ========= */
function logout() {

    // Clear all stored data
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("full_name");

    // Call backend logout API
    fetch("http://localhost:3000/api/auth/logout", {
        method: "POST"
    })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(err => {
            console.log("Logout API error");
        })
        .finally(() => {
            // Always redirect to login
            window.location.href = "login.html";
        });
}



function apply() {
    window.location.href = 'application.html';
}

function nqttraining() {
    window.location.href = 'nqt_training.html';
}

function training() {
    window.location.href = 'training.html';
}

function instruction() {
    window.location.href = 'instruction.html';
}

function dashboard() {
    window.location.href = 'dashboard.html';
}

function toggleProfileMenu() {
    document.getElementById("profileMenu").classList.toggle("show");
}

// Close menu when clicking outside
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
        const res = await fetch(
            `http://localhost:3000/api/exam/profile?email=${email}`
        );

        const data = await res.json();

        console.log(data, "data");


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
        pwd.type = "password"; // force hide before submit
    }
}


// ==========================
// TOGGLE LOGIN / SIGNUP UI
// ==========================
function showSignup() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("signupForm").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

// ==========================
// PASSWORD VISIBILITY TOGGLE
// ==========================
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
}

// ==========================
// SIGNUP FUNCTION
// ==========================

function signupUser(event) {
    console.log("signup script");

    event.preventDefault();

    const inputs = document.querySelectorAll("#signupForm input");

    const data = {
        fullName: inputs[0].value,
        dob: inputs[1].value,
        email: inputs[2].value,
        mobile: inputs[3].value,
        password: inputs[4].value
    };

    console.log("signup data", data);


    fetch("http://localhost:3000/api/auth/signup", {
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

// ==========================
// LOGIN FUNCTION
// ==========================
function loginRedirect(event) {
    event.preventDefault();

    const email = document.querySelector("#loginForm input[type=email]").value;
    const password = document.getElementById("loginPassword").value;

    fetch("http://localhost:3000/api/auth/login", {
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

    fetch("http://localhost:3000/api/application/apply", {
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

    console.log('roleeeeeeeeee', role);


    const addCourseLink = document.getElementById("addCourseLink");

    // Hide by default
    if (addCourseLink) {
        addCourseLink.style.display = "none";
        console.log('Nooooooooooo');

    }

    // Show only for admin
    if (role === "admin" && addCourseLink) {
        addCourseLink.style.display = "block";
        console.log('yesssssssss');

    }

});