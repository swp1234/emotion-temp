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
                el.textContent = `${count.toLocaleString()}명이 참여했어요!`;
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
            if (isNaN(temp) || !resultData || !resultData.title) return;

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
            history.push({ date: today, temp: temp, title: resultData.title });

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
                badge.innerHTML = `🏆 ${streak}일 연속 측정!`;
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
            const changeText = diff > 0 ? '감정이 더 따뜻해졌어요' : diff < 0 ? '감정이 더 차가워졌어요' : '감정이 비슷해요';

            return `<div style="background:rgba(255,255,255,0.05);padding:1em;margin:1em 0;border-radius:8px;"><small>${arrow} 어제 대비: ${changeText} (${diff > 0 ? '+' : ''}${diff}°C)</small></div>`;
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
        gtag('event', 'test_start', { test_type: 'emotion_temperature' });
    }

    // Show question
    function showQuestion() {
        const q = QUESTIONS[currentQ];
        const total = QUESTIONS.length;

        document.getElementById('progress-fill').style.width = `${((currentQ) / total) * 100}%`;
        document.getElementById('progress-text').textContent = `${currentQ + 1} / ${total}`;

        document.getElementById('q-text').textContent = q.text;

        const optionsEl = document.getElementById('q-options');
        // Shuffle options for variety
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);

        optionsEl.innerHTML = shuffled.map((opt, i) => `
            <button class="option-btn" data-score="${opt.score}" style="animation-delay: ${i * 0.08}s">
                ${opt.text}
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
        document.getElementById('result-title').textContent = `"${resultData.title}"`;
        document.getElementById('result-desc').textContent = resultData.desc;

        // Thermometer fill animation
        const fillPercent = ((tempValue + 10) / 50) * 100;
        setTimeout(() => {
            document.getElementById('thermo-fill').style.height = `${Math.max(5, Math.min(fillPercent, 100))}%`;
            document.getElementById('thermo-bulb').style.background = resultData.color;
        }, 100);

        // Traits
        document.getElementById('result-traits').innerHTML = resultData.traits.map(t => `<li>${t}</li>`).join('');
        document.getElementById('result-activities').innerHTML = resultData.activities.map(a => `<li>${a}</li>`).join('');
        document.getElementById('result-warnings').innerHTML = resultData.warnings.map(w => `<li>${w}</li>`).join('');

        // Emotion change tracker
        const emotionComparison = getEmotionComparison();

        // New enrichment content
        let compatText = emotionComparison || '';
        compatText += resultData.compat;
        if (resultData.advice) {
            compatText += `<br><br><strong>💡 ${resultData.advice}</strong>`;
        }
        if (resultData.quote) {
            compatText += `<br><blockquote style="font-style:italic;margin:1em 0;padding:1em;border-left:3px solid ${resultData.color};opacity:0.9">❝${resultData.quote}❞</blockquote>`;
        }
        if (resultData.statistics) {
            compatText += `<br><small>${resultData.statistics}</small>`;
        }
        compatText += `<br><small style="opacity:0.6;">💾 당신의 감정이 저장되었습니다. 내일도 다시 측정해보세요!</small>`;
        document.getElementById('result-compat-text').innerHTML = compatText;

        // Set card border color (borderImage breaks border-radius)
        document.getElementById('result-card').style.borderColor = resultData.color;

        // GA tracking
        gtag('event', 'test_complete', { test_type: 'emotion_temperature', result: `${tempValue}C_${resultData.title}` });

        // Scroll to top
        resultScreen.scrollTop = 0;
    }

    // Share
    function shareResult() {
        const url = 'https://dopabrain.com/emotion-temp/';
        const text = `🌡️ 나의 감정 온도는 ${tempValue}°C!\n\n"${resultData.title}" ${resultData.emoji}\n${resultData.subtitle}\n\n너의 감정 온도는 몇 도? 👇\n${url}\n\n#감정온도계 #심리테스트 #감정테스트`;

        gtag('event', 'share', { method: 'native', test_type: 'emotion_temperature' });

        if (navigator.share) {
            navigator.share({ title: `감정 온도 ${tempValue}°C ${resultData.emoji}`, text, url }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('결과가 복사되었습니다! 친구에게 공유해보세요 🌡️');
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
        ctx.fillText('나의 감정 온도는', w / 2, 150);

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
        ctx.fillText(`"${resultData.title}"`, w / 2, 650);

        // Subtitle
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '32px sans-serif';
        ctx.fillText(resultData.subtitle, w / 2, 720);

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
        ctx.fillText('너는 몇 도? 👇', w / 2, 850);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '24px sans-serif';
        ctx.fillText('감정 온도계 테스트', w / 2, 900);

        // Branding
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '22px sans-serif';
        ctx.fillText('🔥 DopaBrain', w / 2, 1020);

        // Download
        const link = document.createElement('a');
        link.download = `감정온도_${tempValue}도.png`;
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

        contentEl.innerHTML = `
            <div class="premium-section">
                <h4>📊 감정 패턴 분석</h4>
                <p>${emotionPattern}</p>
            </div>
            <div class="premium-section">
                <h4>📅 이번 달 감정 관리 팁</h4>
                <p>${monthlyAdvice}</p>
            </div>
            <div class="premium-section">
                <h4>💕 나와 잘 맞는 감정 온도</h4>
                <p>${resultData.compat}</p>
                <p class="premium-note">반대 온도의 사람과 만나면 서로의 부족한 부분을 채워줄 수 있어요.</p>
            </div>
            <div class="premium-section">
                <h4>🧘 맞춤 감정 루틴 (1주일)</h4>
                <ul>
                    <li>월: 감정 일기 쓰기 (5분)</li>
                    <li>화: 좋아하는 음악 듣기 (15분)</li>
                    <li>수: 산책하며 생각 정리 (20분)</li>
                    <li>목: 친구에게 안부 메시지 보내기</li>
                    <li>금: 나를 위한 작은 선물 사기</li>
                    <li>토: 새로운 경험 하나 해보기</li>
                    <li>일: 다음 주 감정 목표 세우기</li>
                </ul>
            </div>
        `;

        premiumEl.classList.remove('hidden');
        premiumEl.scrollIntoView({ behavior: 'smooth' });

        gtag('event', 'premium_view', { test_type: 'emotion_temperature' });
    }

    function getMonthlyAdvice() {
        const month = new Date().getMonth();
        const advice = [
            "새해의 에너지를 활용하세요. 감정 목표를 세우기 좋은 달입니다.",
            "겨울의 끝, 봄의 시작. 변화에 대한 기대감을 즐기세요.",
            "봄기운과 함께 새로운 관계를 시작해보세요.",
            "벚꽃처럼 감정도 활짝 피어나는 시기입니다.",
            "에너지가 넘치는 달! 야외활동으로 감정을 해소하세요.",
            "중반기 점검 시기. 상반기 감정을 돌아보세요.",
            "여름 더위처럼 감정도 뜨거워질 수 있어요. 쿨다운 시간을 가지세요.",
            "무더위 속 자기 관리가 중요합니다. 충분히 쉬세요.",
            "가을의 시작, 감정 정리에 최적의 시기입니다.",
            "독서의 계절. 감성을 자극하는 책을 읽어보세요.",
            "연말이 다가옵니다. 감사한 사람에게 마음을 전하세요.",
            "한 해를 마무리하며 감정을 정리하고 내년을 준비하세요."
        ];
        return advice[month];
    }

    function getEmotionPattern() {
        if (tempValue <= 0) return "당신은 감정을 내면에서 깊이 처리하는 '내향 감정형'입니다. 겉으로는 차분해 보이지만 속마음은 풍부합니다. 신뢰할 수 있는 사람에게 조금씩 마음을 열어보세요.";
        if (tempValue <= 10) return "당신은 '균형 감정형'입니다. 이성과 감성의 조화가 뛰어나 대부분의 상황에서 적절히 대처할 수 있습니다. 다만 자신의 진짜 감정을 놓치지 않도록 주의하세요.";
        if (tempValue <= 20) return "당신은 '따뜻한 공감형'입니다. 타인의 감정에 민감하게 반응하며 자연스럽게 위로와 지지를 줍니다. 자신의 감정 에너지도 잘 관리해주세요.";
        return "당신은 '열정 감정형'입니다. 모든 감정을 깊게 느끼고 크게 표현합니다. 이것은 큰 강점이지만, 감정 소진을 방지하기 위해 규칙적인 자기 관리가 필수입니다.";
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
    })();

    // Init
    updateTestCount();
})();
