// src/js/planner.js

// 1. Хранение данных в localStorage
let plannerData = JSON.parse(localStorage.getItem('plannerData')) || [];

/** Сохраняет текущее состояние в localStorage */
function save() {
    localStorage.setItem('plannerData', JSON.stringify(plannerData));
}

/** Считает итоговую сумму слотов в одном дне */
function calcDayTotal(day) {
    return day.slots.reduce((sum, slot) => sum + (slot.cost || 0), 0);
}

/** Считает общий бюджет по всем дням */
function calcOverallTotal() {
    return plannerData.reduce((sum, day) => sum + calcDayTotal(day), 0);
}

/** Обновляет на странице сумму для одного дня */
function updateDayTotalInDOM(dayId) {
    const day = plannerData.find(d => d.id === dayId);
    if (!day) return;
    const total = calcDayTotal(day);
    const dayEl = document.querySelector(`.planner__day[data-day-id="${dayId}"]`);
    if (dayEl) {
        const span = dayEl.querySelector('.day__total span');
        if (span) span.textContent = total;
    }
}

/** Обновляет на странице общий бюджет */
function updateOverallTotalInDOM() {
    const overall = calcOverallTotal();
    const overallSpan = document.querySelector('.planner__total-value');
    if (overallSpan) overallSpan.textContent = overall;
}

/**
 * Полностью рендерит все дни и их слоты.
 * Вызывается только при add/remove дней и слотов.
 */
export function renderPlanner() {
    const container = document.querySelector('.planner__days');
    container.innerHTML = ''; // очистить

    plannerData.forEach(day => {
        const dayTotal = calcDayTotal(day);
        const dayEl = document.createElement('div');
        dayEl.className = 'planner__day';
        dayEl.dataset.dayId = day.id;

        dayEl.innerHTML = `
      <div class="day__header">
        <input 
          type="text" 
          class="day__title" 
          placeholder="Название дня" 
          value="${day.title}" />
        <button class="day__remove">×</button>
      </div>
      <div class="day__slots">
        ${day.slots.map(slot => `
          <div class="slot" data-slot-id="${slot.id}">
            <input type="time" 
                   class="slot__time" 
                   value="${slot.time}" />
            <input type="text" 
                   class="slot__desc" 
                   placeholder="Описание" 
                   value="${slot.description}" />
            <input type="number" 
                   class="slot__cost" 
                   min="0" 
                   value="${slot.cost}" />
            <button class="slot__remove">×</button>
          </div>
        `).join('')}
      </div>
      <button class="day__add-slot">Добавить событие</button>
      <div class="day__total">
        Итого за день: <span>${dayTotal}</span>₽
      </div>
    `;

        container.append(dayEl);
    });

    // После перерисовки обновляем общий бюджет
    updateOverallTotalInDOM();
}

// === CRUD для дней ===

/** Добавляет новый пустой день */
export function addDay() {
    plannerData.push({
        id: Date.now(),
        title: '',
        slots: []
    });
    save();
    renderPlanner();
}

/** Удаляет день по его id */
export function removeDay(dayId) {
    plannerData = plannerData.filter(d => d.id !== dayId);
    save();
    renderPlanner();
}

/** Обновляет название дня */
export function updateDayTitle(dayId, newTitle) {
    const day = plannerData.find(d => d.id === dayId);
    if (day) {
        day.title = newTitle;
        save();
        // не перерисовываем весь DOM, сохраняя фокус
    }
}

// === CRUD для слотов ===

/** Добавляет новый слот в указанный день */
export function addSlot(dayId) {
    const day = plannerData.find(d => d.id === dayId);
    if (!day) return;
    day.slots.push({
        id: Date.now(),
        time: '',
        description: '',
        cost: 0
    });
    save();
    renderPlanner();
}

/** Удаляет слот из дня */
export function removeSlot(dayId, slotId) {
    const day = plannerData.find(d => d.id === dayId);
    if (!day) return;
    day.slots = day.slots.filter(s => s.id !== slotId);
    save();
    renderPlanner();
}

/** Обновляет поле слота (time, description или cost) */
export function updateSlot(dayId, slotId, field, value) {
    const day = plannerData.find(d => d.id === dayId);
    if (!day) return;
    const slot = day.slots.find(s => s.id === slotId);
    if (!slot) return;

    slot[field] = field === 'cost' ? Number(value) : value;
    save();

    // обновляем суммы без полной перерисовки
    if (field === 'cost') {
        updateDayTotalInDOM(dayId);
        updateOverallTotalInDOM();
    }
}

// === Инициализация событий ===

/** Навешивает все клики и input-обработчики */
export function initPlanner() {
    // Добавление дня
    document
        .querySelector('.planner__add-day')
        .addEventListener('click', addDay);

    // Делегирование по кликам внутри дней
    const daysContainer = document.querySelector('.planner__days');
    daysContainer.addEventListener('click', e => {
        const dayEl = e.target.closest('.planner__day');
        if (!dayEl) return;
        const dayId = Number(dayEl.dataset.dayId);

        if (e.target.matches('.day__remove')) {
            removeDay(dayId);
        }
        else if (e.target.matches('.day__add-slot')) {
            addSlot(dayId);
        }
        else if (e.target.matches('.slot__remove')) {
            const slotEl = e.target.closest('.slot');
            const slotId = Number(slotEl.dataset.slotId);
            removeSlot(dayId, slotId);
        }
    });

    // Делегирование по вводу в полях
    daysContainer.addEventListener('input', e => {
        const dayEl = e.target.closest('.planner__day');
        if (!dayEl) return;
        const dayId = Number(dayEl.dataset.dayId);

        if (e.target.matches('.day__title')) {
            updateDayTitle(dayId, e.target.value);
        }
        else if (e.target.matches('.slot__time')) {
            const slotId = Number(e.target.closest('.slot').dataset.slotId);
            updateSlot(dayId, slotId, 'time', e.target.value);
        }
        else if (e.target.matches('.slot__desc')) {
            const slotId = Number(e.target.closest('.slot').dataset.slotId);
            updateSlot(dayId, slotId, 'description', e.target.value);
        }
        else if (e.target.matches('.slot__cost')) {
            const slotId = Number(e.target.closest('.slot').dataset.slotId);
            updateSlot(dayId, slotId, 'cost', e.target.value);
        }
    });
}
