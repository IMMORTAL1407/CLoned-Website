/**
 * Frontend scripting for the business page pricing module.
 */

class BusinessPagePricing {
    $businessPagePricing;

    $banner;
    $leftContainer;
    $rightContainer;

    $calculatorToggle;
    $toggleEstimationNote;
    $calculatorPricingEstimationNote;
    $estimatedUsageButton;

    $pricingCalculator;
    $planPricingCalculator;

    /** @type DropdownComponent */
    currencyDropdown;

    currentCurrency;

    localPlanPrice;
    localExtraStoragePrice;
    localExtraUserPrice;
    euroPlanPrice;
    euroExtraStoragePrice;
    euroExtraUserPrice;

    constructor(element) {
        this.$businessPagePricing = $(element);

        this.$banner = $('.business-card-banner', this.$businessPagePricing);
        this.$leftContainer = $('.left-container', this.$banner);
        this.$rightContainer = $('.right-container', this.$banner);
        this.$buyPlanButton = $('.get-started-btn .button', this.$banner);

        this.$calculatorToggle = $('.calculator-toggle', this.$businessPagePricing);

        this.$toggleEstimationNote = $('.pricing-estimation-note', this.$calculatorToggle);
        this.$calculatorPricingEstimationNote = $('.calculator-pricing-estimation-note', this.$businessPagePricing);
        this.$estimatedUsageButton = $('.estimated-usage-btn', this.$calculatorToggle);

        this.fetchBusinessPlanInfo();

        this.$pricingCalculator = $('.pricing-calculator', this.$businessPagePricing);
        this.$pricingCalculator.toggleClass('hidden', true).addClass('business');

        this._initCurrencyDropdown();

        if (!this.$planPricingCalculator) {
            this.$estimatedUsageButton.addClass('hidden');
            this.$calculatorToggle.addClass('hidden');
        }

        this.$planPricingCalculator = new PlanPricingCalculator(this.$pricingCalculator);

        $('.cost', this.$banner).addClass('hidden');

        this.$estimatedUsageButton.rebind('click', () => {
            const $icon = $('.icon', this.$estimatedUsageButton);

            const $calculatorToggleHeading = $('.pricing-calculator-heading', this.$calculatorToggle);

            const toHide = $icon.hasClass('plus') ? true : false;
            const iconToRemove = $icon.hasClass('plus') ? 'plus' : 'minus';
            const iconToAdd = $icon.hasClass('plus') ? 'minus' : 'plus';

            $calculatorToggleHeading.toggleClass('hidden', !toHide);
            $icon.removeClass(iconToRemove).addClass(iconToAdd);
            this.$pricingCalculator.toggleClass('hidden', !toHide);

            this.showHidePriceEstimationNotes();
        });

        L10n.onCurrencyPrefChanged.addListener((newCurrency) => {
            this.currentCurrency = newCurrency;

            this.showHidePriceEstimationNotes();

            this.getPriceValues();

            const currency = this.currentCurrency === 'EUR' ? 'euro' : 'local';

            $('.cost', this.$banner).addClass('hidden');
            $(`.cost.${currency}`, this.$banner).removeClass('hidden');
        });

        // Don't allow user to buy Pro Flexi plan if they're on a Business plan
        //  Don't allow user to buy Pro Flexi/Business plan if they're on a Pro Flexi plan
        if (window.user && (window.user.planNum === Plans.AccountLevels.Business || window.user.planNum === Plans.AccountLevels.ProFlexi)) {
            this.$buyPlanButton
                .removeClass('hidden primary')
                .addClass('outline-muted disabled')
                .prop('disabled', true);

            $('.get-started-btn', this.$banner)
                .addClass('tooltip bottom');

        }
    }

    showHidePriceEstimationNotes() {
        if (!this.$pricingCalculator.hasClass('hidden')) {
            this.$calculatorPricingEstimationNote.toggleClass('hidden', false || (this.currentCurrency === 'EUR'));
            this.$toggleEstimationNote.addClass('hidden');
        }
        else {
            this.$calculatorPricingEstimationNote.addClass('hidden');
            this.$toggleEstimationNote.toggleClass('hidden', this.currentCurrency === 'EUR');
        }
    }

    // Fetch info for the Business plan from the API
    async fetchBusinessPlanInfo() {
        const allPlans = await Plans.instance.get();
        this.currentCurrency = Plans.instance.localCurrency;

        for (const plan of allPlans) {
            if (plan instanceof BusinessPlan && plan.months === 1) {
                this.euroPlanPrice = plan.extra.userPrice * plan.minUsers;
                this.euroExtraUserPrice = plan.extra.userPrice;
                this.euroExtraStoragePrice = plan.extra.storagePrice;

                this.localPlanPrice = plan.extra.userLocalPrice * plan.minUsers;
                this.localExtraUserPrice = plan.extra.userLocalPrice;
                this.localExtraStoragePrice = plan.extra.storageLocalPrice;

                this.formatPriceValues();

                this.$businessPagePricing.removeClass('hidden');

                return;
            }
        }
    }

    // Format all price values for this module
    formatPriceValues() {
        const currencyIsEuros = this.currentCurrency === 'EUR';

        $('.pricing-estimation-note', this.$businessPagePricing).toggleClass('hidden', currencyIsEuros);
        $('.cost.local', this.$businessPagePricing).toggleClass('hidden', currencyIsEuros);
        $('.cost.euro', this.$businessPagePricing).toggleClass('hidden', !currencyIsEuros);

        const localiser = new CurrencyLocalizer(this.currentCurrency, 'narrowSymbol');
        const currencies = ['local', 'euro'];

        for (const currency of currencies) {
            // left container
            const $users = $('.users', this.$leftContainer);
            const $extraStorageAndTransfer = $('.extra-s-and-t', this.$leftContainer);

            let $monthlyCost = $(`.cost.${currency}`, $users);
            let $leftContainerValue = $('.value', $monthlyCost);

            localiser.currency = currency === 'euro' ? 'EUR' : Plans.instance.localCurrency;

            let price = currency === 'euro' ? this.euroExtraUserPrice : this.localExtraUserPrice;
            $leftContainerValue.text($leftContainerValue.text().replace('%1', localiser.format(price)));

            $monthlyCost = $(`.cost.${currency}`, $extraStorageAndTransfer);
            $leftContainerValue = $('.value', $monthlyCost);

            price = currency === 'euro' ? this.euroExtraStoragePrice : this.localExtraStoragePrice;
            $leftContainerValue.text($leftContainerValue.text().replace('%1', localiser.format(price)));

            // right container
            $monthlyCost = $(`.cost.${currency}`, this.$rightContainer);

            const $rightContainerValue = $('.plan-price .value', $monthlyCost);
            price = currency === 'euro' ? this.euroPlanPrice : this.localPlanPrice;
            $rightContainerValue.text($rightContainerValue.text().replace('%1', localiser.format(price)));
        }

        const $localPlanUnits = $('.plan-units.local', this.$businessPagePricing);
        const planUnitsText = this.currentCurrency !== 'EUR' ? this.currentCurrency : '';

        $localPlanUnits.text($localPlanUnits.text().replace('%2', planUnitsText));

        this.getPriceValues();
    }

    // Get the correct price values for each slider to feed into the PlanPricingCalculator class variable
    getPriceValues() {
        const currencyIsNotEuros = (this.currentCurrency !== 'EUR');

        const planCost = currencyIsNotEuros ? this.localPlanPrice : this.euroPlanPrice;
        const extraStorageCost = currencyIsNotEuros ? this.localExtraStoragePrice : this.euroExtraStoragePrice;
        const extraUsersCost = currencyIsNotEuros ? this.localExtraUserPrice : this.euroExtraUserPrice;

        this.$planPricingCalculator.planPrice = planCost;
        this.$planPricingCalculator.extraStoragePrice = extraStorageCost;
        this.$planPricingCalculator.extraUserPrice = extraUsersCost;
        this.$planPricingCalculator.currency = this.currentCurrency;

        this.$planPricingCalculator.calculateMonthlyEstimatePrice();
    }

    async _initCurrencyDropdown() {
        this.currencyDropdown = new DropdownComponent($('.header-btn-container .dropdown', this.$businessPagePricing));
        this.currencyDropdown.selectionChangedEvent.addListener((newSelection) => {
            L10n.setPreferredCurrency(newSelection.value);
        });

        Breakpointer.breakpointChangedEvent.addListener((newBreakpoint) => {
            let sizeClass = newBreakpoint.gteq(Breakpoint.LG) ? 'lg' :
                (newBreakpoint.gteq(Breakpoint.MD) ? 'md' : 'sm');

            this.currencyDropdown.setSize(sizeClass);
        });

        const currency = await L10n.getLocalCurrency();

        if (currency && currency !== 'EUR') {
            this.currencyDropdown.addOption(currency, currency);
            this.currencyDropdown.selectOption(currency);
        }
    }
}
