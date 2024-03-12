import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
import { sourceColor } from '../../sharedVariables/colors.js';

export class SaveCompositeModulePopupContent {
    constructor(groupInfo, saveCallback) {
        this.HF = new HTMLFactory();
        this.saveCallback = saveCallback;
        this.groupInfo = groupInfo;
        this.contentWrapper = this.createContentWrapper();
        this.nameInput = this.createNameInput();
        this.addInputLabel(this.nameInput, 'Module Name');
        this.descriptionInput = this.createDescriptionInput();
        this.addInputLabel(this.descriptionInput, 'Description');
        this.saveButton = this.createSaveButton();
        this.addSaveButtonListener();
        this.contentWrapper.appendChild(this.saveButton);
    }

    createContentWrapper() {
        return this.HF.createNewDiv('', '', ['save-popup-wrapper'], []);
    }

    createNameInput() {
        return this.HF.createNewInput('', '', [], [], 'text');
    }

    createDescriptionInput() {
        return this.HF.createNewTextArea('', '', [], []);
    }

    createSaveButton() {
        return this.HF.createNewButton('','', ['save-popup-save-button'], [], 'button', 'Save');
    }

    addInputLabel(element, labelText) {
        const label = this.HF.createNewParagraph('', '', [], [], labelText);
        const inputWrapper = this.HF.createNewDiv('', '', ['save-popup-input-wrapper'], []);
        inputWrapper.appendChild(label);
        inputWrapper.appendChild(element);
        this.contentWrapper.appendChild(inputWrapper);
    }

    addSaveButtonListener() {
        this.saveButton.addEventListener('click', this.saveModule.bind(this));
    }

    saveModule() {
        console.log(this.nameInput.value);
        const data = {name: this.nameInput.value, description: this.descriptionInput.value, groupInfo: this.groupInfo};
        this.saveCallback(data);
    }

    getContent = () => this.contentWrapper;
    getColor = () => sourceColor;
    getHeaderText = () => 'Save Composite Module';
}