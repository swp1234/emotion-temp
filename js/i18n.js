class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'zh', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
    }

    detectLanguage() {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        if (urlLang && this.supportedLanguages.includes(urlLang)) return urlLang;

        const savedLang = localStorage.getItem('app_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) return savedLang;

        const browserLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) return browserLang;

        return 'en';
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error('Locale not found');
            this.translations[lang] = await response.json();
            return true;
        } catch (error) {
            if (lang !== 'en') {
                const result = await this.loadTranslations('en');
                if (result) this.currentLang = 'en';
                return result;
            }
            return false;
        }
    }

    t(key) {
        if (!key) return '';
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        if (!value) {
            const fallbackLang = Object.keys(this.translations)[0];
            if (fallbackLang) value = this.translations[fallbackLang];
            if (!value) return key;
        }

        for (const segment of keys) {
            if (value != null && typeof value === 'object' && value[segment] !== undefined) {
                value = value[segment];
            } else {
                return key;
            }
        }

        return value != null ? value : key;
    }

    getSeoHref(lang) {
        const links = document.querySelectorAll('link[rel="alternate"][hreflang]');
        const hrefMap = {};

        links.forEach((link) => {
            const hreflang = link.getAttribute('hreflang');
            if (hreflang) hrefMap[hreflang] = link.href;
        });

        return hrefMap[lang] || hrefMap['x-default'] || (document.querySelector('link[rel="canonical"]') || {}).href || window.location.href;
    }

    syncSeoState(lang, updateHistory = false) {
        const currentUrl = new URL(window.location.href);
        const currentHasLangParam = currentUrl.searchParams.has('lang');
        const targetHref = this.getSeoHref(updateHistory || currentHasLangParam ? lang : 'x-default');

        if (targetHref) {
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) canonical.href = targetHref;

            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) ogUrl.content = targetHref;

            const twitterUrl = document.querySelector('meta[name="twitter:url"]');
            if (twitterUrl) twitterUrl.content = targetHref;
        }

        if (updateHistory && targetHref) {
            const nextUrl = new URL(targetHref);
            nextUrl.hash = currentUrl.hash;
            if (currentUrl.pathname !== nextUrl.pathname || currentUrl.search !== nextUrl.search || currentUrl.hash !== nextUrl.hash) {
                window.history.replaceState({}, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
            }
        }
    }

    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return false;

        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;
        this.updateUI();
        this.syncSeoState(lang, true);
        return true;
    }

    updateUI() {
        document.documentElement.lang = this.currentLang;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const value = this.t(el.getAttribute('data-i18n'));
            if (value === el.getAttribute('data-i18n')) return;
            el.textContent = value;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
        });

        const title = this.t('meta.title') !== 'meta.title' ? this.t('meta.title') : this.t('app.title');
        if (title) document.title = title;

        const description = this.t('meta.description') !== 'meta.description' ? this.t('meta.description') : this.t('app.description');
        const meta = document.querySelector('meta[name="description"]');
        if (meta && description !== 'app.description') meta.content = description;

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && title) ogTitle.content = title;

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription && description !== 'app.description') ogDescription.content = description;

        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle && title) twitterTitle.content = title;

        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription && description !== 'app.description') twitterDescription.content = description;

        this.syncSeoState(this.currentLang);
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getLanguageName(lang) {
        const names = {
            ko: '\uD55C\uAD6D\uC5B4',
            en: 'English',
            ja: '\u65E5\u672C\u8A9E',
            es: 'Espa\u00F1ol',
            pt: 'Portugu\u00EAs',
            zh: '\u4E2D\u6587',
            id: 'Bahasa Indonesia',
            tr: 'T\u00FCrk\u00E7e',
            de: 'Deutsch',
            fr: 'Fran\u00E7ais',
            hi: '\u0939\u093F\u0928\u094D\u0926\u0940',
            ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439'
        };
        return names[lang] || lang;
    }
}

let i18n;
try {
    i18n = new I18n();
} catch (error) {
    console.warn('i18n init failed:', error);
    i18n = {
        loadTranslations: async () => true,
        setLanguage: async () => true,
        t: (key) => key,
        getCurrentLanguage: () => 'en',
        updateUI: () => {}
    };
}
