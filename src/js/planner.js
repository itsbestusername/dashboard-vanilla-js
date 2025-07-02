let trips = JSON.parse(localStorage.getItem('trips')) || [];
let activeTripId = null;

function save() {
  localStorage.setItem('trips', JSON.stringify(trips));
}

function calcDayTotal(day) {
  return day.slots.reduce((s, slot) => s + (slot.cost || 0), 0);
}

function calcTripTotal(trip) {
  return trip.days.reduce((s, d) => s + calcDayTotal(d), 0);
}

function renderOverview() {
  const out = document.querySelector('#planner-overview .trip-list');
  out.innerHTML = trips.map(trip => `
    <div class='trip' data-id='${trip.id}'>
      <input class='trip__title-input' type='text' value='${trip.title || ''}' placeholder='Название путешествия' />
      <button class='trip__open'>&#9998;</button>
      <button class='trip__remove'>&times;</button>
    </div>
  `).join('');
  // Добавим обработчики для input
  document.querySelectorAll('.trip__title-input').forEach(input => {
    input.addEventListener('input', function (e) {
      const tripId = Number(e.target.closest('.trip').dataset.id);
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        trip.title = e.target.value;
        save();
      }
    });
  });
}

function renderDetails() {
  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return;
  document.querySelector('#planner-details .details__title').textContent = trip.title || 'Без названия';
  const dc = document.querySelector('#planner-details .planner__days');
  dc.innerHTML = trip.days.map(day => {
    const total = calcDayTotal(day);
    return `
      <div class='planner__day' data-id='${day.id}'>
        <button class='day__remove'>&times;</button>
        <input type='text' class='day__title' value='${day.title}' placeholder='Название дня' />
        <div class='day__slots'>
          ${day.slots.map(slot => `
            <div class='slot' data-id='${slot.id}'>
              <input type='time' class='slot__time' value='${slot.time}' />
              <input type='text' class='slot__desc' value='${slot.description}' placeholder='Описание' />
              <input type='number' class='slot__cost' min='0' value='${slot.cost}' />
              <button class='slot__remove'>&times;</button>
            </div>
          `).join('')}
        </div>
        <div class='day__actions'>
          <button class='day__add-slot'>+ Событие</button>
          <div class='day__total'>Итого: <span>${total}</span>₽</div>
        </div>
      </div>
    `;
  }).join('');
  document.querySelector('#planner-details .planner__total-value').textContent = calcTripTotal(trip);
}

function showOverview() {
  document.getElementById('planner-overview').classList.remove('hidden');
  document.getElementById('planner-details').classList.add('hidden');
  renderOverview();
}

function showDetails() {
  document.getElementById('planner-overview').classList.add('hidden');
  document.getElementById('planner-details').classList.remove('hidden');
  renderDetails();
}

export function addTrip() {
  const id = Date.now();
  trips.push({ id, title: '', days: [] });
  save();
  renderOverview();
}

export function removeTrip(id) {
  trips = trips.filter(t => t.id !== id);
  save();
  showOverview();
}

export function openTrip(id) {
  activeTripId = id;
  showDetails();
}

export function addDay() {
  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return;
  const newDay = {
    id: Date.now(),
    title: '',
    slots: []
  };
  trip.days.push(newDay);
  save();
  renderDetails();
}

export function removeDay(dayId) {
  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return;
  trip.days = trip.days.filter(d => d.id !== dayId);
  save();
  renderDetails();
}

export function updateDayTitle(dayId, value) {
  const trip = trips.find(t => t.id === activeTripId);
  const day = trip.days.find(d => d.id === dayId);
  day.title = value;
  save();
}

export function addSlot(dayId) {
  const trip = trips.find(t => t.id === activeTripId);
  const day = trip.days.find(d => d.id === dayId);
  day.slots.push({ id: Date.now(), time: '', description: '', cost: 0 });
  save();
  renderDetails();
}

export function removeSlot(dayId, slotId) {
  const trip = trips.find(t => t.id === activeTripId);
  const day = trip.days.find(d => d.id === dayId);
  day.slots = day.slots.filter(s => s.id !== slotId);
  save();
  renderDetails();
}

function updateDayTotalInDOM(dayId) {
  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return;
  const day = trip.days.find(d => d.id === dayId);
  if (!day) return;
  const total = day.slots.reduce((sum, s) => sum + (s.cost || 0), 0);
  const span = document.querySelector(`.planner__day[data-id='${dayId}'] .day__total span`);
  if (span) span.textContent = total;
}

function updateOverallTotalInDOM() {
  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return;
  const overall = trip.days.reduce((sumD, d) => sumD + d.slots.reduce((s, x) => s + (x.cost || 0), 0), 0);
  const span = document.querySelector('#planner-details .planner__total-value');
  if (span) span.textContent = overall;
}

export function updateSlot(dayId, slotId, field, value) {
  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return;
  const day = trip.days.find(d => d.id === dayId);
  if (!day) return;
  const slot = day.slots.find(s => s.id === slotId);
  if (!slot) return;
  slot[field] = field === 'cost' ? Number(value) : value;
  save();
  if (field === 'cost') {
    updateDayTotalInDOM(dayId);
    updateOverallTotalInDOM();
  }
}

export function initPlanner() {
  document.querySelector('.planner__add-trip').addEventListener('click', addTrip);
  document.querySelector('.trip-list').addEventListener('click', e => {
    const id = Number(e.target.closest('.trip').dataset.id);
    if (e.target.matches('.trip__remove')) removeTrip(id);
    else if (e.target.matches('.trip__open')) openTrip(id);
  });
  document.querySelector('.planner__back').addEventListener('click', showOverview);
  document.querySelector('.planner__add-day').addEventListener('click', addDay);
  document.querySelector('#planner-details').addEventListener('click', e => {
    const dayEl = e.target.closest('.planner__day');
    if (!dayEl) return;
    const dayId = Number(dayEl.dataset.id);
    if (e.target.matches('.day__remove')) removeDay(dayId);
    if (e.target.matches('.day__add-slot')) addSlot(dayId);
    if (e.target.matches('.slot__remove')) {
      const slotId = Number(e.target.closest('.slot').dataset.id);
      removeSlot(dayId, slotId);
    }
  });
  document.querySelector('#planner-details').addEventListener('input', e => {
    const dayEl = e.target.closest('.planner__day');
    if (!dayEl) return;
    const dayId = Number(dayEl.dataset.id);
    if (e.target.matches('.day__title')) updateDayTitle(dayId, e.target.value);
    if (e.target.matches('.slot__time')) updateSlot(dayId, Number(e.target.closest('.slot').dataset.id), 'time', e.target.value);
    if (e.target.matches('.slot__desc')) updateSlot(dayId, Number(e.target.closest('.slot').dataset.id), 'description', e.target.value);
    if (e.target.matches('.slot__cost')) updateSlot(dayId, Number(e.target.closest('.slot').dataset.id), 'cost', e.target.value);
  });
  showOverview();
}
