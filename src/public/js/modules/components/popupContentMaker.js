import { HTMLFactory } from "../../htmlGeneration/htmlFactory.js";
import chartThemes from '../../dataComponents/charts/echarts/theme/echartsThemes.js';
import { Message, Publisher } from "../../communication/index.js";
import { POPUP_CONTENT_MAKER, INPUT_MANAGER, OUTPUT_MANAGER } from "../../sharedVariables/constants.js";

export class PopupContentMaker {

    dataTable;

    constructor() {
        this.dataTable = new Map();
        this.HF = new HTMLFactory();
        this.dataTable.set('popupContentWrapper', this.HF.createNewDiv('', '', [], []));
        this.publisher = new Publisher();
    }

    addDescriptionText(text) {
        this.getPopupContentWrapper()
            .appendChild(this.HF.createNewParagraph('', '', ['popup-module-description'], [], text));
    }

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

    addMetadataCard(metadata) {
        console.log(metadata);
    }

    addDataArea() {
        this.dataTable.set('dataArea', this.HF.createNewDiv('csvDataArea', 'csvDataArea', [], []));
        this.getPopupContentWrapper().appendChild(this.dataTable.get('dataArea'));
        return this.getField('dataArea');
    }

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