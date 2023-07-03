/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison / Mai Abe                         *
 * Date: 5/5/2022                                            *
 *************************************************************/
import { GM } from "../../../main.js";

export class IncludeColumnCard {

    #wrapper;
    // card column titles
    // card inputs
    #bodyElements;
    #viewButton;

    // params: fields object includes the { fieldName, displayName, units (temp) }
    constructor(moduleKey, fields, buttonName) {
        this.#wrapper = GM.HF.createNewDiv('include-column-card-' + moduleKey, '', ['include-column-card'], []);

        //this.#appendChildren(this.#wrapper, header, checkboxArray);
        this.#createElements(moduleKey, fields, buttonName);

        this.#buildCard();
    }

    #createElements(moduleKey, fields, buttonName) {   
        this.#createFieldsInputTable(moduleKey, fields);
        // create button
        this.#createViewButton(moduleKey, buttonName);
    }


    #buildCard() {
        // append header, column titles, input fields and viewButton to the table
        const header = GM.HF.createNewH3('', '', ['include-column-card-header'], [], 'Include Checked Columns');

        this.#wrapper.appendChild(header);
        this.#wrapper.appendChild(this.#bodyElements);
        this.#wrapper.appendChild(this.#viewButton);
    }

    #createFieldsInputTable(moduleKey, fields) {
        const bodyWrapper = GM.HF.createNewDiv('', '', ['include-column-card-body-wrapper'], []);
        const columnTitleWrapper = GM.HF.createNewDiv('', '', ['include-column-card-title-wrapper'], []);

        // create column title
        //const columnTitle_Include = GM.HF.createNewH3('', '', ['include-column-card-title'], [{ style: 'width', value: '23.33%' }, { style: 'text-align', value: 'center' }], 'Include');
        const columnTitle_Columns = GM.HF.createNewH3('', '', ['include-column-card-title'], [{ style: 'width', value: '80%' }], 'Include columns');
        const columnTitle_Units = GM.HF.createNewH3('', '', ['include-column-card-title'], [{ style: 'width', value: '20%' }], 'Units');

        //columnTitleWrapper.appendChild(columnTitle_Include);
        columnTitleWrapper.appendChild(columnTitle_Columns);
        columnTitleWrapper.appendChild(columnTitle_Units);
        bodyWrapper.appendChild(columnTitleWrapper);

        // create field elements
        fields.forEach(field => {
            const fieldsInputWrapper = GM.HF.createNewDiv('', '', ['include-column-card-fields-wrapper'], []);

            var checkbox = GM.HF.createNewCheckbox('checkbox-' + field.fieldName, field.fieldName, ['include-column-checkbox'], [], field.fieldName, field.displayName, true);
            var unitsWrapper = GM.HF.createNewDiv('', '', ['dropdown-wrapper'], []);
            if (field.units) {
                var unitsDropdown = GM.HF.createNewSelect('dropdown-' + field.fieldName, field.fieldName, ['include-column-dropdown'], [], Object.keys(fields.units), Object.keys(fields.units));
                unitsWrapper.appendChild(unitsDropdown);
            }
            fieldsInputWrapper.appendChild(checkbox.wrapper);
            fieldsInputWrapper.appendChild(unitsWrapper);
            bodyWrapper.appendChild(fieldsInputWrapper);
        });
        this.#bodyElements = bodyWrapper;
    }

    #createViewButton(moduleKey, buttonName) {
        const viewButtonWrapper = GM.HF.createNewDiv('', '', ['view-button-wrapper'], []);
        const viewButton = GM.HF.createNewButton('include-column-card-view-button-'+ moduleKey, '', ['btn', 'include-column-card-view-btn'], [], 'button', buttonName, false);
        viewButtonWrapper.appendChild(viewButton);
        this.#viewButton = viewButtonWrapper;
    }


    // add eventListener for view button
    
    

    getCard() {
        return { wrapper: this.#wrapper, bodyElements: this.#bodyElements, viewButton: this.#viewButton };
    }
}