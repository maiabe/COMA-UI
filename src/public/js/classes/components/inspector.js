import { Message, Publisher } from '../communication/communication.js';
import { GM } from '../../scripts/main.js';
import { INSPECTOR, MODULE_MANAGER } from '../../scripts/constants.js';

export default class Inspector {

    publisher;                  // Message Publisher
    subscriber;                 // Message Subscriber
    #currentModuleKey;          // Key identifying the Highlighted Module

    constructor() {
        // Set Up the communication components.
        this.publisher = new Publisher();
        this.div = document.getElementById('inspector');
        this.#currentModuleKey;
        this.createTitle();
        this.contentArea;
        this.createContentArea();
    }

    setCurrentModuleKey(key, content) {
        this.#currentModuleKey = key;
    }

    createTitle = () => {
        const titleDiv = document.createElement('h1');
        const text = document.createTextNode('Inspector');
        titleDiv.appendChild(text);
        this.div.appendChild(titleDiv);
    }

    createContentArea = () => {
        this.contentArea = document.createElement('div');
        this.contentArea.id = 'inspectorContentArea';
        this.div.appendChild(this.contentArea);
    }

    createContent = con => {
        this.content = con;
        this.clearInspector(false);
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        const contentIterator = con[Symbol.iterator]();
        for (const p of contentIterator) {
            const tr = document.createElement('tr');
            const title = document.createElement('td');
            const titleText = document.createTextNode(p[0].toUpperCase());
            title.appendChild(titleText);
            const value = document.createElement('td');
            //const valueText = GM.HF.createNewParagraph(`${this.#currentModuleKey}_${p[1].text}_text`, `${this.#currentModuleKey}_${p[1].text}_text`, ['show'], [], p[1].text);
            let valueText;
            if (p[1].modify) {
                valueText = this.createAlt(p[1].modifyType, p[1].text, p[0]);
            } else {
                valueText = document.createTextNode(p[1].text);
            }
            value.appendChild(valueText);
            tr.appendChild(title);
            tr.appendChild(value);
            tbody.appendChild(tr);

        };
        this.contentArea.appendChild(table);
        if (con.html) {
            con.html.forEach(e => {
                this.contentArea.appendChild(e);
            });
        }
    };

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