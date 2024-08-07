/**
 * Frontend scripting for the horizontal tabs table module.
 *
 * Contains classes for the main module and for the download cards.
 */

class HorizontalDownloads {
    $horizontalDownloads;
    $osTabs;
    $macTab;

    $allDownloadsButton;

    $productCards;

    /** @type DropdownComponent */
    linuxDistroDropdown;

    constructor(element) {
        this.$horizontalDownloads = $(element);

        this.$osTabs = $('.tab', this.$horizontalDownloads);
        this.$macTab = $('.mac-os.tab', this.$horizontalDownloads);

        this.$productCards = $('.product-card', this.$horizontalDownloads);
        this.$productCards.each((i, element) => {
            const productCard = $('.product-cards');
            productCard.append(element);
        });

        const $dropdown = $('.header-btn-container .dropdown', this.$horizontalDownloads);
        this.linuxDistroDropdown = new DropdownComponent($dropdown);

        this.linuxDistroDropdown.selectionChangedEvent.addListener((newSelection) => {
            this.showLinuxPackages(newSelection.value);
        });

        Reactor.addEventListener('breakpoint-changed', (newBreakpoint) => {
            const sizeClass = newBreakpoint.gteq(Breakpoint.LG) ? 'lg' : 'md';
            this.linuxDistroDropdown.setSize(sizeClass);
        });

        this.$productCards.each((i, element) => {
            const productCard = $(element);
            this.$dropdownOptions = $('.header-btn-container .dropdown .option', this.$horizontalDownloads);

            this.$dropdownOptions.addClass('hidden');
            this.$dropdownOptions.each((n, element) => {
                const $option = $(element);
                if (productCard.hasClass($option.attr('data-value'))) {
                    $option.addClass('active');
                }
            });
        });
        this.$activeOptions = this.$dropdownOptions.filter('.active');
        this.linuxDistroDropdown._selectOption(this.$activeOptions.first());
        if (this.$activeOptions) {
            this.$activeOptions.removeClass('hidden');
        }

        this.initSelectedTab();

        this.$osTabs.on('click', (e) => {
            const $osTab = $(e.currentTarget);

            this.$osTabs.removeClass('selected');
            $osTab.addClass('selected');

            this.setMacTabBorders();
            this.showProductCards();
        });

        this.$allDownloadsButton = $('.linux-all-downloads-button .text-button', this.$horizontalDownloads);
        Reactor.addEventListener('breakpoint-changed',(newBreakpoint) => {
            const sizeClass = newBreakpoint.toString().toLowerCase();

            this.$allDownloadsButton.removeClass('xl lg md sm').addClass(sizeClass);
        });
    }

    showLinuxPackages(distro) {
        this.$horizontalDownloads.removeClass();
        this.$horizontalDownloads.addClass('horizontal-downloads-module linux');
        this.$horizontalDownloads.attr('data-linux-distro', distro);

        this.showProductCards();
    }

    showProductCards() {
        this.$productCards.each((i, element) => {
            const productCard = $(element);

            if ((this.$horizontalDownloads.hasClass('mac-os') && productCard.hasClass('mac-os')) ||
                this.$horizontalDownloads.hasClass('windows') && productCard.hasClass('windows')) {
                productCard.removeClass('hidden');
            }
            else if (this.$horizontalDownloads.hasClass('linux')) {
                productCard.toggleClass('hidden',
                    !productCard.hasClass(this.$horizontalDownloads.attr('data-linux-distro')));
            }
            else {
                productCard.addClass('hidden');
            }
        });
    }

    initSelectedTab() {

        const platform = (window.navigator.userAgentData ? window.navigator.userAgentData.platform : null) ||
            window.navigator.platform;
        const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'macOS'];
        const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

        const ua = window.navigator.userAgent.toLowerCase();
        const isAndroid = ua.indexOf('android') !== -1;
        const isMobileMacOS = (ua.indexOf('safari') !== -1) && (ua.indexOf('mobile') !== -1) && (ua.indexOf('mac os') !== -1);

        this.$osTabs.each((i, element) => {
            const osTab = $(element);
            if (isAndroid || isMobileMacOS) {
                if (osTab.hasClass('windows') && isAndroid) {
                    this.$osTabs.eq(0).addClass('selected');
                    this.setMacTabBorders();
                    this.showProductCards();
                }
                else if (osTab.hasClass('mac-os') && isMobileMacOS) {
                    osTab.addClass('selected');
                    this.setMacTabBorders();
                    this.showProductCards();
                }
            }
            else {
                if (osTab.hasClass('mac-os') && macosPlatforms.indexOf(platform) !== -1) {
                    osTab.addClass('selected');
                    this.setMacTabBorders();
                    this.showProductCards();
                }
                else if ((osTab.hasClass('windows') && windowsPlatforms.indexOf(platform) !== -1) ||
                    (osTab.hasClass('windows') && !platform)) {
                    osTab.addClass('selected');
                    this.setMacTabBorders();
                    this.showProductCards();
                }
                else if (osTab.hasClass('linux') && /Linux/.test(platform)) {
                    osTab.addClass('selected');
                    this.setMacTabBorders();
                    this.showProductCards();
                }
            }

        });
    }

    setMacTabBorders() {
        this.$horizontalDownloads.removeClass();
        this.$horizontalDownloads.addClass('horizontal-downloads-module');

        this.$osTabs.each((i, element) => {
            const osTab = $(element);

            if (osTab.is('.windows.selected')) {
                this.$macTab.addClass('right-border').removeClass('left-border');
                this.$horizontalDownloads.addClass('windows');
                return;
            }
            else if (osTab.is('.mac-os.selected'))  {
                this.$macTab.removeClass('left-border right-border');
                this.$horizontalDownloads.addClass('mac-os');
                return;
            }
            else if (osTab.is('.linux.selected'))  {
                this.$macTab.addClass('left-border').removeClass('right-border');
                this.$horizontalDownloads.addClass('linux');
                return;
            }
        });
    }
}

class DownloadAppCards {
    $card;

    $thirtyTwoBitDownloadButton;
    $sixtyFourBitDownloadButton;

    $fileManagerCards;

    $textBox;
    $cmdTextBox;
    cmdPlaceholderText;
    $copyIcon;
    $fmiTooltip;

    $toast;
    $toastCross;
    $toastTimeout;

    $radioButtons;
    $thirtyTwoBitRadioBtn;
    $sixtyFourBitRadioBtn;

    constructor(element) {
        this.$card = $(element);

        this.$thirtyTwoBitDownloadButton = $('.download-button.thirty-two', this.$card);
        this.$sixtyFourBitDownloadButton = $('.download-button.sixty-four', this.$card);
        this.$desktopBetaThirtyTwoBitDownloadButton = $('.download-button.desktop-beta-thirty-two', this.$card);
        this.$desktopBetaSixtyFourBitDownloadButton = $('.download-button.desktop-beta-sixty-four', this.$card);

        // TODO FIXME below will always be empty jQuery collection
        this.$fmiTooltip = $('.fmi-tooltip', this.$horizontalDownloads);

        this.$textBox = $('.copy-command-box', this.$card);
        this.$cmdTextBox = $('.text', this.$textBox);
        this.cmdPlaceholderText = this.$cmdTextBox.text();
        this.$copyIcon = $('.icon-box', this.$textBox);

        this.$toast = $('.toast');
        this.$toastCross = $('.icon-box', this.$toast);

        if (this.$card.hasClass('desktop-beta')) {
            $('.button', this.$desktopBetaSixtyFourBitDownloadButton).removeClass('secondary-muted').addClass('outline-muted');
            $('.button', this.$desktopBetaThirtyTwoBitDownloadButton).removeClass('secondary-muted').addClass('outline-muted');
        }
        this.$toastCross.on('click', () => {
            clearTimeout(this.$toastTimeout);
            this.$toast.toggleClass('hidden', true);
        });

        this.$copyIcon.on('click', () => {
            const copyText = $('.text', this.$textBox).text();

            // Copy the text to the clipboard
            navigator.clipboard.writeText(copyText);

            this.$toast.toggleClass('hidden', false);

            clearTimeout(this.$toastTimeout);
            this.$toastTimeout = setTimeout(() => {
                this.$toast.toggleClass('hidden', true);
            }, 5000);

        });

        this.$radioButtons = $('.radio-buttons', this.$card);
        this.$thirtyTwoBitRadioBtn = $('.option.thirty-two-bit', this.$radioButtons);
        this.$sixtyFourBitRadioBtn = $('.option.sixty-four-bit', this.$radioButtons);

        const downloadUrl64 = $('.button', this.$sixtyFourBitDownloadButton).attr('href');
        const downloadUrl32 = $('.button', this.$thirtyTwoBitDownloadButton).attr('href');
        const downloadBetaUrl64 = $('.button', this.$desktopBetaSixtyFourBitDownloadButton).attr('href');
        const downloadBetaUrl32 = $('.button', this.$desktopBetaThirtyTwoBitDownloadButton).attr('href');

        if (!this.$card.hasClass('desktop-beta')) {
            // Determine which link to show first
            if (downloadUrl32 && downloadUrl64) {
                this.$thirtyTwoBitRadioBtn.removeClass('hidden');
                this.$sixtyFourBitRadioBtn.removeClass('hidden');
                // prefer 64-bit
                $('.dot', this.$sixtyFourBitRadioBtn).removeClass('hidden');
                $('.dot', this.$thirtyTwoBitRadioBtn).addClass('hidden');
                this.$thirtyTwoBitDownloadButton.addClass('hidden');
                this._populateCmdText(downloadUrl64);
            }
            else if (downloadUrl32) {
                this.$sixtyFourBitDownloadButton.addClass('hidden');
                if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                    this.$thirtyTwoBitRadioBtn.removeClass('hidden');
                    $('.dot', this.$thirtyTwoBitRadioBtn).removeClass('hidden');
                    this._populateCmdText(downloadUrl32);
                }
            }
            else if (downloadUrl64) {
                this.$thirtyTwoBitDownloadButton.addClass('hidden');
                if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                    this.$sixtyFourBitRadioBtn.removeClass('hidden');
                    $('.dot', this.$sixtyFourBitRadioBtn).removeClass('hidden');
                    this._populateCmdText(downloadUrl64);
                }
            }
        }
        if (downloadBetaUrl32 && downloadBetaUrl64) {
            this.$thirtyTwoBitRadioBtn.removeClass('hidden');
            this.$sixtyFourBitRadioBtn.removeClass('hidden');
            // prefer 64-bit
            $('.dot', this.$thirtyTwoBitRadioBtn).addClass('hidden');
            $('.dot', this.$sixtyFourBitRadioBtn).removeClass('hidden');
            this._populateCmdText(downloadBetaUrl64);
            this.$desktopBetaThirtyTwoBitDownloadButton.addClass('hidden');

        }
        else if (downloadUrl32 && downloadBetaUrl64) {
            this.$thirtyTwoBitRadioBtn.removeClass('hidden');
            this.$sixtyFourBitRadioBtn.removeClass('hidden');
            this.$desktopBetaSixtyFourBitDownloadButton.addClass('hidden');
            if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                this.$thirtyTwoBitRadioBtn.removeClass('hidden');
                $('.dot', this.$thirtyTwoBitRadioBtn).removeClass('hidden');
                $('.dot', this.$sixtyFourBitRadioBtn).addClass('hidden');
                this._populateCmdText(downloadUrl32);
            }
        }
        else if (downloadUrl64 && downloadBetaUrl32) {
            this.$thirtyTwoBitRadioBtn.removeClass('hidden');
            this.$sixtyFourBitRadioBtn.removeClass('hidden');
            this.$desktopBetaThirtyTwoBitDownloadButton.addClass('hidden');
            if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                this.$sixtyFourBitRadioBtn.removeClass('hidden');
                $('.dot', this.$sixtyFourBitRadioBtn).removeClass('hidden');
                $('.dot', this.$thirtyTwoBitRadioBtn).addClass('hidden');
                this._populateCmdText(downloadUrl64);
            }
        }
        else if (downloadBetaUrl32) {
            if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                this.$thirtyTwoBitRadioBtn.removeClass('hidden');
                $('.dot', this.$thirtyTwoBitRadioBtn).removeClass('hidden');
                this._populateCmdText(downloadBetaUrl32);
            }
            this.$desktopBetaSixtyFourBitDownloadButton.addClass('hidden');
        }
        else if (downloadBetaUrl64) {
            if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                this.$sixtyFourBitRadioBtn.removeClass('hidden');
                $('.dot', this.$sixtyFourBitRadioBtn).removeClass('hidden');
                this._populateCmdText(downloadBetaUrl64);
            }
            this.$desktopBetaThirtyTwoBitDownloadButton.addClass('hidden');
        }

        this.$thirtyTwoBitRadioBtn.on('click', () => {
            this.radioButtonDots(this.$thirtyTwoBitRadioBtn);
            this.$desktopBetaThirtyTwoBitDownloadButton.toggleClass('hidden', false);
            this.$desktopBetaSixtyFourBitDownloadButton.toggleClass('hidden', true);
            if (this.$card.hasClass('desktop-beta')) {
                if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                    this._populateCmdText(downloadBetaUrl32);
                }
            }
            else {
                this.$sixtyFourBitDownloadButton.toggleClass('hidden', true);
                if (downloadUrl32) {
                    this.$thirtyTwoBitDownloadButton.toggleClass('hidden', false);
                }
                if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                    this._populateCmdText(downloadUrl32);
                }
            }

        });
        this.$sixtyFourBitRadioBtn.on('click', () => {
            this.radioButtonDots(this.$sixtyFourBitRadioBtn);
            this.$desktopBetaThirtyTwoBitDownloadButton.toggleClass('hidden', true);
            this.$desktopBetaSixtyFourBitDownloadButton.toggleClass('hidden', false);
            if (this.$card.hasClass('desktop-beta')) {
                if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                    this._populateCmdText(downloadBetaUrl64);
                }
            }
            else {
                this.$thirtyTwoBitDownloadButton.toggleClass('hidden', true);
                if (downloadUrl64) {
                    this.$sixtyFourBitDownloadButton.toggleClass('hidden', false);
                }
                if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                    this._populateCmdText(downloadUrl64);
                }
            }
        });

        const fmArray = ['nautilus', 'nemo', 'dolphin', 'thunar'];

        this.$fileManagerCards = $('.fmi-card');
        this.$thirtyTwoBitDownloadButton.on('click', () => {
            this.fileManagerTooltip(fmArray, '-fmi-thirty-two');

            this.$fileManagerCards.each((i, element) => {
                for (const fileManager of fmArray) {
                    const fmCard = $(element);

                    if (fmCard.hasClass(fileManager)) {
                        this.toggleFmDownloadLink(fmCard, fileManager + "-fmi-thirty-two");
                    }
                }
            });
        });
        this.$sixtyFourBitDownloadButton.on('click', () => {
            this.fileManagerTooltip(fmArray, '-fmi-sixty-four');

            this.$fileManagerCards.each((i, element) => {
                for (const fileManager of fmArray) {
                    const fmCard = $(element);

                    if (fmCard.hasClass(fileManager)) {
                        this.toggleFmDownloadLink(fmCard, fileManager + "-fmi-sixty-four");
                    }
                }
            });
        });
    }

    // Modify the Linux file manager tooltip if file manager integrations are not compatible
    // with the package being downloaded
    fileManagerTooltip(fmArray, arch) {
        if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
            for (const fileManager of fmArray) {
                if (this.$card.data(fileManager + arch)) {
                    return;
                }
            }

            $('.fmi-cards-filter').removeClass("off");
            this.$fmiTooltip.removeClass("hidden").addClass("error");
            $('.icon', this.$fmiTooltip).removeClass("help-circle").addClass("alert-triangle");
            $('.tooltip-text', this.$fmiTooltip).addClass('hidden');
            $('.error-text', this.$fmiTooltip).removeClass('hidden');
        }
    }

    toggleFmDownloadLink(fmCard, dataType) {
        if (this.$card.data(dataType)) {
            if (!this.$card.hasClass('mac-os') && !this.$card.hasClass('windows')) {
                $('.fmi-cards-filter').addClass("off");
                this.$fmiTooltip.addClass("hidden");
            }
            $('.fmi-button .fmi-link', fmCard).attr("href", this.$card.data(dataType));
        }
        else {
            $('.fmi-button .fmi-link', fmCard).attr("href", null);
        }
    }

    radioButtonDots(clicked) {
        if (this.$thirtyTwoBitRadioBtn === clicked) {
            $('.dot', this.$sixtyFourBitRadioBtn).addClass('hidden');
        }
        else {
            $('.dot', this.$thirtyTwoBitRadioBtn).addClass('hidden');
        }

        $('.dot', clicked).removeClass('hidden');
    }

    _populateCmdText(packageDownloadUrl) {
        const url = new URL(packageDownloadUrl);
        url.searchParams.delete('aff');

        const packageFilename = url.href.substring(url.href.lastIndexOf('/') + 1);
        const cmdText = this.cmdPlaceholderText
            .replace('!{packageDownloadUrl}', url)
            .replace('!{packageFilename}', packageFilename);
        this.$cmdTextBox.text(cmdText);
    }
}
