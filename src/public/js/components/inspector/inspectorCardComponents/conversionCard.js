import { GM } from "../../../main.js";
import { conversionFunctions } from "../../../sharedVariables/conversionFunctions.js";

export class ConversionCard {
    constructor(metadata){
        this.inputDropdown = null;
        this.functionDropdown = null;
        this.convertButton = null;
        this.card = GM.HF.createNewDiv('', '', ['conversion-card'], []);
        this.card.appendChild(this.createUpperLevel(metadata));
        this.card.appendChild(this.createMiddleLayer());
        this.card.appendChild(this.createLowerLayer());
    }

    createUpperLevel(metadata) {
        const upperLevel = GM.HF.createNewDiv('', '', ['conversion-card-upper'], []);
        const left = this.createUpperLevelLeft(metadata);
        const center = this.createUpperLevelCenter();
        const right = this.createUpperLevelRight();
        upperLevel.appendChild(left);
        upperLevel.appendChild(center);
        upperLevel.appendChild(right);
        return upperLevel;
    }

    createUpperLevelLeft(metadata) {
        const options = [];
        Object.values(metadata.columnHeaders).forEach(header => {
            options.push(header.name);
        });
        const wrapper = GM.HF.createNewDiv('', '', ['conversion-card-upper-segment'], []);
        const label = GM.HF.createNewParagraph('','',[],[], 'Source');
        const select = GM.HF.createNewSelect('', '', [], [], options, options, options);
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        this.inputDropdown = select;
        return wrapper;
    }

    createUpperLevelRight() {
        const options = [];
        conversionFunctions.forEach(fn => {
            options.push(fn.name);
        });
        const wrapper = GM.HF.createNewDiv('', '', ['conversion-card-upper-segment'], []);
        const label = GM.HF.createNewParagraph('','',[],[], 'Function');
        const select = GM.HF.createNewSelect('', '', [], [], options, options, options);
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        this.functionDropdown = select;
        return wrapper;
    }

    createUpperLevelCenter() {
        const wrapper = GM.HF.createNewDiv('','',['conversion-card-upper-segment'], []);
        const image = GM.HF.createNewIMG('','','../../../../images/icons/right-arrow.png', [], [], '');
        wrapper.appendChild(image);
        return wrapper;
    }
    
    createMiddleLayer() {
        const wrapper = GM.HF.createNewDiv('','', ['conversion-card-middle-layer'], []);
        const description = GM.HF.createNewParagraph('','',[],[], conversionFunctions[0].description);
        wrapper.appendChild(description);
        return wrapper;
    }

    createLowerLayer() {
        const wrapper = GM.HF.createNewDiv('','', ['conversion-card-middle-layer'], []);
        const button = GM.HF.createNewButton('','',['conversion-card-button'],[], 'button', 'Convert');
        wrapper.appendChild(button);
        this.convertButton = button;
        return wrapper;
    }

    getConversionFunction = () => {
        const element  = conversionFunctions.find(element => element.name === this.functionDropdown.value);
        return element.fn;
    }

    getConversionFieldName = () => {
        const element  = conversionFunctions.find(element => element.name === this.functionDropdown.value);
        return element.outputFieldName;
    }

    getButton = () => this.convertButton;

    getConversionInputAndFunction = () => ({input: this.inputDropdown.value, fn: this.getConversionFunction(), outputFieldName: this.getConversionFieldName()});

    getCard = () => this.card;
}