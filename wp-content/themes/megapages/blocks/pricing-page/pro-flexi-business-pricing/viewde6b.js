/**
 * Frontend scripting for the pro flexi pricing module.
 */

class ProFlexiBusinessPricing {
    $proFlexiBusinessPricing;
    $planCard;
    $dropdown;
    $options;

    planNumber;
    $buyPlanButton;

    /** @type PlanPricingCalculator */
    calculator;

    planPrice;
    extraStoragePrice;
    extraUserPrice;

    localPlanPrice;
    localExtraUserPrice;
    localExtraStoragePrice;

    constructor(element) {
        this.$proFlexiBusinessPricing = $(element);
        this.$planCard = $('.pro-flexi-business-plan-card', this.$proFlexiBusinessPricing);
        this.$dropdown = $('.header-btn-container .dropdown', '.pricing-table-core');
        this.$options = $('.options-list .option', this.$dropdown);

        this.planNumber = this.$planCard.data('plan-account-level');
        this.$buyPlanButton = $('.buy-plan-button .button', this.$planCard);

        this.$pricingCalculator = $('.pricing-calculator', this.$proFlexiBusinessPricing);
        this.calculator = new PlanPricingCalculator(this.$pricingCalculator);

        this.$planCard.addClass('hidden');
        this.$pricingCalculator.addClass('hidden');

        this.fetchPlanInfo();

        L10n.onCurrencyPrefChanged.addListener((newCurrency) => {
            this.currentCurrency = newCurrency;

            const currency = this.currentCurrency === 'EUR' ? 'euro' : 'local';

            const $planCard = $('.pro-flexi-business-plan-card', this.$proFlexiBusinessPricing);

            this.getPriceValues();
            $('.pricing-estimation-note').toggleClass('hidden', this.currentCurrency === 'EUR');

            $('.cost', $planCard).addClass('hidden');
            $(`.cost.${currency}`, $planCard).removeClass('hidden');
        });

        if (this.planNumber === Plans.AccountLevels.ProFlexi) {
            // Don't allow user to buy Pro Flexi plan if they're on a Business plan
            //  Don't allow user to buy Pro Flexi/Business plan if they're on a Pro Flexi plan
            if (window.user && (window.user.planNum === Plans.AccountLevels.Business || window.user.planNum === Plans.AccountLevels.ProFlexi)) {
                this.$buyPlanButton
                    .removeClass('hidden primary')
                    .addClass('outline-muted')
                    .prop('disabled', true);

                $('.buy-plan-button', this.$planCard)
                    .addClass('tooltip bottom');

            }
        }
        else if (this.planNumber === Plans.AccountLevels.Business) {
            if (window.user && (window.user.planNum === Plans.AccountLevels.Business || window.user.planNum === Plans.AccountLevels.ProFlexi)) {
                this.$buyPlanButton
                    .removeClass('hidden primary')
                    .addClass('outline-muted disabled');

                $('.buy-plan-button', this.$planCard)
                    .addClass('tooltip bottom');

            }
        }
    }

    // Fetch info for the plan from the API
    async fetchPlanInfo() {
        const allPlans = await Plans.instance.get();

        this.currentCurrency = Plans.instance.localCurrency;

        for (const plan of allPlans) {
            if (this.planNumber === plan.accountLevel && plan.months === 1) {
                this.planPrice = plan instanceof ProFlexiPlan ?
                    plan.base.price : (plan.extra.userPrice * plan.minUsers);
                this.extraUserPrice = plan.extra.userPrice ?? 0;
                this.extraStoragePrice = plan.extra.storagePrice;

                this.localPlanPrice = plan instanceof ProFlexiPlan ?
                    plan.base.localPrice : (plan.extra.userLocalPrice * plan.minUsers);
                this.localExtraUserPrice = plan.extra.userLocalPrice ?? 0;
                this.localExtraStoragePrice = plan.extra.storageLocalPrice;

                this.formatPriceValues();

                this.$planCard.removeClass('hidden');
                this.$pricingCalculator.removeClass('hidden');

                return;
            }
        }
    }

    formatPriceValues() {
        const currencyIsEuros = this.currentCurrency === 'EUR';

        $('.pricing-estimation-note').toggleClass('hidden', currencyIsEuros);
        $('.cost.local', this.$planCard).toggleClass('hidden', currencyIsEuros);
        $('.cost.euro', this.$planCard).toggleClass('hidden', !currencyIsEuros);

        let priceLocaliser = new CurrencyLocalizer(this.currentCurrency, 'narrowSymbol');
        const currencies = ['local', 'euro'];

        for (const currency of currencies) {
            const $planCost = $('.plan-cost', this.$planCard);
            const $extraStorageAndTransfer = $('.plan-user-storage-transfer', this.$planCard);

            let $monthlyCost = $(`.cost.${currency}`, $planCost);
            let $value = $('.value', $monthlyCost);

            priceLocaliser.currency = currency === 'euro' ? 'EUR' : Plans.instance.localCurrency;

            let price = currency === 'euro' ? this.planPrice : this.localPlanPrice;
            if ($value.length) {
                $value.text($value.text().replace('%1', priceLocaliser.format(price)));
                TextScaler.instance.scale($value[0].parentElement);
            }

            const $localPlanUnits = $('.plan-units.local', $monthlyCost);
            $localPlanUnits.text($localPlanUnits.text().replace('%2', Plans.instance.localCurrency));

            $monthlyCost = $(`.cost.${currency}`, $extraStorageAndTransfer);
            $value = $('.additional-s-and-t-price', $monthlyCost);

            price = currency === 'euro' ? this.extraStoragePrice : this.localExtraStoragePrice;
            $value.text($value.text().replace('%1', priceLocaliser.format(price)));
        }

        this.getPriceValues();
    }

    // Get the correct price values for each slider to feed into the PlanPricingCalculator class variable
    getPriceValues() {
        const currencyIsNotEuros = (this.currentCurrency !== 'EUR');

        const planCost = currencyIsNotEuros ? this.localPlanPrice : this.planPrice;
        const extraStorageCost = currencyIsNotEuros ? this.localExtraStoragePrice : this.extraStoragePrice;
        const extraUsersCost = currencyIsNotEuros ? this.localExtraUserPrice : this.extraUserPrice;

        this.calculator.planPrice = planCost;
        this.calculator.extraStoragePrice = extraStorageCost;
        this.calculator.extraUserPrice = extraUsersCost;
        this.calculator.currency = this.currentCurrency;

        this.calculator.calculateMonthlyEstimatePrice();
    }
}
