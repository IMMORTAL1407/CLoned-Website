/**
 * Scripting for MEGA's custom components for WordPress blocks.
 */

class MegaComponent extends wp.element.Component {
    props;
    state = { };

    _tandle = null;

    constructor(props) {
        super(...arguments);

        this.props = props;

        this.state.isSelected = false;

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    onFocus(e) {
        if (this._tandle) {
            clearTimeout(this._tandle);
            this._tandle = null;
        }

        e.currentTarget.style.border = '2px solid var(--wp-admin-theme-color)';
        this.setState({ isSelected: true });
    }

    onBlur(e) {
        if (this._tandle) {
            clearTimeout(this._tandle);
            this._tandle = null;
        }

        e.currentTarget.style.removeProperty('border');

        // Delay the state update to give time for the inspector options to gain focus and cancel deselection,
        // otherwise inspector options will disappear and so never gain focus.
        this._tandle = setTimeout(() => {
            this.setState({ isSelected: false });
        }, 100);
    }

    render() {
        const preview = this._renderPreview();
        const inspector = this.state.isSelected ? this._renderInspector() : '';

        return wp.element.createElement('div', {
            tabIndex: 0,
            onFocus: this.onFocus,
            onBlur: this.onBlur,
            ...this._getWrapperAttributes(),
        }, preview, inspector);
    }

    _renderInspector() { }

    _renderPreview() { }

    _getWrapperAttributes() {
        return { };
    }
}

// TODO: superseded by IconEditorComponent, remove once usages updated.
class IconStyleComponent extends MegaComponent {
    static iconClassOptions = [
        { label: 'None', value: '' },
        { label: 'Airplay MTO', value: 'airplay-mto' },
        { label: 'Alert Triangle SRO', value: 'alert-triangle' },
        { label: 'Arrow Left MRO', value: 'arrow-left' },
        { label: 'Arrow Right MRO', value: 'arrow-right' },
        { label: 'Bell Ringing MTO', value: 'bell-ringing-mto' },
        { label: 'Calendar 01 MRO', value: 'calendar' },
        { label: 'Cast MTO', value: 'cast-mto' },
        { label: 'Check MRO', value: 'check' },
        { label: 'Check Circle MRO', value: 'check-circle' },
        { label: 'Check Circle MTO', value: 'check-circle-mto' },
        { label: 'Chevrons Left SRO', value: 'chevron-2left' },
        { label: 'Chevrons Right SRO', value: 'chevron-2right' },
        { label: 'Chevron Down MRO', value: 'chevron-down' },
        { label: 'Chevron Left SRO', value: 'chevron-left' },
        { label: 'Chevron Right SRO', value: 'chevron-right' },
        { label: 'Chevron Up MRO', value: 'chevron-up' },
        { label: 'Clock Rotate MTO', value: 'clock-rotate-mto' },
        { label: 'Cloud MRO', value: 'cloud' },
        { label: 'Cloud Download MTO', value: 'cloud-download-mto' },
        { label: 'Cloud MTO', value: 'cloud-mto' },
        { label: 'Cloud Upload MRO', value: 'cloud-upload-mro' },
        { label: 'Cloud Upload MTO', value: 'cloud-upload-mto' },
        { label: 'Cloud White', value: 'cloud-white' },
        { label: 'Code', value: 'code' },
        { label: 'Copy MRO', value: 'copy' },
        { label: 'Database MRO', value: 'database' },
        { label: 'Database MTO', value: 'database-mto' },
        { label: 'Edit 3 MTO', value: 'edit-3-mto' },
        { label: 'Emoji Happy MTO', value: 'emoji-happy-mto' },
        { label: 'Emoji Smile MTO', value: 'emoji-smile-mto' },
        { label: 'Emoji Wink MTO', value: 'emoji-wink-mto' },
        { label: 'File Attachment 02 MRO', value: 'file-attachment-02-mro' },
        { label: 'File Text MRO', value: 'file-text-mro' },
        { label: 'File Text MTO', value: 'file-text-mto' },
        { label: 'File Upload MTO', value: 'file-upload-mto' },
        { label: 'Filter MRO', value: 'file-filter' },
        { label: 'Folder Arrow 01 MTO', value: 'folder-arrow-01-mto' },
        { label: 'Folder Lock MRO', value: 'folder-lock-mro' },
        { label: 'Folder MRO', value: 'folder-mro' },
        { label: 'Folder Sync MTO', value: 'folder-sync-mto' },
        { label: 'Globe 01 MRO', value: 'globe' },
        { label: 'Globe 02 MTO', value: 'globe-02-mto' },
        { label: 'Globe Eurafrica MTO', value: 'globe-eurafrica-mto' },
        { label: 'Hard Drive MRO', value: 'hard-drive' },
        { label: 'Headset MTO', value: 'headset-mto' },
        { label: 'Heart MTO', value: 'heart-mto' },
        { label: 'Help circle MRO', value: 'help-circle' },
        { label: 'Image 01 MTO', value: 'image-01-mto' },
        { label: 'Info MRO', value: 'info' },
        { label: 'Key 01 MRO', value: 'key-01-mro' },
        { label: 'Key 01 MTO', value: 'key-01-mto' },
        { label: 'Link 01 MRO', value: 'link-01-mro' },
        { label: 'Lock MTO', value: 'lock-mto' },
        { label: 'Mail', value: 'mail' },
        { label: 'Mail MTO', value: 'mail-mto' },
        { label: 'Map Pin', value: 'map-pin' },
        { label: 'Map Pin MTO', value: 'map-pin-mto' },
        { label: 'Mega MTO', value: 'mega-mto' },
        { label: 'Menu MRO', value: 'menu' },
        { label: 'Message Check MTO', value: 'message-check-mto' },
        { label: 'Message Circle MTO', value: 'message-circle-mto' },
        { label: 'Message Square MRO', value: 'message-square' },
        { label: 'Minus MRO', value: 'minus' },
        { label: 'Minus Circle MRO', value: 'minus-circle-mro' },
        { label: 'Monitor MRO', value: 'monitor-mro' },
        { label: 'Monitor MTO', value: 'monitor-mto' },
        { label: 'Moon MRO', value: 'moon' },
        { label: 'More Horizontal MRO', value: 'more-horizontal-mro' },
        { label: 'Play Square MTO', value: 'play-square-mto' },
        { label: 'Plus MRO', value: 'plus' },
        { label: 'Plus Circle MRO', value: 'plus-circle' },
        { label: 'Printer MRO', value: 'printer-mro'},
        { label: 'Printer MTO', value: 'printer-mto'},
        { label: 'Rocket MTO', value: 'rocket-mto' },
        { label: 'RSS', value: 'rss' },
        { label: 'Search SRO', value: 'search' },
        { label: 'Server MTO', value: 'server-mto' },
        { label: 'Share MRO', value: 'share' },
        { label: 'Share MTO', value: 'share-mto' },
        { label: 'Shield MRO', value: 'shield' },
        { label: 'Shield MTO', value: 'shield-mto' },
        { label: 'Sliders Horizontal 01 MRO', value: 'sliders-horizontal-01-mro' },
        { label: 'Sliders Vertical 01 MTO', value: 'sliders-vertical-01-mto' },
        { label: 'Social Facebook M', value: 'social-facebook' },
        { label: 'Social Instagram M', value: 'social-instagram' },
        { label: 'Social LinkedIn M', value: 'social-linkedin' },
        { label: 'Social X M', value: 'social-X' },
        { label: 'Social Youtube M', value: 'social-youtube' },
        { label: 'Social Threads M', value: 'social-threads'},
        { label: 'Star MTO', value: 'star-mto' },
        { label: 'Sun', value: 'sun' },
        { label: 'Sync MRO', value: 'sync' },
        { label: 'Sync MTO', value: 'sync-mto' },
        { label: 'User Circle MTO', value: 'user-circle-mto' },
        { label: 'User Plus MTO', value: 'user-plus-mto' },
        { label: 'Users MRO', value: 'users-mro' },
        { label: 'Users MTO', value: 'users-mto' },
        { label: 'Video MRO', value: 'video-mro' },
        { label: 'Video MTO', value: 'video-mto' },
        { label: 'X STO', value: 'x' },
        { label: 'X MRO', value: 'x-mro' },
        { label: 'Zap MRO', value: 'zap-mro' },
        { label: 'Zap MTO', value: 'zap-mto' },
        { label: 'Zap Off MRO', value: 'zap-off-mro' },
        { label: 'Zap Off MTO', value: 'zap-off-mto' },
        /* Duotone icons */
        { label: 'Android 01 Duotone', value: 'android' },
        { label: 'Brain Duotone', value: 'brain' },
        { label: 'Bug Duotone', value: 'bug' },
        { label: 'C++ Duotone', value: 'c-plus-plus' },
        { label: 'CMD Duotone', value: 'CMD' },
        { label: 'Copyright Duotone', value: 'copyright' },
        { label: 'Extension Duotone', value: 'extension' },
        { label: 'Hand Duotone', value: 'hand' },
        { label: 'iOS Duotone', value: 'iOS' },
        { label: 'Lifebuoy Duotone', value: 'lifebuoy' },
        { label: 'Lightbulb Duotone', value: 'lightbulb' },
        { label: 'Media Duotone', value: 'media' },
        { label: 'Sync Duotone', value: 'mega-sync' },
        { label: 'Privacy Duotone', value: 'privacy' },
        { label: 'SDK Duotone', value: 'SDK' },
        { label: 'Scale Duotone', value: 'scale' },
        { label: 'Shield Duotone', value: 'shield-duotone' },
        { label: 'Thunderbird Duotone', value: 'thunderbird' },
        { label: 'TM Duotone', value: 'tm' },
        { label: 'Web Duotone', value: 'web' },
    ];

    get availableIcons() {
        return this.props.styles || IconStyleComponent.iconClassOptions;
    }

    _renderInspector() {
        const iconStyleControl = wp.element.createElement(wp.components.SelectControl, {
            label: 'Icon Styles',
            value: this.props.value,
            options: this.availableIcons,
            onChange: this.props.onChange,
        });

        // Dropdown menu in the inspector
        const iconInspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Icon Settings',
            initialOpen: true,
        }, iconStyleControl);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { },
                this.availableIcons.length > 1 ? iconInspectorPanel : '');
    }

    _renderPreview() {
        const iconElement = wp.element.createElement('div', {
            className: `icon ${this.props.value}`,
            tabIndex: '0', // Enable focus / blur
        });

        return wp.element.createElement('div', {
            className: 'icon-box',
        }, iconElement);
    }
}

class IconEditorComponent extends MegaComponent {
    static iconColourOptions = [
        { label: 'default', value: 'color-brand-black' },
        { label: 'Primary red 500', value: 'color-primary-red-500' },
    ];

    static defaultAttributesSchema = {
        type: 'object',
        default: {
            style: '',
            colour: '',
        },
    };

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
    }

    get availableIcons() {
        return this.props.styles || IconStyleComponent.iconClassOptions;
    }

    get availableColours() {
        return this.props.colours || IconEditorComponent.iconColourOptions;
    }

    onChange(key, value) {
        const newIcon = Object.assign({}, this.props.value);
        newIcon[key] = value;
        this.props.onChange(newIcon);
    }

    _renderInspector() {
        const iconColourControl = wp.element.createElement(wp.components.SelectControl, {
            label: 'Colour',
            value: this.props.value.colour,
            options: this.availableColours,
            onChange: (colour) => this.onChange('colour', colour),
        });

        const iconStyleControl = wp.element.createElement(wp.components.SelectControl, {
            label: 'Styles',
            value: this.props.value.style,
            options: this.availableIcons,
            onChange: (style) => this.onChange('style', style),
        });

        // Dropdown menu in the inspector
        const iconInspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Icon Settings',
            initialOpen: true,
        },
            this.availableIcons.length > 1 ? iconStyleControl : '',
            this.availableColours.length > 1 ? iconColourControl : '');

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, iconInspectorPanel);
    }

    _renderPreview() {
        const iconProps = {
            className: `icon ${this.props.style || this.props.value.style}`,
            tabIndex: '0', // Enable focus / blur
        };

        const colour = this.props.colour || this.props.value.colour;
        if (colour) {
            iconProps.style = { backgroundColor: `var(--${colour})` };
        }

        const iconElement = wp.element.createElement('div', iconProps);

        return wp.element.createElement('div', {
            className: 'icon-box',
        }, iconElement);
    }
}

class ButtonEditorComponent extends MegaComponent {
    static buttonStyles = [
        { label: 'Please select', value: '' },
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Text', value: 'text' },
        { label: 'Primary (muted)', value: 'primary-muted' },
        { label: 'Secondary (muted)', value: 'secondary-muted' },
        { label: 'Outline (muted)', value: 'outline-muted' },
        { label: 'Text (muted)', value: 'text-muted' },
    ];

    static defaultAttributesSchema = {
        type: 'object',
        default: {
            label: '',
            href: '',
            newTab: false,
            beforeIcon: '',
            afterIcon: '',
            style: '',
        },
    };

    static helpStyle = {
        paddingBottom: '20px',
        fontSize: '12px',
        color: 'rgb(117, 117, 117)',
    }

    get availableStyles() {
        return this.props.styles || ButtonEditorComponent.buttonStyles;
    }

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
    }

    onChange(key, value) {
        const newButton = Object.assign({ }, this.props.value);
        newButton[key] = value;
        this.props.onChange(newButton);
    }

    _renderInspector() {
        const helpLabel = wp.element.createElement('label', {
            style: ButtonEditorComponent.helpStyle,
        }, 'This button is controlled by scripting.');

        const hrefControl = wp.element.createElement(wp.components.TextControl, {
            label: 'Link To',
            value: this.props.value.href,
            onChange: (href) => this.onChange('href', href),
        });

        const newTabControl = wp.element.createElement(wp.components.CheckboxControl, {
            label: 'Open in New Tab',
            checked: this.props.value.newTab,
            onChange: (newTab) => this.onChange('newTab', newTab),
        });

        const styleSelectControl = wp.element.createElement(wp.components.SelectControl, {
            label: 'Style',
            value: this.props.value.style,
            options: this.availableStyles,
            onChange: (style) => this.onChange('style', style),
        });

        const controls = [];
        const showHrefOption = this.props.showHrefOption !== undefined ? this.props.showHrefOption : this.props.type !== 'script';
        const showNewTabOption = this.props.showNewTabOption !== undefined ? this.props.showNewTabOption : this.props.type !== 'script';

        if (this.props.type === 'script') {
            controls.push(helpLabel);
        }

        if (showHrefOption) {
            controls.push(hrefControl);
        }
        if (showNewTabOption) {
            controls.push(newTabControl);
        }

        if (this.availableStyles.length >= 2) {
            controls.push(styleSelectControl);
        }

        const buttonInspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Button Settings',
            initialOpen: true,
        }, ...controls);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, buttonInspectorPanel);
    }

    _renderPreview() {
        const label = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'span',
            placeholder: this.props.labelPlaceholder || 'Button Label',
            value: this.props.label || this.props.value.label,
            allowedFormats: [],
            onChange: (label) => this.onChange('label', label),
        });

        const beforeIcon = wp.element.createElement(IconStyleComponent, {
            colours: [], // Editor shouldn't choose any icon colours for icons in buttons
            value: this.props.beforeIcon || this.props.value.beforeIcon,
            onChange: (beforeIcon) => this.onChange('beforeIcon', beforeIcon),
        });
        const afterIcon = wp.element.createElement(IconStyleComponent, {
            colours: [],
            value: this.props.afterIcon || this.props.value.afterIcon,
            onChange: (afterIcon) => this.onChange('afterIcon', afterIcon),
        });

        const fallbackStyle = this.availableStyles[0]?.value;
        const classes = ['button lg', this.props.style || this.props.value.style || fallbackStyle, this.props.className || ''];
        return wp.element.createElement('div', {
            className: classes.join(' '),
            style: { // Minimal CSS changes to look OK in the editor
                display: 'flex',
                width: 'fit-content',
            },
        }, beforeIcon, label, afterIcon);
    }
}

class ImagePickerComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            id: -1,
            url: '',
            altText: '',
        },
    };

    constructor(props) {
        super(...arguments);
        this.props = props;

        this.onChange.bind(this);
        this.onImageChange = this.onImageChange.bind(this);
    }

    get image() { return this.props.image }

    onChange(key, value) {
        const newImage = Object.assign({ }, this.props.value);
        newImage[key] = value;
        this.props.onChange(newImage);
    }

    onImageChange(image) {
        this.props.onChange({
            id: image.id,
            url: image.url,
            altText: image.altText,
        });
    }

    onImageClear = () => {
        this.props.onChange({
            id: -1,
            url: '',
            altText: '',
        });
    }

        _renderInspector() {
            const AltControl = wp.element.createElement(wp.components.TextControl, {
                label: 'Alt text',
                value: this.props.value.altText,
                onChange:  (altText) => this.onChange('altText', altText),
            });
            const imageInspectorPanel = wp.element.createElement(wp.components.PanelBody, {
                title: 'Image Settings',
                initialOpen: true,
            }, this.props.type === 'script' ? '' : AltControl);

            return wp.element.createElement(wp.blockEditor.InspectorControls, { }, imageInspectorPanel);
        }

        _renderPreview() {

        const imagePlaceholder = wp.element.createElement(wp.blockEditor.MediaPlaceholder, {
            icon: 'format-image',
            accept: 'image/*',
            allowedTypes: ['image'],
            value: this.props.value.id,
            onSelect: this.onImageChange,
            onSelectURL: (url) => this.onChange('url', url),
            style: this.props.style,
        });

        const imageEdit = wp.element.createElement(wp.blockEditor.MediaUpload, {
            accept: 'image/*',
            allowedTypes: ['image'],
            value: this.props.value.id,
            onSelect: this.onImageChange,
            render: (obj) => {
                return wp.element.createElement(wp.components.Button, {
                    icon: 'edit',
                    onClick: obj.open,
                });
            },
        });

        const imageClear = wp.element.createElement(wp.components.Button, {
            icon: 'trash',
            onClick: this.onImageClear,
        });

        const imageView = wp.element.createElement('div', {
            className: 'img',
            style: {
                backgroundImage: `url('${this.props.value.url}')`,
                ...this.props.innerStyle || { },
            },
        });

        const imageButtons = wp.element.createElement('div', {
            className: 'img-buttons',
            style: {
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1,
                backgroundColor: '#aaad',
                borderBottomLeftRadius: '10px',
            },
        }, imageEdit, imageClear);

        const imageBox = wp.element.createElement('div', {
            className: 'img-box',
            style: Object.assign({
                position: 'relative',
                border: '1px solid #e2e3e3',
            }, this.props.style),
        }, imageView, imageButtons);

        // Render image if it exists, else an image placeholder.
        return this.props.value.url ? imageBox : imagePlaceholder;
    }
}

class VideoPickerComponent extends wp.element.Component {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            id: -1,
            url: '',
        },
    };

    constructor(props) {
        super(...arguments);
        this.props = props;

        this.onVideoChange = this.onVideoChange.bind(this);
    }

    get video() { return this.props.video }

    onVideoChange(video) {
        this.props.onChange({
            id: video.id,
            url: video.url,
        });
    }

    onVideoClear = () => {
        this.props.onChange({
            id: -1,
            url: '',
        });
    }

    render() {
        const videoPlaceholder = wp.element.createElement(wp.blockEditor.MediaPlaceholder, {
            icon: 'format-video',
            accept: 'video/*',
            allowedTypes: ['video'],
            value: this.props.value.id,
            onSelect: this.onVideoChange,
            style: this.props.style,
        });

        const videoEdit = wp.element.createElement(wp.blockEditor.MediaUpload, {
            accept: 'video/*',
            allowedTypes: ['video'],
            value: this.props.value.id,
            onSelect: this.onVideoChange,
            render: (obj) => {
                return wp.element.createElement(wp.components.Button, {
                    icon: 'edit',
                    onClick: obj.open,
                });
            },
        });

        const videoClear = wp.element.createElement(wp.components.Button, {
            icon: 'trash',
            onClick: this.onVideoClear,
        });

        const videoView = wp.element.createElement('video', {
            className: 'video',
            controls: true,
            src: this.props.value.url,
        });

        const videoButtons = wp.element.createElement('div', {
            className: 'video-buttons',
            style: {
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1,
                backgroundColor: '#aaad',
                borderBottomLeftRadius: '10px',
            },
        }, videoEdit, videoClear);

        const videoBox = wp.element.createElement('figure', {
            className: 'video-box',
            style: Object.assign({
                position: 'relative',
                border: '1px solid #e2e3e3',
            }, this.props.style),
        }, videoView, videoButtons);

        // Render video if it exists, else a video placeholder.
        return this.props.value.url ? videoBox : videoPlaceholder;
    }
}

class ThemedVideoPickerComponent extends wp.element.Component {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            light: VideoPickerComponent.defaultAttributesSchema.default,
            dark: VideoPickerComponent.defaultAttributesSchema.default,
            safariLight: VideoPickerComponent.defaultAttributesSchema.default,
            safariDark: VideoPickerComponent.defaultAttributesSchema.default,
        },
    };

    constructor(props) {
        super(...arguments);
        this.props = props;

        this.onChange = this.onChange.bind(this);
    }

    onChange(key, value) {
        const newThing = Object.assign({ }, this.props.value);
        newThing[key] = value;
        this.props.onChange(newThing);
    }

    render() {
        const lightLabel = wp.element.createElement(wp.components.BaseControl, {
            help: 'Light mode:',
        });
        const lightVideo = wp.element.createElement(VideoPickerComponent, {
            value: this.props.value.light,
            onChange: (light) => this.onChange('light', light),
        });

        const darkLabel = wp.element.createElement(wp.components.BaseControl, {
            help: 'Dark mode:',
        });
        const darkVideo = wp.element.createElement(VideoPickerComponent, {
            value: this.props.value.dark,
            onChange: (dark) => this.onChange('dark', dark),
        });
        const safariLightVideoLabel = wp.element.createElement(wp.components.BaseControl, {
            help: 'Light mode image for Safari browser',
        });
        const safariLightVideo = wp.element.createElement(VideoPickerComponent, {
            value: this.props.value.safariLight,
            onChange: (safariLight) => this.onChange('safariLight', safariLight),
        });
        const safariDarkVideoLabel = wp.element.createElement(wp.components.BaseControl, {
            help: 'Dark mode image for Safari browser',
        });
        const safariDarkVideo = wp.element.createElement(VideoPickerComponent, {
            value: this.props.value.safariDark,
            onChange: (safariDark) => this.onChange('safariDark', safariDark),
        });

        return wp.element.createElement('div', this.props, lightLabel, lightVideo, darkLabel, darkVideo,
            safariLightVideoLabel, safariLightVideo, safariDarkVideoLabel, safariDarkVideo);
    }
}

class InspectorKvp extends wp.element.Component {
    static kvpStyle = {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #efefef',
        marginBottom: '8px',
        padding: '4px',
    };

    static labelInputWrapperStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
    };

    static labelStyle = {
        flexShrink: 0,
        fontSize: '13px',
    };

    render() {
        const keyLabel = wp.element.createElement('label', {
            style: InspectorKvp.labelStyle,
        }, this.props.keyLabel || 'Key');

        const keyControl = wp.element.createElement(wp.components.TextControl, {
            value: this.props.value.key,
            onChange: (key) => this.props.onChange({ ...this.props.value, key }),
        });

        const keyInputGroup = wp.element.createElement('div', {
            style: InspectorKvp.labelInputWrapperStyle,
        }, keyLabel, keyControl);

        const nonUniqueErrorMsg = wp.element.createElement('p', {
            className: 'error',
            style: {
                marginBottom: '8px',
                textAlign: 'right',
                color: 'red',
            },
        }, 'Key must be unique');

        const keyInputField = wp.element.createElement(wp.element.Fragment, null,
                keyInputGroup, this.props.showNonUniqueError ? nonUniqueErrorMsg : '');

        const valueLabel = wp.element.createElement('label', {
            style: InspectorKvp.labelStyle,
        }, this.props.valueLabel || 'Value');

        const valueControl = wp.element.createElement(wp.components.TextControl, {
            value: this.props.value.value,
            onChange: (value) => this.props.onChange({ ...this.props.value, value }),
        });

        const valueInputGroup = wp.element.createElement('div', {
            style: InspectorKvp.labelInputWrapperStyle,
        }, valueLabel, valueControl);

        const removeControl = wp.element.createElement(wp.components.Button, {
            isDestructive: true,
            onClick: () => this.props.onRemove(),
            style: {
                width: 'fit-content',
                alignSelf: 'end',
            }
        }, 'Remove');

        return wp.element.createElement('div', {
            style: InspectorKvp.kvpStyle,
        }, keyInputField, valueInputGroup, removeControl);
    }
}

class InspectorKvpComponent extends wp.element.Component {
    static defaultAttributesSchema = { type: 'array', default: [] }

    static helpStyle = {
        fontSize: '13px',
        color: 'rgb(117, 117, 117)',
        marginBottom: '8px',
    };

    props;
    state = { };

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
        this.updateKvp = this.updateKvp.bind(this);
        this.removeKvp = this.removeKvp.bind(this);
    }

    onChange(kvps) {
        this.props.onChange(kvps);
    }

    addKvp(key, value) {
        const kvps = [...this.props.value, { key: key, value: value }];

        this.onChange(kvps);
    }

    removeKvp(i) {
        this.props.value.splice(i, 1);

        this.onChange(this.props.value);
    }

    updateKvp(i, kvp) {
        if (this.props.uniqueKeys) {
            const foundI = this.props.value.findIndex(testKvp => testKvp.key === kvp.key);
            if (foundI !== -1 && foundI !== i) {
                // Key was changed to one that already exists, when unique keys are wanted
                this.setState({...this.state, nonUniqueKey: i });
                return;
            }
            else {
                this.setState({ ...this.state, nonUniqueKey: _ });
            }
        }

        this.props.value[i] = kvp;

        this.onChange(this.props.value);
    }

    render() {
        const helpControl = wp.element.createElement('p', {
            style: InspectorKvpComponent.helpStyle,
        }, this.props.help || '');

        const kvpControls = [];
        for (let i = 0; i < this.props.value.length; i++) {
            const kvp = this.props.value[i];
            const kvpControl = wp.element.createElement(InspectorKvp, {
                value: kvp,
                keyLabel: this.props.keyLabel,
                valueLabel: this.props.valueLabel,
                onChange: (kvp) => this.updateKvp(i, kvp),
                onRemove: () => this.removeKvp(i),
                showNonUniqueError: this.props.uniqueKeys && i === this.state.nonUniqueKey,
            });

            kvpControls.push(kvpControl);
        }

        const kvpsFragment = wp.element.createElement(wp.components.PanelBody, {
            title: this.props.title || 'Key-value pairs',
            initialOpen: false,
        }, this.props.help ? helpControl : '', ...kvpControls, this._renderAddKvpControl());

        return kvpsFragment;
    }

    _renderAddKvpControl() {
        const newKey = this.state.newKey;
        const newValue = this.state.newValue;

        const newKvpHelpLabel = wp.element.createElement('span', {
            style: InspectorKvpComponent.helpStyle,
        }, this.props.newKvpHelp || 'Add a new key-value pair.');

        const newKeyLabel = wp.element.createElement('label', {
            style: InspectorKvp.labelStyle,
        }, this.props.keyLabel || 'Key');

        const newKeyControl = wp.element.createElement(wp.components.TextControl, {
            value: newKey,
            onChange: (newKey) => this.setState({ newKey }),
        });

        const newKeyInputGroup = wp.element.createElement('div', {
            style: InspectorKvp.labelInputWrapperStyle,
        }, newKeyLabel, newKeyControl);

        const newValueLabel = wp.element.createElement('label', {
            style: InspectorKvp.labelStyle,
        }, this.props.valueLabel || 'Value');

        const newValueControl = wp.element.createElement(wp.components.TextControl, {
            value: newValue,
            onChange: (newValue) => this.setState({ newValue }),
        });

        const newValueInputGroup = wp.element.createElement('div', {
            style: InspectorKvp.labelInputWrapperStyle,
        }, newValueLabel, newValueControl);

        const newKvpAddControl = wp.element.createElement(wp.components.Button, {
            isSecondary: true,
            onClick: () => {
                this.addKvp(newKey, newValue);
                this.setState({
                    newKey: '',
                    newValue: '',
                });
            },
            style: {
                width: 'fit-content',
                alignSelf: 'end',
            },
            disabled: !newKey || !newValue || (this.props.uniqueKeys && this.props.value.find(kvp => kvp.key === newKey)),
        }, 'Add');

        return wp.element.createElement('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                marginTop: '16px',
                paddingTop: '8px',
                borderTop: '1px solid #ddd',
            },
        }, newKvpHelpLabel, newKeyInputGroup, newValueInputGroup, newKvpAddControl);
    }
}

class FormTextComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            label: '',
            placeholder: '',
            isOptional: false,
            errors: { },
        },
    };

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
        this.props.onChange({ ...this.props.value, ...value });
    }

    _renderInspector() {
        const isOptionalControl = wp.element.createElement(wp.components.CheckboxControl, {
            label: 'Is optional',
            help: 'Select whether filling the field is optional.',
            checked: this.props.value.isOptional || false,
            onChange: (isOptional) => this.onChange({ isOptional }),
        });

        let errors = {
            tooShort: {
                label: 'Too short error message',
                help: 'Provide an error message to display when the user\'s input is too short.',
            },
        };

        if (this.props.type === 'email') {
            errors.invalidEmail = {
                label: 'Invalid email error message',
                help: 'Provide an error message to display when the user\'s provided email address is invalid.',
            }
        }

        errors = { ...errors, ...this.props.extraErrors || { } };

        const errorControls = [];
        for (const [key, details] of Object.entries(errors)) {
            errorControls.push(wp.element.createElement(wp.components.TextControl, {
                label: details.label || '',
                help: details.help || '',
                value: this.props.value.errors[key] || '',
                onChange: (errorMsg) => this.onChange({ errors: { ...this.props.value.errors, [key]: errorMsg } }),
            }));
        }

        const inspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Text Input Form Field Settings',
            initialOpen: true,
        }, isOptionalControl, ...errorControls);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, inspectorPanel);
    }

    _renderPreview() {
        const fieldLabelControl = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'label',
            placeholder: 'Text input form field label',
            allowedFormats: [],
            value: this.props.label || this.props.value.label,
            onChange: (label) => this.onChange({ label }),
        });

        const textInputControl = wp.element.createElement(wp.components.TextControl, {
            className: 'm-text lg',
            placeholder: 'Placeholder text',
            value: this.props.placeholder || this.props.value.placeholder,
            onChange: (placeholder) => this.onChange({ placeholder }),
        });

        return wp.element.createElement('div', { className: 'field' }, fieldLabelControl, textInputControl);
    }
}

class FormTextareaComponent extends FormTextComponent {
    _renderPreview() {
        const fieldLabelControl = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'label',
            placeholder: 'Text input form field label',
            allowedFormats: [],
            value: this.props.label || this.props.value.label,
            onChange: (label) => this.onChange({ label }),
        });

        const textareaControl = wp.element.createElement(wp.components.TextareaControl, {
            className: 'm-textarea lg',
            placeholder: 'Placeholder text',
            value: this.props.placeholder || this.props.value.placeholder,
            onChange: (placeholder) => this.onChange({ placeholder }),
        });

        return wp.element.createElement('div', { className: 'field' }, fieldLabelControl, textareaControl);
    }
}

class FormDropdownComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            label: '',
            options: [],
            errors: { },
        },
    };

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
        this.props.onChange({ ...this.props.value, ...value });
    }

    _renderInspector() {
        const optionsControl = wp.element.createElement(InspectorKvpComponent, {
            title: 'Dropdown Options',
            keyLabel: 'Option Value',
            valueLabel: 'Option Label',
            newKvpHelp: 'Add a dropdown option.',
            value: this.props.value.options.map(option => ({ key: option.value, value: option.label })),
            onChange: (kvps) => this.onChange({ options: kvps.map(kvp => ({ value: kvp.key, label: kvp.value })) }),
        });

        const errorMsgControl = wp.element.createElement(wp.components.TextControl, {
            label: 'No value error message',
            help: 'Provide an error message to display when the user hasn\'t selected an option.',
            value: this.props.value.errors.noValue || '',
            onChange: (errorMsg) => this.onChange({ errors: { ...this.props.value.errors, noValue: errorMsg } }),
        });

        const inspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Dropdown Form Field Settings',
            initialOpen: true,
        }, optionsControl, errorMsgControl);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, inspectorPanel);
    }

    _renderPreview() {
        const fieldLabelControl = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'label',
            placeholder: 'Dropdown form field label',
            allowedFormats: [],
            value: this.props.label || this.props.value.label,
            onChange: (label) => this.onChange({ label }),
        });

        const dropdownControl = wp.element.createElement(wp.components.SelectControl, {
            className: 'dropdown lg',
            options: this.props.options || [
                { label: 'Please select' },
            ],
        });

        return wp.element.createElement('div', { className: 'field' }, fieldLabelControl, dropdownControl);
    }
}

class FormRadioComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            label: '',
            options: [],
            errors: { },
            hasCustom: false,
            customKey: '',
        },
    };

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
        this.props.onChange({ ...this.props.value, ...value });
    }

    _renderInspector() {
        const optionsControl = wp.element.createElement(InspectorKvpComponent, {
            title: 'Radio Options',
            keyLabel: 'Option Value',
            valueLabel: 'Option Label',
            help: this.props.optionsHelp || '',
            newKvpHelp: 'Add a radio option.',
            value: this.props.value.options.map(option => ({ key: option.value, value: option.label })),
            onChange: (kvps) => this.onChange({ options: kvps.map(kvp => ({ value: kvp.key, label: kvp.value })) }),
        });

        const hasCustomControl = wp.element.createElement(wp.components.CheckboxControl, {
            label: 'Has custom field',
            help: 'Enable if one of the radio options should provide a text input for a user-chosen value when selected.',
            checked: this.props.value.hasCustom,
            onChange: (hasCustom) => this.onChange({ hasCustom }),
        });

        const customKeyControl = wp.element.createElement(wp.components.TextControl, {
            label: 'Custom option identifier',
            help: 'Provide the option\'s identifying value.',
            value: this.props.value.customKey,
            onChange: (customKey) => this.onChange({ customKey }),
        });

        const customTsErrorMsgControl = wp.element.createElement(wp.components.TextControl, {
            label: 'Too short error message for custom input',
            help: 'Provide an error message to display when the user has selected a custom-type option but the input is too short.',
            value: this.props.value.errors.customTooShort || '',
            onChange: (errorMsg) => this.onChange({ errors: { ...this.props.value.errors, customTooShort: errorMsg } }),
        });

        const customControls = wp.element.createElement(wp.element.Fragment, null, customKeyControl, customTsErrorMsgControl);

        const errorMsgControl = wp.element.createElement(wp.components.TextControl, {
            label: 'No value error message',
            help: 'Provide an error message to display when the user hasn\'t selected an option.',
            value: this.props.value.errors.noValue || '',
            onChange: (errorMsg) => this.onChange({ errors: { ...this.props.value.errors, noValue: errorMsg } }),
        });

        const inspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Radio Form Field Settings',
            initialOpen: true,
        }, optionsControl, hasCustomControl, this.props.value.hasCustom ? customControls : '', errorMsgControl);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, inspectorPanel);
    }

    _renderPreview() {
        const fieldLabelControl = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'label',
            placeholder: 'Radio form field label',
            value: this.props.label || this.props.value.label,
            allowedFormats: [],
            onChange: (label) => this.onChange({ label }),
        });

        return wp.element.createElement('div', { className: 'field' }, fieldLabelControl);
    }
}

class AgreeCheckboxComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            label: '',
            errors: { },
        },
    };

    onChange(value) {
        this.props.onChange({ ...this.props.value, ...value });
    }

    _renderInspector() {
        const errorMsgControl = wp.element.createElement(wp.components.TextControl, {
            label: 'Not checked error message',
            help: 'Provide an error message to display when the user hasn\'t yet agreed.',
            value: this.props.value.errors.notChecked || '',
            onChange: (errorMsg) => this.onChange({ errors: { ...this.props.value.errors, notChecked: errorMsg } }),
        });

        const inspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Agree Checkbox Form Field Settings',
            help: 'Provide a label or description (like a T&C) for a checkbox that must be ticked in order for the form to successfully validate.',
            initialOpen: true,
        }, errorMsgControl);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, inspectorPanel);
    }

    _renderPreview() {
        const agreeControl = wp.element.createElement(wp.components.CheckboxControl);

        const agreeLabelControl = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'label',
            placeholder: 'Label or description for an agreement checkbox that must be checked to proceed.',
            value: this.props.value.label,
            onChange: (label) => this.onChange({ label }),
        });

        const disabledInput = wp.element.createElement(wp.components.Disabled, { },
            agreeControl,
        );

        const inputControl = wp.element.createElement('div', {
            className: 'checkbox-component'
        }, disabledInput, agreeLabelControl);

        return wp.element.createElement('div', { className: 'field' }, inputControl);
    }
}

class CodeInputComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            label: '',
            errors: { },
        },
    };

    onChange(value) {
        this.props.onChange({ ...this.props.value, ...value });
    }

    _renderInspector() {
        const errorMsgControl = wp.element.createElement(wp.components.TextControl, {
            label: 'Not complete error message',
            help: 'Provide an error message to display when the code input fields aren\'t completely filled.',
            value: this.props.value.errors.notComplete || '',
            onChange: (errorMsg) => this.onChange({ errors: { ...this.props.value.errors, notComplete: errorMsg } }),
        });

        const inspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Code Input Form Field Settings',
            initialOpen: true,
        }, errorMsgControl);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, inspectorPanel);
    }

    _renderPreview() {
        const fieldLabelControl = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'label',
            placeholder: 'Code input form field label',
            allowedFormats: [],
            value: this.props.label || this.props.value.label,
            onChange: (label) => this.onChange({ label }),
        });

        const codeCharInputControl = wp.element.createElement(wp.components.TextControl, {
            className: 'code-input-char',
        });

        const codeInputControl = wp.element.createElement('div', {
            className: 'code-input',
        }, ...Array(this.props.size || 4).fill(codeCharInputControl));

        return wp.element.createElement('div', { className: 'field' }, fieldLabelControl, codeInputControl);
    }
}

class ToastComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            icon: '',
            message: '',
        },
    };

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
        this.props.onChange({ ...this.props.value, ...value });
    }

    _renderPreview() {
        const iconControl = wp.element.createElement(IconStyleComponent, {
            className: 'toast-icon',
            colours: [], // Editor shouldn't choose any icon colours for icons in toast notifications
            value: this.props.icon || this.props.value.icon,
            onChange: (icon) => this.onChange({ icon }),
        });

        const messageControl = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'span',
            className: 'message',
            placeholder: this.props.messagePlaceholder || 'Toast notification message',
            value: this.props.message || this.props.value.message,
            onChange: (message) => this.onChange({ message }),
        });

        const contentElement = wp.element.createElement('div', {
            className: 'content',
        }, iconControl, messageControl);

        const closeButtonControl = wp.element.createElement(IconStyleComponent, {
            colours: [],
            styles: ['x-mro'],
            value: 'x-mro',
        });

        return wp.element.createElement('div', {
            className: 'toast',
        }, contentElement, closeButtonControl);
    }
}

class ModalComponent extends MegaComponent {
    static defaultAttributesSchema = {
        type: 'object',
        default: {
            title: '',
            imageryType: '',
            // icon: '', // TODO stub
            image: ImagePickerComponent.defaultAttributesSchema.default,
            blurb: '',
            buttonPrimary: ButtonEditorComponent.defaultAttributesSchema.default,
            buttonSecondary: ButtonEditorComponent.defaultAttributesSchema.default,
        },
    }

    constructor(props) {
        super(...arguments);

        this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
        this.props.onChange({ ...this.props.value, ...value });
    }

    _renderInspector() {
        const imageryType = wp.element.createElement(wp.components.RadioControl, {
            label: 'Imagery type',
            selected: this.props.value.imageryType,
            options: [
                { label: 'None', value: '' },
                // { label: 'Icon', value: 'icon' }, // TODO stub
                { label: 'Image', value: 'image' },
            ],
            onChange: (imageryType) => this.onChange({ imageryType }),
        });

        const inspectorPanel = wp.element.createElement(wp.components.PanelBody, {
            title: 'Message modal settings',
            initialOpen: true,
        }, imageryType);

        return wp.element.createElement(wp.blockEditor.InspectorControls, { }, inspectorPanel);
    }

    _renderPreview() {
        const image = wp.element.createElement(ImagePickerComponent, {
            value: this.props.value.image,
            onChange: (image) => this.onChange({ image }),
        });

        const title = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'h5',
            className: 'heading',
            placeholder: 'Message modal title',
            value: this.props.value.title,
            onChange: (title) => this.onChange({ title }),
        });

        const blurb = wp.element.createElement(wp.blockEditor.RichText, {
            tagName: 'p',
            className: 'blurb',
            placeholder: 'Blurb text or description for this message modal.',
            value: this.props.value.blurb,
            onChange: (blurb) => this.onChange({ blurb }),
        });

        const content = wp.element.createElement('div', { className: 'content' }, blurb);

        const primaryButton = wp.element.createElement(ButtonEditorComponent, {
            value: this.props.value.buttonPrimary,
            onChange: (buttonPrimary) => this.onChange({ buttonPrimary }),
        });

        const secondaryButton = wp.element.createElement(ButtonEditorComponent, {
            value: this.props.value.buttonSecondary,
            onChange: (buttonSecondary) => this.onChange({ buttonSecondary }),
        });

        const buttons = wp.element.createElement('div', {
            className: 'buttons'
        }, primaryButton, secondaryButton);

        return wp.element.createElement('div', {
            className: 'm-modal',
            style: {
                border: '1px solid var(--color-grey-200)',
            },
        }, title, this.props.value.imageryType === 'image' ? image : '', content, buttons);
    }
}
