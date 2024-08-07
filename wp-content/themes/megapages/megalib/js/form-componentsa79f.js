/**
 * Scripting for common form components.
 */

class FormField {
    /** @type HTMLDivElement */
    field;
    /** @type HTMLDivElement */
    errorBox;
    errors;

    externalValidator;

    constructor(element) {
        this.field = element;
        this.errorBox = this.field.querySelector('div.error-box');
        this.errors = JSON.parse(this.errorBox.dataset.errors);

        const form = this.field.closest('form');
        if (form) {
            form.addEventListener('reset', () => this.hideError());
        }
    }

    get value() {
        return null;
    }

    set value(value) { };

    validate() {
        if (!this.selfValidate()) return false;

        if (!this.externalValidate()) return false;

        this.hideError();
        return true;
    }

    selfValidate() { } // Abstract stub

    externalValidate() {
        if (!this.externalValidator) return true;

        if (typeof this.externalValidator !== 'function') {
            console.warn('Unexpected external validator. Expected callable function.');
            return true;
        }

        // Defer any error messages to the external validator for handling
        return this.externalValidator(this);
    }

    hideError() {
        this.errorBox.classList.add('hidden');
    }

    showError(errorMessage) {
        this.errorBox.querySelector('.error-msg').textContent = errorMessage;
        this.errorBox.classList.remove('hidden');
    }
}

class TextField extends FormField {
    /** @type HTMLInputElement */
    input;

    constructor(element) {
        super(element);
        this.input = this.field.querySelector('input');
    }

    get isOptional() {
        return this.field.classList.contains('optional');
    }

    get value() {
        return this.input.value.trim();
    }

    set value(value) {
        this.input.value = value;
    }

    selfValidate() {
        if (!this.isOptional && this.value.length < 2) {
            this.showError(this.errors.tooShort);
            return false;
        }

        return true;
    }

    hideError() {
        super.hideError();
        this.input.classList.remove('error-highlight');
    }

    showError(errorMessage) {
        super.showError(errorMessage);
        this.input.classList.add('error-highlight');
    }
}

class EmailField extends TextField {
    /** Expression as per {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation} */
    regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    selfValidate() {
        if (!super.selfValidate()) return false;

        if (this.value && !this.regEx.test(this.value)) {
            this.showError(this.errors.invalidEmail);
            return false;
        }

        return true;
    }
}

class TextareaField extends FormField {
    /** @type HTMLTextAreaElement */
    textarea;

    constructor(element) {
        super(element);
        this.textarea = this.field.querySelector('textarea');
    }

    get isOptional() {
        return this.field.classList.contains('optional');
    }

    get value() {
        return this.textarea.value.trim();
    }

    set value(value) {
        this.textarea.value = value;
    }

    selfValidate() {
        if (!this.isOptional && this.value.length < 2) {
            this.showError(this.errors.tooShort);
            return false;
        }

        return true;
    }

    hideError() {
        super.hideError();
        this.textarea.classList.remove('error-highlight');
    }

    showError(errorMessage) {
        super.showError(errorMessage);
        this.textarea.classList.add('error-highlight');
    }
}

class DropdownField extends FormField {
    /** @type DropdownComponent */
    dropdown;

    constructor(element) {
        super(element);
        this.dropdown = new DropdownComponent($('.dropdown', this.field));
    }

    get value() {
        return this.dropdown.value;
    }

    set value(value) {
        this.dropdown.value = value;
    }

    selfValidate() {
        if (this.dropdown.getSelected().value === undefined) {
            this.showError(this.errors.noValue);
            return false;
        }

        return true;
    }

    hideError() {
        super.hideError();
        this.dropdown.hideErrorHighlight();
    }

    showError(errorMessage) {
        super.showError(errorMessage);
        this.dropdown.showErrorHighlight();
    }
}

class MultiselectField extends FormField {
    /** @type MultiselectDropdown */
    dropdown;

    constructor(element) {
        super(element);
        this.dropdown = new MultiselectDropdown($('.dropdown', this.field));
    }

    get value() {
        return this.dropdown.getSelected().map(selection => selection.value).join(', ');
    }

    selfValidate() {
        if (this.dropdown.getSelected().length < 1) {
            this.showError(this.errors.noValue);
            return false;
        }

        return true;
    }

    hideError() {
        super.hideError();
        this.dropdown.hideErrorHighlight();
    }

    showError(errorMessage) {
        super.showError(errorMessage);
        this.dropdown.showErrorHighlight();
    }
}

class RadioField extends FormField {
    radioOptions;

    constructor(element) {
        super(element);
        this.radioOptions = new RadioOptions(this.field.querySelector('.m-radio-options'));
    }

    get value() {
        return this.radioOptions.value;
    }

    selfValidate() {
        if (this.radioOptions.isCustomSelected && this.value.length < 2) {
            this.showError(this.errors.customTooShort);
            return false;
        }
        else if (!this.value) {
            this.showError(this.errors.noValue);
            return false;
        }

        return true;
    }

    hideError() {
        super.hideError();
        this.radioOptions.hideErrorHighlight();
    }

    showError(errorMessage) {
        super.showError(errorMessage);
        this.radioOptions.showErrorHighlight();
    }
}

class CheckboxField extends FormField {
    /** @type HTMLInputElement */
    input;

    constructor(element) {
        super(element);
        this.input = this.field.querySelector('input');
    }

    get value() {
        return this.input.checked;
    }

    selfValidate() {
        return true;
    }

    hideError() {
        super.hideError();
        this.input.classList.remove('error-highlight');
    }

    showError(errorMessage) {
        super.showError(errorMessage);
        this.input.classList.add('error-highlight');
    }
}

class AgreeCheckboxField extends CheckboxField {
    selfValidate() {
        if (!super.selfValidate()) return false;

        if (!this.value) {
            this.showError(this.errors.notChecked);
            return false;
        }

        return true;
    }
}

class CodeInputField extends FormField {
    constructor(element) {
        super(element);

        this._isDigitOnly = this.field.querySelector('.code-input').classList.contains('is-digit-only');
        this.inputs = element.querySelectorAll('input.code-input-char');

        for (const input of this.inputs) {
            input.addEventListener('input', (e) => this._handleInput(e, input));
            input.addEventListener('keydown', (e) => this._handleKeydown(e, input));
            input.addEventListener('focus', (e) => this._handleFocus(e, input));
        }
    }

    get value() {
        return Array.from(this.inputs).map(input => input.value).join('');
    }

    set value(value) {
        const chars = value.substring(0, this.inputs.length - 1).split('');

        this.inputs.forEach((input, i) => {
            input.value = chars[i] || '';
        });
    }

    get isDigitOnly() {
        return this._isDigitOnly;
    }

    set isDigitOnly(value) {
        this._isDigitOnly = !!value;
        this.element.classList.toggle('is-digit-only', this._isDigitOnly);
    }

    selfValidate() {
        if (this.value.length < this.inputs.length) {
            this.showError(this.errors.notComplete);
            return false;
        }

        return true;
    }

    hideError() {
        super.hideError();
        for (const input of this.inputs) {
            input.classList.remove('error-highlight');
        }
    }

    showError(errorMessage) {
        super.showError(errorMessage);
        for (const input of this.inputs) {
            input.classList.add('error-highlight');
        }
    }

    _handleInput(e, input) {
        let cleanValue = input.value;
        input.value = '';

        if (this.isDigitOnly) {
            const digits = cleanValue.match(/\d+/g);
            cleanValue = digits ? digits.join('') : '';
        }

        if (!cleanValue) return;

        let i = 0;
        let nextInput = input;
        while (nextInput && i < cleanValue.length) {
            nextInput.focus();
            nextInput.value = cleanValue.charAt(i);
            nextInput = nextInput.nextElementSibling;
            i++;
        }

        if (nextInput) {
            nextInput.focus();
        }
    }

    _handleKeydown(e, input) {
        if (e.key !== 'Backspace') return;

        input.value = '';

        if (input.previousElementSibling) {
            input.previousElementSibling.focus();
        }

        e.preventDefault(); // Don't continue to input handler.
    }

    async _handleFocus(e, input) {
        if (input.value) {
            await Utils.sleep(0); // for Safari
            input.select();
        }
    }
}
