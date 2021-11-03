class PipelineManager {
    publisher;
    constructor() {
        this.publisher = new Publisher();
    };

    /**
     * Validates the pipeline before sending it to the server.
     * @param {Object} pipeLine has two fields, links and nodes. Each has a single 1d array.
     */
    validatePipeline = pipeLine => {
        if (validateVariables([varTest(pipeLine, 'pipeLine', 'object')], 'PipelineManager', 'validatePipeline')) return;
        let valid = true;
        // TODO: Create validation function.
        if (valid) this.sendRequest(this.buildPipeJSON(pipeLine)).sendPipelineKeys(pipeLine);
        else console.log(`ERROR: invalid Pipeline. -- Pipeline Manager - validatePipeline`);
    }

    /**
     * Creates an array of JSON objects to send to the server from links and nodes of the flow diagram.
     * Each object has an id, a command, next (out links), previous (in links), and an optional datavalue field.
     * @param {object {links: [], nodes: []}} pipeLine The pipeline data to build from.
     * @returns array of nodes. (DAG representation with serverside commands)
     */
    buildPipeJSON = pipeLine => {
        if (validateVariables([varTest(pipeLine, 'pipeLine', 'object')], 'PipelineManager', 'buildPipeJSON')) return;
        const nodeArray = [];
        if (pipeLine.nodes.length > 0) {
            pipeLine.nodes.forEach(node => {
                nodeArray.push(this.createNodeRepresentation(node, pipeLine));
            });
        } else console.log(`ERROR: pipeLine Node array is length 0. -- Pipeline Manager -> buildPipeJSON`);
        return nodeArray;
    };

    /**
     * Creates a node representation from the pipeline. 
     * NodeRepresentation = {id: number, command: string, dataValue: number(optional), next:number[], previous:number[]}
     * @param {object} node A single Node
     * @param {object} pipeLine The entire pipeline
     * @returns the node representation object that will be sent to the server.
     */
    createNodeRepresentation = (node, pipeLine) => {
        if (validateVariables([varTest(pipeLine, 'pipeLine', 'object'), varTest(node, 'node', 'object')], 'PipelineManager', 'buildPipeJSON')) return;
        const nodeRepresentation = { id: node.module.getData('key'), command: node.module.getData('command'), dataValue: null, next: [], previous: [] };
        this.setNodeLinks(pipeLine, node, nodeRepresentation).isNodeALocalDataSource(nodeRepresentation, node);
        return nodeRepresentation;
    }

    /**
     * Sets the in and out links from the node.
     * @param {object} pipeLine The entire pipeline (array of links and nodes)
     * @param {object} node A single node from the pipeline
     * @param {object {id: number, command: string, dataValue: number(optional), next:number[], previous:number[]}} nodeRepresentation 
     * @returns this (PipelineManager) for chaining function calls.
     */
    setNodeLinks = (pipeLine, node, nodeRepresentation) => {
        if (validateVariables([varTest(pipeLine, 'pipeLine', 'object'), varTest(node, 'node', 'object'), varTest(nodeRepresentation, 'nodeRepresentation', 'object')], 'PipelineManager', 'setNodeLinks')) return;
        pipeLine.links.forEach(link => {
            if (link.to === node.module.getData('key')) nodeRepresentation.previous.push(link.from);
            else if (link.from === node.module.getData('key')) nodeRepresentation.next.push(link.to);
        });
        return this;
    }

    /**
     * Checks to see if this node is a local data source meaning the data is generated on the client. If it is, it gets the command 'store this value
     * @param {object {id: number, command: string, dataValue: number(optional), next:number[], previous:number[]}} nodeRepresentation 
     * @param {object} node a single node from the pipeline
     */
    isNodeALocalDataSource = (nodeRepresentation, node) => {
        if (validateVariables([varTest(nodeRepresentation, 'nodeRepresentation', 'object'), varTest(node, 'node', 'object')], 'PipelineManager', 'isNodeASource')) return;
        if (nodeRepresentation.previous.length === 0) {
            if (nodeRepresentation.command === 'storeThisData') nodeRepresentation.dataValue = node.module.getData('value');
        }
    }

    /**
     * Builds an array of keys. Sends the keys to the environment to turn them all gray when run button is clicked.
     * @param {object {links: [], nodes: []}} pipeLine The pipeline object.
     */
    sendPipelineKeys = pipeLine => {
        if (validateVariables([varTest(pipeLine, 'pipeLine', 'object')], 'PipelineManager', 'sendPipelineKeys')) return;
        const keyArray = [];
        pipeLine.nodes.forEach(node => keyArray.push(node.module.getData('key')));
        this.#sendMessage(new Message(ENVIRONMENT, PIPELINE_MANAGER, 'Gray Out Pipeline Event', { value: keyArray }));
    };

    /**
     * Sends a transmit pipeline event to the worker manager for transmittal to the server.
     * @param {[{id: number, command: string, dataValue: number (-1 if not using), next:[number], previous[number]}]} pipelineArray array of constructed nodes.
     * @returns this
     */
    sendRequest = pipelineArray => {
        if (validateVariables([varTest(pipelineArray, 'pipelineArray', 'object')], 'PipelineManager', 'sendRequest')) undefined;
        if (pipelineArray.length > 0) {
            this.#sendMessage(new Message(WORKER_MANAGER, PIPELINE_MANAGER, 'Transmit Pipeline Event', { value: pipelineArray }));
        } else console.log(`ERROR: Will not transmit a pipeline of length: ${pipelineArray.length}. -- Pipeline Manager -> sendRequest`);
        return this;
    };

    printResults = res => {
        console.log(res);
    };

    #sendMessage = msg => {
        if (validateVariables([varTest(msg, 'msg', 'object')], 'PipelineManager', '#sendMessage')) undefined;
        this.publisher.publishMessage(msg);
    };
}