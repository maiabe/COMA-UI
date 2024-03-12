import { HTMLFactory } from '../index.js';

export class MinMaxSlider {

    #HF;
    #wrapper;
    #rangeInput;
    #textInput;

    constructor(id, name, classlist, customStyles, labelName, min, max, minVal, maxVal, step, gap, textInput) {
        this.#HF = new HTMLFactory();
        this.#wrapper = this.#createWrapper(id, name, classlist, customStyles);
        this.#createElements(labelName, min, max, minVal, maxVal, step, gap, textInput);
    }

    // Create wrapper
    #createWrapper(id, name, classlist, customStyles) {
        return this.#HF.createNewDiv(id, name, classlist, customStyles, [], '');
    }

    #createElements(labelName, min, max, minVal, maxVal, step, gap, textInput) {
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

        // create range input for min and max
        const minmaxRangeWrapper = this.#HF.createNewDiv('', '', ['minmax-range-wrapper'], [], [], '');

        if (textInput) {
            const minInput = this.#HF.createNewRangeInput('', '', ['min-range-input', 'range-input'], [], min, max, step, minVal);
            const maxInput = this.#HF.createNewRangeInput('', '', ['max-range-input', 'range-input'], [], min, max, step, maxVal);
            const minTextInput = this.#HF.createNewInput('', '', ['min-text-input', 'text-input'], [], 'number', min);
            const maxTextInput = this.#HF.createNewInput('', '', ['max-text-input', 'text-input'], [], 'number', max);

            minmaxRangeWrapper.appendChild(minTextInput);
            minmaxRangeWrapper.appendChild(minInput);
            minmaxRangeWrapper.appendChild(maxInput);
            minmaxRangeWrapper.appendChild(maxTextInput);

            // Add event listener?

        }
        else {
            const minInput = this.#HF.createNewRangeInput('', '', ['min-range-input', 'range-input'], [], min, max, step, minVal);
            const maxInput = this.#HF.createNewRangeInput('', '', ['max-range-input', 'range-input'], [], min, max, step, maxVal);

            minmaxRangeWrapper.appendChild(minInput);
            minmaxRangeWrapper.appendChild(maxInput);

            //-- TODO: Add tooltip for the min and max values

        }


        wrapper.appendChild(minmaxRangeWrapper);

        this.#addSliderEventListener(gap);

    }

    #addSliderEventListener(gap) {
        const wrapper = this.#wrapper;
        const minmaxSlider = wrapper.querySelector('.minmax-slider-wrapper .minmax-slider');

        const rangeInputs = wrapper.querySelectorAll('.minmax-range-wrapper .range-input');
        const textInputs = wrapper.querySelectorAll('.minmax-range-wrapper .text-input');

        // Adding event listeners to slider range
        for (let i = 0; i < rangeInputs.length; i++) {
            rangeInputs[i].addEventListener('input', e => {
                const minInput = rangeInputs[0];
                const maxInput = rangeInputs[1];

                const currentMin = Number(minInput.value);
                const currentMax = Number(maxInput.value);
                const diff = currentMax - currentMin;

                // don't let the input values cross over the gap
                if (diff > gap) {
                    if (e.target === minInput) {
                        minInput.value = currentMin;
                        minInput.setAttribute('value', currentMin);

                        // update the textInput if there are any
                        if (textInputs) {
                            const minTextInput = textInputs[0];
                            minTextInput.value = currentMin;
                            minTextInput.setAttribute('value', currentMin);
                        }
                    }
                    else {
                        maxInput.value = currentMax;
                        maxInput.setAttribute('value', currentMax);

                        // update the textInput if there are any
                        if (textInputs) {
                            const maxTextInput = textInputs[1];
                            maxTextInput.value = currentMax;
                            maxTextInput.setAttribute('value', currentMax);
                        }
                    }

                    // Update range progress
                    minmaxSlider.style.left = `${(currentMin / (currentMax - gap)) * 100}%`;
                    minmaxSlider.style.right = `${100 - (currentMax / (currentMin + gap)) * 100}%`;

                }
                else {
                    if (e.target === minInput) {
                        minInput.value = currentMax - gap;
                        minInput.setAttribute('value', currentMax - gap);

                        if (textInputs) {
                            const minTextInput = textInputs[0];
                            minTextInput.value = currentMax - gap;
                            minTextInput.setAttribute('value', currentMax - gap);
                        }
                    }
                    else {
                        maxInput.value = currentMin + gap;
                        maxInput.setAttribute('value', currentMin + gap);

                        if (textInputs) {
                            const maxTextInput = textInputs[1];
                            maxTextInput.value = currentMin + gap;
                            maxTextInput.setAttribute('value', currentMin + gap);
                        }
                    }
                };
            });

            // -- cursor does not appear correctly since the input ranges are overlapping with each other ?
            rangeInputs[i].addEventListener('mousedown', (e) => {
                e.target.style.zIndex = 1;
                e.target.style.cursor = 'grabbing';
                /*console.log(e.target.style.cursor);*/
            });
            rangeInputs[i].addEventListener('mouseup', (e) => {
                e.target.style.zIndex = 'auto';
                e.target.style.cursor = 'grab';
                /*console.log(e.target.style.cursor);*/
            });
        }

        if (textInputs) {
            for (let i = 0; i < textInputs.length; i++) {
                textInputs[i].addEventListener('blur', (e) => {
                    const minTextInput = textInputs[0];
                    const maxTextInput = textInputs[1];

                    const minRangeInput = rangeInputs[0];
                    const maxRangeInput = rangeInputs[1];

                    const currentMin = Number(minTextInput.value);
                    const currentMax = Number(maxTextInput.value);
                    const diff = currentMax - currentMin;

                    if (diff > gap) {
                        if (e.target === minTextInput) {
                            minRangeInput.value = currentMin;
                            minRangeInput.setAttribute('value', currentMin);
                        }
                        else {
                            maxRangeInput.value = currentMax;
                            maxRangeInput.setAttribute('value', currentMax);
                        }
                    }
                    else {
                        if (e.target === minTextInput) {
                            minRangeInput.value = currentMax - gap;
                            minRangeInput.setAttribute('value', currentMax - gap);
                            minTextInput.value = currentMax - gap;
                            minTextInput.setAttribute('value', currentMax - gap);
                        }
                        else {
                            maxRangeInput.value = currentMin + gap;
                            maxRangeInput.setAttribute('value', currentMin + gap);
                            maxTextInput.value = currentMin + gap;
                            maxTextInput.setAttribute('value', currentMin + gap);
                        }
                    }


                });
            }
        }
    }

    /**
     * Adds a delay for user input event to occur
     * */
    /*#debounce(func, delay) {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }*/


    get() {
        return { wrapper: this.#wrapper, rangeInput: this.#rangeInput, textInput: this.#textInput };
    }

}

