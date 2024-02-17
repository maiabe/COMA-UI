/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { GM } from "../../../main.js";

export class AxisCard {

    #wrapper;
    #axisTypeInfo;
    #axisHeader;
    #axisContent;
    #axisDropdown;
    #axisArea;
    #addAxisButton;

    axisCards;

    /** Creates an axis card for Chart Module inspector card.
     * @param { moduleKey } Number key of the module
     * @param { axisTypeInfo } Object consists of name, displayName, and activeTab information of this axisCard
     *                            (e.g. { name: 'xAxis', displayName: 'X Axis', activeTab: true })
     * @param { axes } Array of objects with name, displayName and dataType information
     *                      (e.g. [{ name: 'iso_date_mjd', displayName: 'ISO Date', dataType: 'time' }, ..])
     * @param { defaultAxis } Object that consists of name, displayName and dataType information of a specified default axis.
     *                               defaultAxis will be an undefined object if it is not set for the current datasetType
     *                               (e.g. { name: 'mag', displayName: 'magnitude', dataType: 'value' })
     */
    constructor(moduleKey, axisTypeInfo, axes, defaultAxis) {
        this.#axisTypeInfo = axisTypeInfo;
        this.#createElements(moduleKey, axisTypeInfo, axes, defaultAxis);
        this.#buildCard();
        this.#addAxisFunction(axisTypeInfo.name, axes);
    }

    #createElements(moduleKey, axisTypeInfo, axes, defaultAxis) {
        this.#createWrapper(moduleKey, axisTypeInfo);
        //this.#createHeader(axisName);
        this.#createContent(axisTypeInfo, axes, defaultAxis);
    }

    #buildCard() {
        //this.#wrapper.appendChild(this.#axisHeader);
        this.#wrapper.appendChild(this.#axisContent);
    }

    #createWrapper(moduleKey, axisTypeInfo) {
        this.#wrapper = GM.HF.createNewDiv(`${axisTypeInfo.name}-${moduleKey}`, axisTypeInfo.name, ['axis-tab-content', 'tab-content'], [], [], '');
        if (axisTypeInfo.activeTab) {
            this.#wrapper.classList.add('active');
        }
    }

    // create header
    #createHeader(axisTypeInfo) {
        const axisCardHeader = GM.HF.createNewDiv('', '', ['axis-card-header', 'header'], [], [], '');
        axisCardHeader.innerHTML = axisTypeInfo.displayName;
        this.#wrapper.appendChild(axisCardHeader);
        this.#axisHeader = axisCardHeader;
    }

    // create content --> dropdowns & labels & (other chart options) & addTrace button for each field (add function to addTrace button)
    #createContent(axisTypeInfo, axes, defaultAxis) {
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
            let axis = axes[0];
            if (defaultAxis) {
                axis = axes.filter(a => a.name === defaultAxis.name)[0];
            }
            this.#createAxisCard(axisTypeInfo.name, axis);

            // label input for the added trace.. other options for the chart
            contentWrapper.appendChild(axesWrapper);
            contentWrapper.appendChild(this.#axisArea);

            this.#axisContent = contentWrapper;
        }
        else {
            // show error there are no fields to load
        }
    }


    #addAxisFunction(axisType, axes) {
        const button = this.#addAxisButton;
        button.addEventListener('click', e => {
            //-- Get the selected axis option
            const dropdown = e.target.previousElementSibling;
            const selected = dropdown.options[dropdown.selectedIndex];
            const selectedAxis = axes.filter(a => a.name === selected.value)[0];
            //-- Create new Axis Card
            if (selected.value !== 'none') {
                const axisCard = this.#createAxisCard(axisType, selectedAxis);
                if (axisType == 'yAxis' && axisCard) {
                    //-- Update Axis reference options in Series cards
                    this.updateSeriesAxisOptions('add', axisCard);
                }
            }
        });
    }


    /** Creates an Axis Card in the axis area
     * @param { axisType } String indicates the type of axis (e.g. xAxis or yAxis)
     * @param { axis } Object that consists of axis information for the axisCard to be created
     * */
    #createAxisCard(axisType, axis) {
        //console.log(axis);
        var axisArea = this.#axisArea;
        console.log(axisArea);

        //-- Check number of axis cards loaded already and if the target axis card exists already
        const numAxis = axisArea.children.length;
        const axisExists = axisArea.querySelector(`#${axis.name}`);

        if ((numAxis < 4) && (axisExists === null)) {

            //-- Create traceCard content
            const axisCard = GM.HF.createNewDiv(axis.name, '', ['axis-card-wrapper'], [], [], '');

            //-- Create traceCard header
            const header = GM.HF.createNewDiv('', '', ['axis-card-header'], [], [], '');
            const axisTitle = GM.HF.createNewSpan('', 'axis-title', ['axis-title'], [], axis.name);
            const axisDataType = GM.HF.createNewTextInput('', '', ['data-type'], [], 'hidden', axis.dataType);
            const removeBtn = GM.HF.createNewIMG('', '', './images/icons/delete-icon.png', ['remove-button', 'button'], [], '');
            header.appendChild(axisTitle);
            header.appendChild(axisDataType);
            //header.appendChild(removeBtn);
            axisCard.appendChild(removeBtn);
            axisCard.appendChild(header);
            axisArea.appendChild(axisCard);

            //-- Set primary xAxis 
            if (axisType == 'xAxis') {
                if (numAxis == 0) {
                    axisCard.classList.add('primary');
                }
                //const axisCardHeader = axisCard.querySelector('.axis-card-header');
                //-- Add event listner on click, switch primary xAxis
                header.style.cursor = 'pointer';
                header.addEventListener('click', (e) => {
                    const currentCard = e.target.closest('.axis-card-wrapper');
                    // remove primary class from current primary xAxis
                    const currentPrimary = axisArea.querySelector('.axis-card-wrapper.primary');
                    currentPrimary.classList.remove('primary');
                    // add primary class to the clicked axisCard
                    currentCard.classList.add('primary');
                    // update xAxisRef of currently loaded series cards
                    const xAxisIndex = Array.from(axisArea.children).indexOf(currentCard);
                    this.updateSeriesAxisOptions('update', currentCard, xAxisIndex);
                });
            }

            //-- Create removeFunction for this card
            this.#removeAxisFunction(axisType, removeBtn);

            const axisBody = GM.HF.createNewDiv('', '', ['axis-card-body'], [], [], '');

            //-- Create axis label input
            const labelWrapper = GM.HF.createNewDiv('', '', ['label-wrapper', 'axis-card-element'], [], [], '');
            const labelText = GM.HF.createNewSpan('', '', ['label-text'], [], `Label Name: `);
            const label = GM.HF.createNewTextInput('', '', ['label-input'], [], 'text', false);
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
            const axisPosWrapper = GM.HF.createNewDiv('', '', ['axis-position-wrapper', 'axis-card-element'], [], [], '');
            // position option
            const axisPosOptions = this.#createPositionOptions(axisType);
            const axisPosLabel = GM.HF.createNewSpan('', '', ['axis-position-label'], [], `Axis Position: `);
            const axisPosDD = GM.HF.createNewSelect('', '', ['axis-position-dropdown'], [], axisPosOptions, axisPosOptions);
            const axisIndex = Array.from(axisArea.children).indexOf(axisCard);
            const axisPosIndex = axisIndex % axisPosOptions.length; // alternate axis position selection
            axisPosDD.selectedIndex = axisPosIndex;
            axisPosWrapper.appendChild(axisPosLabel);
            axisPosWrapper.appendChild(axisPosDD);
            axisBody.appendChild(axisPosWrapper);

            //-- Create tick position options
            const tickPosWrapper = GM.HF.createNewDiv('', '', ['tick-position-wrapper', 'axis-card-element'], [], [], '');
            // position option
            const tickPosOptions = ['outside', 'inside'];
            const tickPosLabel = GM.HF.createNewSpan('', '', ['tick-position-label'], [], `Tick Position: `);
            const tickPosDD = GM.HF.createNewSelect('', '', ['tick-position-dropdown'], [], tickPosOptions, tickPosOptions);
            tickPosWrapper.appendChild(tickPosLabel);
            tickPosWrapper.appendChild(tickPosDD);
            axisBody.appendChild(tickPosWrapper);

            // offset option
            //let offsetOptionWrapper = GM.HF.createNewDiv('', '', ['offset-option-wrapper', 'trace-card-element'], [], [], '');
            // create range input here
            const offsetOptionRange = GM.HF.createNewRangeInputComponent('', '', ['offset-option-wrapper', 'axis-card-element'], [], 'Offset: ', -50, 50, 1, 0);
            axisBody.appendChild(offsetOptionRange);

            //-- Create options
            const axisOptionsWrapper = GM.HF.createNewDiv('', '', ['axis-options-wrapper', 'axis-card-element'], [], [], '');
            //let optionsWrapper = GM.HF.createNewDiv('', '', ['options-wrapper'], [], [], '');

            // major gridlines option
            const gridLinesOption = GM.HF.createNewCheckbox('', '', ['major-gridlines', 'checkbox'], [], '', 'Major Grid Lines', false);
            axisOptionsWrapper.appendChild(gridLinesOption.wrapper);

            // ticks option
            const ticksOption = GM.HF.createNewCheckbox('', '', ['axis-ticks', 'checkbox'], [{ style: 'margin-left', value: '22%' }], '', 'Ticks', true);
            axisOptionsWrapper.appendChild(ticksOption.wrapper);

            // minor gridlines option
            const minorGridLinesOption = GM.HF.createNewCheckbox('', '', ['minor-gridlines', 'checkbox'], [], '', 'Minor Grid Lines', false);
            axisOptionsWrapper.appendChild(minorGridLinesOption.wrapper);

            // inverse option
            let inverseChecked = false;
            if (axis.name.includes('mag') && axis.dataType === 'value') {
                inverseChecked = true;
            }
            let inverseOption = GM.HF.createNewCheckbox('', '', ['inverse', 'checkbox'], [{ style: 'margin-left', value: '22%' }], '', 'Inverse', inverseChecked);
            axisOptionsWrapper.appendChild(inverseOption.wrapper);

            axisBody.appendChild(axisOptionsWrapper);
            axisCard.appendChild(axisBody);

            //-- Update Axis reference options in Series cards
            //this.updateSeriesAxisOptions('add', axisContentName, axisCard);

            return axisCard;
        }

        console.log('ERR_MESSAGE ------------------- 2 axis is loaded already, or axis card already exists');
        return null;
    }

    //-- Creates options array for axis position configuration
    #createPositionOptions(axisTypeName) {
        let positionOptions = [];
        if (axisTypeName === 'xAxis') {
            positionOptions = ['bottom', 'top'];
        }
        else {
            positionOptions = ['left', 'right'];
        }
        return positionOptions;
    }

    /**
     * Removes the axisCard from axis area
     * @param { axisType } String indicates the type of axis (e.g. xAxis or yAxis)
     * @param { button } HTMLObject of the remove button
     * */
    #removeAxisFunction(axisType, button) {
        button.addEventListener('click', e => {
            const axisArea = e.target.closest('.axis-area');
            const axisCard = e.target.closest('.axis-card-wrapper');
            const numAxisCards = axisArea.querySelectorAll('.axis-card-wrapper');

            // Don't remove axisCard if there is only one left in axisArea
            if (numAxisCards.length > 1) {
                axisArea.removeChild(axisCard);
                // Update Primary
                if (axisType == 'xAxis' && axisCard.classList.contains('primary')) {
                    const newPrimaryAxisCard = axisArea.querySelector('.axis-card-wrapper');
                    newPrimaryAxisCard.classList.add('primary');
                    // update xAxisRef of currently loaded series cards
                    const xAxisIndex = Array.from(axisArea.children).indexOf(newPrimaryAxisCard);
                    this.updateSeriesAxisOptions('update', newPrimaryAxisCard, xAxisIndex);
                }
                //-- Update the yaxis reference dropdown in series content
                if (axisType == 'yAxis') {
                    this.updateSeriesAxisOptions('remove', axisCard);
                }
            }
        });
    }


    /** 
     *  Updates the Series Axis Reference Options in the series content
     *  If the action is to 'add' an axis, the name of the axis will be added to the axis reference dropdown in series content
     *  If the action is to 'remove' an axis, the name of the axis will be removed from the axis reference dropdown in series content
     *  @param { action } String of the action to add or remove an axis from axisArea
     *  @param { axisCard } HTMLObject of the axisCard added/removed from axisArea
     *  @param { xAxisIndex } Number of the index of axisCard in axisArea
     * */
    updateSeriesAxisOptions(action, axisCard, xAxisIndex) {
        console.log(action);
        console.log(axisCard);
        const axisName = axisCard.getAttribute('id'); // xaxis or yaxis
        const inspectorWrapper = axisCard.closest('.chart-tabs-wrapper');
        console.log(inspectorWrapper);
        //-- Select corresponding seriesCards and add/remove from axis reference dropdown
        const seriesCards = inspectorWrapper ? inspectorWrapper.querySelectorAll('.series-tab-content .series-card-area .series-card-wrapper') : [];
        if (seriesCards.length > 0) {
            seriesCards.forEach(seriesCard => {
                const dropdown = seriesCard.querySelector(`.yaxis-index-dropdown`);
                switch (action) {
                    case 'add':
                        var index = dropdown.options.length;
                        GM.HF.addSelectOption(dropdown, { name: axisName, value: index });
                        break;
                    case 'remove':
                        const optionElement = Array.from(dropdown.options).find(option => option.textContent === axisName);
                        GM.HF.removeSelectOption(dropdown, optionElement);
                        break;
                    case 'update':
                        const xAxisIndexRef = seriesCard.querySelector('.xaxis-index-ref');
                        const xAxisIndexInput = xAxisIndexRef.nextElementSibling;
                        //GM.HF.updateSpanText(xAxisIndexRef, axisName);
                        xAxisIndexRef.textContent = axisName;
                        xAxisIndexInput.value = xAxisIndex;
                }
            });
        }

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
            card: this, wrapper: this.#wrapper, content: this.#axisContent, axisTypeInfo: this.#axisTypeInfo,
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


