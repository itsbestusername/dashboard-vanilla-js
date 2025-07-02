// Здесь будут функции, принимающие данные (например, температура + описание) и вставляющие их в DOM.
import { RATES_ALL_SYMBOLS, CURRENCY_NAMES } from './config.js';

const temp = document.querySelector(".weather__temp");
const desc = document.querySelector(".weather__desc");

export function renderWeather(data, cityName) {
  const roundedTemp = Math.round(data.temperature);
  temp.textContent = `${roundedTemp}°C`;
  desc.textContent = cityName;
}

export function renderFinanceList(rates) {
  const container = document.getElementById('finance-container');
  container.innerHTML = '';
  RATES_ALL_SYMBOLS.forEach(code => {
    const rate = rates[code];
    // если API вернул undefined, пропустим
    if (rate == null) return;
    // инверсия: сколько рублей за 1 единицу валюты
    const rublesPerUnit = (1 / rate).toFixed(2);
    // Достаём полное название, если нет — оставляем код
    const fullName = CURRENCY_NAMES[code] || code;

    // Собираем HTML
    const div = document.createElement('div');
    div.className = 'finance__item';
    div.innerHTML = `
      <span class="finance__name">${fullName}</span>
      <span class="finance__code">1${code}</span>:
      <span class="finance__value">${rublesPerUnit} ₽</span>
    `;
    container.append(div);
  });
}