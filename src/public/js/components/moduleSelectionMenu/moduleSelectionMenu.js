import { moduleMenuColor, sourceColor, outputColor, processorColor, compositColor, MODULE_MANAGER, MODULE_SELECTION_MENU } from '../../sharedVariables/index.js';
import { Publisher, Message } from '../../communication/index.js';
import { GM } from '../../main.js';
import { HTMLFactory } from '../../htmlGeneration/index.js';
import { moduleDataObject } from '../../sharedVariables/moduleData.js';

/************************************************************************************************
 * This file creates the HTML and JS interactions for the module selection menu on the left side of the UI.
 * The menu is a series of sections.
 * The outer layer is the Module Selection Menu.
 * The module top button is the heading that says Composite or source etc. This is a button that when clicked expands the sub menu.
 * Module sub menu is the inner menus that have the buttons for actually choosing a module 
 * Sub menu cards are the icon and text buttons.
 */
export class ModuleSelectionMenu {
    publisher;
    constructor() {
        this.publisher = new Publisher();
        this.menuContainer = document.getElementById('moduleMenu');
        this.sourceSubMenuItems = [];
        this.processorSubMenuItems = [];
        this.outputSubMenuItems = [];
        this.compositeSubMenuItems = [];
        this.moduleTypes = [
            { text: 'Composite', color: moduleMenuColor, subMenuItems: this.compositeSubMenuItems, subMenu: null, buttonIcon: 'images/icons/flow-diagram-white.png' },
            { text: 'Source', color: moduleMenuColor, subMenuItems: this.sourceSubMenuItems, subMenu: null, buttonIcon: 'images/icons/database-storage.png' },
            { text: 'Processor', color: moduleMenuColor, subMenuItems: this.processorSubMenuItems, subMenu: null, buttonIcon: 'images/icons/calculator.png' },
            { text: 'Output', color: moduleMenuColor, subMenuItems: this.outputSubMenuItems, subMenu: null, buttonIcon: 'images/icons/scatter-graph.png' }
        ];
        this.topMenuButtonArray = [];
        this.populateMenuArrays();
    };

    populateMenuArrays() {
        moduleDataObject.forEach(e => {
            if (e.menuData) {
                switch (e.menuData.category) {
                    case 'Source':
                        this.sourceSubMenuItems.push(e.menuData);
                        break;
                    case 'Processor':
                        this.processorSubMenuItems.push(e.menuData);
                        break;
                    case 'Output':
                        this.outputSubMenuItems.push(e.menuData);
                        break;
                    case 'Composite':
                        this.compositeSubMenuItems.push(e.menuData);
                        break;
                }
            }
        });
    }

    initializeMenu = () => {
        this.moduleTypes.forEach((m, index) => this.instantiateMenuButton(m, index));
    }

    instantiateMenuButton = (m, index) => {
        const button = new ModuleTopButton(m);
        if (index === 0) button.getButtonElement().classList.add('topRoundedCorners');
        else if (index === this.moduleTypes.length - 1) button.getButtonElement().classList.add('bottomRoundedCorners');
        this.topMenuButtonArray.push(button.getElement());
        this.menuContainer.append(button.getElement());
    }

    addCompositeSubMenuItem = name => {
        this.compositeSubMenuItems.push({ icon: 'images/icons/flow-diagram-black.png', text: name, category: 'Composite' });
    };
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
        if (this.category === 'Composite') this.createCompositeModel();
        else this.createNonCompositeModel();
    };

    createCompositeModel() {
        const data = { moduleName: this.text, moduleCategory: this.category, type: 'composite' };
        const msg = new Message(MODULE_MANAGER, MODULE_SELECTION_MENU, 'Deploy Module Event', data);
        this.#sendMessage(msg);
    }

    createNonCompositeModel() {
        const data = { moduleName: this.text, moduleCategory: this.category, type: 'non-composite' };
        const msg = new Message(MODULE_MANAGER, MODULE_SELECTION_MENU, 'Deploy Module Event', data);
        this.#sendMessage(msg);
    }

    #sendMessage = msg => {
        GM.MSM.publisher.publishMessage(msg);
    };
}