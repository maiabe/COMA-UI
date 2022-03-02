import { GM } from "../../../main.js";

export class MinMaxFilter {
    dataTable;
    constructor(label, min, max, dataType, dataFormat) {
        this.dataTable = new Map();
        this.createWrapperElement();
        this.dataTable.set('dataType', dataType);
        this.dataTable.set('dataFormat', dataFormat);
        if (dataType === 'date') {
            console.log(min);
            min = this.convertDateStringToMilliseconds(min);
            max = this.convertDateStringToMilliseconds(max);
        }
        this.dataTable.set('min', min);
        this.dataTable.set('max', max);
        this.dataTable.set('lastValidLeft', min);
        this.dataTable.set('lastValidRight', max);
        this.dataTable.set('range', max - min);
        if (dataType === 'date') this.createFirstLevel(label, this.convertMillisecondsToString(min), this.convertMillisecondsToString(max));
        else this.createFirstLevel(label, min, max);
        this.createRangeSlider();
        this.setInputListeners();
    }

    createWrapperElement() {
        const wrapper = GM.HF.createNewDiv('', '', ['min-max-filter-wrapper'], []);
        this.dataTable.set('wrapper', wrapper);
    }

    createRangeSlider() {
        const sliderBar = GM.HF.createNewRangeSlider('', '', [], [], this.sliderCallback.bind(this), this.setUpdateSliderFunction.bind(this));
        const sliderWrapper = GM.HF.createNewDiv('', '', ['slider-wrapper'], []);
        this.dataTable.get('wrapper').appendChild(sliderWrapper).appendChild(sliderBar);
    }

    createFirstLevel(labelText, min, max) {
        const wrapper = GM.HF.createNewDiv('', '', ['min-max-first-level-wrapper'], []);
        const labelWrapper = GM.HF.createNewDiv('', '', ['min-max-label-wrapper'], []);
        const label = GM.HF.createNewParagraph('', '', ['min-max-label'], [], labelText);
        const labelCheckbox = GM.HF.createNewCheckbox('', '', [], [], 'include-row', 'Include', true);
        const leftInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper'], []);
        const rightInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper'], []);
        const leftInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Min');
        const leftInput = GM.HF.createNewTextInput('', '', [], [], 'text');
        leftInput.value = min;
        const rightInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Max');
        const rightInput = GM.HF.createNewTextInput('', '', [], [], 'text');
        rightInput.value = max;
        this.dataTable.get('wrapper').appendChild(wrapper);
        wrapper.appendChild(labelWrapper);
        wrapper.appendChild(leftInputWrapper);
        wrapper.appendChild(rightInputWrapper);
        labelWrapper.appendChild(label);
        labelWrapper.appendChild(labelCheckbox.wrapper);
        leftInputWrapper.appendChild(leftInputLabel);
        leftInputWrapper.appendChild(leftInput);
        rightInputWrapper.appendChild(rightInputLabel);
        rightInputWrapper.appendChild(rightInput);
        this.dataTable.set('Min Input', leftInput);
        this.dataTable.set('Max Input', rightInput);
    }

    setInputListeners() {
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
    }

    updateRangeSlider() {
        if (this.isValueInput(this.dataTable.get('Min Input').value, 'left') && this.isValueInput(this.dataTable.get('Max Input').value, 'right')) {
            const min = Number(this.dataTable.get('Min Input').value);
            const max = Number(this.dataTable.get('Max Input').value);
            const minPercent = (min - Number(this.dataTable.get('min'))) / Number(this.dataTable.get('range'));
            const maxPercent = (max - Number(this.dataTable.get('min'))) / Number(this.dataTable.get('range'));
            this.dataTable.get('sliderUpdateFunction')(minPercent, maxPercent);
        }
    }


    sliderCallback(sliderData) {
        const leftValue = this.calcValue(sliderData.left);
        const rightValue = this.calcValue(sliderData.right)
        this.dataTable.get('Min Input').value = leftValue;
        this.dataTable.get('Max Input').value = rightValue;
        this.dataTable.set('lastValidLeft', leftValue);
        this.dataTable.set('lastValidRight', rightValue);
    }

    isValueInput(input, side) {
        if (side === 'left') return Number(input) <= Number(this.dataTable.get('lastValidRight')) && Number(input) >= Number(this.dataTable.get('min'));
        else return Number(input) >= Number(this.dataTable.get('lastValidLeft')) && Number(input) <= Number(this.dataTable.get('max'));
    }

    calcValue = percentage => {
        const type = this.dataTable.get('dataType');
        if (type === 'date') {
            const val = Number(this.dataTable.get('range')) * Number(percentage) + Number(this.dataTable.get('min'));
            return this.convertMillisecondsToString(val);
        } else {
            const val = Number(this.dataTable.get('range')) * Number(percentage) + Number(this.dataTable.get('min'));
            switch (type) {
                case 'int':
                    return parseInt(val);
                case 'number':
                    return Number(val).toFixed(2);
                case 'float':
                    return parseFloat(val).toFixed(3);
                case 'double':
                    return parseDouble(val).toFixed(5);
            }
        }

    }

    convertDateStringToMilliseconds = string => (new Date(string).getTime());

    convertMillisecondsToString(milliseconds) {
        const conversion = new Date(milliseconds);
        return `${conversion.getMonth() + 1}/${conversion.getDate()}/${conversion.getFullYear()}`;
    }

    setUpdateSliderFunction(fn) {
        this.dataTable.set('sliderUpdateFunction', fn);
    }

    getHTML = () => this.dataTable.get('wrapper');

    getData = () => this.dataTable;

}