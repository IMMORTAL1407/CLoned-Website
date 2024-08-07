/**
 * Scripting for common MEGA WP manager and helper classes.
 */

const $ = jQuery;

/**
 * Remove and re-add the given event listener to the given event
 * to ensure there is just one instance of the given listener bound.
 *
 * @param event
 * @param listener
 * @returns {*|jQuery}
 */
$.fn.rebind = function (event, listener) {
    return this.off(event, listener).on(event, listener);
};

/**
 * Bag of utility functions.
 */
class Utils {
    /**
     * Sleep for the given amount of milliseconds.
     *
     * @param ms duration in milliseconds.
     * @returns {Promise<unknown>}
     */
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Similar to {@link String.replace} but with asynchronous callback support.
     * The resulting string is returned after all matches are replaced.
     * Courtesy of {@link https://stackoverflow.com/questions/33631041/javascript-async-await-in-replace Chris Morgan}
     *
     * @param string
     * @param regexp
     * @param replacerFunction
     * @returns {Promise<*>}
     */
    static async replaceAsync(string, regexp, replacerFunction) {
        const replacements = await Promise.all(
            Array.from(string.matchAll(regexp),
                match => replacerFunction(...match)));
        let i = 0;
        return string.replace(regexp, () => replacements[i++]);
    }

    /**
     * Convert a string to an {@link ArrayBuffer}.
     *
     * @param {string} b
     *
     * @returns {ArrayBuffer}
     */
    static strToAb(b) {
        let ab = new ArrayBuffer((b.length + 15) & -16);
        let u8 = new Uint8Array(ab);

        for (let i = b.length; i--;) {
            u8[i] = b.charCodeAt(i);
        }

        return ab;
    }

    /**
     * Scrolls the given element into view, but only if out of view.
     * FIXME: may need tweaking for use-cases other than document scrolling, tweak as needed.
     *
     * @param element The element to scroll into view.
     * @param options The options for scrolling. Supports position: 'start', 'center', 'end'
     */
    static scrollIntoViewIfNeeded(element, options = { position: 'start' }) {
        const topHeight = parseInt($(':root').css('--top-height').trim());

        const rect = element.getBoundingClientRect();
        const inViewVertically = rect.top >= topHeight && rect.bottom <= window.innerHeight;
        const inViewHorizontally = rect.left >= 0 && rect.right <= window.innerWidth;

        if (!inViewVertically || !inViewHorizontally) {
            const end = ['start', 'center', 'end'].includes(options.position) ? options.position : 'end';

            element.scrollIntoView({ block: end, inline: end });
        }
    }

    /**
     * Convert a base64 string to an {@link ArrayBuffer}.
     *
     * @param {string} a
     * @returns {ArrayBuffer}
     */
    static base64ToAb(a) {
        return Utils.strToAb(Utils.base64UrlDecode(a));
    }

    /**
     * Encode a string as Base64 URL.
     *
     * @param {string} string
     * @returns {string}
     */
    static base64UrlEncode(string) {
        string = unescape(encodeURIComponent(string)); // Unicode to UTF-8
        string = btoa(string); // To base64
        // Replace characters according to the Base64 URL specifications
        return string.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    /**
     * Decode a base64-encoded string.
     *
     * @param {string} data
     * @returns {string}
     */
    static base64UrlDecode(data) {
        data += '=='.substr((2 - data.length * 3) & 3);
        data = data.replace(/\-/g, '+').replace(/_/g, '/').replace(/,/g, '');

        try {
            return atob(data);
        }
        catch (e) {
            return '';
        }
    }

    /**
     * Encode a string as URL-safe Base64.
     *
     * @param {string} str
     * @returns {string}
     */
    static base64UrlEncodeUtf8(str) {
        const utf8Bytes = new TextEncoder().encode(str);
        const base64 = btoa(String.fromCharCode(...utf8Bytes));

        // // Replace characters according to the Base64 URL specifications
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    /**
     * Decode a url-safe base64-encoded string.
     *
     * @param {string} str
     * @returns {string}
     */
    static base64UrlDecodeUtf8(str) {
        // URL-safe base64 to base64
        str = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.substr((2 - str.length * 3) & 3);

        const base64Bytes = atob(str).split('').map(c => c.charCodeAt(0));
        return new TextDecoder().decode(new Uint8Array(base64Bytes));
    }

    /**
     * Floors a number to the specified number of significant figures.
     *
     * @param {number} number
     * @param {number} sigFigs
     *
     * @returns {number}
     */
    static floorToSigFigs(number, sigFigs) {
        if (number === 0) return 0;

        const factor = Math.pow(10, Math.floor(Math.log10(Math.abs(number))) - (sigFigs - 1));
        return Math.floor(number / factor) * factor;
    }

    /**
     * Check if a {@link URL} has a filename - e.g. /downloads/mega.exe
     *
     * @param {URL} url
     * @returns {boolean} true if the URL looks like a filename
     */
    static hasFilename(url) {
        return /\/[^\/]+\.[^\/]+$/.test(url.pathname);
    }
}

/** Helper utilities from webclient */
class WebclientUtils {
    // From webclient copyright.js validateUrl()
    /**
     * Parse the given URL to validate as a MEGA share link, and check what type of link (file, folder etc.)
     *
     * @param {string} link
     */
    static parseMegaUrl(link) {
        let url = '';

        try {
            url = new URL(link);
        }
        catch (e) {
            return false;
        }

        const ext = url && String(url.protocol).endsWith('-extension:');

        const ourDomains = { 'mega.co.nz': 1, 'mega.nz': 1, 'mega.io': 1 };

        if (!url || !ourDomains[url.host] && !ext) {
            return null;
        }
        let path = (ext ? '' : url.pathname) + url.hash;

        if (url.hash) {
            const hash = String(url.hash).replace('#', '');

            if (hash[0] === '!' || hash[0] === 'F' && hash[1] === '!') {
                path = hash[0] === 'F'
                    ? hash.replace('F!', '/folder/').replace('!', '#').replace('!', '/folder/').replace('?', '/file/')
                    : hash.replace('!', '/file/').replace('!', '#');
            }
            else if (hash[0] === 'P' && hash[1] === '!') {
                const a = Utils.base64UrlDecode(hash.substring(2));
                const b = String.fromCharCode(a.charCodeAt(2))
                    + String.fromCharCode(a.charCodeAt(3))
                    + String.fromCharCode(a.charCodeAt(4))
                    + String.fromCharCode(a.charCodeAt(5))
                    + String.fromCharCode(a.charCodeAt(6))
                    + String.fromCharCode(a.charCodeAt(7));
                path = '/file/' + Utils.base64UrlEncode(b);
            }
        }

        const match = path.match(/^[#/]*(file|folder|embed|collection|album)[!#/]+([\w-]{8})\b/i);

        if (!match) {
            return null;
        }
        const result = [match[1], match[2]];

        if (match[1] === 'folder') {
            const ffmatch = path.replace(match[0], '').match(/(file|folder)\/([\w-]{8})/i) || [];
            if (ffmatch[1] === 'file') {
                result[0] = 'file';
            }
            result.push(ffmatch[2]);
        }
        return result;
    }

    /**
     * Returns a cached map of {@link HTMLAnchorElement}s and their parsed {@link URL}s.
     *
     * @returns {Map<HTMLAnchorElement, URL>}
     */
    static getWebclientLinks() {
        if (this._webclientLinks) return this._webclientLinks;

        this._webclientLinks = new Map();

        for (const a of document.getElementsByTagName('a')) {
            if (!a || !a.href) continue;

            let url;
            try {
                url = new URL(a.href);
            }
            catch (e) {
                console.warn('Element with invalid href found.');
                console.trace(a);
                continue;
            }

            if (url.hostname !== 'mega.nz') continue;
            if (Utils.hasFilename(url)) continue; // Don't include MEGA package download links - such links are not part of webclient
            if (url.hostname.startsWith('/linux')) continue; // Linux downloads directory explorer is not webclient

            this._webclientLinks.set(a, url);
        }

        return this._webclientLinks;
    }
}

/* region Managers, Helpers */

/**
 * An event object for simple event listener registration and invocation to
 * provide events without requiring attachment to DOM elements.
 * For global events, consider using Reactor.
 *
 * @see Reactor
 */
class Event {
    constructor() {
        this._callbacks = new Set();
    }

    invoke(...eventArgs) {
        for (const callback of this._callbacks) {
            callback(...eventArgs);
        }
    }

    addListener(callback) {
        this._callbacks.add(callback);
    }

    removeListener(callback) {
        this._callbacks.delete(callback);
    }
}

/**
 * A simple event system to provide events without requiring attachment to DOM elements.
 * Reactor is intended for global events. For scoped events, you can just instantiate an Event.
 *
 * Inspired by https://stackoverflow.com/questions/15308371/custom-events-model-without-using-dom-events-in-javascript
 * Courtesy of Mohsen
 *
 * @see Event
 */
class Reactor {
    static events = {};

    static registerEvent(eventName) {
        Reactor.events[eventName] = new Event();
    }

    static dispatchEvent(eventName, eventArgs) {
        const event = Reactor.events[eventName];
        if (!event) {
            console.warn(`An attempt was made to dispatch a non-existent event '${eventName}'.`);
            return;
        }

        console.log(`Dispatching '${eventName}' event.`);
        event.invoke(eventArgs);
    }

    static addEventListener(eventName, callback) {
        const event = Reactor.events[eventName];
        if (!event) {
            console.warn(`An attempt was made to register an event listener to a non-existent event '${eventName}'.`);
            return;
        }

        event.addListener(callback);
    }

    static removeEventListener(eventName, callback) {
        const event = Reactor.events[eventName];
        if (!event) {
            console.warn(`An attempt was made to remove an event listener from a non-existent event '${eventName}'.`);
            return;
        }

        event.removeListener(callback);
    }
}

class MemoryStorage {
    constructor() {
        this._data = {};
    }

    get length() {
        return Object.keys(this._data).length;
    }

    key(index) {
        const keys = Object.keys(this._data);
        return keys[index] || null;
    }

    /** @returns {string|null} */
    getItem(key) {
        return this._data.hasOwnProperty(key) ? this._data[key] : null;
    }

    setItem(key, value) {
        this._data[key] = String(value);
    }

    removeItem(key) {
        delete this._data[key];
    }

    clear() {
        this._data = {};
    }
}

class Storage {
    /** Get localStorage, or fall back to sessionStorage or even in-memory storage if not available. */
    static get local() {
        if (this.isLocalAvailable()) return window.localStorage;
        if (this.isSessionAvailable()) return window.sessionStorage;

        this.memoryStorage = this.memoryStorage || new MemoryStorage();
        return this.memoryStorage;
    }

    /** Get sessionStorage or fall back to in-memory storage if not available. */
    static get session() {
        if (this.isSessionAvailable()) return window.sessionStorage;

        this.memoryStorage = this.memoryStorage || new MemoryStorage();
        return this.memoryStorage;
    }

    static isLocalAvailable() {
        if (this._isLsAvailable !== undefined) return this._isLsAvailable;

        try {
            localStorage.setItem('test.ls', '1');
            this._isLsAvailable = localStorage.getItem('test.ls') === '1';
            localStorage.removeItem('test.ls');
        }
        catch (e) {
            this._isLsAvailable = false;
        }

        return this._isLsAvailable;
    }

    static isSessionAvailable() {
        if (this._isSsAvailable !== undefined) return this._isSsAvailable;

        try {
            sessionStorage.setItem('test.ss', '1');
            this._isSsAvailable = sessionStorage.getItem('test.ss') === '1';
            sessionStorage.removeItem('test.ss');
        }
        catch (e) {
            this._isSsAvailable = false;
        }

        return this._isSsAvailable;
    }
}

class CookieSettings {
    static onConsentChanged = new Event();

    static isPrefsAllowed() {
        return !!this.getConsent().preferences;
    }

    static isAnalyticsAllowed() {
        return !!this.getConsent().analytics;
    }

    static isMarketingAllowed() {
        return !!this.getConsent().marketing;
    }

    static isConsentSet() {
        const consent = this.getConsent();

        return Object.keys(consent).length > 0;
    }

    /** @returns {object} */
    static getConsent() {
        if (this._consent) return this._consent;

        const consent = Cookies.get('cookieConsent');
        try {
            this._consent = JSON.parse(consent);
        }
        catch {
            this._consent = {};
        }

        if (!this._consent || typeof this._consent !== 'object') {
            this._consent = {};
        }

        return this._consent;
    }

    /** @param {object} value */
    static setConsent(value) {
        const oldConsent = this._consent;

        this._consent = value;

        Cookies.set('cookieConsent', JSON.stringify(value), 365);
        this.onConsentChanged.invoke(this._consent, oldConsent);
    }
}

class Cookies {
    static get(name) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');

            if (key === name) {
                return value;
            }
        }
    }

    static set(name, value, days) {
        const properties = new Map();
        properties.set(name, value);

        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            properties.set('Expires', date.toUTCString());
        }

        const host = (new URL(window.location)).hostname;
        properties.set('Domain', host.endsWith('mega.io') ? 'mega.io' : host);
        properties.set('Path', '/');
        properties.set('SameSite', 'Strict; Secure');

        let cookie = '';
        for (const [key, value] of properties.entries()) {
            cookie += `${key}=${value};`;
        }

        document.cookie = cookie;
    }
}

class Prefs {
    static init() {
        CookieSettings.onConsentChanged.addListener(this._onConsentChanged.bind(this));
    }

    static remove(pref) {
        const key = `pref.${pref}`;

        Storage.local.removeItem(key);
        Storage.session.removeItem(key);
    }

    /** @returns {string|null} */
    static get(pref) {
        const key = `pref.${pref}`;

        const storage = CookieSettings.isPrefsAllowed() ? Storage.local : Storage.session;

        return storage.getItem(key);
    }

    static set(pref, value) {
        const key = `pref.${pref}`;

        const storage = CookieSettings.isPrefsAllowed() ? Storage.local : Storage.session;

        storage.setItem(key, value);
    }

    static _onConsentChanged(newConsent, oldConsent) {
        // Move preferences to sessionStorage or localStorage on preference cookie setting change.
        let newStorage;
        let oldStorage;

        if (newConsent.preferences && !oldConsent.preferences) {
            newStorage = Storage.local;
            oldStorage = Storage.session;
        }
        else if (!newConsent.preferences && oldConsent.preferences) {
            newStorage = Storage.session;
            oldStorage = Storage.local;
        }
        else return;

        for (let i = 0; i < oldStorage.length; i++) {
            const key = oldStorage.key(i);
            if (!key.startsWith('pref.')) continue;

            const value = oldStorage.getItem(key);
            newStorage.setItem(key, value);
        }
    }
}

/**
 * Communicate with the MEGA API servers.
 * {@link https://confluence.developers.mega.co.nz/display/API/API+Overview View API Documentation}
 * @see ApiErrors
 */
class Api {
    static get domain() {
        return Storage.local.getItem('d.api.domain') || 'https://g.api.mega.co.nz/';
    }

    static get csUrl() {
        Api._csUrl ||= this._getCsUrl();

        return Api._csUrl.href;
    }

    /** @param {string} domain */
    static setDomain(domain) {
        if (!domain) {
            Storage.local.removeItem('d.api.domain');
            return;
        }

        if (typeof domain !== 'string') {
            console.warn(`[API] Unexpected request URL domain value "${domain}". Expecting a non-empty string.`);
            return;
        }

        Storage.local.setItem('d.api.domain', domain);
    }

    /** @param {object} params */
    static setRequestUrlParams(params) {
        if (!params) {
            Storage.local.removeItem('d.api.requestParams');
            return;
        }

        if (typeof params !== 'object') {
            console.warn('[API] Unexpected request URL parameters value. Expecting a non-empty object.');
            return;
        }

        Storage.local.setItem('d.api.requestParams', JSON.stringify(params));
    }

    /**
     * Send a single request to the API servers.
     * Returns a promise.
     *
     * @param request
     * @returns {Promise<*>}
     */
    static async request(request) {
        const response = await Api._sendRequest(request);

        return Api._handleResponse(response);
    }

    static async _sendRequest(request) {
        const maxRetries = 4;

        // Send the request to the API.
        // If network error encountered, retry with exponential backoff.
        // If HTTP error encountered, retry with exponential backoff.
        // If max retries reached, throw error.

        for (let i = 1; i <= maxRetries; i++) {
            let response;

            try {
                response = await fetch(Api.csUrl, {
                    method: 'POST',
                    body: JSON.stringify([request]),
                });
            }
            catch (e) {
                // Network error encountered.
                console.warn(`[API] Network error encountered for API request (attempt ${i} of ${maxRetries}).`);

                if (i >= maxRetries) {
                    console.error(`[API] Couldn't send an API request after ${maxRetries} attempts.`);
                    console.debug(e);
                    throw new ApiRequestError(`[API] Sending the API request failed after ${maxRetries} attempts (network error).`);
                }

                // Let's retry w/ exponential backoff
                await Utils.sleep((i ** 2) * 1000);
                continue;
            }

            if (response.ok) return response;

            // HTTP error encountered.
            console.warn(`[API] HTTP error ${response.status} (${response.statusText}) encountered for API request (attempt ${i} of ${maxRetries}).`);

            if (i >= maxRetries) {
                console.error(`[API] Max retries reached on API request (HTTP error ${response.status}, ${response.statusText}).`);
                throw new ApiRequestError(`[API] The API request failed after ${maxRetries} attempts (HTTP error ${response.status}, ${response.statusText}).`);
            }

            // Let's retry w/ exponential backoff
            await Utils.sleep((i ** 2) * 1000);
        }
    }

    static async _handleResponse(response) {
        let responseBody;
        try {
            responseBody = await response.json();
        }
        catch (e) {
            console.error('[API] Couldn\'t decode an API response as json.', e);
            throw new ApiRequestError('Decoding the API response failed.');
        }

        // If the API just returns a negative integer and not json, there is an issue with this api layer.
        if (Number.isInteger(responseBody)) {
            console.error(`[API] API error ${responseBody}: ${ApiErrors.getMessage(responseBody)}`);
            throw new ApiRequestError('API error.');
        }

        if (!Array.isArray(responseBody) || responseBody.length < 1) {
            console.error('[API] API returned something unexpected.');
            throw new ApiRequestError('API returned unexpected response.');
        }

        return responseBody[0];
    }

    static _getCsUrl() {
        const url = new URL(Api.domain);
        url.pathname = '/cs';

        let customUrlParams = Storage.local.getItem('d.api.requestParams');
        try {
            customUrlParams = JSON.parse(customUrlParams);
        }
        catch (e) {
            console.warn('[API] Unable to parse custom API request URL parameters. Expecting valid JSON.');
            return url;
        }

        if (!customUrlParams) return url;

        if (typeof customUrlParams !== 'object') {
            console.warn('[API] Unable to load custom API request URL parameters. Expecting an object.')
            return url;
        }

        url.search = new URLSearchParams(customUrlParams).toString();

        return url;
    }

    /**
     * @param {number} id
     * @param {string} message
     * @returns {Promise<*>}
     */
    static async log(id, message) {
        let response;
        try {
            response = await Api.request({ a: 'log', e: id, m: message });
        }
        catch (e) {
            console.error(`[API] Unable to log event "${id}."`, e.message);
            return false;
        }

        if (response !== 0) {
            console.error(`[API] API returned unexpected response when logging event "${id}."`,
                Number.isInteger(response) ? `Code: ${response} (${ApiErrors.getMessage(response)})` : '');
            return false;
        }

        return true;
    }
}

/**
 * Stub error (add properties like error code as needed)
 *
 * @see Api
 */
class ApiRequestError extends Error {}

/**
 * Definitions for errors returned by the API servers.
 * {@link https://confluence.developers.mega.co.nz/display/SUPPORT/Api_error_codes View API Codes Documentation}
 * @see Api
 */
class ApiErrors {
    /** -1 */ static EINTERNAL = -1;
    /** -2 */ static EARGS = -2;
    /** -3 */ static EAGAIN = -3;
    /** -4 */ static ERATELIMIT = -4;
    /** -5 */ static EFAILED = -5;
    /** -6 */ static ETOOMANY = -6;

    /** -8 */ static EEXPIRED = -8;
    /** -9 */ static ENOENT = -9;

    /** -11 */ static EACCESS = -11;
    /** -12 */ static EEXIST = -12;

    /** -15 */ static ESID = -15;
    /** -16 */ static EBLOCKED = -16;

    /** -18 */ static ETEMPUNAVAIL = -18;
    /** -19 */ static ETOOMANYCONNECTIONS = -19;

    /** -26 */ static EMFAREQUIRED = -26;

    // Generic messages when reasons more specific for a command aren't available
    static messages = {
        [ApiErrors.EINTERNAL]: 'An unexpected error occurred in the API.',
        [ApiErrors.EARGS]: 'The required arguments provided to the API command were invalid or missing.',
        [ApiErrors.EAGAIN]: 'The API dropped the request. Try again later.',
        [ApiErrors.ERATELIMIT]: 'API rate limit exceeded.',
        [ApiErrors.EFAILED]: 'The API failed to handle the request.',
        [ApiErrors.ETOOMANY]: 'Too many actions done recently.',
        [ApiErrors.EEXPIRED]: 'The resource has expired.',

        [ApiErrors.ENOENT]: 'The API could not find the requested entity.',
        [ApiErrors.EEXIST]: 'The API has already performed this action.',

        [ApiErrors.EACCESS]: 'The request was not authorised.',

        [ApiErrors.ESID]: ' The session authentication is invalid and is required for the command, or the command is otherwise not available.',
        [ApiErrors.EBLOCKED]: 'The API refused the request.',

        [ApiErrors.ETEMPUNAVAIL]: 'The API cannot handle this request at the time. Try again later.',
        [ApiErrors.ETOOMANYCONNECTIONS]: 'The API refused the request because there are too many connections.',

        [ApiErrors.EMFAREQUIRED]: 'Multi-factor authentication is required.',
    };

    static getMessage(code) {
        return ApiErrors.messages[code] || `Unknown error, code '${code}'.`;
    }
}

/**
 * Represents a layout breakpoint to define layout at a particular screen width.
 */
class Breakpoint {
    static XL = new Breakpoint('XL', 1320, Infinity);
    static LG = new Breakpoint('LG', 1080, 1320);
    static MD = new Breakpoint('MD', 768, 1080);
    static SM = new Breakpoint('SM', 0, 768);
    static SM_Old = new Breakpoint('SM_Old', 576, 768);
    static XS_Old = new Breakpoint('XS_Old', 0, 576);

    name;
    min;
    max;

    constructor(name, min, max) {
        this.name = name;
        this.min = min;
        this.max = max;
        Object.freeze(this);
    }

    /* Override operators in JS, when? */

    eq(breakpoint) {
        return this.min === breakpoint.min;
    }

    lt(breakpoint) {
        return this.min < breakpoint.min;
    }

    gt(breakpoint) {
        return this.min > breakpoint.min;
    }

    lteq(breakpoint) {
        return this.min <= breakpoint.min;
    }

    gteq(breakpoint) {
        return this.min >= breakpoint.min;
    }

    isWidthInside(width) {
        return width >= this.min && width <= this.max;
    }

    toString() {
        return this.name;
    }
}

/**
 * Simple static class to handle page layout breakpoint scripting.
 */
class Breakpointer {
    static breakpoints = [Breakpoint.XL, Breakpoint.LG, Breakpoint.MD, Breakpoint.SM];

    static currentBreakpoint = Breakpoint.XL;

    static breakpointChangedEvent = new Event();
    static initialisedEvent = new Event();

    static _isInitialised = false;

    static init() {
        Reactor.registerEvent('breakpoint-changed');

        $(window).on('load resize', () => {
            Breakpointer.setCurrent();

            if (!this._isInitialised) {
                this.initialisedEvent.invoke(Breakpointer.currentBreakpoint);
                this._isInitialised = true;
            }
        });
    }

    /**
     * Get the appropriate breakpoint from the given width.
     */
    static fromWidth(width) {
        for (const breakpoint of this.breakpoints) {
            if (breakpoint.isWidthInside((width))) {
                return breakpoint;
            }
        }

        return Breakpoint.XL;
    }

    /**
     * Updates the current breakpoint based on the window's size.
     */
    static setCurrent() {
        const newBreakpoint = this.fromWidth(window.innerWidth);
        if (newBreakpoint.eq(this.currentBreakpoint)) return;

        this.currentBreakpoint = newBreakpoint;
        Reactor.dispatchEvent('breakpoint-changed', this.currentBreakpoint);
        this.breakpointChangedEvent.invoke(this.currentBreakpoint);
        console.log(`New breakpoint set: ${this.currentBreakpoint}.`);
    }
}

/**
 * Simple static class to handle themes
 */
class ThemeManager {
    static themes = [];
    static currentTheme;
    static deviceColorScheme;

    static themeChangedEvent = new Event();

    static init() {
        Reactor.registerEvent('theme-changed');

        // Set the theme ASAP (when <body> is added) to eliminate white-screen flash.
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === 'BODY') {
                        ThemeManager.applyTheme();
                        observer.disconnect();
                    }
                }
            }
        });

        observer.observe(document.documentElement, { childList: true });

        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Check for and apply theme changes when showing a cached page
                ThemeManager.currentTheme = null; // preferred theme now unknown
                ThemeManager.applyTheme();
            }
        });

        this.initPrintEventListeners();
    }

    static get preferredTheme() {
        return Prefs.get('theme');
    }

    static registerThemes(themes) {
        if (!Array.isArray(themes)) {
            console.warn('Provided themes parameter is not an array. Not registering themes.');
        }

        ThemeManager.themes = [...ThemeManager.themes, ...themes];
    }

    static getTheme() {
        return ThemeManager.currentTheme;
    }

    static setTheme(theme) {
        if (!theme) {
            console.warn('Missing or invalid theme parameter given. Not setting theme.');
            return;
        }

        if (!ThemeManager.themes.includes(theme)) {
            console.warn(`Unrecognised theme '${theme}'. Not setting theme.`);
            return;
        }

        if (theme === ThemeManager.currentTheme) {
            console.warn(`Theme '${theme}' already set.`);
            return;
        }

        ThemeManager.currentTheme = theme;
        ThemeManager.applyTheme();
    }

    static applyTheme() {
        // Determine by current set theme or user preference, if set
        if (!ThemeManager.currentTheme) {
            ThemeManager.currentTheme = ThemeManager.preferredTheme;
        }

        // or default to OS/browser setting, if available
        if (!ThemeManager.currentTheme && window.matchMedia) {
            ThemeManager.deviceColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
            ThemeManager.currentTheme = ThemeManager.deviceColorScheme.matches ? 'dark' : 'light';

            ThemeManager.deviceColorScheme.removeEventListener('change', ThemeManager.onDeviceSchemeChange);
            ThemeManager.deviceColorScheme.addEventListener('change', ThemeManager.onDeviceSchemeChange);
        }

        if (!ThemeManager.currentTheme) {
            console.warn(`Unable to determine theme to apply.`);
            return;
        }

        document.body.classList.remove(...ThemeManager.themes.map(name => `theme-${name}`));
        document.body.classList.add(`theme-${ThemeManager.currentTheme}`);

        Reactor.dispatchEvent('theme-changed', ThemeManager.currentTheme);
        ThemeManager.themeChangedEvent.invoke(ThemeManager.currentTheme);
        console.log(`Theme '${ThemeManager.currentTheme}' applied.`);
    }

    static savePreference() {
        Prefs.set('theme', ThemeManager.currentTheme);
        console.log(`Theme preference saved as '${ThemeManager.preferredTheme}'.`);
    }

    static removePreference() {
        const storedValue = Prefs.get('theme');
        Prefs.remove('theme');
        console.log(`Theme preference of '${storedValue}' removed.`);
    }

    static onDeviceSchemeChange() {
        if (ThemeManager.preferredTheme) {
            // User has now set a preferred theme, which always overrides browser/OS setting.
            ThemeManager.deviceColorScheme.removeEventListener('change', ThemeManager.onDeviceSchemeChange);
            return;
        }

        ThemeManager.setTheme(ThemeManager.deviceColorScheme.matches ? 'dark' : 'light');
    }

    static initPrintEventListeners() {
        let theme;
        window.addEventListener('beforeprint', () => {
            theme = ThemeManager.getTheme();
            if (theme !== 'light') {
                ThemeManager.setTheme('light');
            }
        });

        window.addEventListener('afterprint', () => {
            if (theme && theme !== ThemeManager.getTheme()) {
                ThemeManager.setTheme(theme);
            }
        });
    }
}

/**
 * Simple class to facilitate modal registrations with which the codebase can fetch modals by name.
 */
class ModalRegister {
    static get modalContainer() {
        this._modalContainer = this._modalContainer || document.body.querySelector(':scope > .modals');
        return this._modalContainer;
    };

    static _modalContainer;
    static _modals = {};

    /**
     *
     * @param {Modal} modal
     */
    static registerModal(modal) {
        if (!(modal instanceof Modal)) {
            console.warn('An attempt was made to register a modal that was not of type \'Modal\'.');
            return;
        }

        ModalRegister._modals[modal.getName()] = modal;
    }

    /**
     *
     * @param modalName
     * @returns {Modal}
     */
    static getModal(modalName) {
        return ModalRegister._modals[modalName] || null;
    }
}

class L10n {
    /** Default currency */
    static currency = 'EUR';
    static currencySymbol = '€';

    /** Invoked when the user selects a different currency */
    static onCurrencyPrefChanged = new Event();

    /** User's local currency based on IP via API */
    static _localCurrency;
    static _localCurrencySymbol;

    /** User's preferred currency */
    static _preferredCurrency;

    /** User's country code based on IP via API */
    static _countryCode;
    static _languageCode;

    static _numberFormatter;
    static _currencyFormatter;

    static get languageCode() {
        this._languageCode = this._languageCode || document.querySelector('html').lang;
        return this._languageCode;
    }

    /** Get all supported language codes based on the language links in the <head> */
    static get allLanguageCodes() {
        if (!this._allLanguageCodes) {
            this._allLanguageCodes = [];

            for (const link of document.head.querySelectorAll(':scope > link[rel="alternate"]')) {
                const hreflang = link.getAttribute('hreflang');

                if (hreflang && hreflang !== 'x-default') {
                    this._allLanguageCodes.push(hreflang);
                }
            }
        }

        return this._allLanguageCodes;
    }

    static async getLocalCurrency() {
        await (this._initPromise ||= this._ensureInit());

        return this._localCurrency;
    }

    static async getLocalCurrencySymbol() {
        await (this._initPromise ||= this._ensureInit());

        return this._localCurrencySymbol;
    }

    static async getPreferredCurrency() {
        return this._preferredCurrency || await this.getLocalCurrency();
    }

    static setPreferredCurrency(value) {
        this._preferredCurrency = value;
        this.onCurrencyPrefChanged.invoke(this._preferredCurrency);
    }

    static formatNumber(value) {
        this._numberFormatter ||= new Intl.NumberFormat(this.getFormatLocale());

        value = typeof value === 'string' ? parseFloat(value) : value;

        return this._numberFormatter.format(value);
    }

    static async _ensureInit() {
        if (!this._localCurrency) {
            let details = {};
            try {
                details = await Api.request({ a: 'lcc', amount: 1 });
            }
            catch (e) {
                console.error('Couldn\'t request local currency details from API. Defaulting to euros.', e.message);
            }

            this._countryCode = details.country;
            this._localCurrency = details.name || this.currency;
            this._localCurrencySymbol = details.symbol || this.currencySymbol;
        }
    }

    /**
     * Get the user's country code as determined by the API.
     * Null if the code couldn't be determined.
     * @return {string|null}
     * */
    static async getCountry() {
        await this._ensureInit();
        return this._countryCode || null;
    }

    /** Get locale appropriate for formatting */
    static getFormatLocale() {
        const locale = this.getLocale();

        // Ensure Western Arabic numerals if locale region for Arabic is not defined.
        return locale === 'ar' ? 'ar-AE' : locale;
    }

    /**
     * Function to return locales (e.g. en-GB, en-NZ...) and country code. Default values returned are
     * {country: ISO, locales: en} if a locale cannot be fetched from navigator.languages.filter using
     * the language chosen in WP.
     *
     * @returns {Object} selected locales and country (from matching locales) in user's browser
     */
    static getLocale() {
        let locale = '';

        // Ensure we only have the language code - replace the part after the user's chosen language (e.g -hans)
        const language = this.languageCode.replace(/\-.*/, '');

        if (navigator.languages) {
            const localeWithCountryCode = navigator.languages.filter(l => l.startsWith(`${language}-`))[0];

            locale = localeWithCountryCode || navigator.languages.filter(l => l.startsWith(language))[0];
        }

        // Default to site language as locale if no matching browser-set locale found,
        // for consistency between site language and locale-specific formatting with e.g. numbers, prices.
        return locale || language;
    }
}

/**
 * Instance of a placeholder within the content.
 */
class Placeholder {
    /** Unique key for this placeholder. The placeholder can be used more than once. */
    key;

    /** Cached value */
    value;

    // Allow interested parties to do things like e.g. show the block once it is replaced.
    /** Invoked when the value is obtained and the string containing the placeholder is about to be populated. */
    onPopulatedEvent = new Event();

    /**
     * Get a new Placeholder instance from Object.
     *
     * @param {Object} object
     * @returns {Placeholder}
     */
    static fromObject(object) {
        const placeholder = new Placeholder(object.key);
        Object.assign(placeholder, object);

        return placeholder;
    }

    constructor(key) {
        this.key = key;
    }

    /**
     * Asynchronously get the value of this placeholder. Returns a cached result if available.
     *
     * @returns {Promise<string>}
     */
    async getValue() {
        this.value = this.value || await this._fetchValue();

        return this.value;
    }

    async _fetchValue() { }
}

/**
 * Find placeholders within the content and populate them with values.
 */
class PlaceholderPopulator {
    static _searchLocations = ['.page-container'];

    static regex = /!{(\w+)}/g;

    static _placeholders = {};

    static init(placeholders) {
        for (const placeholder of placeholders) {
            this._placeholders[placeholder.key] = Placeholder.fromObject(placeholder);
        }

        this.populatePlaceholders(); // Async fire and forget.
    }

    /**
     * Register a placeholder, if the key is available.
     * @param {Placeholder} placeholder
     */
    static registerPlaceholder(placeholder) {
        if (placeholder instanceof Placeholder) {
            if (this._placeholders[placeholder.key]) {
                console.warn(`Attempted to register placeholder with key "${placeholder.key}", but it is already in use. Ignoring.`);
                return;
            }

            this._placeholders[placeholder.key] = placeholder;
        }
    }

    /**
     * Get the placeholder, if it exists.
     *
     * @param {string} key
     * @returns {Placeholder|undefined}
     */
    static getPlaceholder(key) {
        return this._placeholders[key];
    }

    /**
     * Find placeholders within the defined search locations and replace them with values.
     */
    static async populatePlaceholders() {
        // Asynchronously check each location for text node strings with placeholders.
        await Promise.allSettled(this._searchLocations.map(async (location) => {
            await this.populateElement(document.querySelector(location));
        }));
    }

    /**
     * Find placeholders in text nodes within the given element and replace them with values.
     * @param {Node} element
     */
    static async populateElement(element) {
        const textNodes = this.getTextNodes(element);

        // Update each string as soon as the placeholder value is available.
        await Promise.allSettled(textNodes.map(async (node) => {
            node.nodeValue = await this.populateString(node.nodeValue);
        }));
    }

    /**
     * Get an array of all text nodes found descending the given element.
     *
     * @param {Node} element
     * @returns {Text[]}
     */
    static getTextNodes(element) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

        const textNodes = [];

        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        return textNodes;
    }

    /**
     * Find placeholders within the given string and replace them with values.
     *
     * @param {string} string
     * @returns {Promise<string>}
     */
    static async populateString(string) {
        // Utils.replaceAsync() awaits for all placeholder values in the given string before replacing.
        return await Utils.replaceAsync(string, this.regex, async (match, key) => this.getPlaceholderValue(key));
    }

    /**
     * Asynchronously get the value of a placeholder.
     *
     * @param {string} key
     * @returns {Promise<string>}
     */
    static async getPlaceholderValue(key) {
        const placeholder = this._placeholders[key];
        if (!(placeholder instanceof Placeholder)) {
            console.warn(`Unregistered placeholder "${key}" detected. Ignoring.`);
            return key;
        }

        const value = await placeholder.getValue();
        placeholder.onPopulatedEvent.invoke(value);

        return value;
    }
}

/**
 * A class to redirect a page to the user's preferred language. If they're viewing the
 * website in a language which isn't English, then no redirections will occur.
 */
class LanguageRedirector {
    static redirect() {
        let targetLanguage = '';

        // No redirect needed if the language code from URL is supported
        const requestedLanguage = this.tryGetCodeFromUrl();
        if (requestedLanguage) {
            if (L10n.allLanguageCodes.includes(requestedLanguage)) return;

            targetLanguage = 'en'; // Requested language is not available in this project, redirect to English.
        }

        // Redirect user to website in their preferred language
        // (but not if it doesn't exist or it is English)
        const preferredLanguage = this.tryGetPreferredLanguage();

        if (preferredLanguage && preferredLanguage !== 'en') {
            this.redirectTo(preferredLanguage);
        }
        else if (targetLanguage) {
            this.redirectTo(targetLanguage);
        }
    }

    static tryGetCodeFromUrl() {
        const possibleCode = location.pathname.split('/')[1];

        const megapagesLanguages = ['ar', 'de', 'es', 'fr', 'id', 'it', 'ja', 'ko',
            'nl', 'pl', 'pt', 'pt-br', 'ro', 'ru', 'th', 'vi', 'zh-hans', 'zh-hant'];

        return megapagesLanguages.includes(possibleCode) ? possibleCode : null;
    }

    static tryGetPreferredLanguage() {
        let preferredLanguage = Prefs.get('language');
        if (!L10n.allLanguageCodes.includes(preferredLanguage) && preferredLanguage !== 'en') {
            Prefs.remove('language'); // Unsupported or invalid language code.
            preferredLanguage = this.tryGetBrowserCode();
        }

        return preferredLanguage;
    }

    /**
     * Get the user's first preferred browser language that is supported, if it exists.
     *
     * @returns {string|null} user's preferred language, if it exists
     */
    static tryGetBrowserCode() {
        for (const language of navigator.languages) {
            let langCode = language.replace(/\-.*/, '');
            if (langCode === 'pt') {
                langCode = 'pt-br';
            }
            else if (langCode === 'zh') {
                langCode = ['zh-HK', 'zh-SG', 'zh-TW'].includes(language) ? 'zh-hant' : 'zh-hans';
            }

            if (L10n.allLanguageCodes.includes(langCode)) {
                return langCode;
            }
        }

        return null;
    }

    static redirectTo(languageCode) {
        this.isRedirecting = true;

        const url = new URL(window.location);

        const urlCode = this.tryGetCodeFromUrl();
        if (urlCode) { // strip existing code
            url.pathname = url.pathname.substring(urlCode.length + 1);
        }

        if (languageCode && languageCode !== 'en') { // add new code
            url.pathname = `/${languageCode}${url.pathname}`;
        }

        window.location.replace(url.href);
    }
}

class CampaignTagger {
    static init() {
        this.tag = this.tryGetTagFromUrl() || Storage.session.getItem('mct');
        if (!this.tag) return;

        if (CookieSettings.isAnalyticsAllowed()) {
            this.sendTag();
        }
        else {
            Storage.session.setItem('mct', this.tag);
            CookieSettings.onConsentChanged.addListener(this.consentListener.bind(this));
        }
    }

    /** @returns {string|null} */
    static tryGetTagFromUrl() {
        const url = new URL(window.location);

        if (url.searchParams.has('mct')) {
            const tag = url.searchParams.get('mct');
            url.searchParams.delete('mct');
            window.history.replaceState({}, '', url.toString());

            return tag;
        }

        return null;
    }

    static consentListener() {
        if (CookieSettings.isAnalyticsAllowed()) {
            CookieSettings.onConsentChanged.removeListener(this.consentListener);
            this.sendTag();
        }
    }

    static async sendTag() {
        await Api.log(99988, this.tag);
        Storage.session.removeItem('mct');
    }
}

/** Allow an object to change state based on the URL fragment. */
class FragmentMonitor {
    /** @param {string} fragment The fragment string to monitor */
    constructor(fragment) {
        this.fragment = fragment;

        this.onFragmentChanged = new Event();
        window.addEventListener('popstate', () => this.onFragmentChanged.invoke(this.isMatch));
    }

    /** @return true if the URL fragment matches this fragment */
    get isMatch() { return window.location.hash === this.fragment }

    /**
     * Add this fragment to the URL.
     * This should only be called when the object is activated programmatically and not via <a> links with #fragments.
     */
    addFragment() {
        if (window.location.hash !== this.fragment) {
            history.pushState({ fragmentMonitor: 'add' }, null, this.fragment);
        }
    }

    /** Clear the fragment from the URL. */
    removeFragment() {
        if (window.location.hash === this.fragment) {
            history.pushState({ fragmentMonitor: 'remove' }, null, window.location.pathname);
        }
    }
}

class AddLangToWebclientURL {
    static addLangInfoToURL() {
        for (const [a, url] of WebclientUtils.getWebclientLinks().entries()) {
            this.localiseWebclientUrl(url);
            a.href = url.href;
        }
    }

    /** @param {URL} url */
    static localiseWebclientUrl(url) {
        if (url.hostname === 'mega.nz') {
            const mappedLang = this.langToWebclient(L10n.languageCode);
            if (mappedLang && url.pathname !== `/linux/repo/`) {
                const path = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
                url.pathname = `${path}/lang_${mappedLang}`;
            }
        }
    }

    static langToWebclient(lang) {
        const mappings = {
            'pt-br': 'pt',
            'zh-hans': 'cn',
            'zh-hant': 'ct',
        };

        return mappings[lang] || lang;
    }
}

class Formatter {
    static get numberFormatter() {
        return Formatter._numberFormatter ||= new Intl.NumberFormat(L10n.getFormatLocale());
    }

    static get percentFormatter() {
        return Formatter._percentFormatter ||= new Intl.NumberFormat(L10n.getFormatLocale(), {
            style: 'percent',
        });
    }

    static get monthsFormatter() {
        return Formatter._monthsFormatter ||= new Intl.NumberFormat(L10n.getFormatLocale(), {
            style: 'unit',
            unit: 'month',
            unitDisplay: 'long',
        });
    }

    static get yearsFormatter() {
        return Formatter._yearsFormatter ||= new Intl.NumberFormat(L10n.getFormatLocale(), {
            style: 'unit',
            unit: 'year',
            unitDisplay: 'long',
        });
    }

    static get currencyFormatter() {
        return Formatter._currencyFormatter ||= new Intl.NumberFormat(L10n.getFormatLocale(), {
            style: 'currency',
            currency: Plans.instance.localCurrency,
        });
    }

    static get gbFormatter() {
        return Formatter._gbFormatter ||= new Intl.NumberFormat(L10n.getFormatLocale(), {
            style: 'unit',
            unit: 'gigabyte',
            unitDisplay: 'short',
        });
    }

    static get tbFormatter() {
        return Formatter._tbFormatter ||= new Intl.NumberFormat(L10n.getFormatLocale(), {
            style: 'unit',
            unit: 'terabyte',
            unitDisplay: 'short',
        });
    }

    static formatNumber(number) {
        return Formatter.numberFormatter.format(number);
    }

    static formatMonths(months) {
        return Formatter.monthsFormatter.format(months);
    }

    static formatYears(years) {
        return Formatter.yearsFormatter.format(years);
    }

    static formatPercent(percent) {
        return Formatter.percentFormatter.format(percent);
    }

    static formatCurrency(amount) {
        return Formatter.currencyFormatter.format(amount);
    }

    static formatGb(gb) {
        return Formatter.gbFormatter.format(gb);
    }

    static formatTb(tb) {
        return Formatter.tbFormatter.format(tb);
    }
}

class SkeletonLoader {
    static init() {
        document.addEventListener('DOMContentLoaded', () => {
            document.documentElement.style.setProperty('--skeleton-play-state', 'running');
        });
    }
}

/** Agnostic text scaler that uses CSS transform to make text fit in its parent element */
class TextScaler {
    static get instance() {
        return this._instance ||= new TextScaler();
    }

    constructor() {
        this.elements = new Set();
        this.transformOrigin = document.documentElement.dir === 'rtl' ? 'right' : 'left';

        this._onResize = this._onResize.bind(this);
        this._resizeScale = this._resizeScale.bind(this);

        this.observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => this._scale(entry.target))
                    this.observer.unobserve(entry.target); // job done
                }
            }
        });

        window.addEventListener('resize', () => {
            if (this.elements > 20) { // arbitrary
                clearTimeout(this.resizeDebounce);
                this.resizeDebounce = setTimeout(this._onResize, 100);
            }
            else {
                this._resizeScale();
            }
        });
    }

    /** Scale text size to fit in its parent element */
    scale(element) {
        if (!(element instanceof HTMLElement) || !element.parentElement) return;

        this.elements.add(element);

        requestAnimationFrame(() => this._scale(element));
    }

    _scale(element) {
        if (element.parentElement.offsetWidth === 0 || element.scrollWidth === 0) {
            // Assume not visible; apply scaling when visible
            this.observer.observe(element);
            return;
        }

        const scaleFactorX = element.parentElement.offsetWidth / element.scrollWidth;
        const scaleFactorY = element.parentElement.offsetHeight / element.scrollHeight;
        const scaleFactor = Math.min(Math.max(Math.min(scaleFactorX, scaleFactorY), 0.3), 1);

        element.style.transformOrigin = getComputedStyle(element).textAlign === 'center' ? 'center' : this.transformOrigin;
        element.style.transform = `scale(${scaleFactor})`;
    }

    _resizeScale() {
        for (const element of this.elements) {
            this._scale(element);
        }
    }

    _onResize() {
        requestAnimationFrame(this._resizeScale);
    }
}

/* endregion */

Prefs.init();
Breakpointer.init();
ThemeManager.init();
SkeletonLoader.init();
