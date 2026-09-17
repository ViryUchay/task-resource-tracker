// ========================================
// TASK & RESOURCE TRACKER
// ========================================


// ========================================
// TASK ELEMENTS
// ========================================

const taskForm = document.querySelector("#task-form");
const taskName = document.querySelector("#task-name");
const taskCategory = document.querySelector("#task-category");
const taskList = document.querySelector("#task-list");
const categoryFilter = document.querySelector("#category-filter");
const taskSearch = document.querySelector("#task-search");


// ========================================
// RESOURCE ELEMENTS
// ========================================

const resourceForm = document.querySelector("#resource-form");
const resourceName = document.querySelector("#resource-name");
const resourceUrl = document.querySelector("#resource-url");
const resourceCategory = document.querySelector("#resource-category");
const resourceList = document.querySelector("#resource-list");
const resourceFilter = document.querySelector("#resource-filter");
const resourceSearch = document.querySelector("#resource-search");


// ========================================
// DASHBOARD ELEMENTS
// ========================================

const totalTasks = document.querySelector("#total-tasks");
const completedTasks = document.querySelector("#completed-tasks");
const pendingTasks = document.querySelector("#pending-tasks");
const totalResources = document.querySelector("#total-resources");


// ========================================
// APPLICATION DATA
// ========================================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let resources = JSON.parse(localStorage.getItem("resources")) || [];


// ========================================
// SAVE TASKS
// ========================================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// ========================================
// SAVE RESOURCES
// ========================================

function saveResources() {
    localStorage.setItem("resources", JSON.stringify(resources));
}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    // Count all tasks
    const total = tasks.length;

    // Count completed tasks
    const completed = tasks.filter(task => task.completed === true).length;

    // Calculate pending tasks
    const pending = total - completed;

    // Display the numbers
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    totalResources.textContent = resources.length;
}


// ========================================
// DISPLAY TASKS
// ========================================

function displayTasks() {

    taskList.innerHTML = "";

    const selectedCategory = categoryFilter.value;

    const searchText = taskSearch.value.toLowerCase().trim();


    // Filter tasks
    const filteredTasks = tasks.filter(task => {

        const matchesCategory =
            selectedCategory === "All" ||
            task.category === selectedCategory;

        const matchesSearch =
            task.name.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });


    // No tasks found
    if (filteredTasks.length === 0) {

        taskList.innerHTML =
            '<p class="empty-message">No tasks found.</p>';

        return;
    }


    // Display each task
    filteredTasks.forEach(task => {

        const taskCard = document.createElement("article");

        taskCard.classList.add("card");


        // Add completed class
        if (task.completed) {
            taskCard.classList.add("completed");
        }


        taskCard.innerHTML = `
            <h3>${task.name}</h3>

            <p>Category: ${task.category}</p>

            <p>
                Status:
                ${task.completed ? "Completed" : "Not completed"}
            </p>

            <div class="card-actions">

                <button
                    class="complete-button"
                    data-id="${task.id}"
                >
                    ${task.completed
                ? "Mark Incomplete"
                : "Mark Complete"}
                </button>

                <button
                    class="delete-button"
                    data-id="${task.id}"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskCard);
    });
}


// ========================================
// ADD TASK
// ========================================

taskForm.addEventListener("submit", event => {

    event.preventDefault();


    const newTask = {

        id: Date.now(),

        name: taskName.value.trim(),

        category: taskCategory.value,

        completed: false
    };


    tasks.push(newTask);


    // Save task
    saveTasks();


    // Update screen
    displayTasks();

    updateDashboard();


    // Clear form
    taskForm.reset();
});


// ========================================
// TASK BUTTONS
// ========================================

taskList.addEventListener("click", event => {

    const taskId = Number(event.target.dataset.id);


    if (!taskId) {
        return;
    }


    // ------------------------------------
    // DELETE TASK
    // ------------------------------------

    if (event.target.classList.contains("delete-button")) {

        tasks = tasks.filter(task => task.id !== taskId);

        saveTasks();

        displayTasks();

        updateDashboard();
    }


    // ------------------------------------
    // COMPLETE / INCOMPLETE TASK
    // ------------------------------------

    if (event.target.classList.contains("complete-button")) {

        const task = tasks.find(task => task.id === taskId);


        if (task) {

            task.completed = !task.completed;

        }


        saveTasks();

        displayTasks();

        updateDashboard();
    }
});


// ========================================
// TASK SEARCH
// ========================================

taskSearch.addEventListener("input", displayTasks);


// ========================================
// TASK CATEGORY FILTER
// ========================================

categoryFilter.addEventListener("change", displayTasks);


// ========================================
// DISPLAY RESOURCES
// ========================================

function displayResources() {

    resourceList.innerHTML = "";

    const selectedCategory = resourceFilter.value;

    const searchText = resourceSearch.value.toLowerCase().trim();


    // Filter resources
    const filteredResources = resources.filter(resource => {

        const matchesCategory =
            selectedCategory === "All" ||
            resource.category === selectedCategory;

        const matchesSearch =
            resource.name.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });


    // No resources found
    if (filteredResources.length === 0) {

        resourceList.innerHTML =
            '<p class="empty-message">No resources found.</p>';

        return;
    }


    // Display resources
    filteredResources.forEach(resource => {

        const resourceCard = document.createElement("article");

        resourceCard.classList.add("card");


        resourceCard.innerHTML = `

            <h3>${resource.name}</h3>

            <p>Category: ${resource.category}</p>

            <a
                class="resource-link"
                href="${resource.url}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Visit Resource
            </a>

            <div class="card-actions">

                <button
                    class="delete-button"
                    data-id="${resource.id}"
                >
                    Delete
                </button>

            </div>
        `;


        resourceList.appendChild(resourceCard);
    });
}


// ========================================
// ADD RESOURCE
// ========================================

resourceForm.addEventListener("submit", event => {

    event.preventDefault();


    const newResource = {

        id: Date.now(),

        name: resourceName.value.trim(),

        url: resourceUrl.value.trim(),

        category: resourceCategory.value
    };


    resources.push(newResource);


    // Save resource
    saveResources();


    // Update screen
    displayResources();

    updateDashboard();


    // Clear form
    resourceForm.reset();
});


// ========================================
// DELETE RESOURCE
// ========================================

resourceList.addEventListener("click", event => {

    const resourceId = Number(event.target.dataset.id);


    if (!resourceId) {
        return;
    }


    if (event.target.classList.contains("delete-button")) {

        resources = resources.filter(
            resource => resource.id !== resourceId
        );


        saveResources();

        displayResources();

        updateDashboard();
    }
});


// ========================================
// RESOURCE SEARCH
// ========================================

resourceSearch.addEventListener("input", displayResources);


// ========================================
// RESOURCE CATEGORY FILTER
// ========================================

resourceFilter.addEventListener("change", displayResources);


// ========================================
// INITIAL DISPLAY
// ========================================

displayTasks();

displayResources();

updateDashboard();