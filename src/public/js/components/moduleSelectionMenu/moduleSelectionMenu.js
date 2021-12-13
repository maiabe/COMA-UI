import { sourceColor, outputColor, processorColor, compositColor, MODULE_MANAGER, MODULE_SELECTION_MENU } from '../../sharedVariables/index.js';
import { Publisher, Message } from '../../communication/index.js';
import { GM } from '../../main.js';
import { HTMLFactory } from '../../htmlGeneration/index.js'

export class ModuleSelectionMenu {
    publisher;
    constructor() {
        this.publisher = new Publisher();
        this.menuContainer = document.getElementById('moduleMenu');
        this.sourceSubMenuItems = [
            // { icon: 'images/icons/sql-open-file-format.png', text: 'SQL', category: 'Source' },
            { icon: 'images/icons/files.png', text: 'FITS', category: 'Source' },
            { icon: 'images/icons/csv-file-format-extension.png', text: 'CSV', category: 'Source' },
            // { icon: 'images/icons/data-random-squares.png', text: 'Random', category: 'Source' },
            // { icon: 'images/icons/json-file.png', text: 'JSON', category: 'Source' },
            // { icon: 'images/icons/axis.png', text: 'Ephemeris', category: 'Source' },
            // { icon: 'images/icons/calendar.png', text: 'MJD', category: 'Source' },
            // { icon: 'images/icons/truck.png', text: 'All', category: 'Source' },
            // { icon: 'images/icons/number.png', text: 'Number', category: 'Source' }
        ];
        this.processorSubMenuItems = [
            // { icon: 'images/icons/function.png', text: 'Function', category: 'Processor' },
            // { icon: 'images/icons/gaussian-function.png', text: 'Gaussian Filter', category: 'Processor' },
            // { icon: 'images/icons/filter.png', text: 'Laplacian Filter', category: 'Processor' },
            // { icon: 'images/icons/sum-sign.png', text: 'Sum', category: 'Processor' },
            // { icon: 'images/icons/subtraction-symbol.png', text: 'Subtract', category: 'Processor' },
        ];
        this.outputSubMenuItems = [
            // { icon: 'images/icons/scatter-graph-black.png', text: 'Scatter Plot', category: 'Output' },
            // { icon: 'images/icons/bar-chart.png', text: 'Bar Chart', category: 'Output' },
            { icon: 'images/icons/line-chart.png', text: 'Line Chart', category: 'Output' },
            { icon: 'images/icons/csv-file-format-extension.png', text: 'To Csv', category: 'Output'}
            // { icon: 'images/icons/table.png', text: 'Table', category: 'Output' },
            // { icon: 'images/icons/image.png', text: 'Image', category: 'Output' },
            // { icon: 'images/icons/equal.png', text: 'Value', category: 'Output' },
        ];
        this.compositSubMenuItems = [
            { icon: 'images/icons/flow-diagram-black.png', text: 'Composite', category: 'Composite' }
        ]
        this.moduleTypes = [
            { text: 'Composite', color: compositColor, subMenuItems: this.compositSubMenuItems, subMenu: null, buttonIcon: 'images/icons/flow-diagram-white.png' },
            { text: 'Source', color: sourceColor, subMenuItems: this.sourceSubMenuItems, subMenu: null, buttonIcon: 'images/icons/database-storage.png' },
            { text: 'Processor', color: processorColor, subMenuItems: this.processorSubMenuItems, subMenu: null, buttonIcon: 'images/icons/calculator.png' },
            { text: 'Output', color: outputColor, subMenuItems: this.outputSubMenuItems, subMenu: null, buttonIcon: 'images/icons/scatter-graph.png' }];
        this.topMenuButtonArray = [];
    };

    initializeMenu = () => {
        this.moduleTypes.forEach((m, index) => {
            const button = new ModuleTopButton(m);
            if (index === 0) button.getButtonElement().classList.add('topRoundedCorners');
            else if (index === this.moduleTypes.length - 1) button.getButtonElement().classList.add('bottomRoundedCorners');
            this.topMenuButtonArray.push(button.getElement());
            this.menuContainer.append(button.getElement());
        });
    }
}

class ModuleTopButton {
    constructor(module) {
        this.wrapperElement;
        this.buttonElement;
        this.text = module.text;
        this.color = module.color;
        this.image = module.buttonIcon;
        this.subMenu;
        this.createButton(module.subMenuItems);
    };

    createButton = (subMenuItems) => {
        this.wrapperElement = GM.HF.createNewDiv('module-selection-menu-wrapper', 'module-selection-menu-wrapper', ['menuSegmentWrapper'], []);
        this.buttonElement = GM.HF.createNewDiv(`${this.text}_topMenuButton`, '', ['topMenuButton'], [{ style: 'backgroundColor', value: this.color }]);
        this.buttonElement.append(GM.HF.createNewIMG('', '', this.image, [], [], 'Submenu Icon'));
        this.buttonElement.append(GM.HF.createNewParagraph('', '', [], [], this.text));
        this.wrapperElement.append(this.buttonElement);
        this.subMenu = new ModuleSubMenu(this.text, subMenuItems);
        this.wrapperElement.append(this.subMenu.getWrapperElement());
        this.buttonElement.addEventListener('click', this.subMenu.toggleMenu);
    };

    getElement = () => this.wrapperElement;

    getButtonElement = () => this.buttonElement;
}

class ModuleSubMenu {
    constructor(name, dataArray) {
        this.name = name;
        this.dataArray = dataArray;
        this.maxHeight = 0;
        this.open = false;
        this.wrapperElement;
        this.cardArray = [];
        this.createSubMenu();
    }

    createSubMenu = () => {
        this.maxHeight = Math.ceil(this.dataArray.length / 4) * 100 + 'px';
        this.wrapperElement = GM.HF.createNewDiv('msm-submenu-wrapper', 'msm-submenu-wrapper', ['subMenuWrapper'], [`height: ${this.maxHeight}`]);
        this.dataArray.forEach(e => {
            const card = new SubMenuCard(e);
            this.cardArray.push(card);
            this.wrapperElement.append(card.getElement());
        });
    };

    toggleMenu = () => {
        const height = this.open ? 0 : this.maxHeight;
        const paddingTop = this.open ? '0%' : '1%';
        const paddingBottom = this.open ? '0%' : '1%';
        this.open = !this.open;
        HTMLFactory.setCustomStyles(this.wrapperElement, [{ style: 'height', value: height }, { style: 'paddingTop', value: paddingTop }, { style: 'paddingBottom', value: paddingBottom }]);
    }

    getWrapperElement = () => {
        return this.wrapperElement;
    }
}

class SubMenuCard {
    constructor(data) {
        this.icon = data.icon;
        this.text = data.text;
        this.category = data.category;
        this.element;
        this.textArea;
        this.image;
        this.createCard();
    };
    createCard = () => {
        this.element = GM.HF.createNewDiv('', '', ['menuIconCard'], []);
        this.image = GM.HF.createNewIMG('', '', this.icon, [], [], 'menu icon');
        this.element.appendChild(this.image);
        this.textArea = GM.HF.createNewParagraph('', '', ['iconText'], [], this.text);
        this.element.appendChild(this.textArea);
        this.element.addEventListener('click', this.clickHandler);
    };

    getElement = () => {
        return this.element;
    };

    clickHandler = () => {
        const data = { moduleName: this.text, moduleCategory: this.category };
        const msg = new Message(MODULE_MANAGER, MODULE_SELECTION_MENU, 'Deploy Module Event', data);
        this.#sendMessage(msg);
    };

    #sendMessage = msg => {
        GM.MSM.publisher.publishMessage(msg);
    };
}