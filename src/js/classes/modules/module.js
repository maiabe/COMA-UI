class Module {
    #command;
    dataTable;

    constructor(type, color, shape, command) {
        this.dataTable;
        this.type = type;
        this.image = '';
        this.color = color;
        this.shape = shape;
        this.inPorts = [];
        this.outPorts = [];
        this.name = '';
        this.key = -1;
        this.inspectorContent = new Map();
        this.popupContent;
        this.publisher = new Publisher();
        this.#command = command;
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

    setupInspectorContent = () => {
        this.addInspectorContent('Name', {text: this.name, modify: false});
        this.addInspectorContent('Type', {text: this.type, modify: false});
        this.addInspectorContent('Module Key', {text: this.key, modify: false});
    }

    addInspectorContent = (key, value) => {
        this.inspectorContent.set(key, value);
    }

    loadPopupContent = () => {
        MP.setBodyContent(this.popupContent);
        MP.setHeaderTitle(this.name);
        MP.setHeaderColor(this.color);
    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.popupContent.appendChild(GM.HF.createNewParagraph('', '', [], [], this.getName()));
    }


    getDataFromNode = key => {
        const mod = ENV.MDT.getModule(key);
        const data = mod.getData();
        return data;
    }

    // GETTERS AND SETTERS
    setName = name => { this.name = name };
    setType = type => (this.type = type);
    setKey = key => {
        this.key = key;
        this.inspectorContent.set('Module Key', {text: key, modify: false});
    };

    addIn = () => {
    }
    addOut = () => {
    }

    getType = () => { return this.type };
    getName = () => { return this.name; }
    getInPorts = () => { return this.inPorts; }
    getOutPorts = () => { return this.outPorts; }
    getShape = () => { return this.shape; }
    getImage = () => { return this.image; }
    getColor = () => { return this.color; }
    getKey = () => { return this.key; }
    getInspectorContent = () => {
        return this.inspectorContent;
    };
    getPopupContent = () => {
        return { color: this.color, content: this.popupContent };
    }
}
