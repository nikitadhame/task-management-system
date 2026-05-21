const taskList = document.getElementById("taskList");

function createProject() {
  const title = document.getElementById("projectTitle").value;
  const desc = document.getElementById("projectDesc").value;

  if (!title || !desc) {
    alert("Please fill all fields");
    return;
  }

  alert(`Project Created: ${title}`);
}

function addTask() {
  const title = document.getElementById("taskTitle").value;
  const status = document.getElementById("taskStatus").value;

  if (!title) {
    alert("Enter task title");
    return;
  }
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${title}</strong><br>
    Status: ${status}
  `;

  taskList.appendChild(li);

  document.getElementById("taskTitle").value = "";
}