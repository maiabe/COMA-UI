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
        this.subscriber = new Subscriber(this.messageHandler);
        this.csvReader.publisher.subscribe(this.subscriber);
        this.setPopupContent();
        this.setupInspectorContent();
        this.addInspectorContent();
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('','',[],[]);
        const uploadWrapper =GM.HF.createNewDiv('','',['uploadWrapper'],[]);
        this.popupContent.appendChild(uploadWrapper);
        const upload = GM.HF.createNewFileInput('upload_csv', 'upload_csv', [], [], 'file', false);
        uploadWrapper.append(upload);
        upload.addEventListener('change', this.handleFiles);

        this.readFileButton = GM.HF.createNewButton('read-file-button', 'read-file-button', [], [], 'button', 'Read File', true);
        uploadWrapper.appendChild(this.readFileButton);

        this.readFileButton.addEventListener('click', () => {
            const newFileArray = document.getElementById('upload_csv').files;
            if (newFileArray.length > 0) {
                this.csvReader.readCSVFile(newFileArray[0], this.createTable);
            }
        });
        this.dataArea = document.createElement('div');
        this.dataArea.id = 'csvDataArea';
        this.popupContent.appendChild(this.dataArea);
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

    addInspectorContent = () => {
        this.inspectorContent.pairs.push({'Data Is Set': this.csvReader.isDataSet()});
    }

    processCSVDataTable = dt => {
        if (dt) {
            const rows =  dt.length;
            const columns = dt[0].length;
            this.inspectorContent.pairs[3]['Data Is Set'] = true;
            this.inspectorContent.pairs.push({'Rows': rows});
            this.inspectorContent.pairs.push({'Columns': columns});
            this.updateInspectorContent();
            this.setData(dt);
        }
    };

    messageHandler = msg => {
        if (msg.tag === 'CSV Data Table') {
            this.processCSVDataTable(msg.data);
        }
    }
}