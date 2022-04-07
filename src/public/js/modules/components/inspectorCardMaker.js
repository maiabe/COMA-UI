import { InspectorCard } from '../../components/inspector/inspectorCard.js';
import { Publisher, Message, Subscriber } from '../../communication/index.js';
import { HTMLFactory } from '../../htmlGeneration/htmlFactory.js';
import { INSPECTOR_CARD, INSPECTOR_CARD_MAKER, MODULE_MANAGER } from '../../sharedVariables/constants.js';

export class InspectorCardMaker {
    constructor (name, color, key) {
        this.inspectorCard = new InspectorCard(name, color, key);   
        this.publisher = new Publisher();
        this.subscriber = new Subscriber(this.messageHandler.bind(this));
        this.inspectorCard.publisher.subscribe(this.subscriber);
        this.messageHandlerMap = new Map();
        this.buildMessageHandlerMap();
        this.HF = new HTMLFactory();
    }

    buildMessageHandlerMap() {
        this.messageHandlerMap.set('Emit Resize Event', this.emitResizeEvent.bind(this));
    }

    messageHandler = msg => {
        const messageData = msg.readMessage();
        if (messageData.from === INSPECTOR_CARD && messageData.to !== INSPECTOR_CARD_MAKER) {
            msg.updateFrom(INSPECTOR_CARD_MAKER);
            this.sendMessage(msg);
        }
    }

    emitResizeEvent(args) {
    }

    maximizeCard() {
        this.inspectorCard.maximizeCard();
    }

    setInspectorCardDescriptionText(text) {
        this.inspectorCard.appendToBody(this.HF.createNewParagraph('', '', ['inspector-card-description'], [], text));
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
        const message = new Message(MODULE_MANAGER, INSPECTOR_CARD_MAKER, 'Request List of Objects', {args: {callbackFunction:this.createInspectorCardDropdown.bind(this)}});
        this.sendMessage(message);
    }

    createInspectorCardDropdown(objectsList, callback) {
        this.addData('Objects List', objectsList);
        this.addData('Selected Object', Object.keys(objectsList)[0]);
        const searchCard = this.inspectorCard.addObjectsSearchCard(objectsList);
        searchCard.getCard().dropdown.addEventListener('change', callback);
    }

    addInspectorCardChartXAxisCard(headers, key) {
        const title = 'test';
        const dropDown = this.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], headers, headers);
        const labelInput = this.HF.createNewTextInput('', '', ['axis-card-label-input'], [], 'text');
        const gridCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Grid Lines', 'Grid Lines');
        const tickCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Ticks', 'Ticks');
        const addTraceButton = this.HF.createNewButton('','', ['axis-card-button'], [], 'button', 'Add Trace');
        this.inspectorCard.addXAxisCard(dropDown, labelInput, gridCheckbox.wrapper, tickCheckbox.wrapper, addTraceButton, undefined);
        return { dropdown: dropDown, labelInput: labelInput, gridCheckbox: gridCheckbox, tickCheckbox: tickCheckbox, addTraceButton: addTraceButton, errorDropDown: undefined };
    }

    addNewTraceToInspectorCard(dropdown, errorDropDown) {
        this.inspectorCard.addChartTrace(dropdown, errorDropDown);
    }

    addInspectorCardChartYAxisCard(headers, key) {
        const errorHeaders = [...headers];
        errorHeaders.unshift('None');
        const title = 'test';
        const dropDown = this.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], headers, headers);
        const errorDropDown = this.HF.createNewSelect(`${title}-${key}`, `${title}-${key}`, [], [], errorHeaders, errorHeaders);
        const labelInput = this.HF.createNewTextInput('', '', ['axis-card-label-input'], [], 'text');
        const gridCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Grid Lines', 'Grid Lines');
        const tickCheckbox = this.HF.createNewCheckbox('', '', [], [], 'Ticks', 'Ticks');
        const addTraceButton = this.HF.createNewButton('','', ['axis-card-button'], [], 'button', 'Add Trace');
        this.inspectorCard.addYAxisCard(dropDown, labelInput, gridCheckbox.wrapper, tickCheckbox.wrapper, addTraceButton, errorDropDown);
        return { dropdown: dropDown, labelInput: labelInput, gridCheckbox: gridCheckbox, tickCheckbox: tickCheckbox, addTraceButton: addTraceButton, errorDropDown: errorDropDown };
    }

    addInspectorCardIncludeColumnCard(headers, key) {
        let checkboxes = [];
        headers.forEach((header, index) => {
            checkboxes.push(this.HF.createNewCheckbox(`includeColumn-checkbox-module${key}-${index}`,
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
        const button = this.HF.createNewButton(`create-line-chart-button-${key}`, `create-line-chart-button-${key}`, [], [], 'button', 'Generate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate Chart: ', button, false);
        return button;
    }

    addInspectorCardGenerateTablePreviewButton(key) {
        const button = this.HF.createNewButton(`create-table-preview-button-${key}`, `create-table-preview-button-${key}`, [], [], 'button', 'Genereate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Preview Table: ', button, false);
        return button;
    }

    addInspectorCardGenerateCSVFileButton(key) {
        const button = this.HF.createNewButton(`create-CSV-button-${key}`, `create-CSV-button-${key}`, [], [], 'button', 'Generate', false);
        this.#addDynamicInspectorCardFieldWithPrebuiltValueDiv('Generate CSV File: ', button, false);
        return button;
    }

    addInspectorDataCard() {
        console.log('DATA Card');
    }

    addInspectorCardDescription(description) {
        this.inspectorCard.appendToBody(this.HF.createNewParagraph('','',['inspector-card-description'], [], description));
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
            filterArray.push(this.inspectorCard.addMinMaxCard(header.name, header.min, header.max, header.dataType, header.dataFormat, header.changeDataTypeFunction));
        });
        return filterArray;
    }

    addCardsToExistingFilter(columnHeaders, filterArray) {
        columnHeaders.forEach(col => {
            filterArray.push(this.inspectorCard.addMinMaxCard(col.name, col.min, col.max, col.dataType, col.dataFormat, col.changeDataTypeFunction))
        });
    }

    addConversionCard(metadata){
        return this.inspectorCard.addConversionCard(metadata);
    }

    #createInspectorCardKeyText = text => this.HF.createNewParagraph('', '', ['inspector-card-key-text'], [], text);
    #createInspectorCardValueText = text => this.HF.createNewParagraph('', '', ['inspector-card-value-text'], [], text);

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

    #createInspectorCardHorizontalFlexContainer = () => this.HF.createNewDiv('', '', ['inspector-card-horizontal-flex-container'], []);

    getCard = () => this.inspectorCard.getCard();

    sendMessage = msg => {
        console.log(msg);
        this.publisher.publishMessage(msg);
    }
}