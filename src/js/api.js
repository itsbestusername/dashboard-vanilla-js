import { GEOCODE_URL, WEATHER_URL, RATES_BASE_URL } from './config.js';

/**
 * @param {string} city — любой город, например 'Moscow'
 */
export async function fetchGeo(city) {
  // 1) Собираем URL
  const url = new URL(GEOCODE_URL);
  url.searchParams.set('q', city);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  // 2) Делаем запрос
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Geocode failed: ${response.status}`);
  }

  // 3) Парсим JSON и возвращаем координаты
  const data = await response.json();
  const place = data[0];
  return {
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon)
  };
}

export async function fetchWeather({ lat, lon }) {
  const url = new URL(WEATHER_URL);
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('current_weather', 'true');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather failed: ${response.status}`);
  }

  const data = await response.json();
  // Вернём только нужную часть
  return data.current_weather;
}

export async function fetchRates(base, symbols) {
  // 1) Оставляем только те валюты, которые не равны base
  const targets = symbols.filter(code => code !== base);

  // 3) Делаем запрос по адресу RATES_BASE_URL/base
  const url = `${RATES_BASE_URL}/${base}`;
  console.log('Fetch rates from:', url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Rates fetch failed: ${res.status}`);
  }

  // 4) Разбираем JSON-ответ
  const json = await res.json();
  const allRates = json.rates; // объект со всеми курсами

  // 5) Собираем итоговый объект, включающий базу и только нужные валюты
  const result = { [base]: 1 };
  for (const code of targets) {
    const rate = allRates[code];
    if (rate != null) {
      result[code] = rate;
    }
  }

  return result;
}