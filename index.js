import { initialData } from './initialData.js';
// Function to initialize data in local storage if it's not already present
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'false');
  } else {
    console.log('Data already exists in LocalStorage');
  }
}

// DOM elements
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  modalTitleInput: document.getElementById('title-input'),
  modalDescInput: document.getElementById('desc-input'),
  modalSelectStatus: document.getElementById('select-status'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  filterDiv: document.getElementById('filterDiv'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  boardsContainer: document.getElementById('boards-nav-links-div'),
  addBoardInput: document.getElementById('add-board-input'),
  addBoardBtn: document.getElementById('add-board-btn')
};

let activeBoard = '';
let selectedTaskId = '';

//fetches tasks from localStorage or an initial data source
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Display boards in the UI
function displayBoards(boards) {
  elements.boardsContainer.innerHTML = '';

  boards.forEach(board => {
    const boardElement = document.createElement('div');
    boardElement.classList.add('board-item');
    const boardButton = document.createElement('button');
    boardButton.textContent = board;
    boardButton.addEventListener('click', () => {
      activeBoard = board;
      localStorage.setItem('activeBoard', JSON.stringify(board));
      elements.headerBoardName.textContent = board;
      styleActiveBoard(board);
      refreshTaskUI();
    });
    boardElement.appendChild(boardButton);
    elements.boardsContainer.appendChild(boardElement);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const launchCareerBtn = document.getElementById("launch-career-btn");
  const roadmapBtn = document.getElementById("roadmap-btn");

  const tasksContainer = {
      todo: document.querySelector('.column-div[data-status="todo"] .tasks-container'),
      doing: document.querySelector('.column-div[data-status="doing"] .tasks-container'),
      done: document.querySelector('.column-div[data-status="done"] .tasks-container')
  };

  launchCareerBtn.addEventListener("click", function() {
      filterTasks('Launch Career');
  });

  roadmapBtn.addEventListener("click", function() {
      filterTasks('Roadmap');
  });

  function filterTasks(board) {
      // Clear the existing tasks
      for (let status in tasksContainer) {
          tasksContainer[status].innerHTML = '';
      }

      // Filter and display tasks based on the selected board
      initialData.filter(task => task.board === board).forEach(task => {
          const taskElement = document.createElement("div");
          taskElement.className = "task";
          taskElement.innerHTML = `
              <h4>${task.title}</h4>
              <p>${task.description}</p>
          `;
          tasksContainer[task.status].appendChild(taskElement);
      });
  }

  // Initially display all tasks
  filterTasks('Launch Career');
});

// Adds a new task to the UI
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"] .tasks-container`);
  if (!column) return;

  const taskElement = createTaskElement(task);
  column.appendChild(taskElement);

  taskElement.addEventListener('click', () => {
    openEditTaskModal(task);
  });
}

// Sets up event listeners
function setupEventListeners() {
  elements.cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
  });

  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  elements.themeSwitch.addEventListener('change', toggleTheme);

  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  });

  elements.modalWindow.addEventListener('submit', addTask);

  elements.saveTaskChangesBtn.addEventListener('click', saveTaskChanges);
  elements.deleteTaskBtn.addEventListener('click', deleteTask);
}

// Toggles the modal display
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

// Adds a new task
function addTask(event) {
  event.preventDefault();

  const task = {
    title: elements.modalTitleInput.value.trim(),
    description: elements.modalDescInput.value.trim(),
    status: elements.modalSelectStatus.value.trim(),
    id: generateTaskId(),
    board: activeBoard
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
    event.target.reset();
  }
}

// Refreshes the UI with tasks of the active board
function refreshTaskUI() {
  const columns = document.querySelectorAll('.column-div .tasks-container');
  columns.forEach(column => column.innerHTML = '');

  const tasks = getTasks().filter(task => task.board === activeBoard);
  tasks.forEach(task => addTaskToUI(task));
}

// Toggles the sidebar display
function toggleSidebar(show) {
  const sideBar = elements.boardsContainer.parentElement;
  if (show) {
    sideBar.style.display = 'block';
    elements.showSideBarBtn.style.display = 'none';
    elements.hideSideBarBtn.style.display = 'flex'; // Show the button to hide the sidebar
    localStorage.setItem('showSideBar', 'true');
  } else {
    sideBar.style.display = 'none';
    elements.showSideBarBtn.style.display = 'flex';
    elements.hideSideBarBtn.style.display = 'none'; // Hide the button to hide the sidebar
    localStorage.setItem('showSideBar', 'false');
  }
}

// Toggles the theme
function toggleTheme() {
  const currentTheme = document.body.classList.contains('light-theme') ? 'light-theme' : 'dark-theme';
  const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';

  document.body.classList.remove(currentTheme);
  document.body.classList.add(newTheme);

  localStorage.setItem('theme', newTheme);
}

// Applies the saved theme on page load
function applySavedThemes() {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light-theme' || savedTheme === 'dark-theme') {
    document.body.classList.add(savedTheme);
  } else {
    document.body.classList.add('light-theme');
  }
}

// Initializes the sidebar visibility based on local storage
function initializeSidebar() {
  const showSideBar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSideBar); 
}

// Deletes a task
function deleteTask() {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.id !== selectedTaskId);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  refreshTaskUI();
  toggleModal(false, elements.editTaskModal);
  elements.filterDiv.style.display = 'none';
}

// Adds a new board
function addNewBoard() {
  const newBoardName = elements.addBoardInput.value.trim();
  if (newBoardName) {
    const tasks = getTasks();
    tasks.push({ board: newBoardName, title: '', description: '', id: generateTaskId(), status: 'todo' });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    fetchAndDisplayBoardsAndTasks();
    elements.addBoardInput.value = '';
  }
}

// Deletes a board and its associated tasks
function deleteBoard(boardName) {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.board !== boardName);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  
  if (activeBoard === boardName) {
    activeBoard = '';
    elements.headerBoardName.textContent = '';
  }

  fetchAndDisplayBoardsAndTasks();
}

// Initializes the application after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeData();
  applySavedThemes();
  setupEventListeners();
  initializeSidebar();
});

// Sample implementation of createNewTask function
function createNewTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  return task;
}

// Creates a task HTML element
function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task-item';
  taskElement.dataset.taskId = task.id;
  taskElement.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <p>${task.status}</p>
  `;
  return taskElement;
}

// Generates a unique task ID
function generateTaskId() {
  return 'task-' + Date.now();
}

// Opens the edit task modal
function openEditTaskModal(task) {
  selectedTaskId = task.id;
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;
  toggleModal(true, elements.editTaskModal);
  elements.filterDiv.style.display = 'block';
}

// Saves task changes
function saveTaskChanges() {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === selectedTaskId);
  if (taskIndex > -1) {
    tasks[taskIndex].title = elements.editTaskTitleInput.value.trim();
    tasks[taskIndex].description = elements.editTaskDescInput.value.trim();
    tasks[taskIndex].status = elements.editSelectStatus.value.trim();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    refreshTaskUI();
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
  }
}

// Styles the active board
function styleActiveBoard(board) {
  const boardItems = document.querySelectorAll('.board-item button');
  boardItems.forEach(button => {
    if (button.textContent === board) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}


