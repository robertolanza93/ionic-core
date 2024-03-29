import { findItemLabel, renderHiddenInput } from '../../utils/helpers';
import { hostContext } from '../../utils/theme';
export class Select {
    constructor() {
        this.childOpts = [];
        this.inputId = `ion-sel-${selectIds++}`;
        this.didInit = false;
        this.isExpanded = false;
        this.disabled = false;
        this.cancelText = 'Cancel';
        this.okText = 'OK';
        this.name = this.inputId;
        this.multiple = false;
        this.interface = 'alert';
        this.interfaceOptions = {};
        this.onFocus = () => {
            this.ionFocus.emit();
        };
        this.onBlur = () => {
            this.ionBlur.emit();
        };
    }
    disabledChanged() {
        this.emitStyle();
    }
    valueChanged() {
        if (this.didInit) {
            this.updateOptions();
            this.ionChange.emit({
                value: this.value,
            });
            this.emitStyle();
        }
    }
    async selectOptionChanged() {
        await this.loadOptions();
        if (this.didInit) {
            this.updateOptions();
        }
    }
    onClick(ev) {
        this.setFocus();
        this.open(ev);
    }
    async componentDidLoad() {
        await this.loadOptions();
        if (this.value === undefined) {
            if (this.multiple) {
                const checked = this.childOpts.filter(o => o.selected);
                this.value = checked.map(o => o.value);
            }
            else {
                const checked = this.childOpts.find(o => o.selected);
                if (checked) {
                    this.value = checked.value;
                }
            }
        }
        this.updateOptions();
        this.emitStyle();
        this.el.forceUpdate();
        this.didInit = true;
    }
    async open(ev) {
        if (this.disabled || this.isExpanded) {
            return undefined;
        }
        const overlay = this.overlay = await this.createOverlay(ev);
        this.isExpanded = true;
        overlay.onDidDismiss().then(() => {
            this.overlay = undefined;
            this.isExpanded = false;
            this.setFocus();
        });
        await overlay.present();
        return overlay;
    }
    createOverlay(ev) {
        let selectInterface = this.interface;
        if ((selectInterface === 'action-sheet' || selectInterface === 'popover') && this.multiple) {
            console.warn(`Select interface cannot be "${selectInterface}" with a multi-value select. Using the "alert" interface instead.`);
            selectInterface = 'alert';
        }
        if (selectInterface === 'popover' && !ev) {
            console.warn('Select interface cannot be a "popover" without passing an event. Using the "alert" interface instead.');
            selectInterface = 'alert';
        }
        if (selectInterface === 'popover') {
            return this.openPopover(ev);
        }
        if (selectInterface === 'action-sheet') {
            return this.openActionSheet();
        }
        return this.openAlert();
    }
    async openPopover(ev) {
        const interfaceOptions = this.interfaceOptions;
        const popoverOpts = Object.assign({ mode: this.mode }, interfaceOptions, { component: 'ion-select-popover', cssClass: ['select-popover', interfaceOptions.cssClass], event: ev, componentProps: {
                header: interfaceOptions.header,
                subHeader: interfaceOptions.subHeader,
                message: interfaceOptions.message,
                value: this.value,
                options: this.childOpts.map(o => {
                    return {
                        text: o.textContent,
                        value: o.value,
                        checked: o.selected,
                        disabled: o.disabled,
                        handler: () => {
                            this.value = o.value;
                            this.close();
                        }
                    };
                })
            } });
        return this.popoverCtrl.create(popoverOpts);
    }
    async openActionSheet() {
        const actionSheetButtons = this.childOpts.map(option => {
            return {
                role: (option.selected ? 'selected' : ''),
                text: option.textContent,
                handler: () => {
                    this.value = option.value;
                }
            };
        });
        actionSheetButtons.push({
            text: this.cancelText,
            role: 'cancel',
            handler: () => {
                this.ionCancel.emit();
            }
        });
        const interfaceOptions = this.interfaceOptions;
        const actionSheetOpts = Object.assign({ mode: this.mode }, interfaceOptions, { buttons: actionSheetButtons, cssClass: ['select-action-sheet', interfaceOptions.cssClass] });
        return this.actionSheetCtrl.create(actionSheetOpts);
    }
    async openAlert() {
        const label = this.getLabel();
        const labelText = (label) ? label.textContent : null;
        const interfaceOptions = this.interfaceOptions;
        const inputType = (this.multiple ? 'checkbox' : 'radio');
        const alertOpts = Object.assign({ mode: this.mode }, interfaceOptions, { header: interfaceOptions.header ? interfaceOptions.header : labelText, inputs: this.childOpts.map(o => {
                return {
                    type: inputType,
                    label: o.textContent,
                    value: o.value,
                    checked: o.selected,
                    disabled: o.disabled
                };
            }), buttons: [
                {
                    text: this.cancelText,
                    role: 'cancel',
                    handler: () => {
                        this.ionCancel.emit();
                    }
                },
                {
                    text: this.okText,
                    handler: (selectedValues) => {
                        this.value = selectedValues;
                    }
                }
            ], cssClass: ['select-alert', interfaceOptions.cssClass,
                (this.multiple ? 'multiple-select-alert' : 'single-select-alert')] });
        return this.alertCtrl.create(alertOpts);
    }
    close() {
        if (!this.overlay) {
            return Promise.resolve(false);
        }
        return this.overlay.dismiss();
    }
    async loadOptions() {
        this.childOpts = await Promise.all(Array.from(this.el.querySelectorAll('ion-select-option')).map(o => o.componentOnReady()));
    }
    updateOptions() {
        let canSelect = true;
        for (const selectOption of this.childOpts) {
            const selected = canSelect && isOptionSelected(this.value, selectOption.value);
            selectOption.selected = selected;
            if (selected && !this.multiple) {
                canSelect = false;
            }
        }
    }
    getLabel() {
        return findItemLabel(this.el);
    }
    hasValue() {
        return this.getText() !== '';
    }
    getText() {
        const selectedText = this.selectedText;
        if (selectedText != null && selectedText !== '') {
            return selectedText;
        }
        return generateText(this.childOpts, this.value);
    }
    setFocus() {
        if (this.buttonEl) {
            this.buttonEl.focus();
        }
    }
    emitStyle() {
        this.ionStyle.emit({
            'interactive': true,
            'select': true,
            'has-placeholder': this.placeholder != null,
            'has-value': this.hasValue(),
            'interactive-disabled': this.disabled,
            'select-disabled': this.disabled
        });
    }
    hostData() {
        const labelId = this.inputId + '-lbl';
        const label = findItemLabel(this.el);
        if (label) {
            label.id = labelId;
        }
        return {
            'role': 'combobox',
            'aria-disabled': this.disabled ? 'true' : null,
            'aria-expanded': `${this.isExpanded}`,
            'aria-haspopup': 'dialog',
            'aria-labelledby': labelId,
            class: {
                'in-item': hostContext('ion-item', this.el),
                'select-disabled': this.disabled,
            }
        };
    }
    render() {
        renderHiddenInput(true, this.el, this.name, parseValue(this.value), this.disabled);
        const labelId = this.inputId + '-lbl';
        const label = findItemLabel(this.el);
        if (label) {
            label.id = labelId;
        }
        let addPlaceholderClass = false;
        let selectText = this.getText();
        if (selectText === '' && this.placeholder != null) {
            selectText = this.placeholder;
            addPlaceholderClass = true;
        }
        const selectTextClasses = {
            'select-text': true,
            'select-placeholder': addPlaceholderClass
        };
        return [
            h("div", { class: selectTextClasses }, selectText),
            h("div", { class: "select-icon", role: "presentation" },
                h("div", { class: "select-icon-inner" })),
            h("button", { type: "button", onFocus: this.onFocus, onBlur: this.onBlur, disabled: this.disabled, ref: (el => this.buttonEl = el) })
        ];
    }
    static get is() { return "ion-select"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "actionSheetCtrl": {
            "connect": "ion-action-sheet-controller"
        },
        "alertCtrl": {
            "connect": "ion-alert-controller"
        },
        "cancelText": {
            "type": String,
            "attr": "cancel-text"
        },
        "disabled": {
            "type": Boolean,
            "attr": "disabled",
            "watchCallbacks": ["disabledChanged"]
        },
        "el": {
            "elementRef": true
        },
        "interface": {
            "type": String,
            "attr": "interface"
        },
        "interfaceOptions": {
            "type": "Any",
            "attr": "interface-options"
        },
        "isExpanded": {
            "state": true
        },
        "mode": {
            "type": String,
            "attr": "mode"
        },
        "multiple": {
            "type": Boolean,
            "attr": "multiple"
        },
        "name": {
            "type": String,
            "attr": "name"
        },
        "okText": {
            "type": String,
            "attr": "ok-text"
        },
        "open": {
            "method": true
        },
        "placeholder": {
            "type": String,
            "attr": "placeholder"
        },
        "popoverCtrl": {
            "connect": "ion-popover-controller"
        },
        "selectedText": {
            "type": String,
            "attr": "selected-text"
        },
        "value": {
            "type": "Any",
            "attr": "value",
            "mutable": true,
            "watchCallbacks": ["valueChanged"]
        }
    }; }
    static get events() { return [{
            "name": "ionChange",
            "method": "ionChange",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "ionCancel",
            "method": "ionCancel",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "ionFocus",
            "method": "ionFocus",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "ionBlur",
            "method": "ionBlur",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "ionStyle",
            "method": "ionStyle",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }]; }
    static get listeners() { return [{
            "name": "ionSelectOptionDidLoad",
            "method": "selectOptionChanged"
        }, {
            "name": "ionSelectOptionDidUnload",
            "method": "selectOptionChanged"
        }, {
            "name": "click",
            "method": "onClick"
        }]; }
    static get style() { return "/**style-placeholder:ion-select:**/"; }
    static get styleMode() { return "/**style-id-placeholder:ion-select:**/"; }
}
function parseValue(value) {
    if (value == null) {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value.join(',');
    }
    return value.toString();
}
function isOptionSelected(currentValue, optionValue) {
    if (currentValue === undefined) {
        return false;
    }
    if (Array.isArray(currentValue)) {
        return currentValue.includes(optionValue);
    }
    else {
        return currentValue === optionValue;
    }
}
function generateText(opts, value) {
    if (value === undefined) {
        return '';
    }
    if (Array.isArray(value)) {
        return value
            .map(v => textForValue(opts, v))
            .filter(opt => opt !== null)
            .join(', ');
    }
    else {
        return textForValue(opts, value) || '';
    }
}
function textForValue(opts, value) {
    const selectOpt = opts.find(opt => opt.value === value);
    return selectOpt
        ? selectOpt.textContent
        : null;
}
let selectIds = 0;
