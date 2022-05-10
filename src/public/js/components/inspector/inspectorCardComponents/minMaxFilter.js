import { GM } from "../../../main.js";

export class MinMaxFilter {
    dataTable;
    constructor(label, min, max, dataType, dataFormat, changeDataTypeFunction) {
        this.dataTable = new Map();
        this.#createWrapperElement();
        this.dataTable.set('isFlipped', false);         // If true, max goes on the left, min goes on the right
        this.dataTable.set('label', label);             // Label identifying the name of the column in the data table
        this.dataTable.set('dataType', dataType);       // String identifying the data type
        this.dataTable.set('dataFormat', dataFormat);   // String identifying the data format (ie dd/mm/yyyy or int or float etc)
        this.dataTable.set('min', min);                 // Min value (set by the metadata on creation)
        this.dataTable.set('max', max);                 // Max value (set by the metadata on creation)
        this.dataTable.set('lastValidLeft', min);       // The current minimum (set by the user in the text inputs or the range slider)
        this.dataTable.set('lastValidRight', max);      // The current max (set by the user in the text inputs or range slider)
        this.#buildCard();
        this.changeDataTypeFunction = changeDataTypeFunction;  // This function is linked to the module and data manager for when user wants to change an automatically assigned data type
    }

    /** --- PRIVATE ---
     * Creates all elements of the card
     */
    #buildCard() {
        // Date datatypes need to be converted into a numerical value before storing.
        if (this.dataTable.get('dataType') === 'date') {
            this.dataTable.set('min', this.convertDateStringToMilliseconds(this.dataTable.get('min')));
            this.dataTable.set('max', this.convertDateStringToMilliseconds(this.dataTable.get('max')));
            this.dataTable.set('lastValidLeft', this.convertMillisecondsToString(this.dataTable.get('min')));
            this.dataTable.set('lastValidRight', this.convertDateStringToMilliseconds(this.dataTable.get('max')));
        }
        const max = this.dataTable.get('max');
        const min = this.dataTable.get('min');
        const label = this.dataTable.get('label');
        this.dataTable.set('range', max - min);
        if (this.dataTable.get('dataType') === 'date') this.#createFirstLevel(label, this.convertMillisecondsToString(min), this.convertMillisecondsToString(max));
        else this.#createFirstLevel(label, min, max);
        this.#createRangeSlider();
        this.#createOptionsMenu();
        this.#setInputListeners();
    }

    #createWrapperElement() {
        const wrapper = GM.HF.createNewDiv('', '', ['min-max-filter-wrapper'], []);
        this.dataTable.set('wrapper', wrapper);
    }

    #createRangeSlider() {
        // The slider gets two callback functions. One for when the slider is changed, and one for when the user changes some value in the input
        // And the slider must be changed to match.
        const sliderBar = GM.HF.createNewRangeSlider('', '', [], [], this.sliderCallback.bind(this), this.#setUpdateSliderFunction.bind(this));
        const sliderWrapper = GM.HF.createNewDiv('', '', ['slider-wrapper'], []);
        this.dataTable.get('wrapper').appendChild(sliderWrapper).appendChild(sliderBar);
    }

    /** --- PRIVATE ---
     * Creates the first level of the card. (include chekbox, min label and input box, max label and input box.)
     * @param {*} labelText 
     * @param {*} min 
     * @param {*} max 
     */
    #createFirstLevel(labelText, min, max) {
        const wrapper = GM.HF.createNewDiv('', '', ['min-max-first-level-wrapper'], []);
        const labelWrapper = GM.HF.createNewDiv('', '', ['min-max-label-wrapper'], []);
        const label = GM.HF.createNewParagraph('', '', ['min-max-label'], [], labelText);
        const labelCheckbox = GM.HF.createNewCheckbox('', '', [], [], 'include-row', 'Include', true);
        const leftInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper'], []);
        const rightInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper'], []);
        const dotMenuInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper', 'min-max-button'], []);
        const leftInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Min');
        const leftInput = GM.HF.createNewTextInput('', '', [], [], 'text');
        leftInput.value = min;  // Set initial Min value in the input
        const rightInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Max');
        const rightInput = GM.HF.createNewTextInput('', '', [], [], 'text');
        rightInput.value = max; // Set initial max value in the input
        this.dataTable.get('wrapper').appendChild(wrapper);

        // the 3 dots menu is not currently in use but is likely a good idea to hide options
        const threeDotMenuButton = GM.HF.createNewIMG('', '', '../../../images/icons/three-dots.png', [], [], '');

        dotMenuInputWrapper.appendChild(threeDotMenuButton);
        wrapper.appendChild(labelWrapper);
        wrapper.appendChild(leftInputWrapper);
        wrapper.appendChild(rightInputWrapper);
        wrapper.appendChild(dotMenuInputWrapper);
        labelWrapper.appendChild(label);
        labelWrapper.appendChild(labelCheckbox.wrapper);
        leftInputWrapper.appendChild(leftInputLabel);
        leftInputWrapper.appendChild(leftInput);
        rightInputWrapper.appendChild(rightInputLabel);
        rightInputWrapper.appendChild(rightInput);

        // Save the elements
        this.dataTable.set('Min Input Wrapper', leftInputWrapper);
        this.dataTable.set('Max Input Wrapper', rightInputWrapper);
        this.dataTable.set('Min Input Label', leftInputLabel);
        this.dataTable.set('Max Input Label', rightInputLabel);
        this.dataTable.set('Min Input', leftInput);
        this.dataTable.set('Max Input', rightInput);
    }

    /** --- PRIVATE ---
     * The options menu is the bottom row. In the future it is probably best to hide this and then
     * show it when the user clicks on the 3 buttons.
     */
    #createOptionsMenu() {
        const wrapper = GM.HF.createNewDiv('', '', ['min-max-options-wrapper'], []);
        const flipButton = GM.HF.createNewButton('', '', ['min-max-flip-button'], [], 'button', 'Flip Min/Max');
        const ddWrapper = GM.HF.createNewDiv('', '', ['min-max-dropdown-wrapper'], []);
        const changeTypeLabel = GM.HF.createNewParagraph('', '', [], [], 'Change Data Type');
        const changeTypeDropdown = GM.HF.createNewSelect('', '', [], [], ['number', 'date', 'category'], ['Number', 'Date', 'Category']);
        ddWrapper.appendChild(changeTypeLabel);
        ddWrapper.appendChild(changeTypeDropdown);
        wrapper.appendChild(flipButton);
        wrapper.appendChild(ddWrapper);

        // Store these elements for easy access
        this.dataTable.get('wrapper').appendChild(wrapper);
        this.dataTable.set('flipButton', flipButton);
        this.dataTable.set('changeTypeDropdown', changeTypeDropdown);
    }

    #setInputListeners() {
        this.dataTable.get('Min Input').addEventListener('input', () => {
            this.updateRangeSlider();
        });
        this.dataTable.get('Max Input').addEventListener('input', () => {
            this.updateRangeSlider();
        });
        this.dataTable.get('Min Input').addEventListener('focusout', () => {
            if (this.isValueInput(this.dataTable.get('Min Input').value, 'left')) this.dataTable.set('lastValidLeft', this.dataTable.get('Min Input').value);
            else this.dataTable.get('Min Input').value = this.dataTable.get('lastValidLeft');
            this.updateRangeSlider();
        });
        this.dataTable.get('Max Input').addEventListener('focusout', () => {
            if (this.isValueInput(this.dataTable.get('Max Input').value, 'right')) this.dataTable.set('lastValidRight', this.dataTable.get('Max Input').value);
            else this.dataTable.get('Max Input').value = this.dataTable.get('lastValidRight');
            this.updateRangeSlider();
        });
        this.dataTable.get('changeTypeDropdown').addEventListener('change', this.changeDataType.bind(this));
        this.dataTable.get('flipButton').addEventListener('click', this.flipMinMax.bind(this));
    }

    /** --- PUBLIC ---
     * When the user changes a value in the input boxes, the range slider must be updated to reflect this change.
     * Find the percentage from bounds of the range and send it to the slider. */
    updateRangeSlider() {
        if (this.isValueInput(this.dataTable.get('Min Input').value, 'left') && this.isValueInput(this.dataTable.get('Max Input').value, 'right')) {
            const min = Number(this.dataTable.get('Min Input').value);
            const max = Number(this.dataTable.get('Max Input').value);
            const minPercent = (min - Number(this.dataTable.get('min'))) / Number(this.dataTable.get('range'));
            const maxPercent = (max - Number(this.dataTable.get('min'))) / Number(this.dataTable.get('range'));
            this.dataTable.get('sliderUpdateFunction')(minPercent, maxPercent);
        }
    }

    /** --- PUBLIC ---
     * Callback attached to the flip min max button.
     * Sets the isFlipped flag and swaps the min and max inputs.
     * is Flipped tag is used to identify which value to update when the slider is changed.  */
    flipMinMax() {
        this.dataTable.set('isFlipped', !this.dataTable.get('isFlipped'));
        if (this.dataTable.get('isFlipped')) this.#moveMaxLeft();
        else this.#moveMaxRight();
    }

    /** --- PRIVATE ---
     * When the min and max are flipped, the max input either gets moved to the rights side or the left side.
     */
    #moveMaxRight() {
        this.dataTable.get('Max Input Wrapper').remove(); // Remove it and place it after the min
        this.dataTable.get('Min Input Wrapper').after(this.dataTable.get('Max Input Wrapper'));
        this.dataTable.get('Min Input Label').innerHTML = 'Min';
        this.dataTable.get('Max Input Label').innerHTML = 'Max';
    }

    /** --- PRIVATE ---
     * When the min and max are flipped, the max input either gets moved to the rights side or the left side.
     */
    #moveMaxLeft() {
        this.dataTable.get('Min Input Wrapper').remove(); // Remove it and place it after the max
        this.dataTable.get('Max Input Wrapper').after(this.dataTable.get('Min Input Wrapper'));
        this.dataTable.get('Min Input Label').innerHTML = 'Max';
        this.dataTable.get('Max Input Label').innerHTML = 'Min';
    }

    /** --- PUBLIC ---
     * When the slider is moved, the slider passes the left percentage and right percentage of the slide balls from their respective endpoints.
     * This information is used to update the current min and max values.
     * @param {{left (number), right{number}}} sliderData decimal representing fraction of distance from the bounds of left and right */
    sliderCallback(sliderData) {
        console.log(sliderData)
        const left = this.dataTable.get('isFlipped') ? sliderData.right : sliderData.left;
        const right = this.dataTable.get('isFlipped') ? sliderData.left : sliderData.right;
        let leftValue = this.#calcValue(left);
        let rightValue = this.#calcValue(right);
        this.dataTable.get('Min Input').value = leftValue;
        this.dataTable.get('Max Input').value = rightValue;
        this.dataTable.set('lastValidLeft', leftValue);
        this.dataTable.set('lastValidRight', rightValue);
    }

    /** --- PUBLIC ---
     * This is a callback bound to the changeDataType dropdown. It gets the new type from the dropdown.
     * This function is working but not totally finished. Currently there are only a few datatypes that can 
     * be switched. This function will notify the DataManager to change the data type if possible. More validation
     * is also needed on the DataManager end. Also, the dropdown does not currently update its value to the current type but 
     * always shows Number regardless. */
    changeDataType() {
        const newType = this.dataTable.get('changeTypeDropdown').value;
        this.changeDataTypeFunction(this.dataTable.get('label'), this.dataTable.get('dataType'), newType, this.handleChangeDataTypeReturn.bind(this));
    }

    /** --- PUBLIC ---
     * Handles the return of a data type change. 
     * @param {
     * changeDataTypeFunction
     * dataFormat (string)
     * dataType (string)
     * max (string or number)
     * min (string or number)
     * name (string)} result */
    handleChangeDataTypeReturn(result) {
        if (result.success) {
            const old = this.dataTable.get('dataType');
            this.dataTable.set('dataType', result.row.dataType.toLowerCase());
            if (old.toLowerCase() === 'number') {
                if (this.dataTable.get('dataType') == 'date') this.convertNumberToDate();
            } else if (old.toLowerCase() === 'date') {
                if (this.dataTable.get('dataType') == 'number') this.convertDateToNumber();
            }

        } else console.log('Unable To Convert Data');
    }

    convertNumberToDate() {
        this.dataTable.get('Min Input').value = this.convertMillisecondsToString(Number(this.dataTable.get('Min Input').value));
        this.dataTable.get('Max Input').value = this.convertMillisecondsToString(Number(this.dataTable.get('Max Input').value));
    }

    convertDateToNumber() {
        this.dataTable.get('Min Input').value = this.dataTable.get('lastValidLeft');
        this.dataTable.get('Max Input').value = this.dataTable.get('lastValidRight');
    }

    /** --- PUBLIC ---
     * Validates if the value is within the bounds of the range
     * @param {any} input 
     * @param {string} side left or right
     * @returns true if it is a valid value, false if not
     */
    isValueInput(input, side) {
        if (side === 'left') return Number(input) <= Number(this.dataTable.get('lastValidRight')) && Number(input) >= Number(this.dataTable.get('min'));
        else return Number(input) >= Number(this.dataTable.get('lastValidLeft')) && Number(input) <= Number(this.dataTable.get('max'));
    }

    /** --- PRIVATE---
     * Calculates the a value based on the position of the slider
     * @param {Number} percentage The percentage of the range
     * @returns the value
     */
    #calcValue = percentage => {
        const type = this.dataTable.get('dataType');
        if (type === 'date') {
            let val = Number(this.dataTable.get('range')) * Number(percentage) + Number(this.dataTable.get('min'));
            if (this.dataTable.get('isFlipped')) val = Number(this.dataTable.get('max') - Number(this.dataTable.get('range')) * Number(percentage));
            return this.convertMillisecondsToString(val);
        } else {
            let val = Number(this.dataTable.get('range')) * Number(percentage) + Number(this.dataTable.get('min'));
            if (this.dataTable.get('isFlipped')) val = Number(this.dataTable.get('max') - Number(this.dataTable.get('range')) * Number(percentage));

            // If a datatype is set, make the adjustment
            switch (type) {
                case 'int':
                    return parseInt(val);
                case 'number':
                    return Number(val).toFixed(2);
                case 'float':
                    return parseFloat(val).toFixed(3);
                case 'double':
                    return parseDouble(val).toFixed(5);
                default:
                    return Number(val).toFixed(2);
            }
        }

    }

    convertDateStringToMilliseconds = string => (new Date(string).getTime());

    convertMillisecondsToString(milliseconds) {
        const conversion = new Date(milliseconds);
        return `${conversion.getMonth() + 1}/${conversion.getDate()}/${conversion.getFullYear()}`;
    }

    /** --- PRIVATE ---
     * Stores the update slider function in the data table
     * @param {function} fn the function to store
     */
    #setUpdateSliderFunction(fn) {
        this.dataTable.set('sliderUpdateFunction', fn);
    }

    getHTML = () => this.dataTable.get('wrapper');

    getData = () => this.dataTable;

}