/**
 * Scripting for marketing.
 */

class HubSpot {
    static get scriptUrl() {
        return document.documentElement.dataset.hubspotScriptUrl || null;
    }

    static init() {
        if (this._isInit) return;
        this._isInit = true;

        const scriptUrl = this.scriptUrl;
        if (!scriptUrl) return;

        this._fetchTrackerScript(scriptUrl);
    }

    static _fetchTrackerScript(scriptUrl) {
        const script = document.createElement('script');
        script.id = 'hs-script-loader';
        script.async = true;
        script.defer = true;
        script.src = scriptUrl;
        document.head.appendChild(script);
    }
}

(() => {
    if (CookieSettings.isMarketingAllowed()) {
        HubSpot.init();
    }
    else {
        CookieSettings.onConsentChanged.addListener(() => {
            if (CookieSettings.isMarketingAllowed()) {
                HubSpot.init();
            }
        });
    }
})();
