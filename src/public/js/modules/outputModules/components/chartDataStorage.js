export class ChartDataStorage {

    #dataTable;

    constructor(chartType) {
        this.#dataTable = new Map();
        this.#setData('chartType', chartType);
    }

    listenToXAxisDataChanges(element) { element.addEventListener('change', this.updateXAxisFieldName.bind(this)); }
    listenToYAxisDataChanges(element) { element.addEventListener('change', this.updateYAxisFieldName.bind(this)); }
    listenToXAxisLabelChanges(element) { element.addEventListener('change', this.updateXAxisLabel.bind(this)); }
    listenToYAxisLabelChanges(element) { element.addEventListener('change', this.updateYAxisLabel.bind(this)); }
    listenToXAxisTickChanges(element) { element.addEventListener('change', this.updateXAxisTick.bind(this)) };
    listenToYAxisTickChanges(element) { element.addEventListener('change', this.updateYAxisTick.bind(this)) };
    listenToXAxisGridChanges(element) { element.addEventListener('change', this.updateXAxisGrid.bind(this)) };
    listenToYAxisGridChanges(element) { element.addEventListener('change', this.updateYAxisGrid.bind(this)) };

    updateXAxisFieldName = event => this.#setData('xAxisField', event.target.value);
    updateYAxisFieldName = event => this.#setData('yAxisField', event.target.value);
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

    setInitialValues(xAxisField, yAxisField, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick) {
        this.#setData('xAxisField', xAxisField);
        this.#setData('yAxisField', yAxisField);
        this.#setData('xAxisLabel', xAxisLabel);
        this.#setData('yAxisLabel', yAxisLabel);
        this.#setData('xAxisGrid', xAxisGrid);
        this.#setData('yAxisGrid', yAxisGrid);
        this.#setData('xAxisTick', xAxisTick);
        this.#setData('yAxisTick', yAxisTick)
    }

    toggleIncludeHeader(event) {
        const headerArray = this.#dataTable.get('headers');
        headerArray.forEach(header => {
            if (header.label === event.target.value) header.include = event.target.checked;
        });
        console.log(this.#dataTable);
    }

    storeHeaders(headers) {
        const headerArray = [];
        headers.forEach(header => {
            headerArray.push({ label: header, include: true });
        });
        this.#setData('headers', headerArray);
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
            yAxisTick: this.#dataTable.get('yAxisTick')
        };
    }

    getTableData() {
        return this.#dataTable.get('headers');
    }

    #setData(key, value) {
        this.#dataTable.set(key, value);
    }
}