import { HTMLFactory } from "../../htmlGeneration/htmlFactory.js";
import chartThemes from '../../dataComponents/charts/echarts/theme/echartsThemes.js';
import { ChartBuilder } from '../../dataComponents/charts/chartBuilder.js';
import { Message, Publisher } from "../../communication/index.js";
import { POPUP_CONTENT_MAKER, INPUT_MANAGER, OUTPUT_MANAGER } from "../../sharedVariables/constants.js";

export class PopupContentMaker {

    dataTable;

    constructor() {
        this.dataTable = new Map();
        this.HF = new HTMLFactory();
        this.dataTable.set('popupContentWrapper', this.HF.createNewDiv('', '', ['popup-content'], []));
        this.publisher = new Publisher();
        this.chartBuilder = new ChartBuilder();
    }

    /** --- PUBLIC ---
     * Appends the description string to the popup content wraper.
     * @param {string} text a description of the module associated with the popup.
     */
    addDescriptionText(text) {
        this.getPopupContentWrapper()
            .appendChild(this.HF.createNewParagraph('', '', ['popup-module-description'], [], text));
    }

    /** --- PUBLIC ---
     * Creates the HTML elements for the file upload section and binds a callback function to the button.
     * @param {function} callback validates the file on the CSV module
     * @param {number} key id of the CSV module that created this.
     */
    createFileUploadField(callback, key) {
        const uploadWrapper = this.HF.createNewDiv('', '', ['uploadWrapper'], []);
        this.getPopupContentWrapper().appendChild(uploadWrapper);
        const upload = this.HF.createNewFileInput('upload_csv', 'upload_csv', [], [], 'file', false);
        uploadWrapper.append(upload);
        upload.addEventListener('change', callback);
        this.dataTable.set('readFileButton', this.HF.createNewButton('read-file-button', 'read-file-button', [], [], 'button', 'Read File', true));
        uploadWrapper.appendChild(this.getField('readFileButton'));
        this.getField('readFileButton').addEventListener('click', () => {
            const message = new Message(INPUT_MANAGER, POPUP_CONTENT_MAKER, 'Read File Event', {
                type: 'csv',
                source: 'html',
                path: 'upload_csv',
                moduleKey: key
            });
            this.sendMessage(message);
        });
    }

    /** --- PUBLIC ---
     * Not Yet Implemented --- 
     * Should display information about the metadata for a data set.
    */
    addMetadataCard(metadata) {
        console.log(metadata);
    }

    addDataCard(data, tableId) {
        // create table elements
        // display headers
        // display content
        // console.log(data);

        // change to plotly data display instead of HTML
        return this.HF.createNewTable(data, 10, tableId);
    }

    /** --- PUBLIC ---
     * Called by the CSV source. This will create a DIV where data about the csv file can be inserted.
     * @returns HTML div
     */
    addDataArea() {
        this.dataTable.set('dataArea', this.HF.createNewDiv('csvDataArea', 'csvDataArea', [], []));
        this.getPopupContentWrapper().appendChild(this.dataTable.get('dataArea'));
        return this.getField('dataArea');
    }


    /** --- PUBLIC ---
     * Stores the chart information and data into the outputmap hash table.
     * @param {number} key key identifying the location in the hash table. it is also the id of the module associated with this chart.
     * @param {object} data the data that is used for the chart
     * @param {object} div the html div to inject the chart
     * @param {string} type the type of chart. ie. 'bar', 'scatter'
     * @param {string} xAxisLabel (Optional)
     * @param {string} yAxisLabel (Optional)
     * @returns true if successful, false if failure  
     */
    /*
    storeChartData = (key, data, div, type, xAxisLabel, yAxisLabel, xAxisGrid, yAxisGrid, xAxisTick, yAxisTick, coordinateSystem) => {
        if (invalidVariables([varTest(key, 'key', 'number'), varTest(data, 'data', 'object'), varTest(div, 'div', 'object'), varTest(type, 'type', 'string')], 'OutputManager', 'storeChartData')) return false;
        this.#outputMap.set(key, { data: data, type: type, div: div, outputType: 'chart', framework: this.#getFramework(type), theme: 'dark', xAxisLabel: xAxisLabel, yAxisLabel: yAxisLabel, xAxisGrid: xAxisGrid, yAxisGrid: yAxisGrid, xAxisTick: xAxisTick, yAxisTick: yAxisTick, coordinateSystem: coordinateSystem });
        return true;
    }*/


    /***************** Mai 022823 ******************/
    /** --- PUBLIC ---
     * Called from Search Module when data is queried. This will create a search result data table
     * @params {Object} data to update the content with. The data contains columns array and tabledata array of jsonData
     * @returns HTML div (content of the popup to be updated)
     */
    setSearchResultTable(moduleKey, data, content) {
        // Organize data for the tabulator data
        if (content.querySelector('.tabulator') == null) {
            // delete any div child under popup content
            var popupcontent = content.querySelector('div');
            if (popupcontent) {
                content.removeChild(content.querySelector('div'));
            }

            content.style.height = "calc(100% - 2rem)"; // set height to fit content

            var downloadBtn = this.HF.createNewButton('', [], ['download-csv-button'], ['border-radius: 3px'], 'button', 'Download CSV');
            this.dataTable.set('downloadControls', this.HF.createNewDiv('download-wrapper', '', ['download-wrapper'], []));
            this.getField('downloadControls').appendChild(downloadBtn);
            content.appendChild(this.getField('downloadControls'));

            var tableWrapper = this.HF.createNewDiv('table-wrapper-' + moduleKey, '', ['table-wrapper'], []);
            this.dataTable.set('searchTableDiv', tableWrapper);

            content.appendChild(this.getField('searchTableDiv'));
            var table = this.chartBuilder.plotData(data, 'table', tableWrapper, '', '', 'tabulator');

            // add download csv event listener
            downloadBtn.addEventListener('click', function () {
                var filename = 'search-results-' + moduleKey;
                table.download('csv', filename + '.csv');
            });
        }
        // Update table content
        else {
            var pdiv = content.querySelector('.table-wrapper');
            this.chartBuilder.updatePlotData(data, 'table', pdiv, '', '', 'tabulator');
        }
    }


    /***************** Mai 041923 ******************/
    /** --- PUBLIC ---
     * Sets error message in the popup content.
     * @params {number} key the keyof the parent module for this popup.
     * @params {array} array of error message elements (string or span element)
     * @returns HTML div (content of the popup to be updated displayed)
     */
    setErrorDisplay(moduleKey, messages, content) {
        // if it doesnt exist in the dataTable already, set the errorwrapper to dataTable
        if (this.getField('errorWrapper') === undefined) {
            // delete any div child under popup content
            var popupcontent = content.querySelector('div');
            if (popupcontent) {
                content.removeChild(content.querySelector('div'));
            }

            this.dataTable.set('errorWrapper',
                this.HF.createNewDiv('error-wrapper-' + moduleKey, '', ['error-wrapper'],
                    [{ style: 'width', value: '60%' }, { style: 'display', value: 'flex' },
                    { style: 'margin', value: 'auto' }, { style: 'flex-flow', value: 'column' }]));

            var errorWrapper = this.getField('errorWrapper');
            var errorHeader = this.HF.createNewDiv('', '', ['error-header'], [{ style: 'height', value: '2rem' }]);
            var errorBody = this.HF.createNewDiv('', '', ['error-body'], [{ style: 'height', value: '70%' }]);
            var errorTitle = this.HF.createNewH1('', '', ['error-title'], [], 'Error');
            errorWrapper.appendChild(errorHeader);
            errorWrapper.appendChild(errorBody);
            errorHeader.appendChild(errorTitle);

            messages.forEach((message) => {
                errorBody.appendChild(message);
            });
            content.appendChild(errorWrapper);
        }
        // Update the error message
        else {
            var errorWrapper = this.getField('errorWrapper');
            var errorBody = errorWrapper.querySelector('.error-body');
            while (errorBody.firstChild) {
                errorBody.removeChild(errorBody.firstChild);
            }
            messages.forEach((message) => {
                errorBody.appendChild(message);
            });
            errorWrapper.appendChild(errorBody);
        }
    }

    /** --- PUBLIC ---
     * 
     * @param {*} key 
     * @returns 
     */
    addPlotDiv(key) {
        this.dataTable.set('plotDiv', this.HF.createNewDiv(`plot_${key}`, `plot_${key}`, ['plot1'], ['chartDiv']));
        this.getPopupContentWrapper().appendChild(this.getField('plotDiv'));
        return this.getField('plotDiv');
    }

    addEChartThemeDropdown(key) {
        this.dataTable.set('themeDD', this.buildEchartThemeDropdown(key));
        this.setEchartThemeDropdownEventListener(this.getField('themeDD'), key);
        this.getPopupContentWrapper().appendChild(this.getField('themeDD'));
        return this.getField('themeDD');
    }

    buildEchartThemeDropdown = (key) => {
        return this.HF.createNewSelect(`plot_${key}`, `plot_${key}`, ['plot-dd'], [], chartThemes, chartThemes);
    };

    setEchartThemeDropdownEventListener = (dropDownElement, key) => {
        dropDownElement.addEventListener('change', event => {
            this.sendMessage(new Message(OUTPUT_MANAGER, POPUP_CONTENT_MAKER, 'Change EChart Theme Event', { moduleKey: key, theme: event.target.value}));
        });
    }

    getField = key => this.dataTable.get(key);

    getPopupContentWrapper = () => this.dataTable.get('popupContentWrapper');

    sendMessage(msg) {
        console.log(msg)
        this.publisher.publishMessage(msg);
    }
}