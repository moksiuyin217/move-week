const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const TESSERACT_VERSION = '5.1.1';
const TESSERACT_ASSETS = {
  workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@${TESSERACT_VERSION}/dist/worker.min.js`,
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
  langPath: 'https://tessdata.projectnaptha.com/4.0.0'
};

const input = document.querySelector('#image-input');
const statusPanel = document.querySelector('#status-panel');
const statusTitle = document.querySelector('#status-title');
const statusDetail = document.querySelector('#status-detail');
const progressFill = document.querySelector('#progress-fill');
const progressNumber = document.querySelector('#progress-number');
const spinner = document.querySelector('#status-spinner');
const errorMessage = document.querySelector('#error-message');
const emptyMessage = document.querySelector('#empty-message');
const errorDetail = document.querySelector('#error-detail');
const results = document.querySelector('#results');
const list = document.querySelector('#workout-list');
const emptyList = document.querySelector('#empty-list');
const workoutCount = document.querySelector('#workout-count');
const planPanel = document.querySelector('#plan-panel');
const planText = document.querySelector('#text-plan');
const calendarLink = document.querySelector('#download-calendar');

let workouts = [];
let nextId = 1;
let calendarUrl = '';

input.addEventListener('change', async () => {
  const image = input.files?.[0];
  input.value = '';
  if (!image) return;
  resetView();
  if (!IMAGE_TYPES.has(image.type)) {
    showError('Please choose a PNG, JPG or WEBP image.');
    return;
  }
  await readImage(image);
});

function resetView() {
  statusPanel.hidden = false;
  statusTitle.textContent = 'Getting ready to read your image…';
  statusDetail.textContent = 'The first read downloads the text-reading tools to your browser.';
  progressFill.style.width = '0%';
  progressNumber.textContent = '0%';
  spinner.hidden = false;
  errorMessage.hidden = true;
  emptyMessage.hidden = true;
  results.hidden = true;
}

async function readImage(image) {
  if (!window.Tesseract) {
    showError('The text-reading tool did not load. Check your internet connection and reload the page.');
    return;
  }
  let worker;
  try {
    worker = await Tesseract.createWorker('eng', 1, {
      ...TESSERACT_ASSETS,
      logger: reportProgress
    });
    statusTitle.textContent = 'Reading your workout list…';
    statusDetail.textContent = 'Your image is being read in this browser.';
    const { data } = await worker.recognize(image);
    console.info('OCR text from selected screenshot:', data.text);
    workouts = parseWorkouts(data.text);
    statusPanel.hidden = true;
    if (workouts.length === 0) {
      emptyMessage.hidden = false;
      return;
    }
    results.hidden = false;
    renderWorkouts();
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    console.error('Screenshot reading failed:', error);
    showError('The reading tools could not finish. Check your connection and try again with a clear screenshot.');
  } finally {
    if (worker) await worker.terminate().catch(() => {});
  }
}

function reportProgress(message) {
  if (!message.status) return;
  const percent = Math.max(0, Math.min(100, Math.round((message.progress || 0) * 100)));
  progressFill.style.width = `${percent}%`;
  progressNumber.textContent = `${percent}%`;
  const labels = {
    'loading tesseract core': 'Loading the text-reading engine…',
    'initializing tesseract': 'Setting up the text reader…',
    'loading language traineddata': 'Loading English text data…',
    'initializing api': 'Preparing to read your screenshot…',
    'recognizing text': 'Reading your workout list…'
  };
  statusTitle.textContent = labels[message.status] || 'Getting ready to read your image…';
  if (message.status === 'recognizing text') {
    statusDetail.textContent = 'Your image stays on this device while we look for names and durations.';
  }
}

function parseWorkouts(text) {
  const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const found = [];
  for (let index = 0; index < lines.length; index += 1) {
    const duration = getDuration(lines[index]);
    if (!duration) continue;
    const inlineName = lines[index].slice(0, duration.index).replace(/[|•,;:–—-]+$/g, '').trim();
    const inlineCandidate = cleanWorkoutName(inlineName);
    const name = isGoodWorkoutName(inlineCandidate) ? inlineCandidate : cleanWorkoutName(previousName(lines, index));
    if (!isGoodWorkoutName(name)) continue;
    found.push({ id: createWorkoutId(), name, durationMinutes: duration.minutes, date: '', time: '' });
  }
  return found;
}

function cleanLine(line) {
  return line.replace(/[•●▪◦]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDuration(line) {
  const match = line.match(/(\d{1,3})\s*(?:mins?|minutes?)\b/i);
  if (!match) return null;
  const minutes = Number(match[1]);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 300) return null;
  return { minutes, index: match.index };
}

function previousName(lines, durationIndex) {
  const candidates = [];
  for (let index = durationIndex - 1; index >= Math.max(0, durationIndex - 4); index -= 1) {
    const line = lines[index];
    if (getDuration(line)) break;
    if (isScreenNoise(line)) break;
    const fragment = cleanWorkoutName(line);
    if (isGoodWorkoutName(fragment)) candidates.unshift(fragment);
  }
  return candidates.join(' ');
}

function cleanWorkoutName(value) {
  return value
    .replace(/^[\d\W_]+/, '')
    .replace(/\b(?:his|her|the|a|y)\b/gi, (word, offset, whole) => (offset === 0 || /^\s*(?:his|her|the|a|y)\s/.test(whole) ? '' : word))
    .replace(/\b(beginner|intermediate|advanced|all levels?)\b/gi, '')
    .replace(/\b(next workout|workout|programmes?|activity|home|workouts?)\b/gi, '')
    .replace(/\s+2\s*$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/(?:^|\s)[a-z](?=\s|$)/gi, ' ')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')
    .trim();
}

function isGoodWorkoutName(value) {
  return Boolean(value && value.length >= 5 && !isScreenNoise(value) && value.split(/\s+/).length >= 2);
}

function isScreenNoise(value) {
  return /^(next workout|home|workouts|activity|programmes?|beginner|intermediate|advanced|ms)$/i.test(value.trim());
}

function createWorkoutId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `workout-${Date.now()}-${nextId++}-${Math.random().toString(36).slice(2)}`;
}

function renderWorkouts() {
  list.replaceChildren();
  workoutCount.textContent = `(${workouts.length})`;
  emptyList.hidden = workouts.length > 0;
  planPanel.hidden = workouts.length === 0;
  workouts.forEach((workout, index) => list.append(makeWorkoutRow(workout, index)));
  renderPlan();
}

function makeWorkoutRow(workout, index) {
  const row = document.createElement('article');
  row.className = 'workout-row';
  row.innerHTML = `
    <span class="row-number">${String(index + 1).padStart(2, '0')}</span>
    <label class="name-cell"><span class="row-label">WORKOUT</span><input class="row-field" data-field="name" type="text" value="" aria-label="Workout name"></label>
    <div class="duration-cell"><span class="row-label">DURATION</span><div class="duration-value"></div></div>
    <label class="date-cell"><span class="row-label">DATE</span><input class="row-field" data-field="date" type="date" aria-label="Workout date"></label>
    <div class="time-cell"><span class="row-label">START TIME</span><div class="time-picker">
      <input class="row-field time-input" data-field="time" type="text" inputmode="text" maxlength="5" placeholder="HH:MM" autocomplete="off" aria-label="Workout start time">
      <button class="time-picker-toggle" type="button" aria-label="Choose start time" aria-expanded="false">◷</button>
      <div class="time-picker-menu" role="group" aria-label="Choose a start time" hidden><div class="time-picker-column"><span>HOUR</span><div class="time-picker-options" role="group" aria-label="Hour" data-time-options="hour"></div></div><div class="time-picker-column"><span>MINUTE</span><div class="time-picker-options" role="group" aria-label="Minute" data-time-options="minute"></div></div></div>
    </div></div>
    <button class="remove-button" type="button" aria-label="Remove workout">×</button>`;
  row.querySelector('[data-field="name"]').value = workout.name;
  row.querySelector('.duration-value').textContent = formatDuration(workout.durationMinutes);
  row.querySelector('[data-field="date"]').value = workout.date;
  const timeInput = row.querySelector('[data-field="time"]');
  timeInput.value = workout.time;
  row.querySelectorAll('[data-field]').forEach((field) => {
    field.addEventListener('input', () => {
      if (field.dataset.field === 'time' && field.value && !isValidTime(field.value)) return;
      workout[field.dataset.field] = field.value;
      renderPlan();
    });
  });
  const timePicker = row.querySelector('.time-picker');
  const timeMenu = row.querySelector('.time-picker-menu');
  const timeToggle = row.querySelector('.time-picker-toggle');
  const hourOptions = timePicker.querySelector('[data-time-options="hour"]');
  const minuteOptions = timePicker.querySelector('[data-time-options="minute"]');
  for (let hour = 0; hour < 24; hour += 1) {
    const option = makeTimeOption(String(hour).padStart(2, '0'), 'hour');
    hourOptions.append(option);
  }
  for (const minute of ['00', '15', '30', '45']) {
    minuteOptions.append(makeTimeOption(minute, 'minute'));
  }
  function refreshTimeOptions() {
    const [hour, minute] = isValidTime(timeInput.value) ? timeInput.value.split(':') : ['09', '00'];
    hourOptions.querySelectorAll('button').forEach((option) => option.setAttribute('aria-pressed', String(option.textContent === hour)));
    minuteOptions.querySelectorAll('button').forEach((option) => option.setAttribute('aria-pressed', String(option.textContent === minute)));
    hourOptions.querySelector(`[data-value="${hour}"]`)?.scrollIntoView({ block: 'nearest' });
    minuteOptions.querySelector(`[data-value="${minute}"]`)?.scrollIntoView({ block: 'nearest' });
  }
  function closeTimeMenu() {
    timeMenu.hidden = true;
    timeToggle.setAttribute('aria-expanded', 'false');
  }
  function setPickedTime(part, value) {
    const [currentHour, currentMinute] = isValidTime(timeInput.value) ? timeInput.value.split(':') : ['09', '00'];
    const nextHour = part === 'hour' ? value : currentHour;
    const nextMinute = part === 'minute' ? value : currentMinute;
    timeInput.value = `${nextHour}:${nextMinute}`;
    workout.time = timeInput.value;
    renderPlan();
    refreshTimeOptions();
    if (part === 'minute') closeTimeMenu();
  }
  function makeTimeOption(value, part) {
    const option = document.createElement('button');
    option.type = 'button';
    option.dataset.value = value;
    option.textContent = value;
    option.setAttribute('aria-label', `${part === 'hour' ? 'Hour' : 'Minute'} ${value}`);
    option.setAttribute('aria-pressed', 'false');
    option.addEventListener('click', () => setPickedTime(part, value));
    return option;
  }
  timeToggle.addEventListener('click', () => {
    const open = timeMenu.hidden;
    timeMenu.hidden = !open;
    timeToggle.setAttribute('aria-expanded', String(open));
    if (open) refreshTimeOptions();
  });
  timeInput.addEventListener('blur', () => {
    if (timeInput.value && !isValidTime(timeInput.value)) timeInput.value = workout.time;
  });
  timePicker.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeTimeMenu();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!timePicker.contains(event.target)) closeTimeMenu();
  });
  row.querySelector('.remove-button').addEventListener('click', () => {
    workouts = workouts.filter((item) => item.id !== workout.id);
    renderWorkouts();
  });
  return row;
}

function formatDuration(minutes) {
  const wholeHours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (wholeHours && remainder) return `${wholeHours} hr ${remainder} min`;
  if (wholeHours) return `${wholeHours} hr`;
  return `${minutes} min`;
}

function isValidTime(value) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function renderPlan() {
  if (workouts.length === 0) {
    planText.textContent = '';
    calendarLink.hidden = true;
    if (calendarUrl) URL.revokeObjectURL(calendarUrl);
    calendarUrl = '';
    calendarLink.removeAttribute('href');
    return;
  }
  planText.textContent = workouts.map((workout) => formatPlanLine(workout)).join('\n');
  const calendar = createCalendarFile(workouts);
  if (calendarUrl) URL.revokeObjectURL(calendarUrl);
  calendarUrl = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
  calendarLink.href = calendarUrl;
  calendarLink.hidden = false;
}

function formatPlanLine(workout) {
  const date = resolveLocalDate(workout.date);
  const dateLabel = new Intl.DateTimeFormat('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  const timeLabel = workout.time
    ? new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit' }).format(resolveLocalStart(date, workout.time))
    : 'Full day';
  return `${dateLabel} · ${timeLabel} · ${workout.name.trim() || 'Workout'}`;
}

function createCalendarFile(items) {
  const stamp = toIcsUtc(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Move Week//NTC Workout Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  items.forEach((workout) => {
    const date = resolveLocalDate(workout.date);
    const summary = workout.name.trim() || 'Workout';
    lines.push('BEGIN:VEVENT', `UID:${workout.id}@move-week.local`, `DTSTAMP:${stamp}`, `SUMMARY:${escapeIcsText(summary)}`);
    if (workout.time) {
      const start = resolveLocalStart(date, workout.time);
      const end = new Date(start.getTime() + workout.durationMinutes * 60_000);
      lines.push(`DTSTART:${toIcsUtc(start)}`, `DTEND:${toIcsUtc(end)}`);
    } else {
      const nextDay = new Date(date.getTime());
      nextDay.setDate(nextDay.getDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${toIcsDate(date)}`, `DTEND;VALUE=DATE:${toIcsDate(nextDay)}`);
    }
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

function resolveLocalDate(value) {
  if (!value) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function resolveLocalStart(date, time) {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}

function toIcsDate(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

function toIcsUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value) {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function foldIcsLine(line) {
  let folded = '';
  let bytesOnLine = 0;
  for (const character of line) {
    const characterBytes = new TextEncoder().encode(character).length;
    if (bytesOnLine + characterBytes > 75) {
      folded += '\r\n ';
      bytesOnLine = 1;
    }
    folded += character;
    bytesOnLine += characterBytes;
  }
  return folded;
}

window.addEventListener('beforeunload', () => {
  if (calendarUrl) URL.revokeObjectURL(calendarUrl);
});

function showError(message) {
  statusPanel.hidden = true;
  errorDetail.textContent = message;
  errorMessage.hidden = false;
}
