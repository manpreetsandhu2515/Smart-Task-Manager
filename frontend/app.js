const API_BASE = "http://127.0.0.1:8000";
const authSection = document.querySelector(".auth");
const dashboard = document.getElementById("dashboard");
const userEmailLabel = document.getElementById("user-email");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const taskForm = document.getElementById("task-form");
const tasksContainer = document.getElementById("tasks");
const filterButton = document.getElementById("filter-button");

const tokenKey = "task_manager_token";

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toISODateTime(value) {
  return value ? new Date(value).toISOString() : null;
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...authHeader(), ...(options.headers || {}) };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || response.statusText);
  }
  return response.status === 204 ? null : response.json();
}

function showDashboard(userEmail) {
  authSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  userEmailLabel.textContent = userEmail;
  loadTasks();
}

function showAuth() {
  authSection.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

async function loadTasks() {
  const priority = document.getElementById("filter-priority").value;
  const status = document.getElementById("filter-status").value;
  const dueBefore = document.getElementById("filter-before").value;
  const dueAfter = document.getElementById("filter-after").value;
  const query = new URLSearchParams();

  if (priority) query.set("priority", priority);
  if (status) query.set("completed", status);
  if (dueBefore) query.set("due_before", new Date(dueBefore).toISOString());
  if (dueAfter) query.set("due_after", new Date(dueAfter).toISOString());

  const tasks = await api(`/tasks/?${query.toString()}`);
  tasksContainer.innerHTML = tasks.map(renderTaskCard).join("");
}

function renderTaskCard(task) {
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleString() : "No due date";
  return `
    <div class="task-card">
      <h3>${task.title}</h3>
      <p>${task.description || "No description"}</p>
      <div class="task-meta">
        <span>Priority: ${task.priority}</span>
        <span>Status: ${task.completed ? "Completed" : "Open"}</span>
        <span>Due: ${dueDate}</span>
      </div>
      <div class="task-actions">
        <button class="small-btn" onclick="toggleComplete(${task.id}, ${task.completed})">
          ${task.completed ? "Mark Open" : "Mark Done"}
        </button>
        <button class="small-btn danger" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `;
}

window.toggleComplete = async function (taskId, completed) {
  await api(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ completed: !completed }),
  });
  await loadTasks();
};

window.deleteTask = async function (taskId) {
  if (!confirm("Delete this task?")) return;
  await api(`/tasks/${taskId}`, { method: "DELETE" });
  await loadTasks();
};

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  await api("/users/register", { method: "POST", body: JSON.stringify({ email, password }) });
  alert("Registration successful. Please login.");
  registerForm.reset();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  const data = await api("/users/login", {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  setToken(data.access_token);
  showDashboard(email);
  loginForm.reset();
});

logoutButton.addEventListener("click", () => {
  clearToken();
  showAuth();
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const priority = document.getElementById("task-priority").value;
  const dueDate = toISODateTime(document.getElementById("task-due-date").value);
  await api("/tasks/", {
    method: "POST",
    body: JSON.stringify({ title, description, priority, due_date: dueDate }),
  });
  taskForm.reset();
  await loadTasks();
});

filterButton.addEventListener("click", async () => loadTasks());

(async function init() {
  const token = getToken();
  if (!token) return;

  try {
    const user = await api("/users/me");
    showDashboard(user.email);
  } catch (error) {
    clearToken();
    showAuth();
  }
})();
