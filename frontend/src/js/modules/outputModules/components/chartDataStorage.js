/*************************************************************
 * COPYRIGHT University of Hawaii - COMA Project / Lava Lab  *
 * Author: James Hutchison                                   *
 * Date: 5/5/2022                                            *
 *************************************************************/
export class ChartDataStorage {

    #dataTable;
    numberOfTraces;

    constructor(chartType, coordinateSystem) {
        this.#dataTable = new Map();
        this.numberOfTraces = 0;
        this.#setData('chartType', chartType);
        this.#setData('coordinateSystem', coordinateSystem);
    }

    set_2D_XAxisListeners(xAxis) {
        this.listenToXAxisDataChanges(xAxis.dropdown);
        this.listenToXAxisLabelChanges(xAxis.labelInput);
        this.listenToXAxisTickChanges(xAxis.tickCheckbox.checkbox);
        this.listenToXAxisGridChanges(xAxis.gridCheckbox.checkbox);
    }

    set_2D_YAxisListeners(yAxis) {
        this.listenToYAxisDataChanges(yAxis.dropdown);
        this.listenToYAxisErrorChanges(yAxis.errorDropDown);
        this.listenToYAxisLabelChanges(yAxis.labelInput);
        this.listenToYAxisTickChanges(yAxis.tickCheckbox.checkbox);
        this.listenToYAxisGridChanges(yAxis.gridCheckbox.checkbox);
    }

    listenToXAxisDataChanges(element) { element.addEventListener('change', this.updateXAxisFieldName.bind(this)); }
    listenToYAxisDataChanges(element) { element.addEventListener('change', this.updateYAxisFieldName.bind(this)); }
    listenToYAxisErrorChanges(element) { element.addEventListener('change', this.updateYAxisErrorFieldName.bind(this)); }
    listenToXAxisLabelChanges(element) { element.addEventListener('change', this.updateXAxisLabel.bind(this)); }
    listenToYAxisLabelChanges(element) { element.addEventListener('change', this.updateYAxisLabel.bind(this)); }
    listenToXAxisTickChanges(element) { element.addEventListener('change', this.updateXAxisTick.bind(this)) };
    listenToYAxisTickChanges(element) { element.addEventListener('change', this.updateYAxisTick.bind(this)) };
    listenToXAxisGridChanges(element) { element.addEventListener('change', this.updateXAxisGrid.bind(this)) };
    listenToYAxisGridChanges(element) { element.addEventListener('change', this.updateYAxisGrid.bind(this)) };


    /** --- PUBLIC ---
     * Updates the X Axis field name
     * @param {DOM Event} event a change event when user changes the X axis dropdown  */
    updateXAxisFieldName = event => this.#setData('xAxisField', event.target.value);

    /** --- PUBLIC ---
     * Updates the Y Axis field name
     * @param {DOM Event} event a change event when user changes one of the Y axis drop downs  */
    updateYAxisFieldName = event => {
        const yAxisArray = this.#dataTable.get('yAxisField');
        const index = event.target.id.split('-')[0];
        yAxisArray[index] = event.target.value;
        console.log(this.#dataTable);
    }

    /** --- PUBLIC ---
     * Updates the Y Axis error field name
     * @param {DOM Event} event a change event when user changes one of the Y axis error drop downs  */
    updateYAxisErrorFieldName = event => {
        const yAxisErrorArray = this.#dataTable.get('yAxisErrorField');
        const index = event.target.id.split('-')[0];
        yAxisErrorArray[index] = event.target.value;
        console.log(this.#dataTable);
    }


    updateXAxisLabel = event => this.#setData('xAxisLabel', event.target.value);
    updateYAxisLabel = event => this.#setData('yAxisLabel', event.target.value);
    updateXAxisTick = event => this.#setData('xAxisTick', event.target.checked);
    updateYAxisTick = event => this.#setData('yAxisTick', event.target.checked);
    updateXAxisGrid = event => this.#setData('xAxisGrid', event.target.checked);
    updateYAxisGrid = event => this.#setData('yAxisGrid', event.target.checked);


    listenToCheckboxChanges(checkboxes) {
        checkboxes.forEach(box => {
            box.checkbox.addEventListener('change', this.toggleIncludeHeader.bind(this));
        });
    }

    /** --- PUBLIC ---
     * Sets the initial values for the object
     * @param {string} xAxisField name of the column to use for the x axis data
     * @param {string} yAxisField name of the column to use for the y axis data
     * @param {string} xAxisLabel x axis label
     * @param {string} yAxisLabel y axis label
     * @param {boolean} xAxisGrid turn grid lines on or off
     * @param {boolean} yAxisGrid turn grid lines on or off
     * @param {boolean} xAxisTick turn tick lines on or off
     * @param {boolean} yAxisTick turn tick lines on or off
     * @param {string} yAxisErrorDropdownField name of the column to use for the y axis error data */
    setInitialValues(xAxisField, yAxisField, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, yAxisErrorDropdownField) {
        const yAxisFieldArray = new Array(100);
        const yAxisErrorFieldArray = new Array(100);
        yAxisFieldArray[this.numberOfTraces] = yAxisField;
        yAxisErrorFieldArray[this.numberOfTraces] = yAxisErrorDropdownField;
        this.#setData('xAxisField', xAxisField);
        this.#setData('yAxisField', yAxisFieldArray);
        this.#setData('xAxisLabel', xAxisLabel);
        this.#setData('yAxisLabel', yAxisLabel);
        this.#setData('xAxisGrid', xAxisGrid);
        this.#setData('yAxisGrid', yAxisGrid);
        this.#setData('xAxisTick', xAxisTick);
        this.#setData('yAxisTick', yAxisTick);
        this.#setData('yAxisErrorField', yAxisErrorFieldArray);
        this.numberOfTraces = 1;
    }

    /** --- PUBLIC ---
     * Users can uncheck boxes which will remove a field from consideration when a table is built.
     * @param {DOM Event} event event when a checkbox is clicked */
    toggleIncludeHeader(event) {
        const headerArray = this.#dataTable.get('headers');
        headerArray.forEach(header => {
            if (header.label === event.target.value) header.include = event.target.checked;
        });
    }

    /** --- PUBLIC ---
     * Stores the list of column headers
     * @param {string[]} headers array of header name strings */
    storeHeaders(headers) {
        const headerArray = [];
        headers.forEach(header => {
            headerArray.push({ label: header, include: true });
        });
        this.#setData('headers', headerArray);
    }

    /** --- PUBLIC ---
     * returns the array of headers
     * @returns array of strings, one for each header (column name)  */
    getHeaders = () => {
        const headers = this.#dataTable.get('headers');
        const lables = [];
        headers.forEach(header => lables.push(header.label));
        return lables;
    }

    /** --- PUBLIC ---
     * When a new trace is added, the output Manager will call this function to add
     * initial values for the trace. They will be the first options in the drop downs.
     * @param {string} value The default value in the y axis data dropdown
     * @param {string} errorValue the default value in the y axis error dropdown
     * @param {number} index The index into the array of Y axis traces */
    addInitialValueForNewTrace(value, errorValue, index) {
        this.#dataTable.get('yAxisField')[index] = value;
        this.#dataTable.get('yAxisErrorField')[index] = errorValue;
        this.numberOfTraces++;
    }

    /** --- PUBLIC ---
     * Gets necessary data to build a chart.
     * @returns xAxisField, yAxisField, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, coordinateSystem, headers, yAxisErrorField */
    getChartData() {
        return {
            xAxisField: this.#dataTable.get('xAxisField'),
            yAxisField: this.#dataTable.get('yAxisField'),
            xAxisLabel: this.#dataTable.get('xAxisLabel'),
            yAxisLabel: this.#dataTable.get('yAxisLabel'),
            xAxisGrid: this.#dataTable.get('xAxisGrid'),
            yAxisGrid: this.#dataTable.get('yAxisGrid'),
            xAxisTick: this.#dataTable.get('xAxisTick'),
            yAxisTick: this.#dataTable.get('yAxisTick'),
            coordinateSystem: this.#dataTable.get('coordinateSystem'),
            yAxisErrorField: this.#dataTable.get('yAxisErrorField'),
            headers: this.#dataTable.get('headers')
        };
    }

    getNumberOfTraces = () => this.numberOfTraces;
    
    /** --- PRIVATE ---
    * Sets key value pair in the dataTable
    * @param {string} key 
    * @param {any} value  */
    #setData(key, value) {
        this.#dataTable.set(key, value);
    }
}