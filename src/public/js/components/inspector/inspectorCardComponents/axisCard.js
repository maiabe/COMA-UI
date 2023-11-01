/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { GM } from "../../../main.js";

export class AxisCard {

    #wrapper;
    #axisContentInfo;
    #axisHeader;
    #axisContent;
    #axisDropdown;
    #axisArea;
    #addAxisButton;

    axisCards;

    /** Creates an axis card for Chart Module inspector card.
     * @param { moduleKey } Number key of the module
     * @param { axisContentInfo } Object consists of name, displayName, and activeTab information of this axisCard
     *                            (e.g. { name: 'xAxis', displayName: 'X Axis', activeTab: true })
     * @param { axes } Array of objects with name, displayName and dataType information
     *                      (e.g. [{ name: 'iso_date_mjd', displayName: 'ISO Date', dataType: 'time' }, ..])
     * @param { defaultAxis } Object that consists of name, displayName and dataType information of a specified default axis.
     *                               defaultAxis will be an undefined object if it is not set for the current datasetType
     *                               (e.g. { name: 'mag', displayName: 'magnitude', dataType: 'value' })
     */
    constructor(moduleKey, axisContentInfo, axes, defaultAxis) {
        this.#axisContentInfo= axisContentInfo;
        this.#createElements(moduleKey, axisContentInfo, axes, defaultAxis);
        this.#buildCard();
        this.#addAxisFunction(axisContentInfo.name, axes);
    }

    #createElements(moduleKey, axisContentInfo, axes, defaultAxis) {
        this.#createWrapper(moduleKey, axisContentInfo);
        //this.#createHeader(axisName);
        this.#createContent(axisContentInfo, axes, defaultAxis);
    }

    #buildCard() {
        //this.#wrapper.appendChild(this.#axisHeader);
        this.#wrapper.appendChild(this.#axisContent);
    }

    #createWrapper(moduleKey, axisContentInfo) {
        this.#wrapper = GM.HF.createNewDiv(`${axisContentInfo.name}-${moduleKey}`, axisContentInfo.name, ['axis-tab-content', 'tab-content'], [], [], '');
        if (axisContentInfo.activeTab) {
            this.#wrapper.classList.add('active');
        }
    }

    // create header
    #createHeader(axisContentInfo) {
        const axisCardHeader = GM.HF.createNewDiv('', '', ['axis-card-header', 'header'], [], [], '');
        axisCardHeader.innerHTML = axisContentInfo.displayName;
        this.#wrapper.appendChild(axisCardHeader);
        this.#axisHeader = axisCardHeader;
    }

    // create content --> dropdowns & labels & (other chart options) & addTrace button for each field (add function to addTrace button)
    #createContent(axisContentInfo, axes, defaultAxis) {
        //console.log(axes);
        //console.log(defaultAxis);
        //console.log(errorFields);
        if (axes) {
            // create content wrapper
            var contentWrapper = GM.HF.createNewDiv('', '', ['axis-content-wrapper'], [], [], '');

            var axesWrapper = GM.HF.createNewDiv('', '', ['axes-dropdown-wrapper'], [], [], '');
            // create dropdown wrapper
            var options = { "none": "---- Select ----" };
            // foreach field, create a dropdown and a label input

            // sort fields by the default selection then the name
            axes.forEach(axis => {
                if (axis.name) {
                    options[axis.name] = axis.displayName;
                }
            });
            this.#axisDropdown = GM.HF.createNewSelect('', '', ['axes-dropdown'], [], Object.keys(options), Object.values(options));
            this.#addAxisButton = GM.HF.createNewButton(`add-axis-button`, '', ['button', 'add-axis-button'], [], 'button', 'Add Axis', false);
            axesWrapper.appendChild(this.#axisDropdown);
            axesWrapper.appendChild(this.#addAxisButton);

            // create trace area (table with removeable items? add error dropdown here if any?)
            this.#axisArea = GM.HF.createNewDiv('', '', ['axis-area'], [], [], '');

            // add default traceCard
            var axis = axes[0];
            if (defaultAxis) {
                axis = axes.filter(a => a.name === defaultAxis.name)[0];
            }
            this.#createAxisCard(axisContentInfo.name, axis);

            // label input for the added trace.. other options for the chart
            contentWrapper.appendChild(axesWrapper);
            contentWrapper.appendChild(this.#axisArea);

            this.#axisContent = contentWrapper;
        }
        else {
            // show error there are no fields to load
        }
    }


    #addAxisFunction(axisContentName, axes) {
        //console.log(axes);
        const button = this.#addAxisButton;
        button.addEventListener('click', e => {
            //-- Get the selected axis option
            let dropdown = e.target.previousElementSibling;
            let selected = dropdown.options[dropdown.selectedIndex];
            let selectedAxis = axes.filter(a => a.name === selected.value)[0];
            //-- Create new Axis Card
            if (selected.value !== 'none') {
                var axisCard = this.#createAxisCard(axisContentName, selectedAxis);
                //-- Update Axis reference options in Series cards
                this.updateSeriesAxisOptions('add', axisContentName, axisCard);
            }
        });
    }


    /** Creates an Axis Card in the axis area
     * @param { axisName } Object that consists of elementId and displayName of the axisCard
     * @param { axis } Object that consists of axis information for the axisCard to be created
     * */
    #createAxisCard(axisContentName, axis) {
        //console.log(axis);
        var axisArea = this.#axisArea;

        //-- Create traceCard content
        let axisCard = GM.HF.createNewDiv(axis.name, '', ['axis-card-wrapper'], [], [], '');

        //-- Create traceCard header
        let header = GM.HF.createNewDiv('', '', ['axis-card-header'], [], [], '');
        let axisTitle = GM.HF.createNewSpan('', 'axis-title', ['axis-title'], [], axis.name);
        let axisDataType = GM.HF.createNewTextInput('', '', ['data-type'], [], 'hidden', axis.dataType);
        let removeBtn = GM.HF.createNewIMG('', '', './images/icons/delete-icon.png', ['remove-button', 'button'], [], '');
        header.appendChild(axisTitle);
        header.appendChild(axisDataType);
        header.appendChild(removeBtn);
        axisCard.appendChild(header);
        axisArea.appendChild(axisCard);

        //-- Create removeFunction for this
        this.#removeAxisFunction(removeBtn);

        let axisBody = GM.HF.createNewDiv('', '', ['axis-card-body'], [], [], '');


        //-- Create axis label input
        let labelWrapper = GM.HF.createNewDiv('', '', ['label-wrapper', 'axis-card-element'], [], [], '');
        let labelText = GM.HF.createNewSpan('', '', ['label-text'], [], `Label Name: `);
        let label = GM.HF.createNewTextInput('', '', ['label-input'], [], 'text', false);
        label.value = axis.name;
        labelWrapper.appendChild(labelText);
        labelWrapper.appendChild(label);
        axisBody.appendChild(labelWrapper);

        /*if (errorFields) {
            // add error bar option
            let errorBarDDWrapper = GM.HF.createNewDiv('', '', ['errorbar-dropdown-wrapper', 'trace-card-element'], [], [], '');
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
        /*let xFieldNameWrapper = GM.HF.createNewDiv('', '', ['xaxis-field-wrapper', 'trace-card-element'], [], [], '');
        let xFieldNameLabel = GM.HF.createNewSpan('', '', ['xaxis-field-label'], [], 'X Axis Field: ');
        let xFieldNameDD = GM.HF.createNewSelect('', '', ['xaxis-field-dropdown'], [], [], []);
        xFieldNameWrapper.appendChild(xFieldNameLabel);
        xFieldNameWrapper.appendChild(xFieldNameDD);
        traceCard.appendChild(xFieldNameWrapper);*/


        //-- Create positions options
        let positionOptionsWrapper = GM.HF.createNewDiv('', '', ['position-options-wrapper', 'axis-card-element'], [], [], '');
        // position option
        let positionOptions = this.#createPositionOptions(axisContentName.name);
        let positionOptionsLabel = GM.HF.createNewSpan('', '', ['position-options-label'], [], `Axis Position: `);
        let positionOptionsDropdown = GM.HF.createNewSelect('', '', ['position-options-dropdown'], [], positionOptions, positionOptions);
        positionOptionsWrapper.appendChild(positionOptionsLabel);
        positionOptionsWrapper.appendChild(positionOptionsDropdown);
        axisBody.appendChild(positionOptionsWrapper);

        // offset option
        //let offsetOptionWrapper = GM.HF.createNewDiv('', '', ['offset-option-wrapper', 'trace-card-element'], [], [], '');
        // create range input here
        let offsetOptionRange = GM.HF.createNewRangeInputComponent('', '', ['offset-option-wrapper', 'axis-card-element'], [], 'Offset: ', 0, 50, 1, 0);
        axisBody.appendChild(offsetOptionRange);

        //-- Create options
        let axisOptionsWrapper = GM.HF.createNewDiv('', '', ['axis-options-wrapper', 'axis-card-element'], [], [], '');
        //let optionsWrapper = GM.HF.createNewDiv('', '', ['options-wrapper'], [], [], '');

        // major gridlines option
        let gridLinesOption = GM.HF.createNewCheckbox('', '', ['major-gridlines', 'checkbox'], [], '', 'Major Grid Lines', true);
        axisOptionsWrapper.appendChild(gridLinesOption.wrapper);

        // minor gridlines option
        let minorTicksOption = GM.HF.createNewCheckbox('', '', ['minor-ticks', 'checkbox'], [{ style: 'margin-left', value: '22%' }], '', 'Ticks', false);
        axisOptionsWrapper.appendChild(minorTicksOption.wrapper);

        // minor gridlines option
        let minorGridLinesOption = GM.HF.createNewCheckbox('', '', ['minor-gridlines', 'checkbox'], [], '', 'Minor Grid Lines', false);
        axisOptionsWrapper.appendChild(minorGridLinesOption.wrapper);

        // inverse option
        var inverseChecked = false;
        if (axis.name.includes('mag') && axis.dataType === 'value') {
            inverseChecked = true;
        }
        let inverseOption = GM.HF.createNewCheckbox('', '', ['inverse', 'checkbox'], [{ style: 'margin-left', value: '22%' }], '', 'Inverse', inverseChecked);
        axisOptionsWrapper.appendChild(inverseOption.wrapper);

        axisBody.appendChild(axisOptionsWrapper);

        axisCard.appendChild(axisBody);
        return axisCard;
    }

    //-- Creates options array for axis position configuration
    #createPositionOptions(axisContentName) {
        var positionOptions = [];
        if (axisContentName === 'xAxis') {
            positionOptions = ['bottom', 'top'];
        }
        else {
            positionOptions = ['left', 'right'];
        }
        return positionOptions;
    }

    #removeAxisFunction(button) {
        // for xaxis don't remove if axisCard is less than or equal to 1
        button.addEventListener('click', e => {
            let axisContentName = e.target.closest('.axis-tab-content').getAttribute('name');
            let axisArea = e.target.closest('.axis-area');
            let axisCard = e.target.closest('.axis-card-wrapper');

            let numAxisCards = axisArea.querySelectorAll('.axis-card-wrapper');

            if (numAxisCards.length <= 1) {
                // Don't remove axisCard if there is only one left in axisArea
            }
            else {
                //-- Update the axis reference dropdown in series content
                this.updateSeriesAxisOptions('remove', axisContentName, axisCard);
                axisArea.removeChild(axisCard);
            }
        });
    }


    /** 
     *  Updates the Series Axis Reference Options in the series content
     *  If the action is to 'add' an axis, the name of the axis will be added to the axis reference dropdown in series content
     *  If the action is to 'remove' an axis, the name of the axis will be removed from the axis reference dropdown in series content
     *  @param { action } String of the action to add or remove an axis from axisArea
     *  @param { axisContentName } String of the axis content name, either xAxis or yAxis
     *  @param { axisCard } HTMLObject of the axisCard added/removed from axisArea
     * */
    updateSeriesAxisOptions(action, axisContentName, axisCard) {
        const axisName = axisCard.getAttribute('id'); // xaxis or yaxis
        const inspectorWrapper = axisCard.closest('.chart-inspector-wrapper');
        //-- Select corresponding seriesCards and add/remove from axis reference dropdown
        const seriesCards = inspectorWrapper.querySelectorAll('.series-tab-content .series-area .series-card-wrapper');
        seriesCards.forEach(seriesCard => {
            const dropdown = seriesCard.querySelector(`.${axisContentName.toLowerCase()}-index-dropdown`);
            switch (action) {
                case 'add':
                    var index = dropdown.options.length;
                    GM.HF.addSelectOption(dropdown, { name: axisName, value: index });
                    break;
                case 'remove':
                    const optionElement = Array.from(dropdown.options).find(option => option.textContent === axisName);
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
        const wrapperElement = GM.HF.createNewDiv(`${elementId}-card-wrapper`, '', ['axis-card-wrapper'], [], [], '');
        this.storeElement('wrapperElement', wrapperElement);
    }*/

    /** --- PRIVATE ---
     * Creates the title bar elements, stores that element, and adds the title text to the html object
     * @param {string} title 
     */
    #createTitleBarElement(title) {
        const titleBarElement = GM.HF.createNewDiv('', '', ['axis-card-title-bar'], [], [], '');
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
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], [], [], '');
        const dropdownsWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-card-wrapper'], [], [], '');
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
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], [], [], '');
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
        const dropDownWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-wrapper'], [], [], '');
        dropDownWrapper.appendChild(dropdown);
        return dropDownWrapper;
    }


    /** --- PRIVATE ---
     * Attaches the input field for user created label names
     * @param {HTML Input} labelInput 
     */
    #createLabelField(labelInput) {
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper'], [], [], '');
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
        const wrapper = GM.HF.createNewDiv('', '', ['axis-card-label-field-wrapper', 'justify-left'], [], [], '');
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
        const dropdownsWrapper = GM.HF.createNewDiv('', '', ['axis-card-dropdown-card-wrapper'], [], [], '');
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
        return {
            card: this, wrapper: this.#wrapper, content: this.#axisContent, axisContentInfo: this.#axisContentInfo,
            axisDropdown: this.#axisDropdown, axisArea: this.#axisArea, addAxisButton: this.#addAxisButton
        };
    }
}
/*
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
*/


