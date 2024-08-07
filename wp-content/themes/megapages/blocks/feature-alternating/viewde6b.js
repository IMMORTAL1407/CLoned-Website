/**
 * Frontend scripting for the alternating feature module.
 */

class FeatureAlternating {
    $featureAlternating;
    $buttons;
    $typeBTextPanes;
    features = [];

    constructor(element) {
        this.$featureAlternating = $(element);
        this.$buttons = $('.text-button', this.$featureAlternating);
        this.$typeBTextPanes = $('.features .type-b .text-pane', this.$featureAlternating);
        this.videos = this.$featureAlternating[0].querySelectorAll('video');

        for (const child of this.$featureAlternating[0].querySelector('.features').children) {
            this.block = child;

            if (child.classList.contains('coming-soon')) {
                this.features.push(new ComingSoon($(child)));
            }
            else {
                this.videos = this.block.querySelectorAll('video');
                for (const video of this.videos) {
                    if (video.loop) {
                        VideoPauser.instance.registerVideo(video);
                    }
                }
            }
        }

        Breakpointer.breakpointChangedEvent.addListener((newBreakpoint) => {
            const sizeClass = newBreakpoint.lt(Breakpoint.LG) ? 'md' : 'lg';
            this.$buttons.removeClass('xl lg md sm').addClass(sizeClass);

            this.$typeBTextPanes.toggleClass('main-grid', newBreakpoint.eq(Breakpoint.MD));
        });
    }
}
