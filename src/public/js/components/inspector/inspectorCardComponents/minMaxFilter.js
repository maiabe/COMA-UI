import { GM } from "../../../main.js";

export class MinMaxFilter {
    dataTable;
    constructor(label, min, max, dataType, dataFormat, changeDataTypeFunction) {
        this.dataTable = new Map();
        this.createWrapperElement();
        this.dataTable.set('isFlipped', false);
        this.dataTable.set('label', label);
        this.dataTable.set('dataType', dataType);
        this.dataTable.set('dataFormat', dataFormat);
        this.dataTable.set('min', min);
        this.dataTable.set('max', max);
        this.dataTable.set('lastValidLeft', min);
        this.dataTable.set('lastValidRight', max);
        this.buildCard();
        this.changeDataTypeFunction = changeDataTypeFunction;
    }

    buildCard(){
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
        if (this.dataTable.get('dataType') === 'date') this.createFirstLevel(label, this.convertMillisecondsToString(min), this.convertMillisecondsToString(max));
        else this.createFirstLevel(label, min, max);
        this.createRangeSlider();
        this.createOptionsMenu();
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
        const dotMenuInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper', 'min-max-button'], []);
        const leftInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Min');
        const leftInput = GM.HF.createNewTextInput('', '', [], [], 'text');
        leftInput.value = min;
        const rightInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Max');
        const rightInput = GM.HF.createNewTextInput('', '', [], [], 'text');
        rightInput.value = max;
        this.dataTable.get('wrapper').appendChild(wrapper);
        const threeDotMenuButton = GM.HF.createNewIMG('','','../../../images/icons/three-dots.png',[],[],'');
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
        this.dataTable.set('Min Input Wrapper', leftInputWrapper);
        this.dataTable.set('Max Input Wrapper', rightInputWrapper);
        this.dataTable.set('Min Input Label', leftInputLabel);
        this.dataTable.set('Max Input Label', rightInputLabel);
        this.dataTable.set('Min Input', leftInput);
        this.dataTable.set('Max Input', rightInput);
    }

    createOptionsMenu() {
        const wrapper = GM.HF.createNewDiv('','', ['min-max-options-wrapper'], []);
        const flipButton = GM.HF.createNewButton('','',['min-max-flip-button'], [], 'button', 'Flip Min/Max');
        const ddWrapper = GM.HF.createNewDiv('','',['min-max-dropdown-wrapper'], []);
        const changeTypeLabel = GM.HF.createNewParagraph('', '', [], [], 'Change Data Type');
        const changeTypeDropdown = GM.HF.createNewSelect('','',[],[],['number', 'date', 'category'],['Number', 'Date', 'Category']);
        ddWrapper.appendChild(changeTypeLabel);
        ddWrapper.appendChild(changeTypeDropdown);
        wrapper.appendChild(flipButton);
        wrapper.appendChild(ddWrapper);
        this.dataTable.get('wrapper').appendChild(wrapper);
        this.dataTable.set('flipButton', flipButton);
        this.dataTable.set('changeTypeDropdown', changeTypeDropdown);
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
        this.dataTable.get('changeTypeDropdown').addEventListener('change', this.changeDataType.bind(this));
        this.dataTable.get('flipButton').addEventListener('click', this.flipMinMax.bind(this));
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

    flipMinMax() {
        this.dataTable.set('isFlipped', !this.dataTable.get('isFlipped'));
        if (this.dataTable.get('isFlipped')) this.moveMaxLeft();
        else this.moveMaxRight();
    }

    moveMaxRight() {
        this.dataTable.get('Max Input Wrapper').remove();
        this.dataTable.get('Min Input Wrapper').after(this.dataTable.get('Max Input Wrapper'));
        this.dataTable.get('Min Input Label').innerHTML = 'Min';
        this.dataTable.get('Max Input Label').innerHTML = 'Max';
    }

    moveMaxLeft() {
        this.dataTable.get('Min Input Wrapper').remove();
        this.dataTable.get('Max Input Wrapper').after(this.dataTable.get('Min Input Wrapper'));
        this.dataTable.get('Min Input Label').innerHTML = 'Max';
        this.dataTable.get('Max Input Label').innerHTML = 'Min';
    }

    sliderCallback(sliderData) {
        const left = this.dataTable.get('isFlipped') ? sliderData.right: sliderData.left;
        const right = this.dataTable.get('isFlipped') ? sliderData.left: sliderData.right;
        let leftValue = this.calcValue(left);
        let rightValue = this.calcValue(right);
        this.dataTable.get('Min Input').value = leftValue;
        this.dataTable.get('Max Input').value = rightValue;
        this.dataTable.set('lastValidLeft', leftValue);
        this.dataTable.set('lastValidRight', rightValue);
    }

    changeDataType() {
        const newType = this.dataTable.get('changeTypeDropdown').value;
        this.changeDataTypeFunction(this.dataTable.get('label'), this.dataTable.get('dataType'), newType, this.handleChangeDataTypeReturn.bind(this));
    }

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

    isValueInput(input, side) {
        if (side === 'left') return Number(input) <= Number(this.dataTable.get('lastValidRight')) && Number(input) >= Number(this.dataTable.get('min'));
        else return Number(input) >= Number(this.dataTable.get('lastValidLeft')) && Number(input) <= Number(this.dataTable.get('max'));
    }

    calcValue = percentage => {
        const type = this.dataTable.get('dataType');
        if (type === 'date') {
            let val = Number(this.dataTable.get('range')) * Number(percentage) + Number(this.dataTable.get('min'));
            if (this.dataTable.get('isFlipped')) val = Number(this.dataTable.get('max') - Number(this.dataTable.get('range')) * Number(percentage) );
            return this.convertMillisecondsToString(val);
        } else {
            let val = Number(this.dataTable.get('range')) * Number(percentage) + Number(this.dataTable.get('min'));
            if (this.dataTable.get('isFlipped')) val = Number(this.dataTable.get('max') - Number(this.dataTable.get('range')) * Number(percentage));
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