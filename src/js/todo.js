import { supabase } from './supabaseClient.js';

let currentUserId = null;
let todoInitialized = false;

async function loadTasks() {
  if (!currentUserId) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', currentUserId)
    .order('id', { ascending: false });
  return data || [];
}

async function addTask(text) {
  if (!currentUserId) return;
  await supabase.from('tasks').insert([{ user_id: currentUserId, text, done: false }]);
  renderTasks();
}

async function removeTask(id) {
  if (!currentUserId) return;
  await supabase.from('tasks').delete().eq('id', id).eq('user_id', currentUserId);
  renderTasks();
}

async function toggleTask(id) {
  if (!currentUserId) return;
  const { data } = await supabase.from('tasks').select('done').eq('id', id).single();
  if (!data) return;
  await supabase.from('tasks').update({ done: !data.done }).eq('id', id).eq('user_id', currentUserId);
  renderTasks();
}

export async function renderTasks() {
  const list = document.querySelector('.todo__list');
  const tasks = await loadTasks();
  if (!tasks.length) {
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

export function initTodo(user) {
  currentUserId = user.id;
  if (todoInitialized) {
    renderTasks();
    return;
  }
  todoInitialized = true;
  const form = document.querySelector('.todo__form');
  const input = form.querySelector('.todo__input');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    await addTask(text);
    input.value = '';
  });

  const list = document.querySelector('.todo__list');
  list.addEventListener('click', async e => {
    const li = e.target.closest('.todo__item');
    if (!li) return;
    const id = Number(li.dataset.id);

    if (e.target.matches('.todo__remove')) {
      await removeTask(id);
    } else if (e.target.matches('.todo__checkbox')) {
      await toggleTask(id);
    }
  });

  renderTasks();
}