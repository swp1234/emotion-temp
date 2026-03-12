// Emotion Temperature Test - App Logic
(function () {
    'use strict';

    // State
    let currentQ = 0;
    let scores = [];
    let resultData = null;
    let tempValue = 0;

    // DOM
    const introScreen = document.getElementById('intro-screen');
    const questionScreen = document.getElementById('question-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const resultScreen = document.getElementById('result-screen');
    const adOverlay = document.getElementById('ad-overlay');

    // Update test count display with error handling
    function updateTestCount() {
        try {
            if (typeof localStorage === 'undefined') return;
            const savedCount = localStorage.getItem('emotion_test_count');
            const count = savedCount ? parseInt(savedCount, 10) : 0;
            if (isNaN(count)) return;
            const el = document.getElementById('intro-count');
            if (el && count > 0) {
                const countText = i18n?.t('intro.count');
                el.textContent = `${count.toLocaleString()}${countText || '명이 참여했어요!'}`;
            }
        } catch (e) {
            console.warn('Could not update test count:', e.message);
        }
    }

    function incrementTestCount() {
        try {
            if (typeof localStorage === 'undefined') return;
            const savedCount = localStorage.getItem('emotion_test_count');
            const count = (savedCount ? parseInt(savedCount, 10) : 0) + 1;
            if (isNaN(count) || count < 0) return;
            localStorage.setItem('emotion_test_count', count.toString());
        } catch (e) {
            console.warn('Could not increment test count:', e.message);
        }
    }

    // Emotion history tracker with error handling
    function saveEmotionHistory(temp) {
        try {
            if (typeof localStorage === 'undefined') return;
            if (isNaN(temp) || !resultData || !resultData.titleKey) return;

            const today = new Date().toISOString().split('T')[0];
            let history = [];

            try {
                const saved = localStorage.getItem('emotion_history');
                history = saved ? JSON.parse(saved) : [];
            } catch (parseErr) {
                console.warn('History corrupted, resetting:', parseErr.message);
                history = [];
            }

            if (!Array.isArray(history)) history = [];

            // Add today's result
            history.push({ date: today, temp: temp, title: i18n.t(resultData.titleKey) });

            // Keep last 30 days
            if (history.length > 30) history.shift();
            localStorage.setItem('emotion_history', JSON.stringify(history));

            // Update streak
            updateStreak(today, history);
        } catch (e) {
            console.warn('Could not save emotion history:', e.message);
        }
    }

    function updateStreak(today, history) {
        try {
            let streak = 0;
            let currentDate = new Date(today);

            for (let i = history.length - 1; i >= 0; i--) {
                const expectedDate = new Date(today);
                expectedDate.setDate(expectedDate.getDate() - (history.length - 1 - i));
                const expected = expectedDate.toISOString().split('T')[0];

                if (history[i].date === expected) {
                    streak++;
                } else {
                    break;
                }
            }

            localStorage.setItem('emotion_streak', streak.toString());

            // Show badge if streak >= 7
            if (streak >= 7) {
                const badge = document.createElement('div');
                badge.style.cssText = 'position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#ffd700,#ffed4e);padding:10px 20px;border-radius:50px;font-weight:bold;color:#000;z-index:9999;animation:bounceIn 0.5s ease;';
                const streakText = i18n?.t('tracker.streak') || '일 연속 측정!';
                badge.innerHTML = `🏆 ${streak}${streakText}`;
                document.body.appendChild(badge);
                setTimeout(() => badge.remove(), 5000);
            }
        } catch (e) {}
    }

    // Show emotion change tracker
    function getEmotionComparison() {
        try {
            const history = JSON.parse(localStorage.getItem('emotion_history') || '[]');
            if (history.length < 2) return '';

            const latest = history[history.length - 1];
            const previous = history[history.length - 2];

            const diff = latest.temp - previous.temp;
            const arrow = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
            const changeText = diff > 0 ? (i18n?.t('tracker.warmer') || '감정이 더 따뜻해졌어요') : diff < 0 ? (i18n?.t('tracker.cooler') || '감정이 더 차가워졌어요') : (i18n?.t('tracker.same') || '감정이 비슷해요');
            const comparisonLabel = i18n?.t('tracker.comparison') || '어제 대비';

            return `<div style="background:rgba(255,255,255,0.05);padding:1em;margin:1em 0;border-radius:8px;"><small>${arrow} ${comparisonLabel}: ${changeText} (${diff > 0 ? '+' : ''}${diff}°C)</small></div>`;
        } catch (e) {
            return '';
        }
    }

    // Show screen
    function show(screen) {
        [introScreen, questionScreen, loadingScreen, resultScreen].forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
        screen.classList.remove('hidden');
        screen.classList.add('active');
    }

    // Start test
    function startTest() {
        currentQ = 0;
        scores = [];
        show(questionScreen);
        showQuestion();
        // GA4: 테스트 시작
        if (typeof gtag === 'function') {
            gtag('event', 'test_start', {
                app_name: 'emotion-temp',
                test_type: 'emotion_temperature',
                content_type: 'test'
            });
        }
    }

    // Show question
    function showQuestion() {
        const q = QUESTIONS[currentQ];
        const total = QUESTIONS.length;

        document.getElementById('progress-fill').style.width = `${((currentQ) / total) * 100}%`;
        document.getElementById('progress-text').textContent = `${currentQ + 1} / ${total}`;

        document.getElementById('q-text').textContent = i18n.t(q.textKey);

        const optionsEl = document.getElementById('q-options');
        // Shuffle options for variety
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);

        optionsEl.innerHTML = shuffled.map((opt, i) => `
            <button class="option-btn" data-score="${opt.score}" style="animation-delay: ${i * 0.08}s">
                ${i18n.t(opt.textKey)}
            </button>
        `).join('');

        // Animate card
        const card = document.getElementById('question-card');
        card.classList.remove('slide-in');
        void card.offsetWidth;
        card.classList.add('slide-in');

        // Bind clicks
        optionsEl.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => selectOption(btn));
        });
    }

    // Select option
    function selectOption(btn) {
        // Prevent double-click
        const options = document.querySelectorAll('.option-btn');
        options.forEach(o => o.disabled = true);

        btn.classList.add('selected');
        scores.push(parseInt(btn.dataset.score));

        setTimeout(() => {
            currentQ++;
            if (currentQ < QUESTIONS.length) {
                showQuestion();
            } else {
                showLoading();
            }
        }, 400);
    }

    // Loading animation
    function showLoading() {
        show(loadingScreen);
        const fill = document.getElementById('loading-fill');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => showResult(), 300);
            }
            fill.style.width = `${progress}%`;
        }, 200);
    }

    // Show result
    function showResult() {
        const totalScore = scores.reduce((a, b) => a + b, 0);
        tempValue = scoreToTemp(totalScore);
        resultData = getResult(tempValue);

        show(resultScreen);
        incrementTestCount();
        saveEmotionHistory(tempValue);

        // Temperature display
        document.getElementById('result-temp').textContent = `${tempValue}°C`;
        document.getElementById('result-title').textContent = `"${i18n.t(resultData.titleKey)}"`;
        document.getElementById('result-desc').textContent = i18n.t(resultData.descKey);

        // Thermometer fill animation
        const fillPercent = ((tempValue + 10) / 50) * 100;
        setTimeout(() => {
            document.getElementById('thermo-fill').style.height = `${Math.max(5, Math.min(fillPercent, 100))}%`;
            document.getElementById('thermo-bulb').style.background = resultData.color;
        }, 100);

        // Traits
        document.getElementById('result-traits').innerHTML = resultData.traitsKeys.map(k => `<li>${i18n.t(k)}</li>`).join('');
        document.getElementById('result-activities').innerHTML = resultData.activitiesKeys.map(k => `<li>${i18n.t(k)}</li>`).join('');
        document.getElementById('result-warnings').innerHTML = resultData.warningsKeys.map(k => `<li>${i18n.t(k)}</li>`).join('');

        // Emotion change tracker
        const emotionComparison = getEmotionComparison();

        // New enrichment content
        let compatText = emotionComparison || '';
        compatText += i18n.t(resultData.compatKey);
        if (resultData.adviceKey) {
            compatText += `<br><br><strong>\u{1F4A1} ${i18n.t(resultData.adviceKey)}</strong>`;
        }
        if (resultData.quoteKey) {
            compatText += `<br><blockquote style="font-style:italic;margin:1em 0;padding:1em;border-left:3px solid ${resultData.color};opacity:0.9">\u275D${i18n.t(resultData.quoteKey)}\u275E</blockquote>`;
        }
        if (resultData.statisticsKey) {
            compatText += `<br><small>${i18n.t(resultData.statisticsKey)}</small>`;
        }
        const savedText = i18n?.t('tracker.saved') || '당신의 감정이 저장되었습니다. 내일도 다시 측정해보세요!';
        compatText += `<br><small style="opacity:0.6;">💾 ${savedText}</small>`;
        document.getElementById('result-compat-text').innerHTML = compatText;

        // Set card border color (borderImage breaks border-radius)
        document.getElementById('result-card').style.borderColor = resultData.color;

        // GA tracking
        gtag('event', 'test_complete', { test_type: 'emotion_temperature', result: `${tempValue}C_${i18n.t(resultData.titleKey)}` });

        // Scroll to top
        resultScreen.scrollTop = 0;
    }

    // Share
    function shareResult() {
        const url = 'https://dopabrain.com/emotion-temp/';
        const shareTitle = i18n?.t('share.title') || 'Emotional Temperature';
        const shareText = i18n?.t('share.text') || 'My emotional temperature is';
        const text = `${shareText} ${tempValue}°C!\n\n"${i18n.t(resultData.titleKey)}" ${resultData.emoji}\n${i18n.t(resultData.subtitleKey)}\n\n${url}`;

        gtag('event', 'share', { method: 'native', test_type: 'emotion_temperature' });

        if (navigator.share) {
            navigator.share({ title: `${shareTitle} ${tempValue}°C ${resultData.emoji}`, text: text, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                const copyMessage = i18n?.t('share.copied') || 'Result copied!';
                alert(copyMessage);
            }).catch(() => {});
        }
    }

    // Generate share image
    function generateShareImage() {
        const canvas = document.getElementById('share-canvas');
        const ctx = canvas.getContext('2d');
        const w = 1080, h = 1080;

        canvas.width = w;
        canvas.height = h;

        // Background gradient (dynamic based on temperature)
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, resultData.color);
        gradient.addColorStop(1, resultData.colorEnd || '#0a0a1e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Subtle pattern - circles
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 50 + 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // Thermometer visual (simple bars on sides)
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        const thermo_width = 30;
        const thermo_height = 300;
        const fill_percent = ((tempValue + 10) / 50) * 100;
        ctx.fillRect(w * 0.08, 300, thermo_width, thermo_height);
        ctx.fillStyle = resultData.color;
        ctx.fillRect(w * 0.08, 300 + (thermo_height * (100 - fill_percent) / 100), thermo_width, (thermo_height * fill_percent / 100));

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(w * 0.92 - thermo_width, 300, thermo_width, thermo_height);
        ctx.fillStyle = resultData.color;
        ctx.fillRect(w * 0.92 - thermo_width, 300 + (thermo_height * (100 - fill_percent) / 100), thermo_width, (thermo_height * fill_percent / 100));

        // Top label
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        const topLabel = i18n?.t('canvas.topLabel') || '나의 감정 온도는';
        ctx.fillText(topLabel, w / 2, 150);

        // Temperature (large, bold)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 160px sans-serif';
        ctx.fillText(`${tempValue}°C`, w / 2, 380);

        // Emoji
        ctx.font = '120px serif';
        ctx.fillText(resultData.emoji, w / 2, 540);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 52px sans-serif';
        ctx.fillText(`"${i18n.t(resultData.titleKey)}"`, w / 2, 650);

        // Subtitle
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '32px sans-serif';
        ctx.fillText(i18n.t(resultData.subtitleKey), w / 2, 720);

        // Divider
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, 770);
        ctx.lineTo(w * 0.85, 770);
        ctx.stroke();

        // CTA
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '28px sans-serif';
        const ctaText = i18n?.t('canvas.cta') || '너는 몇 도? 👇';
        ctx.fillText(ctaText, w / 2, 850);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '24px sans-serif';
        const testName = i18n?.t('canvas.testName') || '감정 온도계 테스트';
        ctx.fillText(testName, w / 2, 900);

        // Branding
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '22px sans-serif';
        ctx.fillText('🔥 DopaBrain', w / 2, 1020);

        // Download
        const link = document.createElement('a');
        const downloadName = i18n?.t('canvas.downloadName') || 'emotion_temp';
        link.download = `${downloadName}_${tempValue}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        gtag('event', 'save_image', { test_type: 'emotion_temperature' });
    }

    // Premium content
    function showPremium() {
        // Show ad
        adOverlay.classList.remove('hidden');
        const countdownEl = document.getElementById('ad-countdown');
        const closeBtn = document.getElementById('btn-close-ad');
        let count = 5;
        closeBtn.classList.add('hidden');
        countdownEl.textContent = count;

        const interval = setInterval(() => {
            count--;
            countdownEl.textContent = count;
            if (count <= 0) {
                clearInterval(interval);
                closeBtn.classList.remove('hidden');
            }
        }, 1000);

        closeBtn.onclick = () => {
            adOverlay.classList.add('hidden');
            displayPremiumContent();
        };

        gtag('event', 'premium_click', { test_type: 'emotion_temperature' });
    }

    function displayPremiumContent() {
        const premiumEl = document.getElementById('premium-result');
        const contentEl = document.getElementById('premium-content');

        const monthlyAdvice = getMonthlyAdvice();
        const emotionPattern = getEmotionPattern();

        const patternLabel = i18n?.t('premium.patternAnalysis') || '📊 감정 패턴 분석';
        const tipsLabel = i18n?.t('premium.tipsLabel') || '📅 이번 달 감정 관리 팁';
        const compatLabel = i18n?.t('premium.compatLabel') || '💕 나와 잘 맞는 감정 온도';
        const compatNote = i18n?.t('premium.compatNote') || '반대 온도의 사람과 만나면 서로의 부족한 부분을 채워줄 수 있어요.';
        const routineLabel = i18n?.t('premium.routineLabel') || '🧘 맞춤 감정 루틴 (1주일)';

        contentEl.innerHTML = `
            <div class="premium-section">
                <h4>${patternLabel}</h4>
                <p>${emotionPattern}</p>
            </div>
            <div class="premium-section">
                <h4>${tipsLabel}</h4>
                <p>${monthlyAdvice}</p>
            </div>
            <div class="premium-section">
                <h4>${compatLabel}</h4>
                <p>${i18n.t(resultData.compatKey)}</p>
                <p class="premium-note">${compatNote}</p>
            </div>
            <div class="premium-section">
                <h4>${routineLabel}</h4>
                <ul>
                    <li>${i18n?.t('routine.monday') || 'Mon: Write emotion journal (5 min)'}</li>
                    <li>${i18n?.t('routine.tuesday') || 'Tue: Listen to favorite music (15 min)'}</li>
                    <li>${i18n?.t('routine.wednesday') || 'Wed: Walking & organizing thoughts (20 min)'}</li>
                    <li>${i18n?.t('routine.thursday') || 'Thu: Send message to friend'}</li>
                    <li>${i18n?.t('routine.friday') || 'Fri: Buy a small gift for yourself'}</li>
                    <li>${i18n?.t('routine.saturday') || 'Sat: Try something new'}</li>
                    <li>${i18n?.t('routine.sunday') || 'Sun: Set next week\'s emotion goal'}</li>
                </ul>
            </div>
        `;

        premiumEl.classList.remove('hidden');
        premiumEl.scrollIntoView({ behavior: 'smooth' });

        gtag('event', 'premium_view', { test_type: 'emotion_temperature' });
    }

    function getMonthlyAdvice() {
        const month = new Date().getMonth();
        const defaultAdvice = [
            "Harness the energy of a new year. It's a great time to set emotional goals.",
            "End of winter, start of spring. Enjoy the anticipation of change.",
            "With spring energy, try starting new relationships.",
            "Like cherry blossoms, your emotions flourish during this season.",
            "A month full of energy! Release emotions through outdoor activities.",
            "Mid-year check-in time. Reflect on your emotions in the first half.",
            "Like summer heat, emotions can intensify. Take time to cool down.",
            "Self-care is important in the heat. Rest sufficiently.",
            "Beginning of autumn, the perfect time to organize emotions.",
            "Season of reading. Try reading books that stimulate your emotions.",
            "Year-end approaches. Share your feelings with grateful people.",
            "Wrap up the year by organizing your emotions and preparing for next year."
        ];
        try {
            const adviceList = i18n?.translations?.advice || defaultAdvice;
            return adviceList[month] || defaultAdvice[month];
        } catch (e) {
            return defaultAdvice[month];
        }
    }

    function getEmotionPattern() {
        const defaultPatterns = [
            "You are an 'Introverted Emotional Type' who processes emotions deeply within. You appear calm outwardly, but your inner world is rich. Try opening your heart gradually to people you can trust.",
            "You are a 'Balanced Emotional Type'. Your harmony of logic and emotion allows you to respond appropriately in most situations. Just make sure not to lose sight of your true feelings.",
            "You are a 'Warm Empathic Type'. You respond sensitively to others' emotions and naturally provide comfort and support. Also take good care of your own emotional energy.",
            "You are a 'Passionate Emotional Type'. You feel all emotions deeply and express them greatly. This is a great strength, but regular self-care is essential to prevent emotional burnout."
        ];
        try {
            const patterns = i18n?.translations?.patterns || defaultPatterns;
            if (tempValue <= 0) return patterns[0] || defaultPatterns[0];
            if (tempValue <= 10) return patterns[1] || defaultPatterns[1];
            if (tempValue <= 20) return patterns[2] || defaultPatterns[2];
            return patterns[3] || defaultPatterns[3];
        } catch (e) {
            if (tempValue <= 0) return defaultPatterns[0];
            if (tempValue <= 10) return defaultPatterns[1];
            if (tempValue <= 20) return defaultPatterns[2];
            return defaultPatterns[3];
        }
    }

    // Event listeners
    document.getElementById('btn-start').addEventListener('click', startTest);
    document.getElementById('btn-share').addEventListener('click', shareResult);
    document.getElementById('btn-save-image').addEventListener('click', generateShareImage);
    document.getElementById('btn-premium').addEventListener('click', showPremium);
    document.getElementById('btn-retry').addEventListener('click', () => {
        // Reset premium content visibility
        document.getElementById('premium-result').classList.add('hidden');
        show(introScreen);
        updateTestCount();
    });

    // Service Worker
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

    // i18n initialization
    (async function initI18n() {
        try {
            await i18n.loadTranslations(i18n.getCurrentLanguage());
            i18n.updateUI();

            const langToggle = document.getElementById('lang-toggle');
            const langMenu = document.getElementById('lang-menu');
            const langOptions = document.querySelectorAll('.lang-option');

            document.querySelector(`[data-lang="${i18n.getCurrentLanguage()}"]`)?.classList.add('active');

            langToggle?.addEventListener('click', () => langMenu.classList.toggle('hidden'));

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.language-selector')) {
                    langMenu?.classList.add('hidden');
                }
            });

            langOptions.forEach(opt => {
                opt.addEventListener('click', async () => {
                    await i18n.setLanguage(opt.getAttribute('data-lang'));
                    langOptions.forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    langMenu.classList.add('hidden');
                });
            });
        } catch (e) {
            console.warn('i18n init failed:', e);
        }
    })();

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('app-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('app-theme', next);
            themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
        });
    }

    // Init
    updateTestCount();

    // Hide app loader
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 300);
    }
})();
