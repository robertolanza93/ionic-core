import { createThemedClasses } from '../../utils/theme';
const SPLIT_PANE_MAIN = 'split-pane-main';
const SPLIT_PANE_SIDE = 'split-pane-side';
const QUERY = {
    'xs': '(min-width: 0px)',
    'sm': '(min-width: 576px)',
    'md': '(min-width: 768px)',
    'lg': '(min-width: 992px)',
    'xl': '(min-width: 1200px)',
    'never': ''
};
export class SplitPane {
    constructor() {
        this.visible = false;
        this.disabled = false;
        this.when = QUERY['lg'];
    }
    visibleChanged(visible) {
        const detail = { visible, isPane: this.isPane.bind(this) };
        this.ionSplitPaneVisible.emit(detail);
    }
    componentDidLoad() {
        this.styleChildren();
        this.updateState();
    }
    componentDidUnload() {
        if (this.rmL) {
            this.rmL();
            this.rmL = undefined;
        }
    }
    updateState() {
        if (this.isServer) {
            return;
        }
        if (this.rmL) {
            this.rmL();
            this.rmL = undefined;
        }
        if (this.disabled) {
            this.visible = false;
            return;
        }
        const query = this.when;
        if (typeof query === 'boolean') {
            this.visible = query;
            return;
        }
        const mediaQuery = QUERY[query] || query;
        if (mediaQuery.length === 0) {
            this.visible = false;
            return;
        }
        const callback = (q) => {
            this.visible = q.matches;
        };
        const mediaList = this.win.matchMedia(mediaQuery);
        mediaList.addListener(callback);
        this.rmL = () => mediaList.removeListener(callback);
        this.visible = mediaList.matches;
    }
    isPane(element) {
        if (!this.visible) {
            return false;
        }
        return element.parentElement === this.el
            && element.classList.contains(SPLIT_PANE_SIDE);
    }
    styleChildren() {
        if (this.isServer) {
            return;
        }
        const contentId = this.contentId;
        const children = this.el.children;
        const nu = this.el.childElementCount;
        let foundMain = false;
        for (let i = 0; i < nu; i++) {
            const child = children[i];
            const isMain = contentId !== undefined ? child.id === contentId : child.hasAttribute('main');
            if (isMain) {
                if (foundMain) {
                    console.warn('split pane can not have more than one main node');
                    return;
                }
                foundMain = true;
            }
            setPaneClass(child, isMain);
        }
        if (!foundMain) {
            console.warn('split pane could not found any main node');
        }
    }
    hostData() {
        return {
            class: Object.assign({}, createThemedClasses(this.mode, 'split-pane'), { 'split-pane-visible': this.visible })
        };
    }
    static get is() { return "ion-split-pane"; }
    static get properties() { return {
        "contentId": {
            "type": String,
            "attr": "content-id"
        },
        "disabled": {
            "type": Boolean,
            "attr": "disabled",
            "watchCallbacks": ["updateState"]
        },
        "el": {
            "elementRef": true
        },
        "isServer": {
            "context": "isServer"
        },
        "visible": {
            "state": true,
            "watchCallbacks": ["visibleChanged"]
        },
        "when": {
            "type": "Any",
            "attr": "when",
            "watchCallbacks": ["updateState"]
        },
        "win": {
            "context": "window"
        }
    }; }
    static get events() { return [{
            "name": "ionSplitPaneVisible",
            "method": "ionSplitPaneVisible",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }]; }
    static get style() { return "/**style-placeholder:ion-split-pane:**/"; }
    static get styleMode() { return "/**style-id-placeholder:ion-split-pane:**/"; }
}
function setPaneClass(el, isMain) {
    let toAdd;
    let toRemove;
    if (isMain) {
        toAdd = SPLIT_PANE_MAIN;
        toRemove = SPLIT_PANE_SIDE;
    }
    else {
        toAdd = SPLIT_PANE_SIDE;
        toRemove = SPLIT_PANE_MAIN;
    }
    const classList = el.classList;
    classList.add(toAdd);
    classList.remove(toRemove);
}
