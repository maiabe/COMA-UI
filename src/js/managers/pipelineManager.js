class PipelineManager {
    publisher;                  // Publishes Messages

    #sourceMap;
    #processorMap;
    #outputMap;
    #pipeline;
    #pipe;
    #returnType;

    constructor() {
        this.publisher = new Publisher();
        this.#pipeline = { commandsequence: [] };
    };

    validatePipeline = pipe => {
        this.#pipeline.commandsequence = [];
        this.#pipe = pipe;
        let valid = false;
        // Split Into Source, Processor, Outputs
        this.#constructMaps(pipe.nodes);
        // You must have at least one source
        if (this.#sourceMap.size === 1) {
            this.#setSourcePipeline(this.#sourceMap.values().next().value.module);
        } else {
            return false;
        }

    };

    /** Takes an array of nodes from the model and organizes them into sources, processors and outputs. */
    #constructMaps = arr => {
        this.#sourceMap = new Map();           // Index are the moduleKey
        this.#processorMap = new Map();        // Index are the moduleKey
        this.#outputMap = new Map();           // Index are the moduleKey

        arr.forEach(n => {
            switch (n.name) {
                case 'Source':
                    this.#sourceMap.set(n.key, n);
                    break;
                case 'Output':
                    this.#outputMap.set(n.key, n);
                    break;
                case 'Processor':
                    this.#processorMap.set(n.key, n);
                    break;
            }
        });
    };

    #setSourcePipeline = s => {
        if (s.getLocation() === 'remote') {
            const cmd = {
                'command': s.getCommand(),
                'params': [s.getParams()],
                'returns': 'tempstore1'
            }
            this.#pipeline.commandsequence.push(cmd);
            this.#setProcessorPipeline();
        } else {
            const data = { moduleKey: s.getKey(), cb: this.setLocalSourcePipeline };
            const msg = new Message(DATA_MANAGER, PIPELINE_MANAGER, 'Data Request Event', data);
            this.#sendMessage(msg);
        }
    };

    setLocalSourcePipeline = (key, data) => {
        console.log(data);
        const cmd = {
            'command': this.#sourceMap.get(key).module.getCommand(),
            'params': data.data.getData(),
            'returns': '0'
        }
        this.#pipeline.commandsequence.push(cmd);
        return this.#setProcessorPipeline();
    };

    #setProcessorPipeline = () => {
        if (this.#processorMap.size === 1) {
            // Validate that a link between the processor and output exists.
            let linkFound = false;
            const s = this.#sourceMap.values().next().value;
            const p = this.#processorMap.values().next().value;
            this.#pipe.links.forEach(l => {
                if (l.from === s.key && l.to === p.key) {
                    linkFound = true;
                }
            });
            if (linkFound) {
                const cmd = {
                    'command': p.module.getCommand(),
                    'params': '0',
                    'returns': '1'
                };
                this.#pipeline.commandsequence.push(cmd);
                return this.#setOutputPipeline(true);
            } else {
                console.log('No Link Between source and processor found.')
            }
        } else {
            return this.#setOutputPipeline(false);
        }
    };

    #setOutputPipeline = hasProcessor => {
        if (hasProcessor) {
            if (this.#outputMap.size === 1) {
                // Validate that a link between the processor and output exists.
                let linkFound = false;
                const o = this.#outputMap.values().next().value;
                const p = this.#processorMap.values().next().value;
                this.#pipe.links.forEach(l => {
                    if (l.from === p.key && l.to === o.key) {
                        linkFound = true;
                    }
                });
                if (linkFound) {
                    const cmd = {
                        'command': 'returnToJavascriptClient',
                        'params': '1',
                        'returntoclient': 'clientid'
                    };
                    this.#pipeline.commandsequence.push(cmd);
                    postData(url, {type: 'Pipeline Request', data : this.#pipeline}).then(data => {
                        const result = data; // JSON data parsed by `data.json()` call
                        const string = `${result.values[0]} + ${result.values[1]} = ${result.sum}`;
                        alert(string);
                      });;
                } else {
                    console.log('No Link Between processor and output found.')
                }
            }
        } else {
            return false;
        }
    };

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }
}