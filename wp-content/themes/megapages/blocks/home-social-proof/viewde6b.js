/**
 * Frontend scripting for the home page social proof module.
 */

class HomeSocialProof {
    $homeSocialProof;
    _usersCounter;
    _filesCounter;

    fetchRate = 30000; // ms
    tickRate = 1000 / 24; // ms

    _numberFormatter = new Intl.NumberFormat(L10n.getFormatLocale(), {
        maximumFractionDigits: 0,
    });

    isFetching = false;
    stats = { };

    isScrolling = false;
    isObscured = false;

    _scrollTimeout;
    _displayInterval;

    usersPerMs;
    filesPerMs;

    extrapolatedUsersCount;
    extrapolatedFilesCount;

    displayedUsersCount;
    displayedFilesCount;

    constructor(element) {
        this.$homeSocialProof = $(element);

        const buttonsToKeep = window.user ? 'user' : 'non-user';
        $(`.button:not(.${buttonsToKeep})`, this.$homeSocialProof).remove();
        $(`.button.${buttonsToKeep}`, this.$homeSocialProof).removeClass('hidden');

        const usersCounter = $('.registered-users .value', this.$homeSocialProof)[0];
        const filesCounter = $('.uploaded-files .value', this.$homeSocialProof)[0];

        usersCounter.textContent = 0;
        filesCounter.textContent = 0;

        this._usersCounter = usersCounter.childNodes[0];
        this._filesCounter = filesCounter.childNodes[0];

        this.fetchStats = this.fetchStats.bind(this);
        this._onScroll = this._onScroll.bind(this);
        this._onObserve = this._onObserve.bind(this);
        this._tick = this._tick.bind(this);
        this._updateDisplay = this._updateDisplay.bind(this);

        this._setup();
    }

    async fetchStats() {
        const dailyStats = await DailyStats._fetchStats(); // Skipping the DailyStats cache

        if (dailyStats) {
            this.stats = dailyStats;
        }
    }

    tryStartDisplay() {
        if (this.isScrolling || this.isObscured) return;

        this.startDisplay();
    }

    startDisplay() {
        this._calculate();

        // Jump the display to the latest extrapolated values.
        this.displayedUsersCount = this.extrapolatedUsersCount;
        this.displayedFilesCount = this.extrapolatedFilesCount;

        this._displayInterval = setInterval(this._tick, this.tickRate);
    }

    stopDisplay() {
        clearInterval(this._displayInterval);
    }

    async _setup() {
        await this.fetchStats();
        setInterval(this.fetchStats, this.fetchRate);

        window.addEventListener('scroll', this._onScroll);

        const observer = new IntersectionObserver(this._onObserve);
        observer.observe(this.$homeSocialProof[0]);
    }

    _onObserve(observables) {
        for (const observable of observables) {
            if (observable.target === this.$homeSocialProof[0]) {
                this.isObscured = !observable.isIntersecting;

                if (this.isObscured) {
                    this.stopDisplay();
                }
                else {
                    this.tryStartDisplay();
                }

                break;
            }
        }
    }

    _onScroll() {
        this.isScrolling = true;
        this.stopDisplay();

        // TODO replace with scrollend event when widely supported.
        clearTimeout(this._scrollTimeout);
        this._scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.tryStartDisplay();
        }, 100);
    }

    _calculate() {
        // We decouple the provided counts from the displayed counts
        // so that the counter doesn't go backwards or jump to a smaller number
        // if the previous estimation was inaccurate.

        const statsAgeMs = Date.now() - (this.stats.timestamp * 1000);

        this.usersPerMs = this.stats.confirmedusers.dailydelta / 86400 / 1000;
        this.filesPerMs = this.stats.files.dailydelta / 86400 / 1000;

        this.extrapolatedUsersCount = this.stats.confirmedusers.total + (this.usersPerMs * statsAgeMs);
        this.extrapolatedFilesCount = this.stats.files.total + (this.filesPerMs * statsAgeMs);
    }

    _tick() {
        this._calculate();

        let usersPerTick = this.usersPerMs * this.tickRate;
        let filesPerTick = this.filesPerMs * this.tickRate;

        // Speed up or slow down by 80 % to sync with latest count extrapolation.
        usersPerTick += (usersPerTick * 0.8 * Math.sign(this.extrapolatedUsersCount - this.displayedUsersCount));
        filesPerTick += (filesPerTick * 0.8 * Math.sign(this.extrapolatedFilesCount - this.displayedFilesCount));

        this.displayedUsersCount += usersPerTick;
        this.displayedFilesCount += filesPerTick;

        requestAnimationFrame(this._updateDisplay);
    }

    _updateDisplay() {
        this._usersCounter.nodeValue = this._numberFormatter.format(this.displayedUsersCount);
        this._filesCounter.nodeValue = this._numberFormatter.format(this.displayedFilesCount);
    }
}
