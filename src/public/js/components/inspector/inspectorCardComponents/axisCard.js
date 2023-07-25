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
        if (fields) {
            // create content wrapper
            var contentWrapper = GM.HF.createNewDiv('', '', ['axis-content-wrapper'], []);

            var fieldsWrapper = GM.HF.createNewDiv('', '', ['fields-wrapper'], []);
            // create dropdown wrapper
            var options = { "---- None ----": "none" };
            // foreach field, create a dropdown and a label input

            // sort fields by the default selection then the name
            fields.forEach(field => {
                if (field.fieldName) {
                    options[field.displayName] = field.fieldName;
                }
            });
            this.#fieldDropdown = GM.HF.createNewSelect('', '', ['fields-dropdown'], [{ style: "width", value: "70%" }, { style: "height", value: "25px" }], Object.values(options), Object.keys(options));
            this.#addTraceButton = GM.HF.createNewButton(`${axisName.elementName}-add-trace-button`, '', ['button', 'add-trace-button'], [{ style: "width", value: "30%" }, { style: "height", value: "25px" }], 'button', 'Add Trace', false);
            fieldsWrapper.appendChild(this.#fieldDropdown);
            fieldsWrapper.appendChild(this.#addTraceButton);

            // create trace area (table with removeable items? add error dropdown here if any?)
            this.#traceArea = GM.HF.createNewDiv('', '', ['trace-area'], []);

            // add default fields
            if (defaultField) {
                // prepare field value and text for creating a trace card
                var field = { value: defaultField.fieldName, text: defaultField.displayName };

                /////////////////////// TODO: add error default if exists (in yaxis)
            }
            // otherwise choose the first field of the 'fields'
            else {
                var field = { value: fields[0].fieldName, text: fields[0].displayName };
            }
            this.#createTraceCard(field, this.#traceArea);

            // label input for the added trace.. other options for the chart
            contentWrapper.appendChild(fieldsWrapper);
            contentWrapper.appendChild(this.#traceArea);

            this.#axisContent = contentWrapper;

            this.#addTraceFunction();
        }
        else {
            // show error there are no fields to load
        }
    }
    
    /** Creates a Trace Card in the axis card.
     * @param {field object} field object consists of value and text of the field to be added as a trace card.
     * @param {traceArea HTML DOM} traceArea is an HTML object for the trace card to be added to.
     * */
    #createTraceCard(field, traceArea) {
        if (field.value !== "none") {
            // create card entry
            let traceCard = GM.HF.createNewDiv(field.value, '', ['trace-card-wrapper'], []);
            let header = GM.HF.createNewDiv('', '', ['trace-card-header'], []);
            let headerText = GM.HF.createNewSpan('', '', ['text'], [], field.text);
            let removeBtn = GM.HF.createNewIMG('', '', './images/icons/delete_1.png', ['remove-button', 'button'], [], '');
            header.appendChild(headerText);
            header.appendChild(removeBtn);
            traceCard.appendChild(header);
            traceArea.appendChild(traceCard);

            // add removeFunction
            this.#removeTraceFunction(removeBtn);

            let labelWrapper = GM.HF.createNewDiv('', '', ['label-wrapper'], []);
            let labelText = GM.HF.createNewSpan('', '', ['label-text'], [], 'Label Name: ');
            let label = GM.HF.createNewTextInput('', '', ['label-input'], [], 'text', false);
            label.value = field.text;
            // add label text here
            labelWrapper.appendChild(labelText);
            labelWrapper.appendChild(label);
            traceCard.appendChild(labelWrapper);

            let optionsWrapper = GM.HF.createNewDiv('', '', ['options-wrapper'], []);
            let gridLinesOption = GM.HF.createNewCheckbox('', '', ['options-gridlines'], [], '', 'Grid Lines', false);
            let ticksOption = GM.HF.createNewCheckbox('', '', ['options-ticks'], [], '', 'Ticks', false);
            optionsWrapper.appendChild(gridLinesOption.wrapper);
            optionsWrapper.appendChild(ticksOption.wrapper);
            traceCard.appendChild(optionsWrapper);
        }
    }


    #addTraceFunction() {
        const button = this.#addTraceButton;
        button.addEventListener('click', e => {
            // get dropdown selection
            let dropdown = e.target.previousElementSibling;
            let selected = dropdown.options[dropdown.selectedIndex];
            let traceArea = e.target.closest('.axis-content-wrapper').querySelector('.trace-area');

            // check if the field is already in there
            // if it is, display error message
            //var exists = traceArea.querySelector(`#${selected.value}`);
            if (selected.value !== 'none') {
                // create card entry
                this.#createTraceCard(selected, traceArea);
            }
            /*else {
                let errorMessageWrapper = GM.HF.createNewDiv('', '', ['add-trace-error-wrapper'], []);
                let errorMessage = GM.HF.createNewSpan('', '', ['add-trace-error'], [{ style: "color", value: "red" }], 'The field has already been selected');
                errorMessageWrapper.appendChild(errorMessage);
                traceArea.appendChild(errorMessageWrapper);
            }*/


        });
    }

    #removeTraceFunction(button) {
        button.addEventListener('click', e => {
            let traceArea = e.target.closest('.trace-area');
            let traceCard = e.target.closest('.trace-card-wrapper');
            traceArea.removeChild(traceCard);
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
        return { card: this, wrapper: this.#wrapper, content: this.#axisContent, fieldDropdown: this.#fieldDropdown, addTraceButton: this.#addTraceButton };
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



