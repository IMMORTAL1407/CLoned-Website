/**
 * Frontend scripting for the animated hero block.
 */

class AnimatedHero {
    $hero;
    $media;
    $canvas;
    $video;
    $textPane;
    $buttons;
    media;
    canvas;
    canvasContext;
    video;

    _bgImages = [];

    _textPaneBottom;
    _totalBlockHeight;
    _visibleBlockHeight;
    _currentBreakpoint;
    _isShowingCanvas = true;
    /** @type {Breakpoint} */
    _xxlBreakpoint; // Unique breakpoint for this block.

    constructor(element) {
        this.$hero = $(element);
        this.$media = $('.media', this.$hero);
        this.$canvas = $('canvas', this.$media);
        this.$video = $('video', this.$media);
        this.$textPane = $('.text-pane', this.$hero);
        this.$buttons = $('.button', this.$textPane);

        this.media = this.$media[0];
        this.canvas = this.$canvas[0];
        this.canvasContext = this.canvas.getContext('2d');
        this.video = this.$video[0];

        this._xxlBreakpoint = new Breakpoint('XXL', 2560, Infinity);

        this._onResize();
        this._updateTextPaneEffects();

        Breakpointer.initialisedEvent.addListener((breakpoint) => this._onBreakpointChanged(breakpoint));
        Breakpointer.breakpointChangedEvent.addListener((breakpoint) => this._onBreakpointChanged(breakpoint));
        ThemeManager.themeChangedEvent.addListener(() => this._setVideoSrc());

        document.addEventListener('scroll', () => {
            this._updateTextPaneEffects();
            this.updateAnimation();
        });

        window.addEventListener('resize', () => this._onResize());

        if (this.$buttons.length) {
            Breakpointer.breakpointChangedEvent.addListener((newBreakpoint) => {
                const sizeClass = newBreakpoint.gteq(Breakpoint.LG) ? 'lg' : 'md';
                this.$buttons.removeClass('xl lg md sm').addClass(sizeClass);
            });

            if ($('.button.user', this.$hero).length) {
                const buttonsToKeep = window.user ? 'user' : 'non-user';

                if (window.user) {
                    $(`.button:not(.${buttonsToKeep})`, this.$hero).remove();
                }
                else {
                    $(`.button.user`, this.$hero).remove();
                }

            }
            $(`.button`, this.$hero).removeClass('hidden');
        }
    }

    updateAnimation() {
        // No jQuery here for performance on scroll listener

        const imageCount = this._bgImages.length;
        // Ensure the final image is displayed while the block is still in full view, before switching to the video.
        const pixelsPerImage = (this._totalBlockHeight - this._visibleBlockHeight) / imageCount;
        const imageIndex = Math.floor(window.scrollY / pixelsPerImage);
        // Transition from image sequence to video when end of sequence reached
        const transitionReached = imageIndex > imageCount - 1;

        if (transitionReached) {
            if (this._isShowingCanvas && this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
                // Hide canvas, show video and play it
                this.media.classList.add('show-video');
                this.video.play();
                this._isShowingCanvas = false;
            }
        }
        else {
            // Show canvas if not already visible, hide and rewind video
            if (!this._isShowingCanvas) {
                if (this.video.readyState >= this.video.HAVE_METADATA) {
                    this.video.pause();
                    this.video.currentTime = 0;
                }

                this.media.classList.remove('show-video');
                this._isShowingCanvas = true;
            }

            this._setBgImage(Math.min(imageIndex, imageCount - 1));
        }
    }

    _onResize() {
        this._updateSizeValues();
        this._onBreakpointChanged(Breakpointer.currentBreakpoint);
    }

    _onBreakpointChanged(newBreakpoint) {
        if (window.innerWidth > this._xxlBreakpoint.min) {
            // Arbitrary but reasonable spacing tweak for the different media at XXL.
            this.$hero.css('margin-bottom', `${this.canvas.height / -4}px`);
            newBreakpoint = this._xxlBreakpoint;
        }
        else {
            this.$hero.css('margin-bottom', 'calc(var(--spacing-12) * -1)');
        }

        // Only fetch larger media - no point fetching smaller if we've already fetched larger
        // (except if the current breakpoint the special XXL breakpoint as the media is different)
        if (this._currentBreakpoint
                && this._currentBreakpoint.gteq(newBreakpoint)
                && this._currentBreakpoint.lt(this._xxlBreakpoint)) {
            this.updateAnimation();
            return;
        }

        this._currentBreakpoint = newBreakpoint;

        this._prefetchImages();
        this._setVideoSrc();
        this.updateAnimation();
    }

    _updateSizeValues() {
        this._textPaneBottom = this.$textPane.offset().top - this.$textPane.parent().offset().top + this.$textPane.height();
        this._totalBlockHeight = this.$hero.height();
        this._visibleBlockHeight = this.$media.height();
        this.canvas.width = this.$canvas.parent().width();
        this.canvas.height = this.$canvas.parent().height();
    }

    _getImageSrcs(breakpoint) {
        const srcs = [];

        const mediaPath = this.media.dataset.mediaPath;
        const breakpointName = breakpoint.name.toLowerCase();

        for (let i = 0; i <= 60; i++) {
            const number = i.toString().padStart(2, '0');
            srcs.push(`${mediaPath}/bgimg-${breakpointName}/${number}.png`);
        }

        return srcs;
    }

    _prefetchImages() {
        const imageSrcs = this._getImageSrcs(this._currentBreakpoint);

        for (let i = 0; i < imageSrcs.length; i++) {
            const image = new Image();
            image.onload = () => {
                // Image for the current step may have been loading, so update animation
                this.updateAnimation();
            }
            image.src = imageSrcs[i];
            this._bgImages[i] = image;
        }
    }

    _setVideoSrc() {
        this.video.pause();
        this.video.onloadeddata = () => this.updateAnimation();
        const mediaPath = this.media.dataset.mediaPath;
        const breakpointName = this._currentBreakpoint.name.toLowerCase();

        const ua = window.navigator.userAgent.toLowerCase();
        const isAndroid = ua.indexOf('android') !== -1; //Mobile Android
        const isDesktopSafari = (ua.indexOf('safari') !== -1) && (!(ua.indexOf('chrome') !== -1) && (ua.indexOf('version/') !== -1) && (ua.indexOf('mac os') !== -1)); //Desktop Safari on Mac OS
        const isMobileOS = (ua.indexOf('safari') !== -1) && (ua.indexOf('mobile') !== -1) && (ua.indexOf('mac os') !== -1); //Mobile Apple device (FF,chrome,safari)

        if (isAndroid) {
            this.video.src = `${mediaPath}/video/${breakpointName}.webm`;
        }
        else if (isMobileOS) {
            this.video.src = `${mediaPath}/video/${breakpointName}.mov`;
        }
        else if (isDesktopSafari) {
            this.video.src = `${mediaPath}/video/${breakpointName}.mov`;
        }
        else {
            // windows/linux/chrome based desktop
            this.video.src = `${mediaPath}/video/${breakpointName}.webm`;
        }

        this.video.load();
    }

    _setBgImage(index) {
        const image = this._bgImages[index];
        if (!image || !image.complete || image.naturalWidth === 0) return; // Not yet loaded or errored; don't update canvas

        const hRatio = this.canvas.width / image.width;
        const vRatio = this.canvas.height / image.height;
        const ratio = Math.max(hRatio, vRatio);
        const centreShiftX = (this.canvas.width - image.width * ratio) / 2;
        const centreShiftY = (this.canvas.height - image.height * ratio) / 2;

        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.drawImage(image,
            0, 0, image.width, image.height, // Source rectangle of image
            centreShiftX, centreShiftY, image.width * ratio, image.height * ratio); // Destination rectangle in canvas
    }

    _updateTextPaneEffects() {
        // Transition text-pane transparency as it is scrolled out of view
        let positionMultiplier = Math.min(Math.max(window.scrollY / this._textPaneBottom, 0), 1); // 0: in centre => 1: out of view
        positionMultiplier -= 0.2; // Start transitioning at 20% progress
        const gradientStart = positionMultiplier * 1.5 * 100; // in percent
        const gradientEnd = gradientStart + (positionMultiplier * 100);
        const topOpacity = Math.max(1 - (positionMultiplier * 4), 0.15);

        this.$textPane.css('mask-image', `linear-gradient(
            rgba(0, 0, 0, ${topOpacity}) ${gradientStart}%,
            rgba(0, 0, 0, 1) ${gradientEnd}%,
            rgba(0, 0, 0, 1))`);

        const blur = Math.min(Math.max(positionMultiplier - 0.1, 0) * 10); // Delay start of blur effect by extra 10% progress
        this.$textPane.css('filter', `blur(${blur}px)`);
    }
}
