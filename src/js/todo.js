import { STORAGE_KEY } from './config.js';

function loadTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function renderTasks() {
  const list = document.querySelector('.todo__list');
  const tasks = loadTasks();
  if (tasks.length === 0) {
    list.innerHTML = "<li class='todo__empty'>Задач нет</li>";
    return;
  }
  list.innerHTML = tasks.map(task => `
    <li class='todo__item${task.done ? ' todo__item--done' : ''}' data-id='${task.id}'>
      <input type='checkbox' class='todo__checkbox' ${task.done ? 'checked' : ''}/>
      <span class='todo__text'>${task.text}</span>
      <button class='todo__remove'>&times;</button>
    </li>
  `).join('');
}

export function addTask(text) {
  const tasks = loadTasks();
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks(tasks);
  renderTasks();
}

export function removeTask(id) {
  let tasks = loadTasks();
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

export function toggleTask(id) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  saveTasks(tasks);
  renderTasks();
}

export function initTodo() {
  // Добавление задачи
  const form = document.querySelector('.todo__form');
  const input = form.querySelector('.todo__input');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    input.value = '';
  });

  // Делегирование по списку: чекбокс и кнопка удаления
  const list = document.querySelector('.todo__list');
  list.addEventListener('click', e => {
    const li = e.target.closest('.todo__item');
    if (!li) return;
    const id = Number(li.dataset.id);

    if (e.target.matches('.todo__remove')) {
      removeTask(id);
    } else if (e.target.matches('.todo__checkbox')) {
      toggleTask(id);
    }
  });

  // Первый рендер
  renderTasks();
}