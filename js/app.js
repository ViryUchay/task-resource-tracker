// ============================================================================
// TASK & RESOURCE TRACKER - MULTI-PAGE APPLICATION ENGINE
// Author: Vivian Eze
// ============================================================================

/**
 * Global Application State loaded from Browser LocalStorage.
 */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let resources = JSON.parse(localStorage.getItem("resources")) || [];

/**
 * Escapes dynamic string inputs to prevent Cross-Site Scripting (XSS) vulnerabilities.
 * @param {string} str - Raw user input text.
 * @returns {string} Sanitized HTML-safe string.
 */
function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Validates and formats URLs to ensure a proper HTTP/HTTPS scheme.
 * @param {string} url - Unformatted user-entered URL.
 * @returns {string} Fully qualified web URL.
 */
function sanitizeURL(url) {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
}

/**
 * Persists current task array state to localStorage.
 */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Persists current resource array state to localStorage.
 */
function saveResources() {
    localStorage.setItem("resources", JSON.stringify(resources));
}

/**
 * Recalculates metrics and updates the Overview Dashboard elements if present on page.
 */
function updateDashboard() {
    const totalTasksEl = document.querySelector("#total-tasks");
    const completedTasksEl = document.querySelector("#completed-tasks");
    const pendingTasksEl = document.querySelector("#pending-tasks");
    const totalResourcesEl = document.querySelector("#total-resources");
    const summaryContainer = document.querySelector("#summary-content");

    if (!totalTasksEl || !completedTasksEl || !pendingTasksEl || !totalResourcesEl) {
        return;
    }

    const total = tasks.length;
    const completed = tasks.filter(task => task.completed === true).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    totalResourcesEl.textContent = resources.length;

    if (summaryContainer) {
        renderDashboardSummary(summaryContainer);
    }
}

/**
 * Renders a combined recent summary list on the Index/Dashboard page.
 * @param {HTMLElement} container - The DOM container element to display summary cards.
 */
function renderDashboardSummary(container) {
    container.innerHTML = "";

    const recentTasks = tasks.slice(-3).reverse();
    const recentResources = resources.slice(-3).reverse();

    if (recentTasks.length === 0 && recentResources.length === 0) {
        container.innerHTML = '<p class="empty-message">No activity recorded yet. Add tasks or resources to view summaries.</p>';
        return;
    }

    recentTasks.forEach(task => {
        const card = document.createElement("article");
        card.classList.add("card");
        card.innerHTML = `
            <h3>Task: ${escapeHTML(task.name)}</h3>
            <p>Category: ${escapeHTML(task.category)}</p>
            <p>Status: <strong>${task.completed ? "Completed" : "Pending"}</strong></p>
        `;
        container.appendChild(card);
    });

    recentResources.forEach(res => {
        const card = document.createElement("article");
        card.classList.add("card");
        card.innerHTML = `
            <h3>Resource: ${escapeHTML(res.name)}</h3>
            <p>Category: ${escapeHTML(res.category)}</p>
            <a href="${escapeHTML(sanitizeURL(res.url))}" target="_blank" rel="noopener noreferrer" class="resource-link">Visit Link</a>
        `;
        container.appendChild(card);
    });
}

/**
 * Filters and renders tasks into the DOM on the tasks.html page.
 */
function displayTasks() {
    const taskList = document.querySelector("#task-list");
    const categoryFilter = document.querySelector("#category-filter");
    const taskSearch = document.querySelector("#task-search");

    if (!taskList || !categoryFilter || !taskSearch) return;

    taskList.innerHTML = "";
    const selectedCategory = categoryFilter.value;
    const searchText = taskSearch.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {
        const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
        const matchesSearch = task.name.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p class="empty-message">No matching tasks found.</p>';
        return;
    }

    filteredTasks.forEach(task => {
        const taskCard = document.createElement("article");
        taskCard.classList.add("card");
        if (task.completed) taskCard.classList.add("completed");

        taskCard.innerHTML = `
            <h3>${escapeHTML(task.name)}</h3>
            <p>Category: ${escapeHTML(task.category)}</p>
            <p>Status: ${task.completed ? "Completed" : "Not completed"}</p>
            <div class="card-actions">
                <button class="complete-button" data-id="${task.id}">
                    ${task.completed ? "Mark Incomplete" : "Mark Complete"}
                </button>
                <button class="delete-button" data-id="${task.id}">Delete</button>
            </div>
        `;
        taskList.appendChild(taskCard);
    });
}

/**
 * Handles the creation and storage of a new task item.
 * @param {Event} event - HTML Form submission event object.
 */
function handleAddTask(event) {
    event.preventDefault();
    const taskName = document.querySelector("#task-name");
    const taskCategory = document.querySelector("#task-category");

    const newTask = {
        id: Date.now(),
        name: taskName.value.trim(),
        category: taskCategory.value,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    displayTasks();
    updateDashboard();

    event.target.reset();
}

/**
 * Handles event delegation for task status toggles and deletions.
 * @param {Event} event - DOM click event object.
 */
function handleTaskActions(event) {
    const taskId = Number(event.target.dataset.id);
    if (!taskId) return;

    if (event.target.classList.contains("delete-button")) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        displayTasks();
        updateDashboard();
    }

    if (event.target.classList.contains("complete-button")) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
        }
        saveTasks();
        displayTasks();
        updateDashboard();
    }
}

/**
 * Filters and renders learning resources into the DOM on the resources.html page.
 */
function displayResources() {
    const resourceList = document.querySelector("#resource-list");
    const resourceFilter = document.querySelector("#resource-filter");
    const resourceSearch = document.querySelector("#resource-search");

    if (!resourceList || !resourceFilter || !resourceSearch) return;

    resourceList.innerHTML = "";
    const selectedCategory = resourceFilter.value;
    const searchText = resourceSearch.value.toLowerCase().trim();

    const filteredResources = resources.filter(resource => {
        const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
        const matchesSearch = resource.name.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });

    if (filteredResources.length === 0) {
        resourceList.innerHTML = '<p class="empty-message">No matching resources found.</p>';
        return;
    }

    filteredResources.forEach(resource => {
        const resourceCard = document.createElement("article");
        resourceCard.classList.add("card");

        resourceCard.innerHTML = `
            <h3>${escapeHTML(resource.name)}</h3>
            <p>Category: ${escapeHTML(resource.category)}</p>
            <a class="resource-link" href="${escapeHTML(sanitizeURL(resource.url))}" target="_blank" rel="noopener noreferrer">
                Visit Resource
            </a>
            <div class="card-actions">
                <button class="delete-button" data-id="${resource.id}">Delete</button>
            </div>
        `;
        resourceList.appendChild(resourceCard);
    });
}

/**
 * Handles the creation and storage of a new resource item.
 * @param {Event} event - HTML Form submission event object.
 */
function handleAddResource(event) {
    event.preventDefault();
    const resourceName = document.querySelector("#resource-name");
    const resourceUrl = document.querySelector("#resource-url");
    const resourceCategory = document.querySelector("#resource-category");

    const newResource = {
        id: Date.now(),
        name: resourceName.value.trim(),
        url: resourceUrl.value.trim(),
        category: resourceCategory.value
    };

    resources.push(newResource);
    saveResources();
    displayResources();
    updateDashboard();

    event.target.reset();
}

/**
 * Handles event delegation for resource deletions.
 * @param {Event} event - DOM click event object.
 */
function handleResourceActions(event) {
    const resourceId = Number(event.target.dataset.id);
    if (!resourceId) return;

    if (event.target.classList.contains("delete-button")) {
        resources = resources.filter(resource => resource.id !== resourceId);
        saveResources();
        displayResources();
        updateDashboard();
    }
}

/**
 * Initializes application event listeners and page content upon DOM loading completion.
 */
function initApp() {
    // Task Page Binding
    const taskForm = document.querySelector("#task-form");
    const taskList = document.querySelector("#task-list");
    const taskSearch = document.querySelector("#task-search");
    const categoryFilter = document.querySelector("#category-filter");

    if (taskForm) taskForm.addEventListener("submit", handleAddTask);
    if (taskList) taskList.addEventListener("click", handleTaskActions);
    if (taskSearch) taskSearch.addEventListener("input", displayTasks);
    if (categoryFilter) categoryFilter.addEventListener("change", displayTasks);

    // Resource Page Binding
    const resourceForm = document.querySelector("#resource-form");
    const resourceList = document.querySelector("#resource-list");
    const resourceSearch = document.querySelector("#resource-search");
    const resourceFilter = document.querySelector("#resource-filter");

    if (resourceForm) resourceForm.addEventListener("submit", handleAddResource);
    if (resourceList) resourceList.addEventListener("click", handleResourceActions);
    if (resourceSearch) resourceSearch.addEventListener("input", displayResources);
    if (resourceFilter) resourceFilter.addEventListener("change", displayResources);

    // Initial state rendering
    updateDashboard();
    displayTasks();
    displayResources();
}

// Attach application entry point listener
document.addEventListener("DOMContentLoaded", initApp);