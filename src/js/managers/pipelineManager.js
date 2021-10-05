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

    sendRequest = list => {
        postData(url, { type: 'Process Pipeline Request', data: list }).then(data => {
            //const string = `${result.values[0]} + ${result.values[1]} = ${result.sum}`;
            this.handleReturn(data);
        });
    }

    printResults = res => {
        console.log(res);
    }

    handleReturn = results => {
        const data = {value: results};
        const msg = new Message(DATA_MANAGER, PIPELINE_MANAGER, 'Pipeline Return Event', data);
        this.#sendMessage(msg);
    }

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    }
}