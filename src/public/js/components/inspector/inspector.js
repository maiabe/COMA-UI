import { Message, Publisher } from '../../communication/index.js';
import { GM } from '../../main.js';
import { INSPECTOR, MODULE_MANAGER } from '../../sharedVariables/index.js';
import { InspectorCard } from './inspectorCard.js';

export class Inspector {

    publisher;                  // Message Publisher
    subscriber;                 // Message Subscriber
    #currentModuleKey;          // Key identifying the Highlighted Module
    #htmlNode;
    #inspectorHeader;
    #moduleCards;
    #dataCards;

    constructor() {
        // Set Up the communication components.
        this.domNodes = {};
        this.domNodes.container = document.querySelector('#inspector');
        this.publisher = new Publisher();
        this.#currentModuleKey;
        //this.createTitle();
        this.contentArea;
        this.#moduleCards = new Map();
        this.#dataCards = new Map();
        //this.createContentArea();
    }

    createInspectorDomNode() {
        this.#createInspectorHeader()
        .#createHeaderButtons()
        .#appendHeaderButtons()
        .#createInspectorModuleCardContainer()
        .#createInspectorDataCardContainer();
        this.showModuleCards();
    }

    #createInspectorModuleCardContainer() {
        this.domNodes.moduleCardContainer = GM.HF.createNewDiv('inspector-module-card-container', 'inspector-card-container', ['inspector-card-container'], []);
        this.domNodes.container.appendChild(this.domNodes.moduleCardContainer);
        return this;
    }

    #createInspectorDataCardContainer() {
        this.domNodes.dataCardContainer = GM.HF.createNewDiv('inspector-data-card-container', 'inspector-card-container', ['inspector-card-container'], []);
        this.domNodes.container.appendChild(this.domNodes.dataCardContainer);
        return this;
    }

    #createInspectorHeader() {
        this.domNodes.inspectorHeaderContainer = GM.HF.createNewDiv('inspector-header', 'inspector-header', ['inspector-header'], []);
        this.domNodes.container.appendChild(this.domNodes.inspectorHeaderContainer);
        return this;
    }

    showModuleCards() {
        this.domNodes.moduleCardContainer.style.display = 'flex';
        this.domNodes.dataCardContainer.style.display = 'none';
        this.domNodes.headerButtons.module.element.classList.add('active-header-button');
        this.domNodes.headerButtons.data.element.classList.remove('active-header-button');
    }

    showDataCards() {
        this.domNodes.moduleCardContainer.style.display = 'none';
        this.domNodes.dataCardContainer.style.display = 'flex';
        this.domNodes.headerButtons.module.element.classList.remove('active-header-button');
        this.domNodes.headerButtons.data.element.classList.add('active-header-button');
    }

    // #createNewInspectorCard(title) {
    //     this.domNodes.cardContainer.append(new InspectorCard(title).getCard());
    //     return this;
    // }

    // #setCurrentModuleKey(key, content) {
    //     this.#currentModuleKey = key;
    // }

    // createTitle = () => {
    //     const titleDiv = document.createElement('h1');
    //     const text = document.createTextNode('Inspector');
    //     titleDiv.appendChild(text);
    //     this.div.appendChild(titleDiv);
    // }

    #createHeaderButtons() {
        this.domNodes.headerButtons = {};
        this.domNodes.headerButtons.module = {element: undefined, title: "Modules" }
        this.domNodes.headerButtons.data = {element: undefined, title: 'Data' }
        Object.values(this.domNodes.headerButtons).forEach((button, index) => {
            button.element = this.#createHeaderButton(button.title, index);
            index === 0 ? this.#createModulesHeaderButtonEventListener(button.element) : this.#createDataHeaderButtonEventListener(button.element);
        });
        return this;
    }

    #createModulesHeaderButtonEventListener(element) {
        element.addEventListener('click', this.showModuleCards.bind(this));
    }

    #createDataHeaderButtonEventListener(element) {
        element.addEventListener('click', this.showDataCards.bind(this));
    }

    #appendHeaderButtons() {
        Object.values(this.domNodes.headerButtons).forEach(button => {
           this.domNodes.inspectorHeaderContainer.appendChild(button.element);
        });
        return this;
    }

    #createHeaderButton(title, index) {
        const identifier = index === 0 ? 'Module' : 'data';
        const classlist = index === 0 ? ['inspector-header-button', 'active-header-button'] : ['inspector-header-button'];
        return GM.HF.createNewButton(`inspector-header-${identifier}-button`, `inspector-header-${identifier}-button`, classlist, [], 'button', title, false);
    }

    addModuleCard(key, card) {
        this.domNodes.moduleCardContainer.append(card);
        this.#moduleCards.set(key, card);
    }

    addDataCard(key, card) {
        console.log(card);
        this.domNodes.dataCardContainer.append(card);
        this.#dataCards.set(key, card);
    }

    // createContentArea = () => {
    //     this.contentArea = document.createElement('div');
    //     this.contentArea.id = 'inspectorContentArea';
    //     this.div.appendChild(this.contentArea);
    // }

    // createContent = con => {
    //     this.content = con;
    //     this.clearInspector(false);
    //     const table = document.createElement('table');
    //     const tbody = document.createElement('tbody');
    //     table.appendChild(tbody);
    //     const contentIterator = con[Symbol.iterator]();
    //     for (const p of contentIterator) {
    //         const tr = document.createElement('tr');
    //         const title = document.createElement('td');
    //         const titleText = document.createTextNode(p[0].toUpperCase());
    //         title.appendChild(titleText);
    //         const value = document.createElement('td');
    //         //const valueText = GM.HF.createNewParagraph(`${this.#currentModuleKey}_${p[1].text}_text`, `${this.#currentModuleKey}_${p[1].text}_text`, ['show'], [], p[1].text);
    //         let valueText;
    //         if (p[1].modify) {
    //             valueText = this.createAlt(p[1].modifyType, p[1].text, p[0]);
    //         } else {
    //             valueText = document.createTextNode(p[1].text);
    //         }
    //         value.appendChild(valueText);
    //         tr.appendChild(title);
    //         tr.appendChild(value);
    //         tbody.appendChild(tr);

    //     };
    //     this.contentArea.appendChild(table);
    //     if (con.html) {
    //         con.html.forEach(e => {
    //             this.contentArea.appendChild(e);
    //         });
    //     }
    // };

    updateContent = (key, content) => {
        if (this.#currentModuleKey === key) {
            this.createContent(content);
        }
    };

    createAlt = (type, text, field) => {
        switch (type) {
            case 'text input':
                const e = GM.HF.createNewTextInput(`${this.#currentModuleKey}_${text}_text`, `${this.#currentModuleKey}_${text}_text`, [], [], 'text', false);
                e.value = text;
                e.addEventListener('change', () => {
                    const data = { moduleKey: this.#currentModuleKey, newValue: e.value, field: field };
                    const msg = new Message(MODULE_MANAGER, INSPECTOR, 'Value Change Event', data);
                    this.#sendMessage(msg);
                });
                return e;
        }
    };

    clearInspector = clearCurrentModuleKey => {
        this.contentArea.innerHTML = '';
        if (clearCurrentModuleKey) {
            this.#currentModuleKey = -1;
        }
    };

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    };
}