/**
 * Scripting for common MEGA WP components.
 */

/**
 * Simple class to handle overlay state.
 */
class Overlay {
    _$overlay;
    _sources = {};

    constructor($overlay) {
        this._$overlay = $overlay;
    }

    enable(sourceKey) {
        if (sourceKey) {
            this._sources[sourceKey] = 1;
        }

        this._$overlay.addClass('active');
        // Assume anything that invokes an overlay will also want to prevent background scrolling.
        $('body').addClass('no-scroll');
    }

    disable(sourceKey) {
        if (sourceKey) {
            delete this._sources[sourceKey];
            if (Object.keys(this._sources).length) return;
        }

        this._$overlay.removeClass('active');

        // Only remove no-scroll if no other overlays are currently active
        if (!($('.overlay').hasClass('active'))) {
            $('body').removeClass('no-scroll');
        }
    }
}

class Header {
    $header;
    $mobileMenuButton;
    $mobileMenuButtonIcon;
    $searchButton;
    $searchButtonIcon;
    $languageButton;
    $themeButton;
    $themeButtonIcon;
    $menuItems;
    $lower;
    $submenus;

    /**
     * @param {jQuery} $headerElement jQuery object for the header component main div.
     */
    constructor($headerElement) {
        this.$header = $headerElement;
        this.$mobileMenuButton = $('.mobile-menu-btn', this.$header);
        this.$mobileMenuButtonIcon = $('.icon', this.$mobileMenuButton);
        this.$searchButton = $('.search-btn', this.$header);
        this.$searchButtonIcon = $('.icon', this.$searchButton);
        this.$languageButton = $('.language-btn', this.$header);
        this.$themeButton = $('.theme-btn', this.$header);
        this.$themeButtonIcon = $('span.icon', this.$themeButton);
        this.$menuItems = $('.menu-item', this.$header);
        this.$lower = $('.lower', this.$header);
        this.$submenus = $('.submenu', this.$header);

        this.onDocumentClick = this.onDocumentClick.bind(this);

        this.$menuItems.on('click', (e) => {
            const $menuItem = $(e.currentTarget);
            const submenuTarget = $menuItem.data('target');
            if (submenuTarget) {
                this.toggleSubmenu(submenuTarget);
            }
        })

        this.$mobileMenuButton.on('click', (e) => {
            e.stopPropagation();
            window.mobileNavMenu.toggle();
        });

        this.$searchButton.on('click', (e) => {
            e.stopPropagation();
            window.mobileSearch.toggle();
        });

        this.$languageButton.on('click', (e) => {
            e.stopPropagation();
            ModalRegister.getModal('language-switcher').open();
        });

        this.$themeButton.on('click', () => {
            ThemeManager.setTheme(ThemeManager.getTheme() === 'dark' ? 'light' : 'dark');
            ThemeManager.savePreference();
        });

        window.mobileNavMenu.visibilityChangedEvent.addListener((isOpen) => {
            this.$mobileMenuButtonIcon.removeClass('menu x');
            this.$mobileMenuButton.attr('aria-label', isOpen ? 'Close' : 'Menu');
            this.$mobileMenuButtonIcon.addClass(isOpen ? 'x' : 'menu');
        });
        Reactor.addEventListener('theme-changed', () => this.setThemeBtnIcon());

        if (window.mobileSearch) {
            window.mobileSearch.visibilityChangedEvent.addListener((isOpen) => {
                this.$mobileMenuButton.toggleClass('hidden');
                this.$searchButtonIcon.removeClass('search x');
                this.$searchButtonIcon.addClass(isOpen ? 'x' : 'search');
            });
        }

        this.setThemeBtnIcon();
    }

    openSubmenu(className) {
        const $relatedMenuBtn = this.$menuItems.filter(`[data-target='${className}']`);
        const $submenu = this.getSubmenuByClass(className);

        // Set submenu outer background colours
        const outerBackgrounds = $submenu.data('bgs');
        const leftBg = outerBackgrounds['left'] ? '--color-bg-page' : '--color-bg-surface-1';
        const rightBg = outerBackgrounds['right'] ? '--color-bg-page' : '--color-bg-surface-1';
        this.$lower.css('background', `linear-gradient(90deg, var(${leftBg}) 50%, var(${rightBg}) 50%)`);

        this.closeSubmenus();
        $submenu.removeClass('hidden');
        $relatedMenuBtn.addClass('active');

        $(document).on('click', this.onDocumentClick);
        window.overlayWithHeader.enable('header');
    }

    closeSubmenus() {
        $(document).off('click', this.onDocumentClick);

        this.$menuItems.removeClass('active');
        this.$submenus.addClass('hidden');
        window.overlayWithHeader.disable('header');
    }

    toggleSubmenu(className) {
        const $submenu = this.getSubmenuByClass(className);
        if ($submenu.hasClass('hidden')) {
            this.openSubmenu(className);
        }
        else {
            this.closeSubmenus();
        }
    }

    getSubmenuByClass(className) {
        return $(`.${className}`, this.$header);
    }

    onDocumentClick(e) {
        if ($(e.target).is(this.$menuItems) || this.$menuItems.has(e.target).length) {
            return;
        }

        if ($('.lower', this.$header).has(e.target).length) {
            return;
        }

        this.closeSubmenus();
    }

    setThemeBtnIcon() {
        this.$themeButtonIcon.removeClass('sun moon').addClass(ThemeManager.getTheme() === 'dark' ? 'sun' : 'moon');
    }

    setAccountBtnsVisibility(isVisible) {
        $('.sign-in-btn, .sign-up-btn', this.$header).toggleClass('hidden', !isVisible);
    }

    /**
     * Set avatar to the default avatar with the given first name and colour.
     *
     * @param {string} firstName
     * @param {string} colour
     */
    setAvatar(firstName, colour) {
        const $vr = $('.right-group .vr', this.$header).removeClass('hidden');
        const $avatarBox = $('.right-group .avatar-box', this.$header).removeClass('hidden');
        const $avatar = $('.avatar', $avatarBox).addClass(colour).text(firstName.charAt(0));
    }

    /**
     * Set avatar to the given URL of a custom avatar.
     *
     * @param {string} url
     */
    setCustomAvatar(url) {
        const $vr = $('.right-group .vr', this.$header).removeClass('hidden');
        const $avatarBox = $('.right-group .custom-avatar-box', this.$header).removeClass('hidden');
        const $avatar = $('img', $avatarBox).attr('src', url);
    }
}

class Footer {
    $footer;
    accordions = [];

    constructor($footerElement) {
        this.$footer = $footerElement;

        for (const element of $('.accordion', this.$footer)) {
            this.accordions.push(new AccordionComponent($(element)));
        }
    }
}

/**
 * Base class for modals.
 */
class Modal {
    $modal;
    /** Reference by which to obtain this modal through the {@link ModalRegister}. */
    name;
    /** Optional URL fragment to associate this modal with. */
    fragment;
    overlay = window.overlay;
    onOpened = new Event();
    onClosed = new Event();
    visibilityChangedEvent = new Event();

    constructor(modal) {
        this.modal = modal;
        this.$modal = $(modal);
        this.constrainer = this.modal.parentNode.classList.contains('modal-constrainer') ? this.modal.parentNode : null;

        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onEscapeKey = this.onEscapeKey.bind(this);
        this.close = this.close.bind(this);

        this.closeButton = modal.querySelector('button.close'); // top-right X
        if (this.closeButton) {
            this.closeButton.addEventListener('click', this.close);
        }
    }

    getName() {
        return this.name;
    }

    isOpen() {
        return !this.modal.classList.contains('hidden');
    }

    open() {
        this.overlay.enable(`modal-${this.name}`);
        if (this.constrainer) this.constrainer.classList.remove('hidden');
        this.modal.classList.remove('hidden');

        $(document).rebind('click', this.onDocumentClick);
        $(document).rebind('keydown', this.onEscapeKey);

        if (this.fragmentMonitor) {
            this.fragmentMonitor.addFragment();
        }

        this.onOpened.invoke();
        this.visibilityChangedEvent.invoke(true);
        console.log(`Modal '${this.name}' opened.`);
    }

    close() {
        $(document).off('keydown', this.onEscapeKey);
        $(document).off('click', this.onDocumentClick);

        this.modal.classList.add('hidden');
        if (this.constrainer) this.constrainer.classList.add('hidden');
        this.overlay.disable(`modal-${this.name}`);

        if (this.fragmentMonitor) {
            this.fragmentMonitor.removeFragment();
        }

        this.onClosed.invoke();
        this.visibilityChangedEvent.invoke(false);
        console.log(`Modal '${this.name}' closed.`);
    }

    setOpen(state) {
        if (state) {
            this.open();
        }
        else {
            this.close()
        }
    }

    toggle() {
        this.setOpen(!this.isOpen());
    }

    setTitle(title) {
        this.heading ||= this.modal.querySelector('.heading');

        this.heading.textContent = title;
    }

    setBlurb(blurb) {
        this.blurb ||= this.modal.querySelector('.blurb');

        this.blurb.textContent = blurb;
    }

    setImage(url) {
        this.imgBox ||= this.modal.querySelector('.img-box');
        this.img ||= this.imgBox.querySelector('.img');
        this.img.style.backgroundImage = `url('${url}')`;
        this.imgBox.classList.toggle('hidden', !url);
    }

    onDocumentClick(e) {
        if (this.$modal.is(e.target) || this.$modal.has(e.target).length) {
            return;
        }

        this.close();
    }

    onEscapeKey(e) {
        if (e.key !== "Escape") {
            return;
        }
        this.close();
    }

    _monitorFragment(fragment) {
        this.fragmentMonitor = new FragmentMonitor(fragment);
        if (this.fragmentMonitor.isMatch) {
            this.open();
        }

        this.fragmentMonitor.onFragmentChanged.addListener((isMatch) => {
            if (isMatch && !this.isOpen()) {
                this.open();
            }
            else if (!isMatch && this.isOpen()) {
                this.close();
            }
        });
    }
}

/** Instantiate new, generic message modals. */
class MessageModal {
    /**
     * Create and display a new message modal with the given title and blurb.
     * The modal will have an "OK" primary button by default, which simply dismisses the modal.
     *
     * @param {string} name Name (handle) of the modal.
     * @param {string} title Title of the modal.
     * @param {string} blurb Blurb or description for the modal.
     */
    constructor(name, title = '', blurb = '') {
        const modals = document.querySelector('.modals');
        const template = modals.querySelector('template.generic-msg-modal');
        const templateInstance = template.content.firstElementChild.cloneNode(true);
        modals.appendChild(templateInstance);
        const modalElement = templateInstance.querySelector('dialog.modal');

        this.modal = new Modal(modalElement);
        this.modal.name = name;
        this.modal.setTitle(title);
        this.modal.setBlurb(blurb);

        this._buttonCache = { };

        // Default behaviour
        this.setPrimaryButton(template.dataset.defaultPrimaryBtnLabel, '', () => this.hide());
        this.show();
    }

    show() {
        this.modal.open();
    }

    hide() {
        this.modal.close();
    }

    /**
     * Set the modal's details as from ModalComponent block component attributes.
     *
     * @param {object} modalDetails
     */
    setDetails(modalDetails) {
        this.modal.setTitle(modalDetails.title);
        this.modal.setBlurb(modalDetails.blurb);
        this.modal.setImage(modalDetails.image.url);

        const primary = modalDetails.buttonPrimary;
        const secondary = modalDetails.buttonSecondary;

        this.setPrimaryButton(primary.label, primary.href, primary.action);
        this.setSecondaryButton(secondary.label, secondary.href, secondary.action);
    }

    /**
     * Set up a primary button for the modal.
     *
     * @param {string} label
     * @param {string} href
     * @param {function()} action
     */
    setPrimaryButton(label, href = '', action = null) {
        this._setButton('primary', label, href, action);
    }

    /** Set up a secondary button for the modal.
     *
     * @param {string} label
     * @param {string} href
     * @param {function()} action
     */
    setSecondaryButton(label, href = '', action = null) {
        this._setButton('secondary', label, href, action);
    }

    _setButton(buttonClass, label, href = '', action = null) {
        const cache = this._buttonCache[buttonClass] ||= { };
        cache['link'] ||= this.modal.modal.querySelector(`a.${buttonClass}`);
        cache['button'] ||= this.modal.modal.querySelector(`button.${buttonClass}`);
        cache['link'].classList.add('hidden');
        cache['button'].classList.add('hidden');

        let button = cache['button'];
        if (href) {
            button = cache['link'];
            button.href = href;
        }

        button.textContent = label;
        if (cache['action']) {
            cache['link'].removeEventListener('click', cache['action']);
            cache['button'].removeEventListener('click', cache['action']);
        }
        if (action && typeof action === 'function') {
            cache['action'] = action;
            button.addEventListener('click', cache['action']);
        }

        if (label && (href || action)) {
            button.classList.remove('hidden');
        }
    }
}

class MobileMenuModal extends Modal {
    name = 'mobile-menu';
    $toggleThemeBtn;
    $languageBtn;
    $bottomBar;
    accordions = [];

    constructor(modal) {
        super(modal);
        this.overlay = window.overlayWithHeader;

        this.$toggleThemeBtn = $('.theme-btn', this.$modal);
        this.$languageBtn = $('.language-btn', this.$modal);
        this.$bottomBar = $('.bottom-bar', this.$modal);

        for (const element of $('.accordion', this.$modal)) {
            this.accordions.push(new AccordionComponent($(element)));
        }

        this.onBreakpointChanged = this.onBreakpointChanged.bind(this);

        this.$toggleThemeBtn.on('click', () => {
            ThemeManager.setTheme(ThemeManager.getTheme() === 'dark' ? 'light' : 'dark');
            ThemeManager.savePreference();
        });

        this.$languageBtn.on('click', (e) => {
            e.stopPropagation();
            ModalRegister.getModal('language-switcher').open();
        });

        Reactor.addEventListener('theme-changed', () => this.updateThemeBtn());

        this.updateThemeBtn();
    }

    open() {
        super.open();
        Reactor.addEventListener('breakpoint-changed', this.onBreakpointChanged);
    }

    close() {
        super.close();
        Reactor.removeEventListener('breakpoint-changed', this.onBreakpointChanged);
    }

    setAccountBtnsVisibility(isVisible) {
        this.$bottomBar.toggleClass('hidden', !isVisible);
    }

    updateThemeBtn() {
        const $buttonText = $('.label', this.$toggleThemeBtn);
        const $buttonIcon = $('.icon', this.$toggleThemeBtn);

        if (ThemeManager.getTheme() === 'dark') {
            $buttonText.text(this.$toggleThemeBtn.data('light-text'));
            $buttonIcon.removeClass('moon').addClass('sun');
        }
        else {
            $buttonText.text(this.$toggleThemeBtn.data('dark-text'));
            $buttonIcon.removeClass('sun').addClass('moon');
        }
    }

    onBreakpointChanged(newBreakpoint) {
        if (newBreakpoint.gt(Breakpoint.MD)) {
            this.close();
        }
    }

    onDocumentClick(e) {
        // Do nothing; override default behaviour
    }
}

class MobileSearchModal extends Modal {
    name = 'mobile-search';
    $searchInput;

    constructor($modal) {
        super($modal[0]);
        this.overlay = window.overlayWithHeader;
        this.$searchInput = $('.search-field', this.$modal);

        this.onBreakpointChanged = this.onBreakpointChanged.bind(this);
    }

    open() {
        super.open();
        this.$searchInput.trigger('focus');
        Breakpointer.breakpointChangedEvent.addListener(this.onBreakpointChanged);
    }

    close() {
        super.close();
        Breakpointer.breakpointChangedEvent.removeListener(this.onBreakpointChanged);
    }

    onBreakpointChanged(newBreakpoint) {
        if (newBreakpoint.gt(Breakpoint.MD)) {
            this.close();
        }
    }

    onDocumentClick(e) {
        // Do nothing; override default behaviour
    }
}

class LanguageSwitcher extends Modal {
    name = 'language-switcher';
    $options;
    $saveButton;

    constructor(modal) {
        super(modal);

        this.$options = $('.language-options .language-option', this.$modal);
        this.$saveButton = $('.buttons button.save-language', this.$modal);

        this.$options.on('click', (e) => {
            this.$options.removeClass('active');
            $(e.currentTarget).addClass('active');

            // For HC as its dialog was designed with no save button
            if (!this.$saveButton.length) {
                this.goToUrl();
            }
        });

        this.$saveButton.on('click', () => {
            this.goToUrl();
        });
    }

    goToUrl() {
        const url = this.getSelectedLanguageUrl();
        if (url) {
            Prefs.set('language', this.getSelectedLanguageCode());
            window.location.href = url;
        }

        this.close();
    }

    getSelectedLanguageUrl() {
        return this.$options.filter('.active').data('link');
    }

    getSelectedLanguageCode() {
        return this.$options.filter('.active').data('code');
    }
}

/**
 * Base class for expandable components.
 */
class ExpandableComponent {
    $expandable;

    constructor($expandableElement) {
        this.$expandable = $expandableElement;
    }

    isExpanded() {
        return this.$expandable.hasClass('expanded');
    }

    expand() {
        this.$expandable.addClass('expanded');
    }

    contract() {
        this.$expandable.removeClass('expanded');
    }

    toggle() {
        if (this.isExpanded()) {
            this.contract();
        }
        else {
            this.expand();
        }
    }
}

class ShowHideComponent extends ExpandableComponent {
    constructor($showHideElement) {
        super($showHideElement);
        $('.show-hide-toggle', this.$expandable).on('click', () => this.toggle());
    }
}

class AccordionComponent extends ExpandableComponent {
    $drawer;
    expandStartEvent = new Event();

    transitionOptions = {
        easing: 'swing',
        duration: 200,
        complete: () => {
            // Reset to automatic height for resize responsiveness
            this.$drawer.height('auto');
        },
    };

    constructor($accordionElement) {
        super($accordionElement);

        this.$expandable.data('js-object', this);

        this.$drawer = $('.accordion-content', this.$expandable);
        this.$drawer[0].style.display = 'none';

        $('.accordion-toggle', this.$expandable).on('click', () => {
            this.$expandable.siblings('.accordion').each((i, element) => {
                const accordion = $(element).data('js-object');
                if (accordion.isExpanded()) {
                    accordion.contract();
                }
            });

            this.toggle();
        });
    }

    setTransitionOptions(newOptions) {
        this.transitionOptions = Object.assign(this.transitionOptions, newOptions);
    }

    expand() {
        this.expandStartEvent.invoke();
        super.expand();
        this.$drawer.stop().animate({
            height: "show",
            opacity: "show",
        }, this.transitionOptions);
    }

    contract() {
        super.contract();
        this.$drawer.stop().animate({
            height: "hide",
            opacity: "hide",
        }, this.transitionOptions);
    }
}

/**
 * Scripting for the search component.
 */
class SearchComponent {
    suggestionItemTemplate = '<a></a>';
    searchSuggestions = [];

    $searchComponent;
    $searchForm;
    $searchField;
    $clearButton;
    $suggestionsList;

    /**
     * @param {jQuery} $searchElement jQuery object for the search component main div.
     */
    constructor($searchElement) {
        this.$searchComponent = $searchElement;
        this.$searchForm = $searchElement.parent();
        this.$searchField = $('.search-field', this.$searchComponent);
        this.$clearButton = $('.input-clear-txt', this.$searchComponent);
        this.$suggestionsList = $('.search-suggestions', this.$searchComponent);
        this.$suggestionsList.children('a').each((i, suggestion) => {
            let $suggestion = $(suggestion);
            let $tags = '';
            $suggestion.data('tags').map((tag) => {
                $tags += tag.name.toLowerCase() + ' ';
            });
            this.searchSuggestions.push({
                label: $suggestion.text(),
                tags: $tags,
                url: $suggestion.attr('href'),
            })
        });

        this.$suggestionsList.empty();

        this.clearInputAndFocus = this.clearInputAndFocus.bind(this);

        this.$searchField.on('input', () => this.setClearBtnState());

        this.setClearBtnState();
        this.initSearchSuggestions();

    }

    openSuggestionList () {
        this.$suggestionsList.removeClass('hidden');
        $(document).on('click', this.onDocumentClick.bind(this));
    }

    closeSuggestionList() {
        this.$suggestionsList.addClass('hidden');
        $(document).off('click', this.onDocumentClick);
    }

    onDocumentClick(e) {
        if (e.target && this.$searchComponent.has(e.target).length) return;
        this.closeSuggestionList();
    }

    setClearBtnState() {
        if (this.$searchField.val()) {
            this.$clearButton.off('click', this.clearInputAndFocus); // Bind the listener just once
            this.$clearButton.on('click', this.clearInputAndFocus);
            this.$clearButton.removeClass('hidden');
        }
        else {
            this.$clearButton.off('click', this.clearInputAndFocus);
            this.$clearButton.addClass('hidden');
        }
    }

    clearInputAndFocus() {
        this.$searchField.val('');
        this.setClearBtnState();
        this.$searchField.trigger('focus');
    }

    initSearchSuggestions() {
        this.$searchField.on('focus', () => {
            let query = this.$searchField.val().replace("'","’");

            if (this.tryPopulateSuggestions(query)) {
                this.openSuggestionList();
            }
        });

        this.$searchField.on('input', () => {
            let query = this.$searchField.val().replace("'","’");

            if (this.tryPopulateSuggestions(query)) {
                this.openSuggestionList();
            }
            else {
                this.closeSuggestionList();
            }
        });

        this.$searchForm.on('submit', () => {
            // prevent submission if empty
            return !!this.$searchField.val().trim();
        });
    }

    filterSuggestions(query) {
        if (!query) {
            // Don't filter with empty string.
            return [];
        }

        const reg = new RegExp(query.toLowerCase().split(" ").join(".*?[ ]"), 'i');

        return this.searchSuggestions.filter(
                suggestion => suggestion['label'].toLowerCase().includes(query.toLowerCase())
                    ||  suggestion['label'].toLowerCase().match(reg)
                    || (suggestion['tags'] && suggestion['tags'].includes(query.toLowerCase()))

        );
    }

    tryPopulateSuggestions(query) {
        this.$suggestionsList.empty();

        let suggestions = this.filterSuggestions(query);
        if (!suggestions.length) return false;

        let count = 0;
        for (let suggestion of suggestions) {
            if (count >= 5) break;

            this.addSearchSuggestion(suggestion['label'], suggestion['url'], suggestion['tags'], query);
            count++;
        }

        return true;
    }

    addSearchSuggestion(label, url, tags, emboldenText) {
        let suggestion = document.createElement('a');
        suggestion.textContent = label;
        suggestion.href = url;
        suggestion.dataset.tag = tags;

        const keywords = emboldenText.trim().split(' ');
        const keywordsCapture = keywords.map(keyword => `(${keyword})`);
        const reg = new RegExp(keywordsCapture.join(".*?[ ]"), 'ig');

        let tempLabel = label;
        const matches = label.matchAll(reg);

        const arr = {};
        for (const match of matches) {
            match.forEach((item, index) => {
                if (index !== 0) {
                    arr[item] = `<b>${item}</b>`;
                }
            })
        }

        for (const [key, value] of Object.entries(arr)) {
            tempLabel = tempLabel.split(key).join(value);
        }
        suggestion.textContent = tempLabel;
        let cleanedTxt = suggestion.innerHTML;

        cleanedTxt = cleanedTxt.replaceAll('&lt;&lt;b&gt;b&lt;/b&gt;&gt;', '<b>').replaceAll('&lt;/&lt;b&gt;b&lt;/b&gt;&gt;', '</b>')
            .replaceAll('&lt;b&gt;','<b>').replaceAll('&lt;/b&gt;', '</b>');

        suggestion.innerHTML = cleanedTxt;
        this.$suggestionsList.append(suggestion);
    }
}

/**
 * Scripting for the dropdown component.
 */
class DropdownComponent {
    $dropdown;
    $selector;
    $selectorText;
    $selectorIcon;
    $optionsList;
    $options;

    onOpenedEvent = new Event();
    onClosedEvent = new Event();
    selectionChangedEvent = new Event();

    $selectedOptions;

    _search = '';
    _searchCooldown;

    /**
     * @param {mixed} element HTMLDivElement or jQuery object for the dropdown component main div.
     */
    constructor(element) {
        if (!(element instanceof jQuery)) {
            element = $(element);
        }

        this.$dropdown = element;
        this.$selector = $('.selector', this.$dropdown);
        this.$selectorText = $('.selector-text', this.$selector);
        this.$selectorIcon = $('.selector-icon span.icon', this.$selector)
        this.$optionsList = $('.options-list', this.$dropdown);
        this.$options = $('.option', this.$optionsList);

        this.$selectedOptions = this.$options.filter('.selected');
        if (this.$selectedOptions.length) {
            this._selectOption(this.$selectedOptions.first());
        }

        this.$selector.on('click keyup', (event) => {
            if (event.type === 'keyup' && event.key !== 'Enter') return;

            if (this.$optionsList.hasClass('hidden')) {
                this.open();
            }
            else {
                this.close();
            }
        });

        this.$options.on('click', (e) => this._onOptionClick(e));
        this.$options.on('blur', (e) => this._onOptionBlur(e));
        this.$options.on('keydown', (e) => this._onOptionKeyDown(e));

        const $form = this.$dropdown.closest('form');
        if ($form) {
            $form.on('reset', () => this.reset());
        }
    }

    get isOpen() { return this.$dropdown.hasClass('active') };

    get value() { return this.getSelected().value; }

    set value(value) { this.selectOption(value); }

    selectOption(value) {
        const $option = this.$options.filter(`.option[data-value="${value}"]`);
        if (!$option) {
            console.warn(`Attempted to select a non-existing select option with value ${value}. Ignoring.`);
            return;
        }

        this._selectOption($option);
    }

    _selectOption($option) {
        this.$selectedOptions.removeClass('selected');
        $option.addClass('selected');

        this.$selectedOptions = $option;
        this._determineSelectorText();
        $option.trigger('focus');
        this.selectionChangedEvent.invoke(this.getSelected());
    }

    getSelected() {
        const $option = this.$selectedOptions.first();

        return {
            name: $option.text(),
            value: $option.data('value'),
        }
    }

    open() {
        this.$dropdown.addClass('active');
        this.$optionsList.removeClass('hidden');
        this.$selectorIcon.addClass('chevron-up').removeClass('chevron-down');
        const firstOption = this.$selectedOptions[0] || this.$options[0];
        if (firstOption) firstOption.focus();

        this.onOpenedEvent.invoke();
    }

    close() {
        this.$dropdown.removeClass('active');
        this.$optionsList.addClass('hidden');
        this.$selectorIcon.addClass('chevron-down').removeClass('chevron-up');
        this.onClosedEvent.invoke();
    }

    reset() {
        this.close();
        this._selectOption($());
    }

    /**
     * Set the size of this particular dropdown component.
     *
     * @param sizeClass Name of the size class. Expecting 'lg', 'md', 'sm'.
     */
    setSize(sizeClass) {
        const sizes = ['lg', 'md', 'sm'];

        if (sizes.includes(sizeClass)) {
            this.$dropdown.removeClass('lg md sm').addClass(sizeClass);
        }
    }

    addOption(value, name) {
        const $newOption = $(`<div class="option" tabIndex="0">
            <span class="name"></span>
            <div class="icon-box">
                <span class="icon check"></span>
            </div>
        </div>`);

        $('.name', $newOption).text(name);
        $newOption.attr('data-value', value);
        $newOption.on('click', (e) => this._onOptionClick(e));
        $newOption.on('blur', (e) => this._onOptionBlur(e));
        $newOption.on('keydown', (e) => this._onOptionKeyDown(e));

        this.$optionsList.append($newOption);

        this.$options = $('.option', this.$optionsList);
    }

    showErrorHighlight() {
        this.$selector.addClass('error-highlight');
    }

    hideErrorHighlight() {
        this.$selector.removeClass('error-highlight');
    }

    _determineSelectorText() {
        this.$selectorText.text(this.$selectedOptions.first().text());
    }

    _onOptionClick(event) {
        this._selectOption($(event.currentTarget));
        this.close();
    }

    _onOptionBlur(event) {
        if (!this.isOpen) return; // Dropdown already closed, ignore
        if ($(event.relatedTarget).is(this.$dropdown)) return; // If focus went to dropdown component root element, keep open
        if (this.$dropdown.has(event.relatedTarget).length > 0) return; // If focus remained within the dropdown component, keep open

        this.close();
    }

    _onOptionKeyDown(event) {
        if (event.key === 'Escape') {
            this.close();
        }
        else if (event.key === 'Enter') {
            this._selectOption($(event.currentTarget));
            this.close();
        }
        else if (event.key === 'ArrowUp') {
            if (event.currentTarget.previousElementSibling) {
                event.currentTarget.previousElementSibling.focus();
            }
            event.preventDefault(); // Don't scroll
        }
        else if (event.key === 'ArrowDown') {
            if (event.currentTarget.nextElementSibling) {
                event.currentTarget.nextElementSibling.focus();
            }
            event.preventDefault();
        }
        else {
            // Try to focus option by search
            this._search += event.key;
            this.$options.filter((i, element) => {
                return element.textContent.trim().toLowerCase().startsWith(this._search);
            }).first().trigger('focus');

            clearTimeout(this._searchCooldown);
            this._searchCooldown = setTimeout(() => {
                this._search = '';
            }, 750);
        }
    }
}

class MultiselectDropdown extends DropdownComponent {
    constructor($dropdownElement) {
        super($dropdownElement);

        // Finding selected options by checkbox value and not .selected class
        // allows value to be remembered after refreshing page
        this.$selectedOptions = this.$options.filter(':has(input[type="checkbox"]:checked)');
        for (const element of this.$selectedOptions) {
            this._selectOption($(element));
        }
    }

    getSelected() {
        return this.$selectedOptions.toArray().map((element) => {
            return {
                name: element.querySelector('.name').textContent,
                value: element.dataset.value,
            };
        });
    }

    clearSelected() {
        $('.checkbox', this.$selectedOptions).attr('checked', false);
        this.$selectedOptions = this.$selectedOptions.removeClass('selected').filter('.selected');

        this._determineSelectorText();
        this.selectionChangedEvent.invoke({ });
    }

    addOption(value, name) {
        // TODO stub
    }

    reset() {
        this.close();
        this.clearSelected();
    }

    _selectOption($option) {
        $option.toggleClass('selected');
        $option[0].querySelector('.checkbox').checked = $option.hasClass('selected');

        this.$selectedOptions = this.$options.filter('.selected');
        this._determineSelectorText();
        $option.trigger('focus');
        this.selectionChangedEvent.invoke(this.getSelected());
    }

    _determineSelectorText() {
        const pluralSelectorText = this.$dropdown.data('plural-selector');
        this.$selectorText.text(this.$selectedOptions.length < 2
                ? this.$selectedOptions.first().text()
                : pluralSelectorText.replace('%1', this.$selectedOptions.length));
    }

    _onOptionClick(event) {
        this._selectOption($(event.currentTarget));
    }

    _onOptionKeyDown(event) {
        if (event.key === 'Enter') {
            this._selectOption($(event.currentTarget));
        }
        else {
            super._onOptionKeyDown(event);
        }
    }
}

class ToggleControl {
    constructor(toggle) {
        this.toggle = toggle;

        this.toggle.addEventListener('click', () => {
            if (this.toggle.classList.contains('disabled')) return;

            this.value = !this.value;
        });

        this.toggle.addEventListener('keydown', (e) => {
            if (e.key !== ' ' && e.key !== 'Enter') return;

            if (this.toggle.classList.contains('disabled')) return;

            this.value = !this.value;
        });
    }

    get value() {
        return this.toggle.classList.contains('on');
    }

    set value(value) {
        this.toggle.classList.toggle('on', value);
        this.toggle.classList.toggle('off', !value);
    }
}

class RadioOptions {
    /** @type HTMLDivElement */
    radioOptions;

    constructor(element) {
        this.radioOptions = element;

        this._setCustomInputVisibility(this._selectedOption);

        for (const element of this.radioOptions.querySelectorAll('.input-n-label input')) {
            element.addEventListener('change', (event) => {
                const option = event.target.parentElement.parentElement;
                this._setCustomInputVisibility(option);
            });
        }
    }

    get value() {
        const option = this._selectedOption;
        if (!option) return null;

        return option.classList.contains('custom-option')
            ? option.querySelector('input.custom-input').value
            : option.querySelector('.input-n-label input').value;
    }

    set value(value) {
        const input = this.radioOptions.querySelector(`.input-n-label input[value="${value}"]`);
        if (!input) {
            console.warn(`Attempted to select a non-existing radio option with value ${value}. Ignoring.`);
            return;
        }

        input.checked = true;
    }

    get isCustomSelected() {
        const option = this._selectedOption;
        if (!option) return false;

        return option.classList.contains('custom-option');
    }

    get _selectedOption() {
        const input = this.radioOptions.querySelector('.input-n-label input:checked');
        if (!input) return null;

        return input.parentElement.parentElement;
    }

    showErrorHighlight() {
        if (this.isCustomSelected) {
            this.radioOptions.querySelector('input.custom-input').classList.add('error-highlight');
        }
    }

    hideErrorHighlight() {
        const customInput = this.radioOptions.querySelector('input.custom-input');
        if (!customInput) return;

        customInput.classList.remove('error-highlight');
    }

    _setCustomInputVisibility(option) {
        // Hide other custom inputs
        for (const element of this.radioOptions.querySelectorAll('input.custom-input')) {
            element.classList.add('hidden');
        }

        if (option && option.classList.contains('custom-option')) {
            const customInput = option.querySelector('input.custom-input');
            customInput.classList.remove('hidden');
        }
    }
}

class CarouselComponent {
    $carousel;
    $controlButtons;
    $content;
    content;

    constructor($carousel) {
        this.$carousel = $carousel;
        this.$controlButtons = $('.carousel-controls button', this.$carousel);
        this.$content = $('.carousel-content', this.$carousel)
        this.content = this.$content[0];

        if (!this.content || !this.$controlButtons.length) {
            console.error(`Missing elements in '${this.$carousel.attr('class')}' carousel.`);
            return;
        }

        this.$controlButtons.on('click', (e) => {
            // Assume the content has a 'gap' property (but this is really up to the implementer - fix if needed)
            const gridGap = parseInt(this.$content.css('gap'));
            const itemWidth = parseInt(this.$content.children().first().css('width'));

            // Ensure each item gets 100 % visibility at some point during scrolling
            const itemFitCount = Math.floor(this.content.clientWidth / itemWidth);
            const scrollAmount = Math.min(this.content.clientWidth + gridGap, (itemWidth + gridGap) * itemFitCount);

            this.scrollTo($(e.currentTarget).hasClass('left')
                ? this.content.scrollLeft - scrollAmount
                : this.content.scrollLeft + scrollAmount);
        });

        $(this.content).on('scroll', () => this.setButtonStates());

        this.setButtonStates();
    }

    get itemCount() { return this.$content.children().length }

    scrollTo(leftValue) {
        this.content.scroll({
            left: leftValue,
            behavior: 'smooth',
        });
    }

    setButtonStates() {
        if (document.documentElement.dir === 'rtl') {
            this.$controlButtons[1].disabled = this.content.scrollLeft >= 0;
            this.$controlButtons[0].disabled = 0 - this.content.scrollLeft + this.content.clientWidth >= this.content.scrollWidth;
        }
        else {
            this.$controlButtons[0].disabled = this.content.scrollLeft <= 0;
            this.$controlButtons[1].disabled = this.content.scrollLeft + this.content.clientWidth >= this.content.scrollWidth;
        }
    }
}

class TabStructure {
    constructor(element) {
        this.tabStructure = element;

        this.onTabChanged = new Event();

        this._tabIds = [];
        this._tablist = this.tabStructure.querySelector('.tab-buttons');
        this._tabButtons = this._tablist.querySelectorAll('.tab-button');
        this._tabPanes = this.tabStructure.querySelectorAll('.tab-pane');

        if (this.tabStructure.dataset.tablistSpan) {
            this.setTablistSpan(this.tabStructure.dataset.tablistSpan);
            Breakpointer.breakpointChangedEvent.addListener(() => this.setTablistSpan(this.tabStructure.dataset.tablistSpan));
        }

        for (const tabButton of this._tabButtons) {
            this._tabIds.push(tabButton.dataset.tabId);
            tabButton.addEventListener('click', () => {
                this.setActiveTab(tabButton.dataset.tabId);
            });
        }

        // Prevent layout shift when emboldening the labels by reserving space for the bold lettering in CSS
        if (this.tabStructure.classList.contains('type-b')) {
            for (const tabButton of this._tabButtons) {
                const title = tabButton.querySelector('.tab-title');
                title.dataset.title = title.textContent;
            }
        }

        if (this._tabPanes.length > 0) {
            this.setActiveTab(this._tabPanes[0].dataset.tabId);
        }
    }

    get tabIds() { return this._tabIds; }

    get tabButtons() { return this._tabButtons; }

    get tabPanes() { return this._tabPanes; }

    setTablistSpan(columns) {
        if (Breakpointer.currentBreakpoint.gt(Breakpoint.MD)) {
            this._tablist.style.gridColumn = `span ${columns}`;
        }
        else {
            this._tablist.style.removeProperty('grid-column');
        }
    }

    getTabPane(tabId) {
        return Array.from(this._tabPanes).find((pane) => pane.dataset.tabId === tabId);
    }

    setActiveTab(tabId) {
        for (const tabButton of this._tabButtons) {
            tabButton.classList.toggle('active', tabButton.dataset.tabId == tabId);
        }

        for (const tabPane of this._tabPanes) {
            tabPane.classList.toggle('hidden', tabPane.dataset.tabId != tabId);
        }

        if (this.tabStructure.classList.contains('type-b') && Breakpointer.currentBreakpoint.eq(Breakpoint.SM)) {
            this.scrollToButton(tabId);
        }

        this.onTabChanged.invoke(tabId);
        this.activeTab = tabId;
    }

    /** Side-scroll the button of the given tab ID into view, if needed */
    scrollToButton(tabId) {
        if (this._tablist.offsetWidth >= this._tablist.scrollWidth) return; // No scrolling required. All buttons are in view.

        const scrollTo = (leftOffset) => {
            this._tablist.scrollTo({
                left: leftOffset,
                behavior: 'smooth',
            });
        };

        const button = Array.from(this._tabButtons).find(button => button.dataset.tabId == tabId);
        if (!button) return;

        const maskLeftEdge = this._tablist.scrollLeft;
        const maskRightEdge = this._tablist.scrollLeft + this._tablist.offsetWidth;
        const buttonLeftEdge = button.offsetLeft;
        const buttonRightEdge = button.offsetLeft + button.offsetWidth;

        // Somewhat arbitrary offset to ensure adjacent buttons are revealed,
        // provided the clicked button doesn't take all the space (therefore 0-54px)
        const offset = Math.min(Math.max(this._tablist.offsetWidth - button.offsetWidth, 0), 54);

        if (buttonLeftEdge <= maskLeftEdge) {
            scrollTo(buttonLeftEdge - offset);
        }
        else if (buttonRightEdge > maskRightEdge) {
            scrollTo(buttonRightEdge + offset - this._tablist.offsetWidth);
        }
    }
}

class ToastNotification {
    constructor(element) {
        this.toast = element;
        this.messageElement = this.toast.querySelector('.message');

        this.toast.querySelector('button.close').addEventListener('click', () => this.hide());
    }

    setMessage(message) {
        this.toast.querySelector('.message').textContent = message;
    }

    showMessage(message, timeout) {
        this.setMessage(message);
        this.show(timeout);
    }

    show(timeout) {
        this.toast.classList.remove('hidden');

        clearTimeout(this._tandle);

        if (timeout <= 0) return;

        this._tandle = setTimeout(() => {
            this.hide();
        }, timeout);
    }

    hide() {
        this.toast.classList.add('hidden');
        clearTimeout(this._tandle);
    }
}

/**
 * Simple controller for the radio button group component.
 */
class RadioGroup {
    $group;
    $buttons;
    selectionChangedEvent = new Event();

    constructor($group) {
        this.$group = $group;
        this.$buttons = $('.radio-option-btn', this.$group);

        this.$buttons.on('click', (e) => {
            this.setActiveButton(e.target);
        });
    }

    getActiveButton() {
        return this.$buttons.filter('.active')[0];
    }

    setActiveButton(button) {
        this.$buttons.removeClass('active');

        if (button && this.$group.has(button).length) {
            button.classList.add('active');
            this.selectionChangedEvent.invoke(button);
        }
        else {
            this.selectionChangedEvent.invoke();
        }
    }
}

class CookieBanner {
    /** @type HTMLDivElement */
    banner;

    /**
     * @param {HTMLDivElement} cookieBanner
     */
    constructor(cookieBanner) {
        this.banner = cookieBanner;

        this.acceptAllCookies = this.acceptAllCookies.bind(this);
        this.rejectNonessentialCookies = this.rejectNonessentialCookies.bind(this);

        this.banner.querySelector('button.close').addEventListener('click', () => this.hide());
        this.banner.querySelector('button.accept-all').addEventListener('click', this.acceptAllCookies);

        if (!CookieSettings.isConsentSet()) {
            this.show();
            CookieSettings.onConsentChanged.addListener(() => this.hide());
        }
    }

    show() {
        this.banner.classList.remove('hidden');
    }

    hide() {
        this.banner.classList.add('hidden');
    }

    acceptAllCookies() {
        CookieSettings.setConsent({
            preferences: true,
            analytics: true,
            marketing: true,
        });

        console.log('All cookies accepted.');
        this.banner.classList.add('hidden');
    }

    rejectNonessentialCookies() {
        CookieSettings.setConsent({
            preferences: false,
            analytics: false,
            marketing: false,
        });

        console.log('Non-essential cookies rejected.');
        this.banner.classList.add('hidden');
    }
}

class CookieDialog extends Modal {
    name = 'cookie-dialog';

    constructor(modal) {
        super(modal);

        this.preferencesToggle = new ToggleControl(this.modal.querySelector('.toggle-control.preferences'));
        this.analyticsToggle = new ToggleControl(this.modal.querySelector('.toggle-control.analytics'));
        this.marketingToggle = new ToggleControl(this.modal.querySelector('.toggle-control.marketing'));

        this.modal.querySelector('button.save').addEventListener('click', () => this.onSave());

        this._monitorFragment('#cookie-settings-dialog');
        this.loadValues();
    }

    loadValues() {
        if (CookieSettings.isConsentSet()) {
            const consent = CookieSettings.getConsent();

            this.preferencesToggle.value = !!consent.preferences;
            this.analyticsToggle.value = !!consent.analytics;
            this.marketingToggle.value = !!consent.marketing;
        }
    }

    onSave() {
        CookieSettings.setConsent({
            preferences: this.preferencesToggle.value,
            analytics: this.analyticsToggle.value,
            marketing: this.marketingToggle.value,
        });

        this.close();
    }
}

class SplitFlapTimer {
    constructor(element) {
        this.element = element;

        this.daysCell0 = this.element.querySelector('.days .cell:first-child');
        this.daysCell1 = this.element.querySelector('.days .cell:nth-child(2)');
        this.hoursCell0 = this.element.querySelector('.hours .cell:first-child');
        this.hoursCell1 = this.element.querySelector('.hours .cell:nth-child(2)');
        this.minutesCell0 = this.element.querySelector('.minutes .cell:first-child');
        this.minutesCell1 = this.element.querySelector('.minutes .cell:nth-child(2)');
    }

    setTime(seconds) {
        this._time = seconds;

        const days = Math.floor(seconds / (3600 * 24));

        seconds -= days * 3600 * 24;
        const hours = Math.floor(seconds / 3600);

        seconds -= hours * 3600
        const minutes = Math.floor(seconds / 60);

        this.setDays(days);
        this.setHours(hours);
        this.setMinutes(minutes);
    }

    setDays(days) {
        days = Math.floor(days);
        days = Math.max(0, Math.min(99, days));
        days = days.toString().padStart(2, '0');

        this.daysCell0.textContent = days.charAt(0);
        this.daysCell1.textContent = days.charAt(1);
    }

    setHours(hours) {
        hours = Math.floor(hours);
        hours = Math.max(0, Math.min(99, hours));
        hours = hours.toString().padStart(2, '0');

        this.hoursCell0.textContent = hours.charAt(0);
        this.hoursCell1.textContent = hours.charAt(1);
    }

    setMinutes(minutes) {
        minutes = Math.floor(minutes);
        minutes = Math.max(0, Math.min(99, minutes));
        minutes = minutes.toString().padStart(2, '0');

        this.minutesCell0.textContent = minutes.charAt(0);
        this.minutesCell1.textContent = minutes.charAt(1);
    }

    beginCountdown() {
        clearInterval(this._updateInterval);
        this._updateInterval = setInterval(() => {
            if (this._time - 60 <= 0) {
                clearInterval(this._updateInterval);
                return;
            }

            this.setTime(this._time - 60);
        }, 60 * 1000);
    }
}
