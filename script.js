const STORAGE_KEY = 'todo-app-tasks';

const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const pendingEmpty = document.getElementById('pending-empty');
const completedEmpty = document.getElementById('completed-empty');

let tasks = loadTasks();

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatTimestamp(iso) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleComplete(task.id));

  const main = document.createElement('div');
  main.className = 'task-main';

  const text = document.createElement('span');
  text.className = 'task-text';
  text.textContent = task.text;

  const time = document.createElement('span');
  time.className = 'task-time';
  time.textContent = `Added ${formatTimestamp(task.createdAt)}${task.completedAt ? ' · Completed ' + formatTimestamp(task.completedAt) : ''}`;

  main.appendChild(text);
  main.appendChild(time);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.type = 'button';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => startEdit(task.id, text, editBtn));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.type = 'button';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(main);
  li.appendChild(actions);

  return li;
}

function startEdit(id, textEl, editBtn) {
  const isEditing = textEl.getAttribute('contenteditable') === 'true';

  if (!isEditing) {
    textEl.setAttribute('contenteditable', 'true');
    textEl.focus();
    placeCursorAtEnd(textEl);
    editBtn.textContent = 'Save';
    return;
  }

  // Save edit
  const newText = textEl.textContent.trim();
  textEl.setAttribute('contenteditable', 'false');
  editBtn.textContent = 'Edit';

  if (newText === '') {
    render(); // revert to stored value if left empty
    return;
  }

  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.text = newText;
    saveTasks();
  }
}

function placeCursorAtEnd(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function render() {
  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  pending.forEach((task) => pendingList.appendChild(createTaskElement(task)));
  completed.forEach((task) => completedList.appendChild(createTaskElement(task)));

  pendingCount.textContent = `${pending.length} pending`;
  completedCount.textContent = `${completed.length} completed`;

  pendingEmpty.classList.toggle('visible', pending.length === 0);
  completedEmpty.classList.toggle('visible', completed.length === 0);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text === '') return;

  tasks.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  });

  saveTasks();
  input.value = '';
  render();
});

render();
