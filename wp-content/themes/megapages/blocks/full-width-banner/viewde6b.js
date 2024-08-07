/**
 * Frontend scripting for the full width banner module.
 */

class FullWidthBanner {
    $fullWidthBanner;
    $buttons;

    constructor(element) {
        this.$fullWidthBanner = $(element);
        this.$buttons = $('.button', this.$fullWidthBanner);

        if ($(`.button.primary-user-button`).length) {
            const buttonsToKeep = window.user ? 'primary-user-button' : 'primary-button';
            $(`.button:not(.${buttonsToKeep})`, this.$fullWidthBanner).remove();
            $(`.button.${buttonsToKeep}`, this.$fullWidthBanner).removeClass('hidden');
        }
    }
}
