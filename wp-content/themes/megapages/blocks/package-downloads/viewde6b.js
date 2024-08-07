/**
 * Frontend scripting for the package downloads block.
 */

class PackageDownloads {
    constructor(element) {
        this.packageDownloads = element;

        const copyToastElement = this.packageDownloads.querySelector('.copy-toast');
        document.querySelector('.toast-notifications-container').appendChild(copyToastElement);
        this.copyToast = new ToastNotification(copyToastElement);

        this._initPackageCards();
        this._initDropdownFilter();
    }

    _initPackageCards() {
        this.packageCards = [];
        for (const cardElement of this.packageDownloads.querySelectorAll('.package-card')) {
            const card = new PackageCard(cardElement);
            card.copyToast = this.copyToast;
            this.packageCards.push(card);
        }
    }

    _initDropdownFilter() {
        const dropdownElement = this.packageDownloads.querySelector('.dropdown.os-filter');
        if (dropdownElement) {
            this.osDropdown = new DropdownComponent($(dropdownElement));

            this.osDropdown.selectionChangedEvent.addListener((newSelection) => {
                for (const card of this.packageCards) {
                    if (card.osId == newSelection.value) {
                        card.show();
                    }
                    else {
                        card.hide();
                    }
                }
            });

            Breakpointer.breakpointChangedEvent.addListener((newBreakpoint) => {
                const sizeClass = newBreakpoint.gteq(Breakpoint.LG) ? 'lg' : 'md';
                this.osDropdown.setSize(sizeClass);
            });

            this.osDropdown.selectOption(this.osDropdown.$options.first().data('value'));
        }
    }
}

class PackageCard {
    constructor(element) {
        this.card = element;

        this.osId = this.card.dataset.osId;
        this.links = JSON.parse(this.card.dataset.links);

        this.downloadButton = this.card.querySelector('.download-button');
        this.betaButton = this.card.querySelector('.beta-button');

        this.installCmdField = this.card.querySelector('.install-cmd-field');
        if (this.installCmdField) {
            this.installCmdElement = this.installCmdField.querySelector('.install-cmd');
            this.installCmdSnippetTpl = this.installCmdElement.textContent;
            this.installCmdField.querySelector('.copy-btn').addEventListener('click', () => this.copyInstallCmdSnippet());
            this._populateSnippetPlaceholders();
        }

        this._initArchitectureRadios();
    }

    show() {
        this.card.classList.remove('hidden');
    }

    hide() {
        this.card.classList.add('hidden');
    }

    setArchitecture(value) {
        if (this.downloadButton) {
            this.downloadButton.href = value == 32 ? this.links.link32 : this.links.link64;
            this.downloadButton.classList.toggle('hidden', !this.downloadButton.getAttribute('href'));
        }

        if (this.betaButton) {
            this.betaButton.href = value == 32 ? this.links.beta32 : this.links.beta64;
            this.betaButton.classList.toggle('hidden', !this.betaButton.getAttribute('href'));
        }

        if (this.installCmdField) {
            this._populateSnippetPlaceholders();
        }
    }

    async copyInstallCmdSnippet() {
        if (!this.installCmdField) return;

        await navigator.clipboard.writeText(this.installCmdElement.textContent);

        this.copyToast.show(5000);
    }

    _populateSnippetPlaceholders() {
        const downloadUrl = new URL(this.downloadButton.getAttribute('href'));
        downloadUrl.searchParams.delete('aff');

        const packageFilename = downloadUrl.href.substring(downloadUrl.href.lastIndexOf('/') + 1);

        this.installCmdElement.textContent = this.installCmdSnippetTpl
            .replace('!{packageDownloadUrl}', downloadUrl.href)
            .replace('!{packageFilename}', packageFilename);
    }

    _initArchitectureRadios() {
        const architectureRadio = this.card.querySelector('.arch-options');
        for (const input of architectureRadio.querySelectorAll('input')) {
            input.addEventListener('change', () => this.setArchitecture(input.value));
        }

        const hr = this.card.querySelector('hr');
        const header = this.card.querySelector('.card-header');
        Breakpointer.breakpointChangedEvent.addListener((newBreakpoint) => {
            if (newBreakpoint.lteq(Breakpoint.SM)) {
                hr.after(architectureRadio);
            }
            else {
               header.appendChild(architectureRadio);
            }
        });

        const checkedArchRadio = architectureRadio.querySelector('input:checked');
        if (!checkedArchRadio) return; // No links available for this package.

        this.setArchitecture(checkedArchRadio.value);
    }
}
