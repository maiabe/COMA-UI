import { GM } from "../../main.js";
import chartThemes from '../../dataComponents/charts/echarts/theme/echartsThemes.js';

export class PopupContentMaker {

    dataTable;

    constructor() {
        this.dataTable = new Map();
        this.dataTable.set('popupContentWrapper', GM.HF.createNewDiv('', '', [], []));

    }

    addDescriptionText(text) {
        this.getPopupContentWrapper()
            .appendChild(GM.HF.createNewParagraph('', '', ['popup-module-description'], [], text));
    }

    createFileUploadField(callback, key) {
        const uploadWrapper = GM.HF.createNewDiv('', '', ['uploadWrapper'], []);
        this.getPopupContentWrapper().appendChild(uploadWrapper);
        const upload = GM.HF.createNewFileInput('upload_csv', 'upload_csv', [], [], 'file', false);
        uploadWrapper.append(upload);
        upload.addEventListener('change', callback);
        this.dataTable.set('readFileButton', GM.HF.createNewButton('read-file-button', 'read-file-button', [], [], 'button', 'Read File', true));
        uploadWrapper.appendChild(this.getField('readFileButton'));
        this.getField('readFileButton').addEventListener('click', () => {
            GM.MM.readFile('csv', 'html', 'upload_csv', key);
        });
    }

    addDataArea() {
        this.dataTable.set('dataArea', GM.HF.createNewDiv('csvDataArea', 'csvDataArea', [], []));
        this.getPopupContentWrapper().appendChild(this.dataTable.get('dataArea'));
        return this.getField('dataArea');
    }

    addPlotDiv(key) {
        this.dataTable.set('plotDiv', GM.HF.createNewDiv(`plot_${key}`, `plot_${key}`, ['plot1'], ['chartDiv']));
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
        return GM.HF.createNewSelect(`plot_${key}`, `plot_${key}`, ['plot-dd'], [], chartThemes, chartThemes);
    };

    setEchartThemeDropdownEventListener = (dropDownElement, key) => {
        dropDownElement.addEventListener('change', event => {
            GM.MM.handleEchartThemeChange(key, event.target.value);
        });
    }

    getField = key => this.dataTable.get(key);

    getPopupContentWrapper = () => this.dataTable.get('popupContentWrapper');
}