/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { GM } from "../../../main.js";
import { conversionFunctions } from "../../../sharedVariables/conversionFunctions.js";

export class ConversionCard {
    constructor(metadata){
        this.inputDropdown = null;
        this.functionDropdown = null;
        this.convertButton = null;
        this.card = GM.HF.createNewDiv('', '', ['conversion-card'], [], [], '');
        this.card.appendChild(this.#createUpperLevel(metadata));
        this.card.appendChild(this.#createMiddleLayer());
        this.card.appendChild(this.#createLowerLayer());
    }

    /** --- PRIVATE ---
     * Creates the top row. It has dropdowns for the column to convert and the function to apply.
     * @param {JSON Object} metadata object containing all metadata
     * @returns HTML node */
    #createUpperLevel(metadata) {
        const upperLevel = GM.HF.createNewDiv('', '', ['conversion-card-upper'], [], [], '');
        const left = this.#createUpperLevelLeft(metadata);
        const center = this.#createUpperLevelCenter();
        const right = this.#createUpperLevelRight();
        upperLevel.appendChild(left);
        upperLevel.appendChild(center);
        upperLevel.appendChild(right);
        return upperLevel;
    }

    /** --- PRIVATE ---
     * Creates the dropdown for selecting the source column.
     * @param {JSON Metadata Object} metadata 
     * @returns HTML Node */
    #createUpperLevelLeft(metadata) {
        const options = [];
        Object.values(metadata.columnHeaders).forEach(header => {
            options.push(header.name);
        });
        const wrapper = GM.HF.createNewDiv('', '', ['conversion-card-upper-segment'], [], [], '');
        const label = GM.HF.createNewParagraph('','',[],[], 'Source');
        const select = GM.HF.createNewSelect('', '', [], [], options, options, options);
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        this.inputDropdown = select;
        return wrapper;
    }

    /** --- PRIVATE ---
     * Creates the dropdown of selectable functions
     * @returns HTML Node */
    #createUpperLevelRight() {
        const options = [];
        conversionFunctions.forEach(fn => {
            options.push(fn.name);
        });
        const wrapper = GM.HF.createNewDiv('', '', ['conversion-card-upper-segment'], [], [], '');
        const label = GM.HF.createNewParagraph('','',[],[], 'Function');
        const select = GM.HF.createNewSelect('', '', [], [], options, options, options);
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        this.functionDropdown = select;
        return wrapper;
    }

    /** --- PRIVATE ---
     * Creates the arrow Icon in between the two dropdowns
     * @returns HTML node */
    #createUpperLevelCenter() {
        const wrapper = GM.HF.createNewDiv('','',['conversion-card-upper-segment'], [], [], '');
        const image = GM.HF.createNewIMG('','','../../../../images/icons/right-arrow.png', [], [], '');
        wrapper.appendChild(image);
        return wrapper;
    }
    
    /** --- PRIVATE ---
     * Creates the row containing the description of the function selected
     * @returns HTML Node */
    #createMiddleLayer() {
        const wrapper = GM.HF.createNewDiv('','', ['conversion-card-middle-layer'], [], [], '');
        const description = GM.HF.createNewParagraph('','',[],[], conversionFunctions[0].description);
        wrapper.appendChild(description);
        return wrapper;
    }

    /** --- PRIVATE ---
     * Creates the bottom row with the conversion buttons
     * @return HTML element */
    #createLowerLayer() {
        const wrapper = GM.HF.createNewDiv('','', ['conversion-card-middle-layer'], [], [], '');
        const button = GM.HF.createNewButton('','',['conversion-card-button'],[], 'button', 'Convert');
        wrapper.appendChild(button);
        this.convertButton = button;
        return wrapper;
    }

    /** --- PUBLIC ---
     * Gets the currently selected function
     * @returns the currently selected function */
    getConversionFunction = () => {
        const element  = conversionFunctions.find(element => element.name === this.functionDropdown.value);
        return element.fn;
    }

    /** --- PUBLIC ---
     * Gets the currently selected source field
     * @returns the currently selected source field */
    getConversionFieldName = () => {
        const element  = conversionFunctions.find(element => element.name === this.functionDropdown.value);
        return element.outputFieldName;
    }

    /** --- PUBLIC ---
     * gets the conversion button for adding event listeners
     * @returns HTML Element */
    getButton = () => this.convertButton;

    /** --- PUBLIC ---
     * This function will return the input fields, the outpfield name, and the function to apply to the specific column.
     * @returns object with the soruce field, conversion function */
    getConversionInputAndFunction = () => ({input: this.inputDropdown.value, fn: this.getConversionFunction(), outputFieldName: this.getConversionFieldName()});

    /** --- PUBLIC ---
     * @returns HTML Wrapper Element */
    getCard = () => this.card;
}