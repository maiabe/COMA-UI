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



    updateXAxisFieldName = event => this.#setData('xAxisField', event.target.value);
    updateYAxisFieldName = event => {
        const yAxisArray = this.#dataTable.get('yAxisField');
        const index = event.target.id.split('-')[0];
        yAxisArray[index] = event.target.value;
        console.log(this.#dataTable);
    }

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

    toggleIncludeHeader(event) {
        const headerArray = this.#dataTable.get('headers');
        headerArray.forEach(header => {
            if (header.label === event.target.value) header.include = event.target.checked;
        });
    }

    storeHeaders(headers) {
        const headerArray = [];
        headers.forEach(header => {
            headerArray.push({ label: header, include: true });
        });
        this.#setData('headers', headerArray);
    }

    getHeaders = () => {
        const headers = this.#dataTable.get('headers');
        const lables = [];
        headers.forEach(header => lables.push(header.label));
        return lables;
    }

    addInitialValueForNewTrace(value, errorValue, index) {
        this.#dataTable.get('yAxisField')[index] = value;
        this.#dataTable.get('yAxisErrorField')[index] = errorValue;
        this.numberOfTraces++;
    }
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

    getTableData() {
        return this.#dataTable.get('headers');
    }

    getNumberOfTraces = () => this.numberOfTraces;

    #setData(key, value) {
        this.#dataTable.set(key, value);
    }
}