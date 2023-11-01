/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import {GM} from '../../../main.js';
export class CompositeDetailsCard {
    
    #wrapper;
    #header;
    #nodesRow;
    #saveButton;
    
    constructor(groupData, saveModuleCallback) {
        this.#wrapper = this.createWrapperElement();
        this.#header = this.createHeader();
        this.#nodesRow = this.createNodesRow(groupData.nodes);
        this.#saveButton = this.createSaveButton();
        this.addSaveEventListener(saveModuleCallback);
        this.buildCard();
    }
    createWrapperElement = () => {
        return GM.HF.createNewDiv('', '', ['composite-details-card'], [], [], '');
    }

    createHeader() {
        const header = GM.HF.createNewDiv('','', ['composite-details-card-header'], [], [], '');
        header.appendChild(GM.HF.createNewParagraph('','',[],[],'Composite Details'));
        return header;
    }

    createNodesRow(nodes) {
        const div = GM.HF.createNewDiv('','', [], [], [], '');
        const left = GM.HF.createNewParagraph('','',[],[], 'Nodes: ');
        let nodesString = '';
        nodes.forEach((node, index) => {
            if (index === nodes.length - 1) nodesString += `${node.key}`;
            else nodesString += `${node.key}, `;
        });
        const right = GM.HF.createNewParagraph('','',[],[], nodesString);
        div.appendChild(left);
        div.appendChild(right);
        return div;
    }

    createSaveButton() {
        return GM.HF.createNewButton('','',[],[],'button', 'Save');
    }

    addSaveEventListener(callback) {
        this.#saveButton.addEventListener('click', callback);
    }

    buildCard() {
        this.#wrapper.appendChild(this.#header);
        this.#wrapper.appendChild(this.#nodesRow);
        this.#wrapper.appendChild(this.#saveButton);
    }

    getCard = () => this.#wrapper;
}