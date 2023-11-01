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
    constructor(moduleKey, columnHeaders, buttonName) {
        this.#wrapper = GM.HF.createNewDiv('include-column-card-' + moduleKey, '', ['include-column-card'], [], [], '');

        //this.#appendChildren(this.#wrapper, header, checkboxArray);
        this.#createElements(moduleKey, columnHeaders, buttonName);

        this.#buildCard();
    }

    #createElements(moduleKey, columnHeaders, buttonName) {
        this.#createFieldsInputTable(columnHeaders);
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

    #createFieldsInputTable(columnHeaders) {
        const bodyWrapper = GM.HF.createNewDiv('', '', ['body-wrapper'], [], [], '');
        const columnTitleWrapper = GM.HF.createNewDiv('', '', ['title-wrapper'], [], [], '');

        // create column title
        //const columnTitle_Include = GM.HF.createNewH3('', '', ['include-column-card-title'], [{ style: 'width', value: '23.33%' }, { style: 'text-align', value: 'center' }], 'Include');
        const columnTitle_Columns = GM.HF.createNewH3('', '', ['title'], [{ style: 'width', value: '80%' }], 'Include columns');
        //const columnTitle_Units = GM.HF.createNewH3('', '', ['title'], [{ style: 'width', value: '20%' }], 'Units');

        //columnTitleWrapper.appendChild(columnTitle_Include);
        columnTitleWrapper.appendChild(columnTitle_Columns);
        //columnTitleWrapper.appendChild(columnTitle_Units);
        bodyWrapper.appendChild(columnTitleWrapper);

        const includeColumnsWrapper = GM.HF.createNewDiv('', '', ['include-columns-wrapper'], [], [], '');
        bodyWrapper.appendChild(includeColumnsWrapper);

        /*columnHeaders = [
            { fieldName: 'test1', dataType: 'value' },
            { fieldName: 'test2', data: [{ fieldName: 'testtest1', dataType: 'value' }, { fieldName: 'testtest2', dataType: 'category' }, { fieldName: 'TEST', data: [{ fieldName: 'lalala', dataType: 'value' }, { fieldName: 'lalala', dataType: 'category' }] }] },
            { fieldName: 'test2', data: [{ fieldName: 'testtest1', dataType: 'value' }, { fieldName: 'testtest2', dataType: 'category' }, { fieldName: 'TEST', data: [{ fieldName: 'lalala', dataType: 'value' }, { fieldName: 'lalala', dataType: 'category' }] }] },
            { fieldName: 'test4', dataType: 'value' },
        ];*/

        this.#createColumnGroups(columnHeaders, includeColumnsWrapper);


        // create field elements
        /*columnHeaders.forEach(columnHeader => {
            var column = columnHeader;
            if (column.hasOwnProperty('data')) {
                var columnData = column.data;
                var columnGroupWrapper = GM.HF.createNewDiv('', '', ['column-group-wrapper'], [], [], '');
                var columnDataLabel = GM.HF.createNewLabel('', '', `column-group-${column.fieldName}`, ['column-group-label'], [], column.fieldName)
                var columnDataWrapper = GM.HF.createNewDiv(`column-group-${column.fieldName}`, `${column.fieldName}`, ['column-group'], [], [], '');
                columnGroupWrapper.appendChild(columnDataLabel);
                columnData.forEach(cd => {
                    column = cd;
                    var columnInputWrapper = this.#createFieldElements(column);
                    columnDataWrapper.appendChild(columnInputWrapper);
                });
                columnGroupWrapper.appendChild(columnDataWrapper);
                bodyWrapper.appendChild(columnGroupWrapper);
            }
            else {
                var columnInputWrapper = this.#createFieldElements(column);
                bodyWrapper.appendChild(columnInputWrapper);
            }
        });*/
        this.#bodyElements = bodyWrapper;
    }

    #createColumnGroups(columnHeaders, columnWrapper) {
        columnHeaders.forEach(columnHeader => {
            if (columnHeader.hasOwnProperty('data')) {
                var columnGroupWrapper = GM.HF.createNewDiv('', '', ['column-group-wrapper'], [], [], '');
                var columnDataLabel = GM.HF.createNewLabel('', '', `column-group-${columnHeader.fieldName}`, ['column-group-label'], [], columnHeader.fieldName)
                var columnDataWrapper = GM.HF.createNewDiv(`column-group-${columnHeader.fieldName}`, `${columnHeader.fieldName}`, ['column-group'], [], [], '');
                columnGroupWrapper.appendChild(columnDataLabel);
                columnGroupWrapper.appendChild(columnDataWrapper);
                columnWrapper.appendChild(columnGroupWrapper);

                var nestedColumnHeaders = columnHeader.data;
                this.#createColumnGroups(nestedColumnHeaders, columnDataWrapper);
            }
            else {
                var columnInputWrapper = this.#createFieldElements(columnHeader);
                columnWrapper.appendChild(columnInputWrapper);
            }
        });
    }

    #createFieldElements(column) {
        const columnInputWrapper = GM.HF.createNewDiv('', '', ['column-wrapper'], [], [], '');

        var checkbox = GM.HF.createNewCheckbox('checkbox-' + column.fieldName, column.fieldName, ['include-column-checkbox'], [], column.fieldName, column.fieldName, true);
        var unitsWrapper = GM.HF.createNewDiv('', '', ['dropdown-wrapper'], [], [], '');
        if (column.units) {
            var unitsDropdown = GM.HF.createNewSelect('dropdown-' + column.fieldName, column.fieldName, ['include-column-dropdown'], [], Object.keys(column.units), Object.keys(column.units));
            unitsWrapper.appendChild(unitsDropdown);
        }
        columnInputWrapper.appendChild(checkbox.wrapper);
        columnInputWrapper.appendChild(unitsWrapper);

        return columnInputWrapper;
    }
    

    #createViewButton(moduleKey, buttonName) {
        const viewButtonWrapper = GM.HF.createNewDiv('', '', ['view-button-wrapper'], [], [], '');
        const viewButton = GM.HF.createNewButton('view-button-'+ moduleKey, '', ['btn', 'view-btn'], [], 'button', buttonName, false);
        viewButtonWrapper.appendChild(viewButton);
        this.#viewButton = viewButtonWrapper;
    }


    // add eventListener for view button
    
    

    getCard() {
        return { wrapper: this.#wrapper, bodyElements: this.#bodyElements, viewButton: this.#viewButton };
    }
}