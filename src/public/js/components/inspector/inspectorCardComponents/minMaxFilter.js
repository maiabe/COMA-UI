import { GM } from "../../../main.js";

export class MinMaxFilter {
    dataTable;
    constructor(label) {
        this.dataTable = new Map();
        this.createWrapperElement();
        this.createFirstLevel(label);
        this.createRangeSlider();
    }

    createWrapperElement() {
        const wrapper = GM.HF.createNewDiv('', '', ['min-max-filter-wrapper'], []);
        this.dataTable.set('wrapper', wrapper);
    }

    createRangeSlider(){
        const sliderBar = GM.HF.createNewRangeSlider('', '', [], []);
        this.dataTable.get('wrapper').appendChild(sliderBar);
    }

    createFirstLevel(labelText) {
        const wrapper = GM.HF.createNewDiv('', '', ['min-max-first-level-wrapper'], []);
        const labelWrapper = GM.HF.createNewDiv('', '', ['min-max-label-wrapper'], []);
        const label = GM.HF.createNewParagraph('', '', ['min-max-label'], [], labelText);
        const labelCheckbox = GM.HF.createNewCheckbox('', '', [], [], 'include-row', 'Include', true);
        const leftInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper'], []);
        const rightInputWrapper = GM.HF.createNewDiv('', '', ['min-max-input-wrapper'], []);
        const leftInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Min');
        const leftInput = GM.HF.createNewTextInput('', '', [], [], 'text');
        const rightInputLabel = GM.HF.createNewParagraph('', '', [], [], 'Max');
        const rightInput = GM.HF.createNewTextInput('', '', [], [], 'text');
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

    getHTML = () => this.dataTable.get('wrapper');

}