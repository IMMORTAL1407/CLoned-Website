/**
 * Frontend scripting for the alternating feature coming soon module.
 */

class ComingSoon {
    $comingSoon;
    $notifyBtn;
    $emailInput;
    $betaTestCheckbox;
    $betaTestCheckboxInput;
    $icon;
    $iconBox;
    $messageWrapper;

    campaignId;

    _sendForm;

    constructor($element) {
        this.$comingSoon = $element;
        this.$notifyBtn = $('.button', this.$comingSoon);
        this.$emailInput = $('.email-field', this.$comingSoon);
        this.$betaTestCheckbox = $('.checkbox-component.beta-tester', this.$comingSoon);
        this.$betaTestCheckboxInput = $('input', this.$betaTestCheckbox);
        this.$icon = $('.icon', this.$comingSoon);
        this.$iconBox = $('.icon-box', this.$comingSoon);
        this.$messageWrapper = $('.message-wrapper', this.$comingSoon);

        this.campaignId = +this.$comingSoon.attr('data-campaign-id'); // convert string to number

        if (!(this.$emailInput.hasClass('hidden'))) {
            this.$notifyBtn.rebind('click', () => {
                this.submitInput();
            });

            this.$emailInput.rebind('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.submitInput();
                }
            });
        }

        Reactor.addEventListener('breakpoint-changed',(newBreakpoint) => {
            const sizeClass = newBreakpoint.gteq(Breakpoint.XL) ? 'lg' : 'md';
            this.$notifyBtn.removeClass('xl lg md sm').addClass(sizeClass);
        });
    }

    submitInput() {
        this.$messageWrapper.removeClass('hidden');

        if (!this.validateInput()) {
            this.$emailInput.addClass('invalid');
            this.$messageWrapper.addClass('invalid');

            this.$iconBox.addClass('error');
            $('.error-text', this.$comingSoon).removeClass('hidden');
            this.$messageWrapper.removeClass('hidden');
        }
        else {
            this.$notifyBtn.addClass('hidden');

            this.$emailInput.removeClass('invalid').addClass('hidden');
            this.$betaTestCheckbox.addClass('hidden');

            this.$iconBox.removeClass('error').addClass('success');
            $('.error-text', this.$comingSoon).addClass('hidden');
            $('.thank-you-text', this.$comingSoon).removeClass('hidden');
            this.$icon.removeClass('alert-triangle').addClass('check-circle');

            $('.call-to-action-section', this.$comingSoon).addClass('submitted');
            this.$messageWrapper.removeClass('invalid hidden').addClass('valid');

            this.sendForm();
        }
    }

    async sendForm() {
        if (!this._sendForm) {
            this._sendForm = Api.request({
                a: 'mrs',   // "marketing record survey"
                e: this.$emailInput.val(), // email address of the user
                c: this.campaignId, // campaign id from data attribute
                l: this.$betaTestCheckboxInput.is(':checked') ? "Y" : "N", // beta tester identifier, "Y" if user wants to be a beta tester and "N" if not
                d: 1, // Survey data, will be empty for coming soon module, so will hardcode to 1
            });
        }

        let response;
        try {
            response = await this._sendForm;
        }
        catch (e) {
            console.error("Email submission has failed", e.message);
            return;
        }
    }

    // Check if email input is valid, return result
    validateInput() {
        // regEx source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation
        const regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

        return this.$emailInput.val() && regEx.test(this.$emailInput.val())
    }
}
