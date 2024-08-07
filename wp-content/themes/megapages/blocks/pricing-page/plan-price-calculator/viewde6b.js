/**
 * Frontend scripting for the plan pricing calculator module.
 */

class PlanPricingCalculator {
    $pricingCalculator;

    $estimatePriceValue;
    $errorMessage;

    isBusinessSlider;

    planPrice;
    extraStoragePrice;
    extraUserPrice;
    currency;

    initEstimatePrice;

    constructor($element) {
        this.$pricingCalculator = $element;
        this.$estimatePrice = $('.estimate-price', this.$pricingCalculator);
        this.$estimatePriceValue = $('.estimate-price .cost .value', this.$pricingCalculator);
        this.$errorMessage = $('.error-message', this.$pricingCalculator);

        $('.flexi-slider', this.$pricingCalculator).each((i, element) => {
            const $flexiSlider = $(element);
            this.isBusinessSlider = $flexiSlider.attr('id') === 'number-of-users';
            const inputBoxValue = $(`.slider-input#${$flexiSlider.attr('id')}`, this.$pricingCalculator).val();

            this.adjustFlexiSliderTooltipPosition($flexiSlider, inputBoxValue);
        });

        Reactor.addEventListener('breakpoint-changed',(newBreakpoint) => {
            this.$errorMessage.toggleClass('mobile', !newBreakpoint.gteq(Breakpoint.LG));
        });

        $('.flexi-slider', this.$pricingCalculator).on('input', (e) => {
            const $currentSlider = $(e.target, this.$pricingCalculator);
            const sliderValue = $currentSlider.val();
            $currentSlider.attr('value', sliderValue);
            const sliderId = $currentSlider.attr('id');
            this.isBusinessSlider = sliderId === 'number-of-users';

            this.setSliderValue($currentSlider, sliderValue);
        });

        $('.slider-input', this.$pricingCalculator).on('change', (e) => {
            const currentInputBox = $(e.target, this.$pricingCalculator);
            let inputBoxValue = currentInputBox.val();

            const sliderId = currentInputBox.attr('id');
            this.isBusinessSlider = sliderId === 'number-of-users';

            const $flexiSlider = $(`.${sliderId}.flexi-slider`, this.$pricingCalculator);
            $flexiSlider.attr('value', inputBoxValue);
            this.setSliderThumb($flexiSlider, currentInputBox, inputBoxValue);
            this.calculateMonthlyEstimatePrice();
        });
    }

    setSliderValue($currentSlider, sliderValue) {
        // marks = array of range slider marks [min, 2nd, 3rd, max]
        const marks = this.isBusinessSlider ? [3, 75, 150, 300] : [3, 100, 1000, 10000];
        // sliderMidpoints = array of range slider marks [2nd, 3rd]
        const sliderMidpoints = this.isBusinessSlider ? [30, 64] : [50, 75];
        // divisors = what to multiply the sliderValue by to get the true input box value
        const divisors = this.isBusinessSlider ? [2.4, 2.27, 4.26] : [1.94, 37.5, 375];

        if (this.isBusinessSlider) {
            this.$errorMessage.toggleClass('hidden', true);
        }

        let value = 3;
        if (sliderValue == 0) {
            value = 3;
        }
        else if (sliderValue > 0 && sliderValue <= sliderMidpoints[0]) {
            value = Math.ceil((sliderValue * divisors[0]) + marks[0]);
        }
        else if (sliderValue == (sliderMidpoints[0] + 1)) {
            value = (marks[1] + 1);
        }
        else if (sliderValue > (sliderMidpoints[0] + 1) && sliderValue <= (sliderMidpoints[1])) {
            value = Math.ceil((sliderValue - (sliderMidpoints[0] + 1)) * divisors[1]) + marks[1];
        }
        else if (sliderValue == (sliderMidpoints[1] + 1)) {
            value = (marks[2] + 1);
        }
        else if (sliderValue > (sliderMidpoints[1] + 1) && sliderValue < 100) {
            value = Math.ceil((sliderValue - (sliderMidpoints[1] + 1)) * divisors[2]) + (marks[2]);
        }
        else if (sliderValue == 100) {
            value = marks[3];
        }

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

        $(`.${$currentSlider.attr('id')}.slider .slider-input`, this.$pricingCalculator).val(value);

        this.adjustFlexiSliderTooltipPosition($currentSlider, value);
        this.calculateMonthlyEstimatePrice();
    }

    setSliderThumb($flexiSlider, currentInputBox, inputBoxValue) {
        let sliderValue = 0;

        // marks = array of range slider marks [min, 2nd, 3rd, max]
        const marks = this.isBusinessSlider ? [3, 75, 150, 300] : [3, 100, 1000, 10000];
        // sliderMidpoints = array of range slider marks [2nd, 3rd]
        const sliderMidpoints = this.isBusinessSlider ? [30, 64] : [50, 75];
        // divisors = what to divide the (inputBoxValue - marks) by to get the true slider value %
        const divisors = this.isBusinessSlider ? [2.4, 2.27, 4.26] : [1.94, 37.5, 375];

        if (this.isBusinessSlider) {
            this.$errorMessage.toggleClass('hidden', true);
        }

        if (inputBoxValue <= marks[0]) {
            sliderValue = 0;
            currentInputBox.val(marks[0]);
            inputBoxValue = marks[0];
        }
        else if (inputBoxValue > marks[0] && inputBoxValue <= marks[1]) {
            sliderValue = Math.floor((inputBoxValue - marks[0]) / divisors[0]);
        }
        else if (inputBoxValue == (marks[1] + 1)) {
            sliderValue = (sliderMidpoints[0] + 1);
        }
        else if (inputBoxValue > (marks[1] + 1) && inputBoxValue <= marks[2]) {
            sliderValue = Math.floor((inputBoxValue - marks[1]) / divisors[1]) + (sliderMidpoints[0] + 1);
        }
        else if (inputBoxValue == (marks[2] + 1)) {
            sliderValue = (sliderMidpoints[1] + 1);
        }
        else if (inputBoxValue > (marks[2] + 1) && inputBoxValue <= marks[3]) {
            sliderValue = Math.floor((inputBoxValue - marks[2]) / divisors[2]) + (sliderMidpoints[1] + 1);
        }
        else if (inputBoxValue > marks[3]) {
            if (this.isBusinessSlider) {
                this.$errorMessage.toggleClass('hidden', false);
            }

            sliderValue = 100;
            currentInputBox.val(marks[3]);
            inputBoxValue = marks[3];
        }

        if (document.documentElement.dir === 'rtl') {
            $flexiSlider.css('background',
                `linear-gradient(to left,
                var(--color-secondary-cobalt-900) ${sliderValue}%,
                var(--color-grey-150) ${sliderValue}% 100%)`
            );
        }
        else {
            $flexiSlider.css('background',
                `linear-gradient(to right,
                var(--color-secondary-cobalt-900) ${sliderValue}%,
                var(--color-grey-150) ${sliderValue}% 100%)`
            );
        }

        $flexiSlider.val(sliderValue);

        this.adjustFlexiSliderTooltipPosition($flexiSlider, inputBoxValue);
    }

    // Adjust the position of the tooltip for the given flexi slider relative to
    // the position of the slider's track thumb (circle)
    adjustFlexiSliderTooltipPosition($currentInputBox, value) {
        const minVal = $currentInputBox.attr('min');
        const maxVal = $currentInputBox.attr('max');
        const currentValue = $currentInputBox.val();

        const newValue = ((currentValue - minVal) * 100) / (maxVal - minVal);

        const currentInputBoxId = $currentInputBox.attr('id');

        const $currentSlider = $(`.${currentInputBoxId}.slider`, this.$pricingCalculator);
        const $rangeSliderTooltip = $currentInputBox.next();
        const $rangeSliderValueAndUnits = $('.value-and-units', $currentSlider);

        if (this.isBusinessSlider) {
            $('.tb-unit', $rangeSliderValueAndUnits).toggleClass('hidden', true);
            $('.pb-unit', $rangeSliderValueAndUnits).toggleClass('hidden', true);
        }
        else {
            const petabytes = (value >= 1000);
            if (petabytes) {
                value = Math.floor(value / 1000);
            }

            $('.tb-unit', $rangeSliderValueAndUnits).toggleClass('hidden', petabytes);
            $('.pb-unit', $rangeSliderValueAndUnits).toggleClass('hidden', !petabytes);
        }

        $('.number-value', $rangeSliderValueAndUnits).text(value);

        if (document.documentElement.dir === 'rtl') {
            const newPosition = -15 - (newValue * 0.3);
            $rangeSliderTooltip.css('right', `calc(${newValue}% + (${newPosition}px))`);
        }
        else {
            const newPosition = 15 - (newValue * 0.3);
            $rangeSliderTooltip.css('left', `calc(${newValue}% + (${newPosition}px))`);
        }
    }

    calculateMonthlyEstimatePrice() {
        const currencyIsNotEuros = this.currency !== 'EUR';
        const currency = currencyIsNotEuros ? 'local' : 'euro';

        const $storageSlider = $('.storage.slider', this.$pricingCalculator);
        const $transferSlider = $('.transfer.slider', this.$pricingCalculator);
        const $numOfUsersSlider = $('.number-of-users.slider', this.$pricingCalculator);

        const largestStorageTransferSliderValue = Math.max(
            $('.slider-input', $transferSlider).val(), $('.slider-input', $storageSlider).val());
        const extraStoragePrice = this.extraStoragePrice * (largestStorageTransferSliderValue - 3);

        const businessSliderValue = $('.slider-input', $numOfUsersSlider).val() || 0;
        const extraUsersPrice = this.extraUserPrice * (businessSliderValue - 3);

        this.initEstimatePrice = this.planPrice + extraStoragePrice + extraUsersPrice;
        const formattedEstimatePrice = CurrencyLocalizer.formatPrice(this.initEstimatePrice, this.currency, 'narrowSymbol');

        const $prices = $('.price', this.$estimatePrice);
        const $visiblePrice = $(`.price.${currency}`, this.$estimatePrice);

        $prices.addClass('hidden');
        $visiblePrice.removeClass('hidden');

        $('.value', $visiblePrice).text(formattedEstimatePrice);

        // Only replace placeholder if currency is defined
        if (this.currency) {
            const $localPrice = $('.price.local', this.$estimatePrice);
            const $localPriceUnits = $('.units', $localPrice);

            const priceUnitsText = currencyIsNotEuros ? this.currency : '';
            $localPriceUnits.text($localPriceUnits.text().replace('%1', priceUnitsText));
        }

        if ($visiblePrice[0]) {
            TextScaler.instance.scale($visiblePrice[0].querySelector('.cost'));
        }
    }
}
