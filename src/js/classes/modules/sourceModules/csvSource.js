class Csv extends Source {
    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [];
        this.outPorts = [{ name: 'OUT', leftSide: false }];
        this.setName('CSV File');
        this.image = 'images/icons/csv-file-format-extension.png';
        this.dataArea;
        this.readFileButton;
        this.deployButton;
        this.csvReader = new CsvReader();
        this.setPopupContent();
        this.setupInspectorContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        const uploadWrapper = GM.HF.createNewDiv('', '', ['uploadWrapper'], []);
        this.popupContent.appendChild(uploadWrapper);
        const upload = GM.HF.createNewFileInput('upload_csv', 'upload_csv', [], [], 'file', false);
        uploadWrapper.append(upload);
        upload.addEventListener('change', this.handleFiles);

        this.readFileButton = GM.HF.createNewButton('read-file-button', 'read-file-button', [], [], 'button', 'Read File', true);
        uploadWrapper.appendChild(this.readFileButton);

        this.dataArea = GM.HF.createNewDiv('csvDataArea','csvDataArea', [], []);
        this.popupContent.appendChild(this.dataArea);

        this.readFileButton.addEventListener('click', () => {
            GM.MM.readFile('csv', 'html', 'upload_csv', this.key);
        });
    }

    createTable = () => {
        this.dataArea.appendChild(this.csvReader.generateHTMLTable(100));
    };

    handleFiles = () => {
        const newFileArray = document.getElementById('upload_csv').files;
        if (newFileArray.length > 0) {
            const words = newFileArray[0].name.split('.');
            if (words[words.length - 1].toLowerCase() === 'csv') {
                this.enableReadFileButton();
            }
        }
    }
    enableReadFileButton = () => {
        this.readFileButton.disabled = false;
    }

}