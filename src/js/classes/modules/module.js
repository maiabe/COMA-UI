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
        this.inspectorContent = {};
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
        this.inspectorContent.pairs = [];
        this.inspectorContent.pairs.push({ 'Name': this.name });
        this.inspectorContent.pairs.push({ 'Type': this.type });
        this.inspectorContent.pairs.push({ 'Module Key': this.key });
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
        this.inspectorContent.pairs.forEach(e => {
            if ('Module Key' in e) {
                e['Module Key'] = this.key;
            }
        });
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


}
