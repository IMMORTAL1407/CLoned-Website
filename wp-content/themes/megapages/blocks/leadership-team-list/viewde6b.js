/**
 * Frontend scripting for the hero section module.
 */

class LeadershipTeamList {
    $leadershipTeamList;
    $cardsContainer;
    $card;
    $button;
    $buttonText;

    constructor (element) {
        this.$leadershipTeamList = $(element);
        this.$cardsContainer = $('.cards', this.$leadershipTeamList);
        this.$card = $('.staff-card', this.$cardsContainer);
        this.$button = $('.text-button', this.$leadershipTeamList);
        this.$buttonText = $('.label', this.$button);
        this.$buttonIcon = $('.icon', this.$button);

        if (this.$card.length <= 4) {
            !Breakpointer.currentBreakpoint.eq(Breakpoint.MD) ? this.$button.addClass('hidden') : '';

        }

        Breakpointer.currentBreakpoint.eq(Breakpoint.MD) ? this.$card.slice(3).addClass('hidden') : this.$card.slice(4).addClass('hidden');

        Reactor.addEventListener('breakpoint-changed', (newBreakpoint) => {
            if (newBreakpoint.eq(Breakpoint.MD)) {
                if (this.$buttonText.hasClass('see-more')) {
                    this.$card.removeClass('hidden');
                    this.$card.slice(3).addClass('hidden');
                }
                if (this.$card.length <= 4) {
                    this.$button.removeClass('hidden');
                }
            }
            else {
                if (this.$buttonText.hasClass('see-more')) {
                    this.$card.removeClass('hidden');
                    this.$card.slice(4).addClass('hidden');
                }
                if (this.$card.length <= 4) {
                    this.$button.addClass('hidden');
                }
            }
        });

        this.$button.on('click', () => {
            const seeMoreText = this.$button.data('see-more-text');
            const collapseText = this.$button.data('collapse-text');
            this.$buttonText.hasClass('see-more') ? this.expandedView(collapseText) : this.defaultView(seeMoreText);
        });
    }

    expandedView(collapseText) {
        this.$card.removeClass('hidden');
        this.$buttonText.text(collapseText);
        this.$buttonText.removeClass('see-more collapse').addClass('collapse');
        this.$buttonIcon.removeClass('chevron-down chevron-up').addClass('chevron-up');
    }

    defaultView(seeMoreText) {
        this.$buttonText.text(seeMoreText);
        this.$buttonText.removeClass('see-more collapse').addClass('see-more');
        this.$buttonIcon.removeClass('chevron-down chevron-up').addClass('chevron-down');
        this.$card.removeClass('hidden');
        Breakpointer.currentBreakpoint.eq(Breakpoint.MD) ? this.$card.slice(3).addClass('hidden') : this.$card.slice(4).addClass('hidden');
    }
}
