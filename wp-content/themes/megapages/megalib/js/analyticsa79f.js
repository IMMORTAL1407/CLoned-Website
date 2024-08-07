/**
 * Scripting for analytics.
 */

class Gtm {
    static get gtmId() {
        return document.documentElement.dataset.gtmId || null;
    }

    static init() {
        if (this._isInit) return;
        this._isInit = true;

        const gtmId = this.gtmId;
        if (!gtmId) return;

        window.dataLayer ||= [];
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });

        this.gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
        });

        this.gtag('consent', 'update', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted'
        });

        this._fetchTagManager(gtmId);
        this.isEnabled = true;
    }

    static gtag() {
        window.dataLayer.push(arguments);
    }

    static _fetchTagManager(gtmId) {
        const script = window.document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        document.head.appendChild(script);
    }
}

class GA4 {
    static get gaMeasurementId() {
        return document.documentElement.dataset.gaMeasurementId || null;
    }

    static init() {
        if (this._isInit) return;
        this._isInit = true;

        const gaMeasurementId = this.gaMeasurementId;
        if (!gaMeasurementId) return;

        this._fetchTagScript(gaMeasurementId);

        window.dataLayer ||= [];
        this.gtag('js', new Date());
        this.gtag('config', gaMeasurementId, { cookie_flags: 'SameSite=None; Secure' });
        this.gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
        });
        this.gtag('consent', 'update', {
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'ad_storage': 'granted',
            'analytics_storage': 'granted'
        });
    }

    static gtag() {
        window.dataLayer.push(arguments);
    }

    static _fetchTagScript(gaMeasurementId) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
        document.head.appendChild(script);
    }
}

(() => {
    const initScripts = () => {
        Gtm.init();
        if (!Gtm.isEnabled) {
            // Don't init GA4 if GTM is initialized
            GA4.init();
        }
    }

    if (CookieSettings.isAnalyticsAllowed()) {
        initScripts();
    }
    else {
        CookieSettings.onConsentChanged.addListener(() => {
            if (CookieSettings.isAnalyticsAllowed()) {
                initScripts();
            }
        });
    }
})();
