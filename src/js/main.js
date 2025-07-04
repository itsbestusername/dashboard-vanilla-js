import { renderWeather, renderFinanceList } from './ui.js';
import { fetchGeo, fetchWeather, fetchRates } from './api.js';
import { RATES_ALL_SYMBOLS, RATES_DEFAULT_BASE } from './config.js';
import { initPlanner } from './planner.js';
import { initTodo } from './todo.js';
import { supabase } from './supabaseClient.js';
import { initAuth, showDashboard, showAuth } from './auth.js';

async function loadWeather(city) {
  try {
    const coords = await fetchGeo(city);
    const weatherData = await fetchWeather(coords);
    renderWeather(weatherData, city);
  } catch (err) {
    console.error('Weather error:', err);
    const titleEl = document.querySelector('.weather__title');
    titleEl.textContent = 'Не удалось получить погоду';
  }
}

async function loadFinance() {
  try {
    const rates = await fetchRates(RATES_DEFAULT_BASE, RATES_ALL_SYMBOLS);
    renderFinanceList(rates);
  } catch (err) {
    console.error('Finance error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Переключение между формами авторизации и регистрации
  const loginFormBlock = document.getElementById('auth-form');
  const registerFormBlock = document.getElementById('register-form');
  const registerBtn = document.querySelector('.auth__btn--register');
  const backBtn = document.querySelector('.auth__btn--back');

  if (registerBtn && registerFormBlock && loginFormBlock) {
    registerBtn.addEventListener('click', () => {
      loginFormBlock.style.display = 'none';
      registerFormBlock.style.display = 'flex';
    });
  }

  if (backBtn && registerFormBlock && loginFormBlock) {
    backBtn.addEventListener('click', () => {
      registerFormBlock.style.display = 'none';
      loginFormBlock.style.display = 'flex';
    });
  }

  // Авторизация и регистрация через Supabase
  initAuth(user => {
    showDashboard();
    // Инициализация дашборда для пользователя
    // Погода
    const savedCity = localStorage.getItem('dashboardCity') || 'Saint-Petersburg';
    loadWeather(savedCity);
    // Финансы
    loadFinance();
    // Планнер и туду
    initPlanner(user);
    initTodo(user);
  });

  // Обработчик выхода
  document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('logout-btn')) {
      await supabase.auth.signOut();
      showAuth();
    }
  });

  // Обработчик формы погоды
  const weatherForm = document.querySelector('.weather__form');
  if (weatherForm) {
    weatherForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = weatherForm.querySelector('.weather-input');
      const city = input.value.trim();
      if (city) {
        localStorage.setItem('dashboardCity', city);
        loadWeather(city);
        input.value = '';
      }
    });
  }
});