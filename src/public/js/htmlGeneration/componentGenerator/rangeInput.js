import { HTMLFactory } from '../index.js';

export class RangeInput {

    #HF;
    #wrapper;
    #rangeInput;
    #textInput;

    constructor(id, name, classlist, customStyles, labelName, min, max, step, value) {
        this.#HF = new HTMLFactory();
        this.#wrapper = this.#createWrapper(id, name, classlist, customStyles);
        this.#createElements(labelName, min, max, step, value);
    }

    // Create wrapper
    #createWrapper(id, name, classlist, customStyles) {
        return this.#HF.createNewDiv(id, name, classlist, customStyles, [], '');
    }

    #createElements(labelName, min, max, step, value) {
        var wrapper = this.#wrapper;
        var label = this.#HF.createNewLabel('', '', '', ['label'], [], labelName);
        var rangeInput = this.#HF.createNewRangeInput('', '', ['range-input'], [], min, max, step, value);
        var textInput = this.#HF.createNewInput('', '', ['text-input'], [{ style: 'width', value: '20%' }], 'text', value);

        // Append eventListeners
        rangeInput.addEventListener('input', (e) => {
            let ti = e.target.nextElementSibling;
            ti.value = e.target.value;
        });

        textInput.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
                rangeInput.value = newValue;
            }
        });

        wrapper.appendChild(label);
        wrapper.appendChild(rangeInput);
        wrapper.appendChild(textInput);
    }



    get() {
        return { wrapper: this.#wrapper, rangeInput: this.#rangeInput, textInput: this.#textInput };
    }

}
