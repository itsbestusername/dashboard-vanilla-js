//все «магические строки»: базовые URL-адреса API, имена параметров, и т. п.

export const GEOCODE_URL = "https://nominatim.openstreetmap.org/search";
export const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
export const DEFAULT_LANGUAGE = "ru";
export const DEFAULT_UNITS = "metric";

// URL для обменников
export const RATES_BASE_URL = 'https://open.er-api.com/v6/latest';
// Дефолтные валюты
export const RATES_DEFAULT_BASE = 'RUB';
export const RATES_ALL_SYMBOLS = [
  'USD', // Доллар США
  'EUR', // Евро
  'GBP', // Фунт стерлингов
  'JPY', // Японская иена
  'CNY', // Китайский юань
  'SGD', // Сингапурский доллар
  'GEL', // Грузинский лари
  'AMD', // Армянский драм
];
export const CURRENCY_NAMES = {
  RUB: 'Российский рубль',
  USD: 'Доллар США',
  EUR: 'Евро',
  GBP: 'Британский фунт стерлингов',
  JPY: 'Японская иена',
  CNY: 'Китайский юань',
  SGD: 'Сингапурский доллар',
  GEL: 'Грузинский лари',
  AMD: 'Армянский драм',
};

// URL для геокодирования (адрес → coords)
export const GEO_BASE_URL       = 'https://nominatim.openstreetmap.org/search';
// (Если планируешь карту через iframe)
export const MAP_EMBED_BASE     = 'https://www.google.com/maps/embed/v1/place';
export const MAP_EMBED_KEY      = 'ВАШ_GOOGLE_API_KEY';
