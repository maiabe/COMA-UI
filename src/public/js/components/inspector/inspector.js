import { Message, Publisher } from '../../communication/index.js';
import { GM } from '../../main.js';
import { INSPECTOR, MODULE_MANAGER } from '../../sharedVariables/index.js';
import { InspectorCard } from './inspectorCard.js';

export class Inspector {

    publisher;                  // Message Publisher
    subscriber;                 // Message Subscriber
    #currentModuleKey;          // Key identifying the Highlighted Module
    #moduleCards;

    constructor() {
        this.domNodes = {};
        this.domNodes.container = document.querySelector('#inspector');
        this.publisher = new Publisher();
        this.#currentModuleKey;
        this.contentArea;
        this.#moduleCards = new Map();
    }

    createInspectorDomNode() {
        this.#createInspectorModuleCardContainer();
    }

    #createInspectorModuleCardContainer() {
        this.domNodes.moduleCardContainer = GM.HF.createNewDiv('inspector-module-card-container', 'inspector-card-container', ['inspector-card-container'], []);
        this.domNodes.container.appendChild(this.domNodes.moduleCardContainer);
        return this;
    }


    #createInspectorHeader() {
        this.domNodes.inspectorHeaderContainer = GM.HF.createNewDiv('inspector-header', 'inspector-header', ['inspector-header'], []);
        this.domNodes.container.appendChild(this.domNodes.inspectorHeaderContainer);
        return this;
    }

    getCard(id) {
        return this.#moduleCards.get(id);
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
                    const data = {
                        type: 'Value Change Event',
                        args: {
                            moduleKey: this.#currentModuleKey,
                            newValue: e.value,
                            field: field
                        }
                    };
                    const msg = new Message(MODULE_MANAGER, INSPECTOR, 'Value Change Event', data);
                    this.#sendMessage(msg);
                });
                return e;
        }
    };

    maximizeCard(cardId) {
        this.#moduleCards.forEach((card, key) => {
            if (key !== cardId) card.style.display = 'none';
            else card.style.display = 'flex';
        });
    }

    minimizeCards() {
        this.#moduleCards.forEach(card => card.style.display = 'flex');
    }

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