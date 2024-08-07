/**
 * Scripting for MEGA Pages.
 */

/**
 * If megapages is loaded with a GET parameter affiliate ID set, save it to session storage and
 * update webclient link targets with the affiliate ID, to pass it on.
 */
class AffiliateLinker {
    validPeriod = 86400 * 30; // affiliate ID valid for 30 days (in seconds)

    constructor() {
        this.setIdFromCurrentUrl();
        this.updateWebclientTargets();
    }

    /**
     * Check current URL for an affiliate ID GET parameter and save it to local storage.
     */
    setIdFromCurrentUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('aff')) {
            Storage.local.setItem('affiliate', JSON.stringify({
                id: urlParams.get('aff'),
                ts: Math.floor(Date.now() / 1000), // seconds
            }));
        }
    }

    /**
     * Try to get the affiliate ID from local storage. If the ID doesn't exist or
     * is older than the {@link validPeriod}, return undefined.
     *
     * @returns {string|undefined} affiliate ID string or undefined if not valid.
     */
    tryGetIdFromStorage() {
        let affiliate = Storage.local.getItem('affiliate');
        try {
            affiliate = JSON.parse(affiliate);
        }
        catch (e) {
            console.error("Couldn't parse affiliate data.");
            console.trace(e, affiliate);
            return;
        }

        // Check ID exists
        if (!affiliate || !affiliate.id) return;

        // If date exists check expiry
        if (affiliate.ts && Math.floor(Date.now() / 1000) - affiliate.ts > this.validPeriod) {
            // Remove expired affiliate data
            Storage.local.removeItem('affiliate');
            return;
        }

        return affiliate.id;
    }

    /**
     * Update all webclient link targets with the affiliate ID saved in session storage, if it exists.
     */
    updateWebclientTargets() {
        const affiliateId = this.tryGetIdFromStorage();
        if (!affiliateId) return;

        for (const [a, url] of WebclientUtils.getWebclientLinks().entries()) {
            url.searchParams.set('aff', affiliateId);
            a.href = url.href;
        }
    }
}

/** External affiliate service */
class CjAffiliateLinker {
    validPeriod = 86400 * 30; // event ID valid for 30 days (in seconds)

    constructor() {
        this.setIdFromCurrentUrl();
        this.updateWebclientTargets();
    }

    /** Check current URL for a CJ event ID GET parameter and save it to local storage. */
    setIdFromCurrentUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('cjevent')) {
            Storage.local.setItem('cj.event', JSON.stringify({
                id: urlParams.get('cjevent'),
                ts: Math.floor(Date.now() / 1000), // seconds since Epoch
            }));
        }
    }

    /**
     * Try to get the event ID from local storage. If the ID doesn't exist or
     * is older than the {@link validPeriod}, return undefined.
     *
     * @returns {string|undefined} event ID string or undefined if not valid.
     */
    tryGetIdFromStorage() {
        let event = Storage.local.getItem('cj.event');
        try {
            event = JSON.parse(event);
        }
        catch (e) {
            console.error("Couldn't parse affiliate data.");
            console.trace(e, event);
            return;
        }

        // Check ID exists
        if (!event || !event.id) return;

        // If date exists check expiry
        if (event.ts && Math.floor(Date.now() / 1000) - event.ts > this.validPeriod) {
            // Remove expired event data
            Storage.local.removeItem('cj.event');
            return;
        }

        return event.id;
    }

    /** Update all webclient link targets with the affiliate ID saved in session storage, if it exists. */
    updateWebclientTargets() {
        const eventId = this.tryGetIdFromStorage();
        if (!eventId) return;

        for (const [a, url] of WebclientUtils.getWebclientLinks().entries()) {
            url.searchParams.set('cjevent', eventId);
            a.href = url.href;
        }
    }
}

class BillingPeriod {
    static Monthly = 1;
    static Yearly = 12;
}

/**
 * Abstract class for plans.
 *
 * See also {@linkcode Plans} plans manager and child plan types
 * {@linkcode StandardPlan}, {@linkcode FeaturePlan}, {@linkcode BusinessPlan}, {@linkcode ProFlexiPlan}
 */
class Plan {
    /** Unique ID for this plan */
    id;
    /** Description of this plan */
    description;
    /** Item this plan purchases, e.g. pro = 0, business/flexi = 1 */
    item;
    /** How many months this plan covers */
    months;
    /** User account level as per {@link Plans.AccountLevels} */
    accountLevel;

    static fromApiResponse(response) {
        let plan;

        if (response.al === Plans.AccountLevels.Business) {
            plan = BusinessPlan.fromApiResponse(response);
        }
        else if (response.al === Plans.AccountLevels.ProFlexi) {
            plan = ProFlexiPlan.fromApiResponse(response);
        }
        else if (response.f && typeof response.f === 'object' && Object.keys(response.f).length > 0) {
            plan = FeaturePlan.fromApiResponse(response);
        }
        else {
            plan = StandardPlan.fromApiResponse(response);
        }

        plan.id = response.id;
        plan.description = response.d;
        plan.item = response.it;
        plan.months = response.m;
        plan.accountLevel = response.al;

        return plan;
    }
}

/**
 * Regular plan like Pro Lite, Pro II, etc.
 * @see Plan
 * @see Plans
 */
class StandardPlan extends Plan {
    storage;
    transfer;
    price;
    localPrice;
    monthlyBasePrice;

    static fromApiResponse(response) {
        const plan = new StandardPlan();

        plan.storage = response.s;
        plan.transfer = response.t;
        plan.price = response.p / 100;
        plan.localPrice = response.lp / 100;
        plan.monthlyBasePrice = response.mbp / 100;

        return plan;
    }
}

/**
 * Feature plan for a standalone feature like e.g. VPN
 * {@linkcode Plan}, {@linkcode Plans}
 */
class FeaturePlan extends Plan {
    features = { };
    price;
    localPrice;
    monthlyBasePrice;

    static fromApiResponse(response) {
        const plan = new FeaturePlan();

        plan.features = response.f;
        plan.price = response.p / 100;
        plan.localPrice = response.lp / 100;
        plan.monthlyBasePrice = response.mbp / 100;

        return plan;
    }
}

/**
 * Business plan.
 * @see Plan
 * @see Plans
 */
class BusinessPlan extends Plan {
    minUsers;
    base = {};
    extra = {};

    static fromApiResponse(response) {
        const plan = new BusinessPlan();

        plan.minUsers = response.bd.minu;

        plan.base = {
            storage: response.bd.ba.s,
            transfer: response.bd.ba.t,
        };

        plan.extra = {
            storagePrice: response.bd.sto.p / 100,
            storageLocalPrice: response.bd.sto.lp / 100,
            transferPrice: response.bd.trns.p / 100,
            transferLocalPrice: response.bd.trns.lp / 100,
            userPrice: response.bd.us.p / 100,
            userLocalPrice: response.bd.us.lp / 100,
        }

        return plan;
    }
}

/**
 * Pro Flexi plan.
 * @see Plan
 * @see Plans
 */
class ProFlexiPlan extends Plan {
    base = {};
    extra = {};

    static fromApiResponse(response) {
        const plan = new ProFlexiPlan();

        plan.base = {
            storage: response.bd.ba.s,
            transfer: response.bd.ba.t,
            price: response.bd.ba.p / 100,
            localPrice: response.bd.ba.lp / 100,
        };

        plan.extra = {
            storagePrice: response.bd.sto.p / 100,
            storageLocalPrice: response.bd.sto.lp / 100,
            transferPrice: response.bd.trns.p / 100,
            transferLocalPrice: response.bd.trns.lp / 100,
        }

        return plan;
    }
}

/**
 * Singleton to manage MEGA plans.
 * @see Plan
 */
class Plans {
    static AccountLevels = {
        Free: 0,
        ProLite: 4,
        ProI: 1,
        ProII: 2,
        ProIII: 3,
        ProFlexi: 101,
        Business: 100,
    };

    static Names = {
        [Plans.AccountLevels.Free]: 'Free',
        [Plans.AccountLevels.ProLite]: 'Pro Lite',
        [Plans.AccountLevels.ProI]: 'Pro I',
        [Plans.AccountLevels.ProII]: 'Pro II',
        [Plans.AccountLevels.ProIII]: 'Pro III',
        [Plans.AccountLevels.ProFlexi]: 'Pro Flexi',
        [Plans.AccountLevels.Business]: 'Business',
    }

    static _instance;

    _plans;
    _allPlans;
    _fetchPromise;
    _fetchAllPromise;

    currency = 'EUR';
    currencySymbol = '€';
    localCurrency = 'EUR';
    localCurrencySymbol = '€';

    /** @returns {Plans} */
    static get instance() {
        if (!Plans._instance) {
            Plans._instance = new Plans();
        }

        return Plans._instance;
    }

    /**
     * Get MEGA plans appropriate for the user's market.
     * Will fetch from API first if not already fetched.
     * Use {@link getAll} to get all plans, including plans not appropriate for the user's market.
     * @returns {Promise<Array>}
     */
    async get() {
        if (this._plans == null) {
            this._fetchPromise ||= this._fetchFromApi();
            this._plans = await this._fetchPromise;
        }

        return this._plans || [];
    }

    /**
     * Get all MEGA plans.
     * Will fetch from API first if not already fetched.
     * Use {@link get} to get only plans appropriate for the user's market.
     * @returns {Promise<Array>}
     */
    async getAll() {
        if (this._allPlans == null) {
            this._fetchAllPromise ||= this._fetchAllFromApi();
            this._allPlans = await this._fetchAllPromise;
        }

        return this._allPlans || [];
    }

    /**
     * Asynchronously fetch market-appropriate plans from the API.
     * @returns {Promise<Array|null>}
     */
    async _fetchFromApi() {
        const fetchPromise = Api.request({
            a: 'utqa', // get a list of plans
            nf: 2, // extended format
            b: 1, // also show business plans
            p: 1, // include the Pro Flexi plan
            ft: 1, // include feature plans like VPN
        });

        return this._handleResponsePromise(fetchPromise);
    }

    /**
     * Asynchronously fetch all plans from the API.
     * @returns {Promise<Array|null>}
     */
    async _fetchAllFromApi() {
        const fetchPromise = Api.request({
            a: 'utqa', // get a list of plans
            nf: 2, // extended format
            b: 1, // also show business plans
            p: 1, // include the Pro Flexi plan
            ft: 1, // include feature plans like VPN
            r: 1, // all plans (include plans hidden from user's market, like Pro Lite)
        });

        return this._handleResponsePromise(fetchPromise);
    }

    /** @returns {Promise<Array|null>} */
    async _handleResponsePromise(response) {
        try {
            response = await response;
        }
        catch (e) {
            console.error('Couldn\'t request plans from API.', e.message);
            return null;
        }

        if (!Array.isArray(response)) {
            console.error('API response to plans request is something unexpected.');
            return null;
        }

        const currencyData = response[0].l;

        this.currency = currencyData.c;
        this.currencySymbol = currencyData.cs;
        this.localCurrency = currencyData.lc || this.currency;
        this.localCurrencySymbol = currencyData.lcs || this.currencySymbol;

        return response.filter(obj => !obj.l).map(planDetails => Plan.fromApiResponse(planDetails));
    }

    /**
     * Convert the given amount into the user's local currency, as detected by the API.
     * @return {Promise<Object>}
     * */
    static async localCurrencyConvert(amount) {
        const fallback = {
            amount: amount,
            sign: '€',
            name: 'EUR',
            country: 'ISO',
        };

        let response;
        try {
            response = await Api.request({ a: 'lcc', 'amount': amount });
        }
        catch (e) {
            console.error(`Couldn't get the amount "${amount}" in user's local currency via the API.`, e.message);
            return fallback;
        }

        if (!response || typeof response !== 'object') {
            console.error(`API returned unexpected response when getting the amount "${amount}" in user's local currency.`,
                Number.isInteger(response) ? `Code: ${response} (${ApiErrors.getMessage(response)})` : '');
            return fallback;
        }

        return response;
    }
}

class Discounts {
    constructor() {
        this._discounts = { };
        this._discountPromises = { };
    }

    /** @returns {Discounts} */
    static get instance() {
        if (!Discounts._instance) {
            Discounts._instance = new Discounts();
        }

        return Discounts._instance;
    }

    /**
     * Fetch the {@see Discount} info (or otherwise the API response) for the given code from the API.
     *
     * @param code Discount URL slug name for a given discount
     * @returns {Promise<*>}
     */
    async get(code) {
        if (!code) return null;

        if (!this._discounts[code]) {
            // Reuse promises to avoid duplicate requests
            this._discountPromises[code] ||= this._fetchAndParse(code);
            const discount = await this._discountPromises[code];
            delete this._discountPromises[code];

            return discount;
        }

        return this._discounts[code];
    }

    /**
     * Fetch the {@linkcode Discount} info (or otherwise the API response) for the given code from the API.
     * The associated {@linkcode Plan} info will be attached to the {@linkcode Discount} object as field "plan".
     *
     * @param {string} code
     * @returns {Promise<*|null>}
     */
    async getWithPlan(code) {
        if (!code) return null;

        const [discount, plans] = await Promise.all([Discounts.instance.get(code), Plans.instance.getAll()]);

        if (discount instanceof Discount) {
            const plan = plans.find(plan => plan.accountLevel === discount.accountLevel);
            discount.plan = plan instanceof Plan ? plan : null;
        }

        return discount;
    }

    async _fetchAndParse(code) {
        const discountInfo = await this._fetch(code);
        if (!discountInfo || typeof discountInfo !== 'object') {
            return discountInfo;
        }

        this._discounts[code] = Discount.fromResponse(discountInfo); // Only cache successful responses

        return this._discounts[code];
    }

    async _fetch(code) {
        const request = Api.request({
            a: 'dci',
            dc: null,
            extra: true,
            su: code,
        });

        let response;
        try {
            response = await request;
        }
        catch (e) {
            console.error(`API discount information request for code '${code}' failed.`, e.message);
            return null;
        }

        if (typeof response !== 'object') {
            console.error(`API discount information request for code '${code}' failed.`, ApiErrors.getMessage(response) || response);
        }

        return response;
    }
}

class Discount {
    get planName() {
        return Plans.Names[this.accountLevel];
    }

    static fromResponse(response) {
        const discount = new Discount();

        discount.accountLevel = response.al; // Account Level
        discount.durationMonths = response.m; // Months
        discount.discountPercentage = response.pd; // Percent Discount
        /** Timestamp of when the discount offer expires */
        discount.expiryTimestamp = response.ex;
        /** Whether the user will be charged the normal plan price when the discount period ends */
        discount.compulsorySubscription = response.cs; // Compulsory Subscription
        /** Whether the discount code can be used multiple times */
        discount.multiUse = response.md // Multi-use Discount

        discount.euro = { };
        discount.euro.undiscountedPrice = response.etp; // Euro Total Price (undiscounted)
        discount.euro.discountedPrice = response.edtp; // Euro Discounted Total Price
        discount.euro.discountedAmount = response.eda // Euro Discount Amount (amount saved)

        discount.local = { };
        discount.local.undiscountedPrice = response.ltp; // Local Total Price (undiscounted)
        discount.local.discountedPrice = response.ldtp; // Local Discounted Total Price
        discount.local.discountedAmount = response.lda; // Local Discounted Amount (amount saved)

        return discount;
    }
}

/**
 * Singleton to manage MEGA job listings.
 * @see JobListing
 */
class JobListings {
    static _instance;

    _jobs;
    _fetchPromise;

    static get instance() {
        if (!JobListings._instance) {
            JobListings._instance = new JobListings();
        }

        return JobListings._instance;
    }

    /**
     * Get all job listings. Will fetch from API first if not already fetched.
     * Returns a promise.
     */
    async getAll() {
        if (this._jobs == null) {
            await this.fetchFromApi();
        }

        return this._jobs || [];
    }

    /**
     * Asynchronously set the jobs array with data from the API.
     * Returns a promise.
     */
    async fetchFromApi() {
        if (!this._fetchPromise) {
            this._fetchPromise = Api.request({
                a: 'ttfj',
            });
        }

        let response;
        try {
            response = await this._fetchPromise;
        }
        catch (e) {
            console.error('Couldn\'t request job listings from API.', e.message);
            return;
        }

        if (!Array.isArray(response)) {
            console.error('API response to job listings request is something unexpected.');
            return;
        }

        this._jobs = [];
        for (let i = 1; i < response.length; i++) {
            const jobData = response[i];
            if (jobData.length < 5) {
                console.warn('Unexpected job data instance from API response: Not enough fields.');
                continue;
            }

            this._jobs.push(new JobListing(jobData[0], jobData[1], jobData[2], jobData[3], jobData[4]));
        }
    }
}

/**
 * Instance of a MEGA job listing.
 * @see JobListings
 */
class JobListing {
    id;
    jobTitle;
    jobField;
    description;
    url;

    constructor(id, jobTitle, jobField, description, url) {
        this.id = id;
        this.jobTitle = jobTitle;
        this.jobField = jobField;
        this.description = description;
        this.url = url;
    }
}

/**
 * A class for localizing price values / currencies.
 *
 * Used by the pricing-page/plan-price-calculator and product-comparison modules, and
 * any future modules which require price values / currencies to be formatted.
 */
class CurrencyLocalizer {
    currency;
    display;
    noDecimals;
    locale;

    constructor(currency, display, noDecimals) {
        this.currency = currency || 'EUR';
        this.display = display || 'symbol';
        this.noDecimals = noDecimals ?? false;
        this.locale = L10n.getFormatLocale();
    }

    /**
     * Function to format currency with current locale. Adapted from webclient code (locale.js)
     * @param {Number} value Value to format
     * @param {String} [currency] Currency to use in currency formatting. Default: 'EUR'
     * @param {String} [display] display type of currency format, supporting types are below:
     *                  'symbol' - use a localized currency symbol but with country code such as "NZ$",
     *                  'narrowSymbol' - use a localized currency symbol without country code such as "$" for "NZ$",
     *                  'code' - use the ISO currency code such as "NZD",
     *                  'name' - use a localized currency name such as "dollar"
     *                  'number' - just number with correct decimal
     * @param {Boolean} noDecimals If the number should be displayed without decimals
     * @returns {String} formated currency value
     */
    format(value) {
        value = typeof value === 'string' ? parseFloat(value) : value;

        var narrowSymbol = false;

        if (this.display === 'narrowSymbol') {
            this.display = 'symbol';
            narrowSymbol = this.currency !== 'EUR'; // Euro cannot have country
        }

        const options = { 'style': 'currency', 'currency': this.currency, currencyDisplay: this.display };

        if (this.noDecimals) {
            options.maximumFractionDigits = 0;
            options.minimumFractionDigits = 0;
        }

        let result = value.toLocaleString(this.locale, options);

        // For Safari that 'symbol' result same as 'code', using fallback locale without country code to avoid the bug.
        if (this.display === 'symbol' && result.indexOf(this.currency.toUpperCase()) !== -1) {

            // Romanian with Euro Symbol currency display is currently buggy on all browsers, so doing this to polyfill it
            if (this.locale.startsWith('ro')) {
                result = value.toLocaleString('fr', options);
            }
            else {
                result = value.toLocaleString(L10n.languageCode, options);
            }
        }

        // Polyfill for narrow symbol format as lacking support on Safari and old browers
        if (narrowSymbol) {
            // Cover NZ$, $NZ kinds case to just $ and not change something like NZD
            result = result.replace(/\b[A-Z]{2}\b/, '');
        }

        if (this.locale === 'fr' && this.display === 'symbol') {
            result = result.replace(/([^1-9A-Za-z])([A-Z]{2})/, '$1 $2');
        }

        return result;
    }

    static formatPrice(price, currency, display, noDecimals) {
        return (new CurrencyLocalizer(currency, display, noDecimals)).format(price);
    }
}

class DailyStats {
    static _stats;

    static _fetchPromise;

    /** @returns {Promise<Object> | null} */
    static async get() {
        await this._ensureInit();

        return this._stats;
    }

    static async getTimestamp() {
        await this._ensureInit();

        return this._stats && this._stats.timestamp || 0;
    }

    static async getTotalUsers() {
        await this._ensureInit();

        return this._stats && this._stats.confirmedusers && this._stats.confirmedusers.total || 0;
    }

    static async getDeltaUsers() { } // TODO stub, fill as needed

    static async getTotalFiles() {
        await this._ensureInit();

        return this._stats && this._stats.files && this._stats.files.total || 0;
    }

    static async getDeltaFiles() { } // TODO stub

    /** @returns {Promise<Object> | null} */
    static async _fetchStats() {
        this._fetchPromise = this._fetchPromise || Api.request({ a: 'dailystats' });

        let response;
        try {
            response = await this._fetchPromise;
        }
        catch (e) {
            console.error('Couldn\'t request daily stats from API.', e.message);
            return null;
        }
        finally {
            this._fetchPromise = null;
        }

        if (typeof response !== 'object') {
            console.error('Unexpected response from API when fetching daily stats.',
                Number.isInteger(response) ? `${response} ${ApiErrors.getMessage(response)}` : '');
            return null;
        }

        return response;
    }

    static async _ensureInit() {
        if (!this._stats) {
            this._stats = await this._fetchStats();
        }
    }
}

class User {
    /** See webclient/css/avatars.css */
    static _webclientColourStylesCount = 12;

    _firstName;
    _avatar;
    _avatarColourKey;
    _planNum;

    /**
     * @param {string} firstName
     * @param {string} avatar
     * @param {int} planNum
     * @param {int} avatarColourKey
     */
    constructor(firstName, avatar, planNum, avatarColourKey) {
        this._firstName = firstName || '';
        this._avatar = avatar || '';
        this._avatarColourKey = parseInt(avatarColourKey) || 1;
        this._planNum = parseInt(planNum) || -1;

        // Check the avatar colour key is in range of available styles
        if (this._avatarColourKey < 1 || this._avatarColourKey > User._webclientColourStylesCount) {
            this._avatarColourKey = 1;
        }
    }

    /**
     * Get the first name of the user.
     *
     * @returns {String} user's first name
     */
    get name() {
        return this._firstName
    };

    /**
     * Get the base64-encoded custom avatar of the user, if it exists.
     * Otherwise, consider using {@link avatarColourKey}.
     *
     * @returns {String} user's base64-encoded avatar
     */
    get avatar() {
        return this._avatar;
    }

    /**
     * Get the webclient-generated avatar colour class of this user.
     * Defaults to "color1" if the real colour key is not available.
     * Consider using {@link avatar} if possible.
     *
     * @returns {String}
     */
    get avatarColourKey() {
        return `color${this._avatarColourKey}`;
    }

    /**
     * Get the identifying number of the user's MEGA plan.
     *
     * @returns {Number}
     */
    get planNum() {
        return this._planNum;
    }
}

/**
 * Automatically pause videos when not in view or tab loses focus, for performance.
 * Intended for video animations. Particularly beneficial for Firefox.
 */
class VideoPauser {
    constructor() {
        this._onObserve = this._onObserve.bind(this);
        this._onVisibilityChanged = this._onVisibilityChanged.bind(this);

        this.visibleVideos = new Set();
        this.observer = new IntersectionObserver(this._onObserve);

        document.addEventListener('visibilitychange', this._onVisibilityChanged);
    }

    static get instance() {
        if (!VideoPauser._instance) {
            VideoPauser._instance = new VideoPauser();
        }

        return VideoPauser._instance;
    }

    /** @param {HTMLVideoElement} video */
    registerVideo(video) {
        // Only target video animations
        if (video.loop) {
            this.observer.observe(video);
        }
    }

    _onObserve(observables) {
        for (const observable of observables) {
            if (observable.isIntersecting) {
                this.visibleVideos.add(observable.target);
                this._tryPlay(observable.target);
            }
            else {
                this.visibleVideos.delete(observable.target);
                observable.target.pause();
            }
        }
    }

    _onVisibilityChanged() {
        if (document.hidden) {
            for (const video of this.visibleVideos) {
                video.pause();
            }
        }
        else {
            for (const video of this.visibleVideos) {
                this._tryPlay(video);
            }
        }
    }

    async _tryPlay(video) {
        try {
            await video.play();
        }
        catch (e) {
            if (e instanceof DOMException &&
                (e.message.includes('play() request was interrupted')
                    || e.message.includes('media resource was aborted by the user'))) {
                // Video pause requested before async play could fulfil, this is fine
                // (e.g. still loading while video is scrolled out of view)
                return;
            }
            if (e.name !== 'AbortError') {
                throw e;
            }
        }
    }
}

ThemeManager.registerThemes(['light', 'dark']);

function setListNumber() {
    $('.page-container ol').each((i, element) => {
        const $li = $('li', element).first();
        const startNumber = element.start;
        $li.css('counter-increment', `item ${startNumber}`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded. Initializing scripting.');

    LanguageRedirector.redirect();
    if (!LanguageRedirector.isRedirecting) { // avoid duplicate logs
        CampaignTagger.init();
    }

    if (L10n.languageCode === 'ar') {
        $('.button .icon.arrow-right').addClass('arrow-left').removeClass('arrow-right');
        $('.text-button .icon.arrow-right').addClass('arrow-left').removeClass('arrow-right');
    }

    AddLangToWebclientURL.addLangInfoToURL();

    if (Storage.session.getItem('userFirstName')) {
        window.user = new User(
            Storage.session.getItem('userFirstName'),
            Storage.session.getItem('userAvatar'),
            parseInt(Storage.session.getItem('userPlanNum')),
            parseInt(Storage.session.getItem('userAvatarColourKey')),
        );
    }

    window.affiliateLinker = new AffiliateLinker();
    window.cjAffiliateLinker = new CjAffiliateLinker();
    window.overlay = new Overlay($('body > .overlay.standard'));
    window.overlayWithHeader = new Overlay($('body > .overlay.with-header'));
    window.mobileNavMenu = new MobileMenuModal($('.mobile-modals .nav-menu')[0]);
    window.header = new Header($('body > header.site-header'));
    window.footer = new Footer($('body > footer.site-footer'));
    window.cookieBanner = new CookieBanner(document.querySelector('body > dialog.cookie-banner'));

    if (window.user) {
        window.header.setAccountBtnsVisibility(false);
        window.mobileNavMenu.setAccountBtnsVisibility(false);

        if (window.user.avatar) {
            const ab = Utils.base64ToAb(window.user.avatar);
            const blob = new Blob([ab], { type: 'image/jpeg' });
            const url = window.URL.createObjectURL(blob);

            window.header.setCustomAvatar(url);
        }
        else {
            window.header.setAvatar(window.user.name, window.user.avatarColourKey);
        }

        // Remove Achievements and Pricing links from footer if user is on a Business/Pro Flexi plan
        if (window.user.planNum === Plans.AccountLevels.Business || window.user.planNum === Plans.AccountLevels.ProFlexi) {
            $('footer.site-footer a[href*="/achievements"], footer.site-footer a[href*="/pricing"]').remove();
        }
    }

    // Modals used across multiple pages
    const modals = ModalRegister.modalContainer;
    ModalRegister.registerModal(new LanguageSwitcher(modals.querySelector('.modal.language-switcher')));
    ModalRegister.registerModal(new CookieDialog(modals.querySelector('.modal.cookie-dialog')));

    setListNumber();

    // init MEGA custom blocks
    const pageContainer = document.querySelector('.page-container');
    if (pageContainer) {
        const selectorClassMap = {
            '.downloads-dropdown': () => DownloadsDropdown,
            '.feature-accordion': () => FeatureAccordion,
            '.feature-alternating': () => FeatureAlternating,
            '.feature-cards': () => SolutionsCards,
            '.feature-columns': () => FeatureColumns,
            '.horizontal-downloads-module': () => HorizontalDownloads,
            '.product-card': () => DownloadAppCards,
            '.hero-section': () => HeroSection,
            '.animated-hero': () => AnimatedHero,
            '.toc-group': () => Toc,
            '.product-comparison': () => ProductComparison,
            '.single-slice': () => SingleSlice,
            '.social-proof': () => SocialProof,
            '.competitor-matrix .matrix-card': () => CompetitorMatrixCard,
            '.pro-flexi-business-pricing-module': () => ProFlexiBusinessPricing,
            '.pricing-table-core': () => PricingTable,
            '.pricing-table.individual': () => PricingTableIndividual,
            '.features-table': () =>  PricingFeaturesTable,
            '.open-source-module': () => OpenSource,
            '.leadership-team-list': () =>  LeadershipTeamList,
            '.counter-module': () => CounterModule,
            '.timeline-container': () => Timeline,
            '.business-page-pricing-module': () => BusinessPagePricing,
            '.refer-calculator': () => ReferCalculator,
            '.input-form-field-module': () => InputFormField,
            '.home-social-proof': () => HomeSocialProof,
            '.full-width-banner': () => FullWidthBanner,
            '.bottom-cta': () => BottomCTA,
            'section.appeal-form': () => AppealFormBlock,
            'section.copyright-notice': () => CopyrightNotice,
            'section.currency-selector': () => CurrencySelector,
            'section.discount-banner': () => DiscountBanner,
            'section.discount-hero': () => DiscountHero,
            'section.package-downloads': () => PackageDownloads,
            'section.s4-ryi': () => S4Ryi,
            'section.tab-structure-block': () => TabStructureBlock,
            'section.vpn-pricing': () => VpnPricing,
        };

        for (const [selector, getClass] of Object.entries(selectorClassMap)) {
            for (const element of pageContainer.querySelectorAll(selector)) {
                try {
                    const Class = getClass();
                    new Class(element);
                }
                catch (e) {
                    console.error(`Error while instantiating class for element: `, element, e);
                }
            }
        }
    }

    const placeholders = [
        {
            key: 's4StorageValue',
            _fetchValue: async () => {
                const s4StorageValue = await Plans.localCurrencyConvert(1000);

                const localisedPrice = CurrencyLocalizer
                    .formatPrice(s4StorageValue.amount, s4StorageValue.name, 'narrowSymbol', true);
                return `${localisedPrice} ${s4StorageValue.name}`;
            },
        },
        {
            key: 's4PerTBPrice',
            _fetchValue: async () => {
                const s4PerTBPrice = await Plans.localCurrencyConvert(2.99);

                const localisedPrice = CurrencyLocalizer
                    .formatPrice(s4PerTBPrice.amount, s4PerTBPrice.name, 'narrowSymbol', true);
                return `${localisedPrice} ${s4PerTBPrice.name}`;
            },
        },
        {
            key: 'totalUsersCompactLong',
            _fetchValue: async () => {
                const totalUsers = Utils.floorToSigFigs(await DailyStats.getTotalUsers(), 3);

                const formatter = new Intl.NumberFormat(L10n.getFormatLocale(), {
                    notation: 'compact',
                    compactDisplay: 'long',
                });

                return formatter.format(totalUsers);
            }
        }
    ];

    PlaceholderPopulator.init(placeholders);

    console.log('Page ready.');
});
