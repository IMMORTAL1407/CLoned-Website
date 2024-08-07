/**
 * Frontend scripting for the tab structure module.
 */

class TabStructureBlock {
    constructor(element) {
        this.block = element;
        this.tabStructure = new TabStructure(this.block.querySelector('.tab-structure'));

        if (!this.setActiveTabViaFragment() && this.block.dataset.isOsFamilies) {
            this.setActiveTabViaAgent();
        }

        this.tabStructure.onTabChanged.addListener((tabId) => {
            const pane = this.tabStructure.getTabPane(tabId);
            if (!pane || !pane.id) return;

            if (window.location.hash !== `#${pane.id}`) {
                history.pushState({ fragmentMonitor: 'add' }, null, `#${pane.id}`);
            }
        });

        window.addEventListener('popstate', () => this.setActiveTabViaFragment());
    }

    /** @returns true if fragment used for tab selection */
    setActiveTabViaFragment() {
        if (!window.location.hash) return false;

        const target = document.getElementById(window.location.hash.slice(1)); // remove #
        if (!target) return false;

        const containingTab = target.closest('.tab-pane');
        if (!containingTab) return false;

        if (!this.tabStructure.tabIds.includes(containingTab.dataset.tabId)) return false;

        if (this.tabStructure.activeTab !== containingTab.dataset.tabId) {
            this.tabStructure.setActiveTab(containingTab.dataset.tabId);
        }

        requestAnimationFrame(() => {
            target.scrollIntoView();
        }); // browser's native scrolling doesn't handle our tabs; ensure we have the last say

        return true;
    }

    setActiveTabViaAgent() {
        const OsFamilies = {
            Windows: '1',
            Mac: '2',
            Linux: '3',
            Android: '4',
            iOS: '5',
        }

        if (this.tabStructure.tabIds.length <= 0) return;

        const platform = (window.navigator.userAgentData ? window.navigator.userAgentData.platform : null) ||
            window.navigator.platform;
        const macPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'macOS'];
        const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

        if (this.tabStructure.tabIds.includes(OsFamilies.Windows) && windowsPlatforms.indexOf(platform) !== -1) {
            this.tabStructure.setActiveTab(OsFamilies.Windows);
        }
        else if (this.tabStructure.tabIds.includes(OsFamilies.Mac) && macPlatforms.indexOf(platform) !== -1) {
            this.tabStructure.setActiveTab(OsFamilies.Mac);
        }
        else if (this.tabStructure.tabIds.includes(OsFamilies.Android) && /android/i.test(platform)) {
            this.tabStructure.setActiveTab(OsFamilies.Android);
        }
        else if (this.tabStructure.tabIds.includes(OsFamilies.Linux) && /Linux/.test(platform)) {
            this.tabStructure.setActiveTab(OsFamilies.Linux);
        }
        else if (this.tabStructure.tabIds.includes(OsFamilies.iOS) && /iPhone|iPad|iPod/.test(platform)) {
            this.tabStructure.setActiveTab(OsFamilies.iOS);
        }
    }
}
