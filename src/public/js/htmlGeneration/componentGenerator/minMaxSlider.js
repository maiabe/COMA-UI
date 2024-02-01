import { HTMLFactory } from '../index.js';

export class MinMaxSlider {

    #HF;
    #wrapper;
    #rangeInput;
    #textInput;

    constructor(id, name, classlist, customStyles, labelName, min, max, minVal, maxVal, step, gap) {
        this.#HF = new HTMLFactory();
        this.#wrapper = this.#createWrapper(id, name, classlist, customStyles);
        this.#createElements(labelName, min, max, minVal, maxVal, step, gap);
    }

    // Create wrapper
    #createWrapper(id, name, classlist, customStyles) {
        return this.#HF.createNewDiv(id, name, classlist, customStyles, [], '');
    }

    #createElements(labelName, min, max, minVal, maxVal, step, gap) {
        const wrapper = this.#wrapper;
        const label = this.#HF.createNewLabel('', '', '', ['label'], [], labelName);
        if (labelName) {
            wrapper.appendChild(label);
        }


        // set a container to dynamically include the slider
        const sliderContainer = this.#HF.createNewDiv('', '', ['minmax-slider-wrapper'], [], [], '');
        const minmaxSlider = this.#HF.createNewDiv('', '', ['minmax-slider'], [], [], '');

        sliderContainer.appendChild(minmaxSlider);
        wrapper.appendChild(sliderContainer);

        // invisible sliders
        const inputWrapper = this.#HF.createNewDiv('', '', ['minmax-range-wrapper'], [], [], '');
        const minInput = this.#HF.createNewRangeInput('', '', ['min-range-input'], [], min, max, step, minVal);
        const maxInput = this.#HF.createNewRangeInput('', '', ['max-range-input'], [], min, max, step, maxVal);

        inputWrapper.appendChild(minInput);
        inputWrapper.appendChild(maxInput);
        wrapper.appendChild(inputWrapper);
        /*wrapper.appendChild(rangeInput);
        wrapper.appendChild(textInput);*/

        this.#addSliderEventListener(gap);
        

    }

    #addSliderEventListener(gap) {
        const wrapper = this.#wrapper;
        const minmaxSlider = wrapper.querySelector('.minmax-slider-wrapper .minmax-slider');

        const rangeInputs = wrapper.querySelectorAll('.minmax-range-wrapper input');

        // Adding event listeners to slider range
        for (let i = 0; i < rangeInputs.length; i++) {
            rangeInputs[i].addEventListener('input', e => {
                let minInput = rangeInputs[0];
                let maxInput = rangeInputs[1];

                let currentMin = parseInt(minInput.value);
                let currentMax = parseInt(maxInput.value);
                let diff = currentMax - currentMin;

                if (diff < gap) {
                    if (e.target === minInput) {
                        minInput.value = currentMax - gap;
                    }
                    else {
                        maxInput.value = currentMin + gap;
                    }

                    // Update range progress
                    minmaxSlider.style.left = `${(currentMin / (maxInput.value - gap)) * 100}%`;
                    minmaxSlider.style.right = `${100 - (currentMax / (minInput.value + gap)) * 100}%`;
                }
            });

            // -- cursor does not appear correctly since the input ranges are overlapping with each other ?
            rangeInputs[i].addEventListener('mousedown', (e) => {
                /*e.target.style.zIndex = 1;*/
                e.target.style.cursor = 'grabbing';
                console.log(e.target.style.cursor);
            });
            rangeInputs[i].addEventListener('mouseup', (e) => {
                /*e.target.style.zIndex = 'auto';*/
                e.target.style.cursor = 'grab';
                console.log(e.target.style.cursor);
            });
        }


        

    }


    get() {
        return { wrapper: this.#wrapper, rangeInput: this.#rangeInput, textInput: this.#textInput };
    }

}

