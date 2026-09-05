class EmotionTempApp {
  constructor() {
    this.current = 0;
    this.total = 0;
    this.accepted = 0;
    this.locked = false;
    this.trackedStages = new Set();
    this.init();
  }

  async init() {
    await i18n.loadTranslations(i18n.currentLang);
    document.documentElement.lang = i18n.currentLang;
    i18n.updateUI();
    this.bindEvents();
    this.applyTheme();
    const loader = document.getElementById('app-loader');
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 300);
    this.trackStage('emotion_temp_view');
  }

  trackStage(name) {
    if (this.trackedStages.has(name)) return;
    this.trackedStages.add(name);
    if (typeof gtag === 'function') gtag('event', name, { event_category: 'emotion_temp_reflection' });
  }

  bindEvents() {
    document.getElementById('btn-start').addEventListener('click', () => this.start());
    document.getElementById('btn-retry').addEventListener('click', () => this.show('intro-screen'));
    document.getElementById('btn-share').addEventListener('click', () => this.share());
    document.getElementById('next-action').addEventListener('click', () => this.trackStage('emotion_temp_next_click'));
    document.querySelector('.related-grid').addEventListener('click', event => {
      if (event.target.closest('.related-card')) this.trackStage('emotion_temp_related_click');
    });
    const menu = document.getElementById('lang-menu');
    document.getElementById('lang-toggle').addEventListener('click', event => { event.stopPropagation(); menu.classList.toggle('hidden'); });
    document.addEventListener('click', () => menu.classList.add('hidden'));
    document.querySelectorAll('.lang-option').forEach(button => button.addEventListener('click', async event => {
      event.stopPropagation();
      await i18n.setLanguage(button.dataset.lang);
      menu.classList.add('hidden');
      if (!document.getElementById('question-screen').classList.contains('hidden')) this.renderQuestion();
      if (!document.getElementById('result-screen').classList.contains('hidden')) this.renderResult();
    }));
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('app-theme', next);
      this.applyTheme();
    });
  }

  applyTheme() {
    const theme = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.dataset.theme = theme;
    document.getElementById('theme-toggle').textContent = theme === 'light' ? '☀️' : '🌙';
  }

  show(id) {
    document.querySelectorAll('.screen').forEach(screen => {
      const active = screen.id === id;
      screen.classList.toggle('active', active);
      screen.classList.toggle('hidden', !active);
    });
    window.scrollTo(0, 0);
  }

  start() {
    this.current = 0;
    this.total = 0;
    this.accepted = 0;
    this.show('question-screen');
    this.renderQuestion();
    this.trackStage('emotion_temp_start');
  }

  renderQuestion() {
    this.locked = false;
    const question = QUESTIONS[this.current];
    document.getElementById('progress-fill').style.width = `${(this.current / QUESTIONS.length) * 100}%`;
    document.getElementById('progress-text').textContent = `${this.current + 1} / ${QUESTIONS.length}`;
    const heading = document.getElementById('q-text');
    heading.textContent = i18n.t(question.textKey);
    const options = document.getElementById('q-options');
    options.innerHTML = '';
    question.options.forEach(([key, points]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-btn';
      button.innerHTML = `<span>${i18n.t(key)}</span><span class="option-points">${points} pt</span>`;
      button.addEventListener('click', () => this.accept(points, button));
      options.appendChild(button);
    });
    heading.focus({ preventScroll: true });
  }

  accept(points, selected) {
    if (this.locked) return;
    this.locked = true;
    document.querySelectorAll('.option-btn').forEach(button => { button.disabled = true; button.classList.toggle('selected', button === selected); });
    this.total += points;
    this.accepted += 1;
    if (this.accepted === 5) this.trackStage('emotion_temp_progress');
    setTimeout(() => {
      this.current += 1;
      if (this.current < QUESTIONS.length) this.renderQuestion();
      else this.renderResult();
    }, 300);
  }

  renderResult() {
    const temperature = scoreToTemp(this.total);
    const result = getResult(temperature);
    const lang = i18n.getCurrentLanguage();
    this.show('result-screen');
    document.getElementById('result-temp').textContent = `${result.emoji} ${temperature}°C`;
    document.getElementById('result-title').textContent = i18n.t(result.titleKey);
    document.getElementById('result-subtitle').textContent = i18n.t(result.subtitleKey);
    document.getElementById('thermo-fill').style.height = `${Math.max(5, ((temperature + 10) / 50) * 100)}%`;
    document.getElementById('thermo-fill').style.background = result.color;
    document.getElementById('thermo-bulb').style.background = result.color;
    document.getElementById('result-calculation').textContent = i18n.t('result.calculation').replace('{total}', this.total).replace('{temperature}', temperature);
    document.getElementById('next-action').href = `/stress-check/?lang=${lang}&source=emotion_temp_result`;
    document.querySelector('[data-related-slug="hsp-test"]').href = `/hsp-test/?lang=${lang}&source=emotion_temp_result`;
    document.querySelector('[data-related-slug="emotion-iceberg"]').href = `/emotion-iceberg/?lang=${lang}&source=emotion_temp_result`;
    this.trackStage('emotion_temp_complete');
  }

  async share() {
    const data = { title: i18n.t('app.title'), text: i18n.t('share.text'), url: 'https://dopabrain.com/emotion-temp/' };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(data.url);
      document.getElementById('share-status').textContent = i18n.t('share.success');
      this.trackStage('emotion_temp_share');
    } catch (error) { document.getElementById('share-status').textContent = ''; }
  }
}

document.addEventListener('DOMContentLoaded', () => { window.emotionTempApp = new EmotionTempApp(); });
