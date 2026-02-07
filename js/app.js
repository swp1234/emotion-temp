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

    // Update test count display
    function updateTestCount() {
        try {
            const count = parseInt(localStorage.getItem('emotion_test_count') || '0');
            const el = document.getElementById('intro-count');
            if (count > 0) el.textContent = `${count.toLocaleString()}명이 참여했어요!`;
        } catch (e) {}
    }

    function incrementTestCount() {
        try {
            const count = parseInt(localStorage.getItem('emotion_test_count') || '0') + 1;
            localStorage.setItem('emotion_test_count', count.toString());
        } catch (e) {}
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
        document.getElementById('result-compat-text').textContent = resultData.compat;

        // Set card gradient
        document.getElementById('result-card').style.borderImage = `linear-gradient(135deg, ${resultData.color}, ${resultData.colorEnd}) 1`;

        // GA tracking
        gtag('event', 'test_complete', { test_type: 'emotion_temperature', result: `${tempValue}C_${resultData.title}` });

        // Scroll to top
        resultScreen.scrollTop = 0;
    }

    // Share
    function shareResult() {
        const url = 'https://swp1234.github.io/emotion-temp/';
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

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, resultData.color);
        gradient.addColorStop(1, resultData.colorEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Subtle pattern
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 40 + 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Top label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('나의 감정 온도는', w / 2, 180);

        // Temperature
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 160px sans-serif';
        ctx.fillText(`${tempValue}°C`, w / 2, 400);

        // Emoji
        ctx.font = '100px serif';
        ctx.fillText(resultData.emoji, w / 2, 530);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(`"${resultData.title}"`, w / 2, 660);

        // Subtitle
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '32px sans-serif';
        ctx.fillText(resultData.subtitle, w / 2, 720);

        // CTA
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '28px sans-serif';
        ctx.fillText('너는 몇 도? 👉 감정 온도계 테스트', w / 2, 920);

        // Branding
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '22px sans-serif';
        ctx.fillText('🔥 FireTools', w / 2, 1010);

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
        show(introScreen);
        updateTestCount();
    });

    // Service Worker
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

    // Init
    updateTestCount();
})();
