let selectedCourse = null;

document.addEventListener("DOMContentLoaded", function () {

    const enquirySection = document.getElementById("enquirySection");
    const trainingSection = document.getElementById("trainingSection");

    const courseSelect = document.getElementById("courseSelect");

    const courseDetails = document.getElementById("courseDetails");
    const trainerName = document.getElementById("trainerName");
    const trainerEmail = document.getElementById("trainerEmail");
    const courseFee = document.getElementById("courseFee");

    const meetLink = document.getElementById("meetLink");
    const videosContainer = document.getElementById("videosContainer");

    const user_id = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    let coursesData = [];
    let studentCourseName = null;

    /* ================= ROLE UI ================= */
    if (role === "trainer" || role === "admin") {
        addUploadSection(); // show upload
    }

    /* ================= CHECK ENQUIRY ================= */
    if (user_id) {
        fetch(`http://localhost:3000/api/enquiry/user/${user_id}`)
            .then(res => res.json())
            .then(data => {

                if (data.length > 0) {

                    enquirySection.classList.add("d-none");
                    trainingSection.classList.remove("d-none");

                    studentCourseName = data[0].course_name;
                    meetLink.href = data[0].gmeet_link;

                    loadVideos(studentCourseName); // ✅ load student videos
                } else {
                    enquirySection.classList.remove("d-none");
                }

            })
            .catch(() => enquirySection.classList.remove("d-none"));
    }

    /* ================= LOAD COURSES ================= */
    fetch("http://localhost:3000/api/course")
        .then(res => res.json())
        .then(data => {

            coursesData = data;

            data.forEach(course => {
                courseSelect.innerHTML += `
                    <option value="${course.id}">
                        ${course.course_name}
                    </option>
                `;
            });

        });

    /* ================= SHOW DETAILS ================= */
    courseSelect.addEventListener("change", function () {

        const selectedId = this.value;

        selectedCourse = coursesData.find(c => c.id == selectedId);

        if (selectedCourse) {

            trainerName.textContent = selectedCourse.trainer_name;
            trainerEmail.textContent = selectedCourse.trainer_email;
            courseFee.textContent = selectedCourse.fee;

            meetLink.href = selectedCourse.gmeet_link;

            courseDetails.classList.remove("d-none");
        }
    });

    /* ================= SUBMIT ENQUIRY ================= */
    document.getElementById("enquiryForm")
        ?.addEventListener("submit", function (e) {

            e.preventDefault();

            if (!selectedCourse) {
                alert("Select course");
                return;
            }

            fetch("http://localhost:3000/api/enquiry/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id,
                    course_id: selectedCourse.id,
                    course_name: selectedCourse.course_name
                })
            })
                .then(res => res.json())
                .then(data => {

                    alert(data.message);

                    if (data.message.includes("success")) {

                        enquirySection.classList.add("d-none");
                        trainingSection.classList.remove("d-none");

                        loadVideos(selectedCourse.course_name);
                    }

                });
        });

    /* ================= LOAD VIDEOS ================= */
    function loadVideos(courseName) {

        fetch(`/api/course-training/videos?course_name=${courseName}`)
            .then(res => res.json())
            .then(videos => {

                videosContainer.innerHTML = "";

                videos.forEach(v => {
                    videosContainer.innerHTML += `
                        <div class="col-md-4 mb-3">
                            <div class="card p-3">
                                <h6>${v.title}</h6>
                                <video src="${v.video_url}" controls class="w-100"></video>
                            </div>
                        </div>
                    `;
                });

            });
    }

    /* ================= UPLOAD UI ================= */
    function addUploadSection() {

        const trainingSection = document.getElementById("trainingSection");

        const uploadHTML = `
            <div class="card p-4 mb-4">
                <h4>🎬 Upload Session</h4>

                <form id="uploadForm">
                    <input type="text" id="videoTitle" class="form-control mb-2" placeholder="Title" required>
                    <input type="file" id="videoFile" class="form-control mb-2" accept="video/*" required>

                    <select id="courseUpload" class="form-control mb-2"></select>

                    <button class="btn btn-success w-100">Upload</button>
                </form>
            </div>
        `;

        trainingSection.insertAdjacentHTML("afterbegin", uploadHTML);

        // fill course dropdown
        fetch("http://localhost:3000/api/course")
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById("courseUpload");

                data.forEach(c => {
                    select.innerHTML += `
                        <option value="${c.course_name}">
                            ${c.course_name}
                        </option>
                    `;
                });
            });

        // upload handler
        // ================= UPLOAD =================
        document.getElementById("uploadForm")
            ?.addEventListener("submit", function (e) {

                e.preventDefault();

                const title = document.getElementById("videoTitle").value;
                const videoFile = document.getElementById("videoFile").files[0];
                const course_name = document.getElementById("courseUpload").value;
                const role = localStorage.getItem("role"); // ✅ IMPORTANT

                if (!title || !videoFile || !course_name) {
                    alert("All fields required");
                    return;
                }

                const formData = new FormData();
                formData.append("title", title);
                formData.append("video", videoFile);
                formData.append("course_name", course_name);
                formData.append("role", role); // ✅ MUST SEND

                fetch("http://localhost:3000/api/course-training/upload", {
                    method: "POST",
                    body: formData
                })
                    .then(res => res.json())
                    .then(data => {
                        alert(data.message);
                        location.reload();
                    })
                    .catch(() => alert("Upload failed"));
            });
    }

});