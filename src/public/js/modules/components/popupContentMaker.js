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

    /** --- PUBLIC --- DEPRECATED
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
     * @params {Object} data to update the content with.
     * @returns HTML div (content of the popup to be updated)
     */
    setSearchModuleContent(moduleKey, content, data) {
        // if content is for Search Module.. display tabulator table >>>>>>>>>>>> change to switch statement?
       /* if (data.tableData) {
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
                console.log(data);
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
        }*/

        var popupcontent = content.querySelector('div');
        if (popupcontent) {
            content.removeChild(content.querySelector('div'));
        }
        content.style.height = "calc(100% - 2rem)"; // set height to fit content

        if (data) {
            var popupContentWrapper = this.HF.createNewDiv('popup-content-wrapper-' + moduleKey, '', ['popup-content-wrapper'], []);
            // temp content
            var queryType = this.HF.createNewH1('', '', ['query-type'], [], data.queryType);
            popupContentWrapper.appendChild(queryType);

            var queryKeys = Object.keys(data.queryEntries);
            queryKeys.forEach(key => {
                var queryEntryDiv = this.HF.createNewDiv('', '', ['query-entries'], []);
                var label = this.HF.createNewLabel('', '', 'query-type-' + key, ['query-type'], [], key + ': ');
                var span = this.HF.createNewSpan('query-type-' + key, '', ['query-type'], [], data.queryEntries[key]);
                queryEntryDiv.appendChild(label);
                queryEntryDiv.appendChild(span);
                popupContentWrapper.appendChild(queryEntryDiv);
            });

            content.appendChild(popupContentWrapper);
        }
    }

    setTablePopupContent(moduleKey) {
        // Create CSV download button
        var downloadWrapper = this.HF.createNewDiv('download-wrapper', '', ['download-wrapper'], []);
        var downloadBtn = this.HF.createNewButton('', [], ['download-csv-button'], ['border-radius: 3px'], 'button', 'Download CSV');
        downloadWrapper.appendChild(downloadBtn);
        this.dataTable.set('downloadControls', downloadWrapper);
        // Create table wrapper
        var tableWrapper = this.HF.createNewDiv(`table-wrapper-${moduleKey}` , '', ['table-wrapper'], []);

        this.getPopupContentWrapper().appendChild(downloadWrapper);
        this.getPopupContentWrapper().appendChild(tableWrapper);
        
    }

    setTableData(moduleKey, content, data) {
        if (data) {
            var tableWrapper = content.querySelector('.table-wrapper');
            var downloadBtn = content.querySelector('.download-wrapper');

            // Organize data for the tabulator data
            var table = this.chartBuilder.plotData(data, 'table', tableWrapper, '', '80%', 'tabulator');

            // add download csv event listener
            downloadBtn.addEventListener('click', function () {
                var filename = `table-results-${moduleKey}`;
                table.download('csv', `${filename}.csv`, { delimiter: "," });
            });



            /*if (content.querySelector('.tabulator') == null) {
                // delete any div child under popup content
                var popupcontent = content.querySelector('div');
                if (popupcontent) {
                    content.removeChild(content.firstChild);
                }
                content.style.height = "calc(100% - 3rem)"; // set height to fit content

                var downloadBtn = this.HF.createNewButton('', [], ['download-csv-button'], ['border-radius: 3px'], 'button', 'Download CSV');
                this.dataTable.set('downloadControls', this.HF.createNewDiv('download-wrapper', '', ['download-wrapper'], []));
                this.getField('downloadControls').appendChild(downloadBtn);
                content.appendChild(this.getField('downloadControls'));

                var tableWrapper = this.HF.createNewDiv('table-wrapper-' + moduleKey, '', ['table-wrapper', 'tabulator'], []);
                this.dataTable.set('tableWrapper-' + moduleKey, tableWrapper);

                content.appendChild(this.getField('tableWrapper-' + moduleKey));
                var table = this.chartBuilder.plotData(data.tableData, 'table', tableWrapper, '', '85%', 'tabulator');
                // add download csv event listener
                downloadBtn.addEventListener('click', function () {
                    var filename = 'table-results-' + moduleKey;
                    table.download('csv', filename + '.csv');
                });
            }
            else {
                console.log('------------ update table content ------------');
                var pdiv = content.querySelector('.table-wrapper'); // get from dataTable instead
                this.chartBuilder.updatePlotData(data.tableData, 'table', pdiv, '', '', 'tabulator');
            }*/
        }
    }

    /***************** SEARCH Module ******************/
    /***************** Mai 041923 ******************/
    /** --- PUBLIC ---
     * Sets error message in the popup content.
     * @params {number} key the keyof the parent module for this popup.
     * @params {object} object containing error details (messages, etc)
     * @returns HTML div (content of the popup to be updated displayed)
     */
    setErrorDisplay(moduleKey, content, data) {
        /*var popupcontent = content.querySelector('div');
        if (popupcontent) {
            content.removeChild(content.firstChild);
        }*/
        // Search Module Error .......... [change to switch statement]
        if (data.queryEntries) {
            // if query type, search module error
            const messages = [];
            let errorMessage = this.HF.createNewParagraph('', '', ['error-message'], [], 'The following query failed:');
            messages.push(errorMessage);
            let queryFields = this.HF.createNewDiv('', '', ['error-message'], [{ key: 'display', value: 'grid' }, { key: 'grid-template-columns', value: 'repeat(3, 1fr)' }]);
            let queryKeys = Object.keys(data.queryEntries);

            // Find the longest string in queryKeys
            let longestText = '';
            queryKeys.forEach(text => {
                if (text.length > longestText.length) {
                    longestText = text;
                }
            });

            // Fields of the query that failed
            queryKeys.forEach((key) => {
                let wrapper = this.HF.createNewParagraph('', '', ['error-query-wrapper'], [], '');
                let keySpan = this.HF.createNewSpan('', '', ['error-query-key'],
                    [{ style: 'width', value: longestText.length + 'ch' }, { style: 'text-align', value: 'right' }], key + ':');
                keySpan.innerHTML += '&nbsp;&nbsp;';
                let valueSpan = this.HF.createNewSpan('', '', ['error-query-value'], [], data.queryEntries[key]);
                wrapper.appendChild(keySpan);
                wrapper.appendChild(valueSpan);
                queryFields.appendChild(wrapper);
            });
            messages.push(queryFields);

            // error contact message sentence organized into span and anchor elements
            let errorContact = this.HF.createNewParagraph('', '', ['error-contact-wrapper'], [], '');
            let firstspan = this.HF.createNewSpan('', '', ['error-contact'], [], 'Please contact the ');
            let anchor = this.HF.createNewAnchor('mailto:admin@comaifa.com', '', '', ['error-contact'], [], 'admin@comaifa.com');
            let lastspan = this.HF.createNewSpan('', '', ['error-contact'], [], ' if error persists.');
            errorContact.appendChild(firstspan);
            errorContact.appendChild(anchor);
            errorContact.appendChild(lastspan);
            messages.push(errorContact);

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
            
        
    }

    /** --- PUBLIC ---
     * 
     * @param {*} key 
     * @returns 
     */
    addPlotDiv(key) {
        this.dataTable.set('plotDiv', this.HF.createNewDiv(`plot_${key}`, `plot_${key}`, ['plot-wrapper'], ['chartDiv']));
        this.getPopupContentWrapper().appendChild(this.getField('plotDiv'));
        return this.getField('plotDiv');
    }

    addEChartThemeDropdown(key) {
        var themeDDWrapper = this.HF.createNewDiv('', '', ['chart-theme-wrapper'], []);
        this.dataTable.set('themeDD', this.HF.createNewSelect(`chart-theme-dd-${key}`, '', ['chart-theme-dd'], [], chartThemes, chartThemes));
        var themeDD = this.getField('themeDD');
        this.setEchartThemeDropdownEventListener(themeDD, key);

        themeDDWrapper.appendChild(themeDD);
        this.getPopupContentWrapper().appendChild(themeDDWrapper);
        return themeDD;
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