import '../../stencil.core';
import { ComponentInterface, EventEmitter } from '../../stencil.core';
import { Mode, OverlaySelect, SelectChangeEventDetail, SelectInterface, StyleEventDetail } from '../../interface';
export declare class Select implements ComponentInterface {
    private childOpts;
    private inputId;
    private overlay?;
    private didInit;
    private buttonEl?;
    el: HTMLIonSelectElement;
    actionSheetCtrl: HTMLIonActionSheetControllerElement;
    alertCtrl: HTMLIonAlertControllerElement;
    popoverCtrl: HTMLIonPopoverControllerElement;
    isExpanded: boolean;
    /**
     * The mode determines which platform styles to use.
     */
    mode: Mode;
    /**
     * If `true`, the user cannot interact with the select.
     */
    disabled: boolean;
    /**
     * The text to display on the cancel button.
     */
    cancelText: string;
    /**
     * The text to display on the ok button.
     */
    okText: string;
    /**
     * The text to display when the select is empty.
     */
    placeholder?: string | null;
    /**
     * The name of the control, which is submitted with the form data.
     */
    name: string;
    /**
     * The text to display instead of the selected option's value.
     */
    selectedText?: string | null;
    /**
     * If `true`, the select can accept multiple values.
     */
    multiple: boolean;
    /**
     * The interface the select should use: `action-sheet`, `popover` or `alert`.
     */
    interface: SelectInterface;
    /**
     * Any additional options that the `alert`, `action-sheet` or `popover` interface
     * can take. See the [AlertController API docs](../../alert/AlertController/#create), the
     * [ActionSheetController API docs](../../action-sheet/ActionSheetController/#create) and the
     * [PopoverController API docs](../../popover/PopoverController/#create) for the
     * create options for each interface.
     */
    interfaceOptions: any;
    /**
     * the value of the select.
     */
    value?: any | null;
    /**
     * Emitted when the value has changed.
     */
    ionChange: EventEmitter<SelectChangeEventDetail>;
    /**
     * Emitted when the selection is cancelled.
     */
    ionCancel: EventEmitter<void>;
    /**
     * Emitted when the select has focus.
     */
    ionFocus: EventEmitter<void>;
    /**
     * Emitted when the select loses focus.
     */
    ionBlur: EventEmitter<void>;
    /**
     * Emitted when the styles change.
     * @internal
     */
    ionStyle: EventEmitter<StyleEventDetail>;
    disabledChanged(): void;
    valueChanged(): void;
    selectOptionChanged(): Promise<void>;
    onClick(ev: UIEvent): void;
    componentDidLoad(): Promise<void>;
    /**
     * Opens the select overlay, it could be an alert, action-sheet or popover,
     * based in `ion-select` settings.
     */
    open(ev?: UIEvent): Promise<OverlaySelect | undefined>;
    private createOverlay;
    private openPopover;
    private openActionSheet;
    private openAlert;
    /**
     * Close the select interface.
     */
    private close;
    private loadOptions;
    private updateOptions;
    private getLabel;
    private hasValue;
    private getText;
    private setFocus;
    private emitStyle;
    private onFocus;
    private onBlur;
    hostData(): {
        'role': string;
        'aria-disabled': string | null;
        'aria-expanded': string;
        'aria-haspopup': string;
        'aria-labelledby': string;
        class: {
            'in-item': boolean;
            'select-disabled': boolean;
        };
    };
    render(): JSX.Element[];
}
