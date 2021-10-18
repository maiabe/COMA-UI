class PipelineManager {
    publisher;                  // Publishes Messages
    constructor() {
        this.publisher = new Publisher();
    };

    validatePipeline = pipe => {
        let valid = true;
        console.log(pipe);
        if (valid) {
            this.sendRequest(this.buildPipeJSON(pipe));
            this.sendPipelineKeys(pipe);
        }
    }

    buildPipeJSON = pipe => {
        const list = [];
        pipe.nodes.forEach(n => {
            const mod = n.module;
            const x = {
                id: mod.getData('key'),
                command: mod.getData('command'),
                dataValue: null,
                next: [],
                previous: []
            };
            pipe.links.forEach(l => {
                if (l.to === mod.getData('key')) {
                    x.previous.push(l.from);
                } else if (l.from === mod.getData('key')) {
                    x.next.push(l.to);
                }
            });
            if (x.previous.length === 0) {
                if (x.command === 'storeThisData') {
                    x.dataValue = mod.getData('value');
                }
            }

            list.push(x);
        });
        return list;
    };

    sendPipelineKeys = pipe => {
        const list = [];
        pipe.nodes.forEach(n => {
            const mod = n.module;
            list.push(mod.getData('key'));
        });
        const data = {value: list};
        const msg = new Message(ENVIRONMENT, PIPELINE_MANAGER, 'Gray Out Pipeline Event', data);
        this.#sendMessage(msg);
    };

    sendRequest = list => {
        const data = {value: list};
        const msg = new Message(WORKER_MANAGER, PIPELINE_MANAGER, 'Transmit Pipeline Event', data);
        this.#sendMessage(msg);
    }

    printResults = res => {
        console.log(res);
    }

    handleReturn = results => {
        const data = { value: results };
        const msg = new Message(DATA_MANAGER, PIPELINE_MANAGER, 'Pipeline Return Event', data);
        this.#sendMessage(msg);
    }

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }
}