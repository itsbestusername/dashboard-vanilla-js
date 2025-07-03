// src/js/auth.js

import { supabase } from './supabaseClient.js';

/**
 * Показываем/скрываем области
 */
export function showDashboard() {
  document.getElementById('auth-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
}

export function showAuth() {
  document.getElementById('auth-form').style.display = 'flex';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('app').classList.add('hidden');
}

/**
 * Инициализация форм авторизации и регистрации
 */
export function initAuth(onSignIn) {
  // --- Вход ---
  const loginForm = document.querySelector('#auth-form .auth__form');
  const loginError = document.querySelector('#auth-form .auth__error');
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const pass = loginForm.querySelector('input[type="password"]').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      loginError.textContent = error.message;
      loginError.style.display = 'block';
      return;
    }
    showDashboard();
    onSignIn(data.user);
  });

  // --- Регистрация ---
  const registerForm = document.querySelector('#register-form .auth__form');
  const registerError = document.querySelector('#register-form .auth__error');
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    registerError.style.display = 'none';
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const pass1 = registerForm.querySelectorAll('input[type="password"]')[0].value;
    const pass2 = registerForm.querySelectorAll('input[type="password"]')[1].value;
    if (pass1 !== pass2) {
      registerError.textContent = 'Пароли не совпадают';
      registerError.style.display = 'block';
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password: pass1 });
    if (error) {
      registerError.textContent = error.message;
      registerError.style.display = 'block';
      return;
    }
    // После успешной регистрации можно сразу залогинить пользователя или показать сообщение
    showDashboard();
    onSignIn(data.user);
  });

  // --- Проверка сессии ---
  supabase.auth.onAuthStateChange((_, session) => {
    const user = session?.user;
    if (user) {
      showDashboard();
      onSignIn(user);
    } else {
      showAuth();
    }
  });
}
