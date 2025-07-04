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
    // Очистка полей после успешного входа
    loginForm.querySelector('input[type="email"]').value = '';
    loginForm.querySelector('input[type="password"]').value = '';
    showDashboard();
    onSignIn(data.user);
  });

  // --- Регистрация ---
  const registerForm = document.querySelector('#register-form .auth__form');
  const registerError = document.querySelector('#register-form .auth__error');
  const pass1Input = registerForm.querySelector('input[name="password"]');
  const pass2Input = registerForm.querySelector('input[name="password_repeat"]');
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    registerError.style.display = 'none';
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const pass1 = pass1Input.value;
    const pass2 = pass2Input.value;
    if (pass1 !== pass2) {
      registerError.textContent = 'Пароли не совпадают';
      registerError.style.display = 'block';
      pass1Input.classList.add('input-error');
      pass2Input.classList.add('input-error');
      return;
    } else {
      pass1Input.classList.remove('input-error');
      pass2Input.classList.remove('input-error');
    }
    const { data, error } = await supabase.auth.signUp({ email, password: pass1 });
    if (error) {
      registerError.textContent = error.message;
      registerError.style.display = 'block';
      return;
    }
    // Очистка полей после успешной регистрации
    registerForm.querySelector('input[type="email"]').value = '';
    pass1Input.value = '';
    pass2Input.value = '';
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
