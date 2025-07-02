import { renderWeather, renderFinanceList } from './ui.js';
import { fetchGeo, fetchWeather, fetchRates } from './api.js';
import { RATES_ALL_SYMBOLS, RATES_DEFAULT_BASE } from './config.js';
import { initPlanner } from './planner.js';
import { initTodo } from './todo.js';

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
  // Погода
  const savedCity = localStorage.getItem('dashboardCity') || 'Saint-Petersburg';
  loadWeather(savedCity);

  // Финансы
  loadFinance();

  // Форма погоды
  const weatherForm = document.querySelector('.weather__form');
  const weatherInput = document.querySelector('.weather-input');
  weatherForm.addEventListener('submit', event => {
    event.preventDefault();
    const newCity = weatherInput.value.trim();
    if (!newCity) return;
    localStorage.setItem('dashboardCity', newCity);
    loadWeather(newCity);
    weatherInput.value = '';
  });

  // Инициализируем планировщик
  initPlanner();

  initTodo();

});