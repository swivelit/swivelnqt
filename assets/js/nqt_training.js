const role = localStorage.getItem("role"); // student | trainer | admin
console.log(role, "roleeeeeee");

const uploadSection = document.getElementById("trainerUploadSection");
const videosContainer = document.getElementById("videosContainer");

if (role === "student" && uploadSection) {
    uploadSection.style.display = "none";
}

// 🔹 Fetch videos
fetch("/api/training/videos")
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

// 🔹 Upload
document.getElementById("uploadForm")?.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("video", document.getElementById("video").files[0]);
    formData.append("role", role);

    fetch("/api/training/upload", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            location.reload();
        });
});