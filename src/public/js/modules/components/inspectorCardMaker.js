import { InspectorCard } from '../../components/inspector/inspectorCard.js';
import { GM } from '../../main.js';
export class InspectorCardMaker {
    constructor (name, color, key) {
        this.inspectorCard = new InspectorCard(name, color, key);   
    }

    maximizeCard() {
        this.inspectorCard.maximizeCard();
    }

    setInspectorCardDescriptionText(text) {
        this.inspectorCard.appendToBody(GM.HF.createNewParagraph('', '', ['inspector-card-description'], [], text));
    }

    addInspectorCardIDField(key) {
        this.inspectorCard.addKeyValueCard('Module Id', [key.toString()]);
    }

        addInspectorCardDataConnectedField() {
        this.inspectorCard.addDynamicKeyValueCard('Data Linked', [false]);
    }

    addInspectorCardLinkedNodeField(key) {
        this.inspectorCard.addDynamicKeyValueCard('Linked Node(s)', [`(${key})`]);
    }

    addInspectorCardObjectsDropdown() {
        GM.MM.requestListOfObjects(this.createInspectorCardDropdown.bind(this));
    }

    createInspectorCardDropdown(objectsList, callback) {
        this.addData('Objects List', objectsList);
        this.addData('Selected Object', Object.keys(objectsList)[0]);
        const searchCard = this.inspectorCard.addObjectsSearchCard(objectsList);
        searchCard.getCard().dropdown.addEventListener('change', callback);
    }

    addInspectorCardChartXAxisCard(headers, key) {
        const title = 'test';
        const dropDown = GM.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], headers, headers);
        const labelInput = GM.HF.createNewTextInput('', '', ['axis-card-label-input'], [], 'text');
        const gridCheckbox = GM.HF.createNewCheckbox('', '', [], [], 'Grid Lines', 'Grid Lines');
        const tickCheckbox = GM.HF.createNewCheckbox('', '', [], [], 'Ticks', 'Ticks');
        const addTraceButton = GM.HF.createNewButton('','', ['axis-card-button'], [], 'button', 'Add Trace');
        this.inspectorCard.addXAxisCard(dropDown, labelInput, gridCheckbox.wrapper, tickCheckbox.wrapper, addTraceButton);
        return { dropdown: dropDown, labelInput: labelInput, gridCheckbox: gridCheckbox, tickCheckbox: tickCheckbox, addTraceButton: addTraceButton };
    }

    addNewTraceToInspectorCard(dropdown) {
        this.inspectorCard.addChartTrace(dropdown);
    }

    addInspectorCardChartYAxisCard(headers, key) {
        const title = 'test';
        const dropDown = GM.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], headers, headers);
        const labelInput = GM.HF.createNewTextInput('', '', ['axis-card-label-input'], [], 'text');
        const gridCheckbox = GM.HF.createNewCheckbox('', '', [], [], 'Grid Lines', 'Grid Lines');
        const tickCheckbox = GM.HF.createNewCheckbox('', '', [], [], 'Ticks', 'Ticks');
        const addTraceButton = GM.HF.createNewButton('','', ['axis-card-button'], [], 'button', 'Add Trace');
        this.inspectorCard.addYAxisCard(dropDown, labelInput, gridCheckbox.wrapper, tickCheckbox.wrapper, addTraceButton);
        return { dropdown: dropDown, labelInput: labelInput, gridCheckbox: gridCheckbox, tickCheckbox: tickCheckbox, addTraceButton: addTraceButton };
    }

    addInspectorCardIncludeColumnCard(headers, key) {
        let checkboxes = [];
        headers.forEach((header, index) => {
            checkboxes.push(GM.HF.createNewCheckbox(`includeColumn-checkbox-module${key}-${index}`,
                `includeColumn-checkbox-module${key}-${index}`,
                ['include-column-checkbox'],
                [],
                header,
                header,
                true));
        });
        this.inspectorCard.addIncludeColumnCard(checkboxes);
        return checkboxes;
    }

    addInspectorCardGenerateChartButton(key) {
        const button = GM.HF.createNewButton(`create-line-chart-button-${key}`, `create-line-chart-button-${key}`, [], [], 'button', 'Generate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate Chart: ', button, false);
        return button;
    }

    addInspectorCardGenerateTablePreviewButton(key) {
        const button = GM.HF.createNewButton(`create-table-preview-button-${key}`, `create-table-preview-button-${key}`, [], [], 'button', 'Genereate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Preview Table: ', button, false);
        return button;
    }

    addInspectorCardGenerateCSVFileButton(key) {
        const button = GM.HF.createNewButton(`create-CSV-button-${key}`, `create-CSV-button-${key}`, [], [], 'button', 'Genereate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate CSV File: ', button, false);
        return button;
    }

    addInspectorDataCard() {
        console.log('DATA Card');
    }

    addInspectorCardDescription(description) {
        this.inspectorCard.appendToBody(GM.HF.createNewParagraph('','',['inspector-card-description'], [], description));
    }

    createInspectorCompositeDetailCard(groupData, saveModuleCallback) {
        this.inspectorCard.addCompositeDetailsCard(groupData, saveModuleCallback);
    }

    addMetadataCard(metadata) {
        metadata.columnHeaders.forEach(header => {
            this.inspectorCard.addKeyValueCard(header.name, [header.dataType, header.dataFormat]);
        });
    }

    addFilterCards(metadata) {
        const filterArray = [];
        metadata?.columnHeaders.forEach(header => {
            filterArray.push(this.inspectorCard.addMinMaxCard(header.name, header.min, header.max, header.dataType, header.dataFormat));
        });
        return filterArray;
    }

    #createInspectorCardKeyText = text => GM.HF.createNewParagraph('', '', ['inspector-card-key-text'], [], text);
    #createInspectorCardValueText = text => GM.HF.createNewParagraph('', '', ['inspector-card-value-text'], [], text);

    #addInspectorCardField(key, value, dynamic) {
        const container = this.#createInspectorCardHorizontalFlexContainer();
        const keyDiv = this.#createInspectorCardKeyText(key);
        const valueDiv = this.#createInspectorCardValueText(value);
        container.appendChild(keyDiv);
        container.appendChild(valueDiv);
        this.inspectorCard.appendToBody(container);
    }

    /** Call this when you want to create an inspector card keyValueCard object with a dropdown or other precreated HTML element */
    #addDynamicInspectorCardFieldWithPrebuiltValueDiv(key, valueDiv) {
        const container = this.#createInspectorCardHorizontalFlexContainer();
        const keyDiv = this.#createInspectorCardKeyText(key);
        container.appendChild(keyDiv);
        container.appendChild(valueDiv);
        this.inspectorCard.appendToBody(container);
    }

    updateInspectorCardDynamicField(key, value) {
        this.inspectorCard.updateDynamicField(key, value);
    }

    createInspectorCardAxisCard(whichAxis, dropdownHeaders) {
        this.inspectorCard.addAxisCard(whichAxis, dropdownValues);
    }

    deleteInspectorCard() {
        this.inspectorCard.getCard().remove();
    }

    #createInspectorCardHorizontalFlexContainer = () => GM.HF.createNewDiv('', '', ['inspector-card-horizontal-flex-container'], []);

    getCard = () => this.inspectorCard.getCard();
}