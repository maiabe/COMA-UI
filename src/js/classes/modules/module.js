class Module {
    #command;
    #dataTable;

    constructor(type, color, shape, command, name, imagePath, inports, outports) {
        this.#dataTable = new Map();
        this.publisher = new Publisher();
        this.popupContent;
        this.setInitialDataValues(type, color, shape, command, name, imagePath, inports, outports);
    };

    setInitialDataValues = (type, color, shape, command, name, imagePath, inports, outports) => {
        this.addData('type', type, true, type, false);
        this.addData('image', imagePath, false, '', false);
        this.addData('color', color, false, '', false);
        this.addData('shape', shape, false, '', false);
        this.addData('inports', inports, false, '', false);
        this.addData('outports', outports, false, '', false);
        this.addData('name', name, true, name, true);
        this.addData('key', -1, true, -1, true);
        this.addData('command', command, false, '', false);
    };

    provides = () => { };
    requires = () => { };
    requirements = () => { };
    inputs_OK = () => { };
    run = () => { };
    output_status = () => { };
    get_output = name => { };
    connect_input = () => { };
    connections = () => { };
    updatePopupContent = () => { };
    updateInspectorContent = () => {
        INS.updateContent(this.key);
    };


    getCommand = () => {
        return this.#command;
    }

    loadPopupContent = () => {
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle(this.name);
        MP.setHeaderColor(this.color);
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.popupContent.appendChild(GM.HF.createNewParagraph('', '', [], [], this.getData('name')));
    }


    getDataFromNode = key => {
        const mod = ENV.MDT.getModule(key);
        const data = mod.getData();
        return data;
    }

    addData = (key, value, allowInspection, inspectorText, modify) => {
        const obj = {
            data: value,
            inspector: {
                allowInspection: allowInspection,
                text: inspectorText,
                modify: modify
            }
        };
        this.#dataTable.set(key, obj);
    }
    // GETTERS AND SETTERS


    setData = (key, data, inspectorText) => {
        const val = this.#dataTable.get(key);
        val.data = data;
        val.inspector.text = inspectorText;
    }

    getData = key => {
        return this.#dataTable.get(key).data;
    }

    getInspectorContent = () => {
        const insCon = new Map();
        for (let entry of this.#dataTable) {
            const key = entry[0];
            const value = entry[1];
            if (value.inspector.allowInspection) {
                insCon.set(key, {text: value.inspector.text, modify: value.inspector.modify});
            }
        }
        return insCon;
    };

    getPopupContent = () => {
        return { color: this.getData('color'), content: this.popupContent };
    }


}
