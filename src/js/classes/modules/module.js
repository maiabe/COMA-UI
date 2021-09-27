class Module {
    constructor(type, color, shape) {
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


    setupInspectorContent = () => {
        this.addInspectorContent('Name', this.name);
        this.addInspectorContent('Type', this.type);
        this.addInspectorContent('Module Key', this.key);
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
        this.popupContent = document.createElement('div');
        this.popupContent.innerHTML = this.getName();
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
        this.inspectorContent.set('Module Key', key);
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
        return {color: this.color, content: this.popupContent};
    }
}
