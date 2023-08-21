/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { GM } from "../../../main.js";

export class AxisCard {

    #wrapper;
    #axisName;
    #axisHeader;
    #axisContent;
    #fieldDropdown;
    #traceArea;
    #addTraceButton;

    traceCards;

    /** Creates an axis card for Chart Module inspector cards.
     * @param {axisName object} axisName object consists of displayName and elementId of this AxisCard.
     * @param {fields Array} fields consists of array of objects with the displayName and fieldName information.
     * @param {defaultField object} defaultField object consists of displayName and fieldName information of specified default field.
     *                                                  defaultField may be an undefined object
     */
    constructor(axisName, fields, defaultField) {
        this.#axisName = axisName;
        this.#createElements(axisName, fields, defaultField);
        this.#buildCard();
        this.#addTraceFunction(axisName.elementName, fields);
    }

    #createElements(axisName, fields, defaultField) {
        this.#createWrapper(axisName);
        this.#createHeader(axisName);
        this.#createContent(axisName, fields, defaultField);
    }

    #buildCard() {
        this.#wrapper.appendChild(this.#axisHeader);
        this.#wrapper.appendChild(this.#axisContent);
    }

    #createWrapper(axisName) {
        this.#wrapper = GM.HF.createNewDiv(`${axisName.elementName}`, '', ['axis-card-wrapper'], []);
    }

    // create header
    #createHeader(axisName) {
        const axisCardHeader = GM.HF.createNewDiv('', '', ['axis-card-header', 'header'], []);
        axisCardHeader.innerHTML = axisName.displayName;
        this.#wrapper.appendChild(axisCardHeader);
        this.#axisHeader = axisCardHeader;
    }

    // create content --> dropdowns & labels & (other chart options) & addTrace button for each field (add function to addTrace button)
    #createContent(axisName, fields, defaultField) {
        console.log(fields);
        console.log(defaultField);
        //console.log(errorFields);
        if (fields) {
            // create content wrapper
            var contentWrapper = GM.HF.createNewDiv('', '', ['axis-content-wrapper'], []);

            var fieldsWrapper = GM.HF.createNewDiv('', '', ['fields-dropdown-wrapper'], []);
            // create dropdown wrapper
            var options = { "---- Select ----": "none" };
            // foreach field, create a dropdown and a label input

            // sort fields by the default selection then the name
            fields.forEach(field => {
                if (field.fieldName) {
                    options[field.fieldName] = field.fieldName;
                }
            });
            this.#fieldDropdown = GM.HF.createNewSelect('', '', ['fields-dropdown'], [{ style: "width", value: "70%" }, { style: "height", value: "25px" }], Object.values(options), Object.keys(options));
            this.#addTraceButton = GM.HF.createNewButton(`${axisName.elementName}-add-trace-button`, '', ['button', 'add-trace-button'], [{ style: "width", value: "30%" }, { style: "height", value: "25px" }], 'button', 'Add Trace', false);
            fieldsWrapper.appendChild(this.#fieldDropdown);
            fieldsWrapper.appendChild(this.#addTraceButton);

            // create trace area (table with removeable items? add error dropdown here if any?)
            this.#traceArea = GM.HF.createNewDiv('', '', ['trace-area'], []);

            // add default traceCard
            var field = fields.filter(f => f.fieldName === defaultField.fieldName)[0];
            if (!field) {
                field = fields[0];
            }
            console.log(field);
            this.#createTraceCard(axisName.elementName, field);

            // label input for the added trace.. other options for the chart
            contentWrapper.appendChild(fieldsWrapper);
            contentWrapper.appendChild(this.#traceArea);

            this.#axisContent = contentWrapper;
        }
        else {
            // show error there are no fields to load
        }
    }


    #addTraceFunction(axisName, fields) {
        const button = this.#addTraceButton;
        button.addEventListener('click', e => {
            // get dropdown selection
            let dropdown = e.target.previousElementSibling;
            let selected = dropdown.options[dropdown.selectedIndex];
            let selectedField = fields.filter(f => f.fieldName === selected.value)[0];
            //let traceArea = e.target.closest('.axis-content-wrapper').querySelector('.trace-area');
            // check if the field is already in there
            // if it is, display error message
            //var exists = traceArea.querySelector(`#${selected.value}`);
            if (selected.value !== 'none') {
                // create card entry
                var traceCard = this.#createTraceCard(axisName, selectedField);
                this.updateSeriesAxisOptions('add', axisName, traceCard);

/*
                var seriesTraceArea = e.target.closest('.chart-axis-wrapper').querySelector('.series-card-wrapper .trace-area');
                var seriesTraces = seriesTraceArea.querySelectorAll('.trace-card-wrapper');

                seriesTraces.forEach(trace => {
                    console.log(trace);
                    var option = { value: traceCard.getAttribute('id'), name: traceCard.getAttribute('id') };
                    if (axisName.elementName === 'xAxis') {
                        var xAxisDD = trace.querySelector('.xaxis-index-dropdown');
                        console.log(xAxisDD);
                        GM.HF.addSelectOption(xAxisDD, option);
                        console.log(xAxisDD);
                    }
                    else if (axisName.elementName === 'yAxis') {
                        var yAxisDD = trace.querySelector('.yaxis-index-dropdown');
                        GM.HF.addSelectOption(yAxisDD, option);
                        console.log(yAxisDD);
                    }
                });*/
            }
            /*else {
                let errorMessageWrapper = GM.HF.createNewDiv('', '', ['add-trace-error-wrapper'], []);
                let errorMessage = GM.HF.createNewSpan('', '', ['add-trace-error'], [{ style: "color", value: "red" }], 'The field has already been selected');
                errorMessageWrapper.appendChild(errorMessage);
                traceArea.appendChild(errorMessageWrapper);
            }*/


        });
    }


    /** Creates a Trace Card in the axis card.
     * @param {field object} field object consists of fieldName and dataType of the field to be added as a trace card.
     * @param {traceArea HTML DOM} traceArea is an HTML object for the trace card to be added to.
     * */
    #createTraceCard(axisName, field) {
        console.log(field);
        var traceArea = this.#traceArea;

        //-- Create traceCard content
        let traceCard = GM.HF.createNewDiv(field.fieldName, '', ['trace-card-wrapper'], []);

        //-- Create traceCard header
        let header = GM.HF.createNewDiv('', '', ['trace-card-header'], []);
        let fieldName = GM.HF.createNewSpan('', '', ['field-name'], [], field.fieldName);
        let fieldDataType = GM.HF.createNewTextInput('', '', ['data-type'], [], 'hidden', field.dataType);
        let fieldGroup = GM.HF.createNewTextInput('', '', ['field-group'], [], 'hidden', field.fieldGroup);
        let removeBtn = GM.HF.createNewIMG('', '', './images/icons/delete_1.png', ['remove-button', 'button'], [], '');
        header.appendChild(fieldName);
        header.appendChild(fieldDataType);
        header.appendChild(fieldGroup);
        header.appendChild(removeBtn);
        traceCard.appendChild(header);
        traceArea.appendChild(traceCard);

        //-- Create removeFunction for this
        this.#removeTraceFunction(removeBtn);

        let body = GM.HF.createNewDiv('', '', ['trace-card-body'], []);


        //-- Create axis label input
        let labelWrapper = GM.HF.createNewDiv('', '', ['label-wrapper', 'trace-card-element'], []);
        let labelText = GM.HF.createNewSpan('', '', ['label-text'], [], `Label Name: `);
        let label = GM.HF.createNewTextInput('', '', ['label-input'], [], 'text', false);
        label.value = field.fieldName;
        labelWrapper.appendChild(labelText);
        labelWrapper.appendChild(label);
        body.appendChild(labelWrapper);

        /*if (errorFields) {
            // add error bar option
            let errorBarDDWrapper = GM.HF.createNewDiv('', '', ['errorbar-dropdown-wrapper', 'trace-card-element'], []);
            let errorBarLabel = GM.HF.createNewSpan('', '', ['errorbar-label'], [], 'Error Bar: ');
            let options = ['none'];
            let optionsText = ['-- None --'];
            errorFields.forEach(e => { optionsText.push(e.fieldName) });
            errorFields.forEach(e => { options.push(e.fieldName) });
            let errorBarDD = GM.HF.createNewSelect('', '', ['error-dropdown'], [], options, optionsText);
            errorBarDDWrapper.appendChild(errorBarLabel);
            errorBarDDWrapper.appendChild(errorBarDD);
            traceCard.appendChild(errorBarDDWrapper);
        }*/

        // Add Corresponding x-axis field dropdown
        /*let xFieldNameWrapper = GM.HF.createNewDiv('', '', ['xaxis-field-wrapper', 'trace-card-element'], []);
        let xFieldNameLabel = GM.HF.createNewSpan('', '', ['xaxis-field-label'], [], 'X Axis Field: ');
        let xFieldNameDD = GM.HF.createNewSelect('', '', ['xaxis-field-dropdown'], [], [], []);
        xFieldNameWrapper.appendChild(xFieldNameLabel);
        xFieldNameWrapper.appendChild(xFieldNameDD);
        traceCard.appendChild(xFieldNameWrapper);*/


        //-- Create positions options
        let positionOptionsWrapper = GM.HF.createNewDiv('', '', ['position-options-wrapper', 'trace-card-element'], []);
        // position option
        let positionOptions = this.#createPositionOptions(axisName.elementName);
        let positionOptionsLabel = GM.HF.createNewSpan('', '', ['position-options-label'], [], `Axis Position: `);
        let positionOptionsDropdown = GM.HF.createNewSelect('', '', ['position-options-dropdown'], [], positionOptions, positionOptions);
        positionOptionsWrapper.appendChild(positionOptionsLabel);
        positionOptionsWrapper.appendChild(positionOptionsDropdown);
        body.appendChild(positionOptionsWrapper);

        // offset option
        //let offsetOptionWrapper = GM.HF.createNewDiv('', '', ['offset-option-wrapper', 'trace-card-element'], []);
        // create range input here
        let offsetOptionRange = GM.HF.createNewRangeInputComponent('', '', ['offset-option-wrapper', 'trace-card-element'], [], 'Offset: ', 0, 50, 1, 0);
        body.appendChild(offsetOptionRange);

        //-- Create options
        let traceOptionsWrapper = GM.HF.createNewDiv('', '', ['trace-options-wrapper', 'trace-card-element'], []);
        //let optionsWrapper = GM.HF.createNewDiv('', '', ['options-wrapper'], []);

        // major gridlines option
        let gridLinesOption = GM.HF.createNewCheckbox('', '', ['major-gridlines', 'checkbox'], [], '', 'Major Grid Lines', true);
        traceOptionsWrapper.appendChild(gridLinesOption.wrapper);

        // minor gridlines option
        let minorTicksOption = GM.HF.createNewCheckbox('', '', ['minor-ticks', 'checkbox'], [{ style: 'margin-left', value: '22%' }], '', 'Ticks', false);
        traceOptionsWrapper.appendChild(minorTicksOption.wrapper);

        // minor gridlines option
        let minorGridLinesOption = GM.HF.createNewCheckbox('', '', ['minor-gridlines', 'checkbox'], [], '', 'Minor Grid Lines', false);
        traceOptionsWrapper.appendChild(minorGridLinesOption.wrapper);

        // inverse option
        let inverseOption = GM.HF.createNewCheckbox('', '', ['inverse', 'checkbox'], [{ style: 'margin-left', value: '22%' }], '', 'Inverse', false);
        traceOptionsWrapper.appendChild(inverseOption.wrapper);

        //traceOptionsWrapper.appendChild(optionsWrapper);
        body.appendChild(traceOptionsWrapper);

        traceCard.appendChild(body);
        return traceCard;
    }

    #createPositionOptions(axisName) {
        var positionOptions = [];
        if (axisName === 'xAxis') {
            positionOptions = ['top', 'bottom'];
        }
        else {
            positionOptions = ['left', 'right'];
        }
        return positionOptions;
    }

    #removeTraceFunction(button) {
        // for xaxis don't remove if tracecard is less than or equal to 1
        button.addEventListener('click', e => {
            let axis = e.target.closest('.axis-card-wrapper').getAttribute('id');
            let traceArea = e.target.closest('.trace-area');
            let traceCard = e.target.closest('.trace-card-wrapper');

            let numTraceCards = traceArea.querySelectorAll('.trace-card-wrapper');

            if (axis === 'xAxis' && numTraceCards.length <= 1) {
                // show error validation on the current traceCard
            }
            else {
                this.updateSeriesAxisOptions('remove', axis, traceCard);
                traceArea.removeChild(traceCard);
            }
        });
    }

    updateSeriesAxisOptions(action, axisName, axisTrace) {
        console.log(axisTrace);
        var axis = axisName.toLowerCase();
        var fieldName = axisTrace.getAttribute('id');
        var seriesCard = axisTrace.closest('.chart-axis-wrapper');
        var seriesTraces = seriesCard.querySelectorAll('.series-card-wrapper .trace-area .trace-card-wrapper');
        seriesTraces.forEach(t => {
            var dropdown = t.querySelector(`.${axis}-index-dropdown`);
            switch (action) {
                case 'add':
                    var index = dropdown.options.length;
                    GM.HF.addSelectOption(dropdown, { name: fieldName, value: index });
                    break;
                case 'remove':
                    const optionElement = Array.from(dropdown.options).find(option => option.textContent === fieldName);
                    GM.HF.removeSelectOption(dropdown, optionElement);
                    break;
            }
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                        OLD CODE                                                          //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** --- PRIVATE ---
     * Creates the HTML element for the axis card.
     * All of these arguments are HTML elements that are appended to the card.
     * @param {HTML p} title 
     * @param {HTML select} dropdown 
     * @param {HTML p} labelInput 
     * @param {HTML checkbox} gridCheckbox 
     * @param {HTML checkbox} tickCheckbox 
     * @param {HTML button} addTraceButton 
     * @param {function} addTraceFunction 
     * @param {HTML select} errorDropDown 
     */
    #createHTMLElement(title, dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        this.#createWrapper(title);
        this.#createTitleBarElement(title);
        this.#createDataField(dropdown, errorDropDown, addTraceButton);
        this.#createLabelField(labelInput);
        this.#createCheckboxField(gridCheckbox, tickCheckbox);
        this.#createAddTraceListener(addTraceFunction);
    }

    /** --- PRIVATE ---
     * Creates and stores the wrapper element
     */
    /*#createWrapper(title) {
        var elementId = title.replaceAll(' ', '-').toLowerCase();
        console.log(elementId);
        const wrapperElement = GM.HF.createNewDiv(`${elementId}-card-wrapper`, '', ['axis-card-wrapper'], []);
        this.storeElement('wrapperElement', wrapperElement);
    }*/

    /** --- PRIVATE ---
     * Creates the title bar elements, stores that element, and adds the title text to the html object
     * @param {string} title 
     */
    #createTitleBarElement(title) {
        const titleBarElement = GM.HF.createNewDiv('', '', ['axis-card-title-bar'], []);
        titleBarElement.innerHTML = title;
        this.storeElement('titleBar', titleBarElement);
        this.elementTable.get('wrapperElement').appendChild(titleBarElement);
    }

    /** --- PRIVATE ---
     * The data field is the area of the card where the user can chose which fields they wish to visualize with the chart
     * This function will create a wrapper, and add the buttons and dropdowns.
     * @param {HTML Select} dropdown 
     * @param {HTML Select} errorDropDown 
     * @param {HTML button} addTraceButton 
     */
    #createDataField(dropdown, errorDropDown, addTraceButton) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], []);
        const dropdownsWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-card-wrapper'], []);
        const dataCard = this.#createDropDownCard('Data', dropdown);
        dropdownsWrapper.appendChild(dataCard);
        if (errorDropDown) {
            const errorCard = this.#createDropDownCard('Error', errorDropDown);
            errorCard.classList.add('axis-card-dropdown-card-errordd');
            dropdownsWrapper.appendChild(errorCard);
        }
        wrapper.appendChild(dropdownsWrapper);
        wrapper.appendChild(addTraceButton);
        this.storeElement('dataFieldWrapper', wrapper);
        this.storeElement('addTraceButton', addTraceButton);
        this.storeElement('lastDropdown', dropdownsWrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    /** -- PRIVATE ---
     * Each dropdown consists of a label, the header text. The text and the dropdown are created together.
     * @param {string} header 
     * @param {HTML Select} dropdown 
     * @returns the html container of this mini card
     */
    #createDropDownCard(header, dropdown) {
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], []);
        const headerText = GM.HF.createNewParagraph('', '', [], [], header);
        dropDownWrapper.appendChild(headerText);
        dropDownWrapper.appendChild(dropdown);
        return dropDownWrapper;
    }

    /** --- PRIVATE ---
     * Used when there is no label for the dropdown (ie. When an additional trace is added)
     * @param {HTML Select} dropdown 
     * @returns the container of the mini card
     */
    #createDropDownCardNoText(dropdown) {
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], []);
        dropDownWrapper.appendChild(dropdown);
        return dropDownWrapper;
    }


    /** --- PRIVATE ---
     * Attaches the input field for user created label names
     * @param {HTML Input} labelInput 
     */
    #createLabelField(labelInput) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], []);
        const header = GM.HF.createNewParagraph('', '', [], [], 'Label');
        wrapper.appendChild(header);
        wrapper.appendChild(labelInput);
        this.storeElement('labelFieldWrapper', wrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    /** --- PRIVATE ---
     * Adds the checkboxes for selecting grid lines and ticks
     * @param {HTML checkbox} gridCheckbox 
     * @param {HTML checkbox} tickCheckbox 
     */
    #createCheckboxField(gridCheckbox, tickCheckbox) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper', 'justify-left'], []);
        wrapper.appendChild(gridCheckbox);
        wrapper.appendChild(tickCheckbox);
        this.storeElement('labelFieldWrapper', wrapper);
        this.elementTable.get('wrapperElement').appendChild(wrapper);
    }

    /** --- PUBLIC ---
     * Adds a new trace dropdown and error dropdown when user clicks add trace button
     * @param {HTML Select} dropdown 
     * @param {HTML Select} errorDropdown 
     */
    addTraceDropdown(dropdown, errorDropdown) {
        const dropdownsWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-card-wrapper'], []);
        dropdownsWrapper.appendChild(this.#createDropDownCardNoText(dropdown));
        dropdownsWrapper.appendChild(this.#createDropDownCardNoText(errorDropdown));
        this.elementTable.get('lastDropdown').after(dropdownsWrapper);
        this.elementTable.set('lastDropdown', dropdownsWrapper);
    }

    /** --- PRIVATE ---
     * Link the trace button to the Output Module
     * @param {function} fn This function fires when add trace is selected. It links the dropdowns to the 
     *                      card so that the chart data storage will be updated. 
     */
    #createAddTraceListener(fn) {
        this.elementTable.get('addTraceButton').addEventListener('click', fn);
    }

    /** --- PUBLIC ---
     * @returns the HTML wrapper containing all child nodes. */
    //getCard = () => this.elementTable.get('wrapperElement');

    storeElement(key, value) {
        this.elementTable.set(key, value);
    }

    getCard() {
        return { card: this, wrapper: this.#wrapper, content: this.#axisContent, fieldDropdown: this.#fieldDropdown, traceArea: this.#traceArea, addTraceButton: this.#addTraceButton };
    }
}

export class XAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        super(dropdown, labelInput, 'X Axis', gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown);
    }
}

export class YAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown) {
        super(dropdown, labelInput, 'Y Axis', gridCheckbox, tickCheckbox, addTraceButton, addTraceFunction, errorDropDown);
    }
}

export class ZAxisCard extends AxisCard {
    constructor(dropdown, labelInput, gridCheckbox, tickCheckbox, addTraceButton, errorDropDown) {
        super(dropdown, labelInput, 'Z Axis', gridCheckbox, tickCheckbox, addTraceButton, errorDropDown);
    }
}



