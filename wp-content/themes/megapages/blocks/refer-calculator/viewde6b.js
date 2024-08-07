/**
 * Frontend scripting for the Refer pricing module.
 */

class ReferCalculator {
    $referCalculator;
    $numberOfUsersSlider;
    $selectedPlan;
    $megaPlanSlider;
    $estimatePriceValue;

    planTitle;
    initEstimatePrice;

    constructor(element) {
        this.$referCalculator = $(element);
        this.megePlan = $('.mega-plan', this.$referCalculator);
        this.$numberOfUsersSlider = $('.number-of-users.flexi-slider', this.$referCalculator);
        this.$megaPlanSlider = $('.mega-plan.flexi-slider', this.$referCalculator);
        this.$selectedPlan = $('.sub-heading .users', this.$referCalculator);
        this.$estimatePriceValue = $('.total-number', this.$referCalculator);
        this.$sliderMarker = $('.slider-mark', this.megePlan);

        this.$selectedPlan.text(10);
        this.fetchPlansPrice(10);

        $('.flexi-slider').rebind('input', (e) => {
            const $currentSlider = $(e.target);
            const sliderValue = $currentSlider.val();
            this.setSliderValue($currentSlider, sliderValue);
        });
    }

    setSliderValue($currentSlider, sliderValue) {
        if (document.documentElement.dir === 'rtl') {
            $currentSlider.css('background',
                `linear-gradient(to left,
                var(--color-secondary-cobalt-900) ${sliderValue}%,
                var(--color-grey-150) ${sliderValue}% 100%)`
            );
        }
        else {
            $currentSlider.css('background',
                `linear-gradient(to right,
                var(--color-secondary-cobalt-900) ${sliderValue}%,
                var(--color-grey-150) ${sliderValue}% 100%)`
            );
        }

        let accountLevel = 1;
        this.planTitle = '';

        $currentSlider.attr('value', sliderValue);
        this.$singularBlurb = $('.sub-heading.singular', this.$referCalculator);
        this.$pluralBlurb = $('.sub-heading.plural', this.$referCalculator);

        const numberOfNumbers = this.$numberOfUsersSlider.val();

        if ($currentSlider.hasClass('mega-plan')) {
            if (sliderValue == 1) {
                accountLevel = 4;
                this.planTitle = $(this.$sliderMarker[0]).text();
            }
            else if (sliderValue == 34) {
                accountLevel = 1;
                this.planTitle = $(this.$sliderMarker[1]).text();
            }
            else if (sliderValue == 67) {
                accountLevel = 2;
                this.planTitle = $(this.$sliderMarker[2]).text();
            }
            else if (sliderValue == 100) {
                accountLevel = 3;
                this.planTitle = $(this.$sliderMarker[3]).text();
            }

            $('.plan', this.$referCalculator).text(this.planTitle);
            this.$megaPlanSlider.attr('data-account-level', accountLevel);
        }
        else {
            if (sliderValue == 1) {
                this.$pluralBlurb.addClass('hidden');
                this.$singularBlurb.removeClass('hidden');
            }
            else {
                this.$pluralBlurb.removeClass('hidden');
                this.$singularBlurb.addClass('hidden');
            }

            $('.users', this.$referCalculator).text(sliderValue);
        }
        this.fetchPlansPrice(numberOfNumbers);
    }

    calculateReferEstimatePrice(numberOfUsers, price) {
        const commissionRate = parseFloat(this.$referCalculator.attr('data-commission-rate')) / 100;
        this.initEstimatePrice = price * numberOfUsers * commissionRate;
        const formattedEstimatePrice = CurrencyLocalizer.formatPrice(this.initEstimatePrice, L10n.currency, 'narrowSymbol');
        this.$estimatePriceValue.text(formattedEstimatePrice);
    }

    // Fetch prices for the Mega plans from the API
    async fetchPlansPrice(numberOfNumbers) {

        const accountLevel = parseInt(this.$megaPlanSlider.attr('data-account-level'));

        const allPlans = await Plans.instance.getAll();

        for (const plan of allPlans) {
            if (accountLevel === plan.accountLevel && plan.months === 12) {
                this.calculateReferEstimatePrice(numberOfNumbers, plan.price);

                return;
            }
        }
    }
}
