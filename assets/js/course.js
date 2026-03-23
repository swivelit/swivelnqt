const table = document.getElementById("courseTable");

/* LOAD COURSES */

function loadCourses() {

    fetch("/api/course")
        .then(res => res.json())
        .then(data => {

            console.log(data, "data"); // debug

            table.innerHTML = "";

            data.forEach(c => {

                table.innerHTML += `
                <tr>
                <td>${c.id}</td>
                <td>${c.course_name}</td>
                <td>${c.duration}</td>
                <td>${c.fee}</td>
                <td>${c.trainer_name}</td>
                <td>${c.gmeet_link}</td>
                <td>${c.status}</td>

                <td>
                <button onclick="deleteCourse(${c.id})" class="btn btn-danger btn-sm">
                Delete
                </button>
                </td>

                </tr>
                `;

            });

        })
        .catch(err => console.error(err));
}

loadCourses();

/* ADD COURSE */

document.getElementById("courseForm").addEventListener("submit", e => {

    e.preventDefault();

    fetch("/api/course/add", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            course_name: course_name.value,
            description: description.value,
            duration: duration.value,
            fee: fee.value,
            trainer_name: trainer_name.value,
            trainer_email: trainer_email.value,
            gmeet_link: gmeet_link.value,
            status: status.value

        })

    })

        .then(res => res.json())
        .then(data => {

            alert(data.message);

            loadCourses();

        });

});

/* DELETE */

function deleteCourse(id) {

    fetch("/api/course/delete/" + id, {
        method: "DELETE"
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadCourses();
        });

}