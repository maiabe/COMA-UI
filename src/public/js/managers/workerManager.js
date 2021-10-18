class WorkerManager {
    #workers;
    publisher;
    #index;
    constructor() {
        this.publisher = new Publisher();
        this.#workers = new Map();
        this.#index = -1;
    }

    startWorker = (list, handleReturn, stopWorker) => {
        if (typeof (Worker) !== "undefined") {
            if (typeof (w) == "undefined") {
                let i = this.getNextIndex();
                const w = new Worker("js/workers/pingWorker.js");
                this.#workers.set(i, { id: i, worker: w });
                w.postMessage({ type: 'Set Worker Id', id: i });
                w.postMessage({ type: 'Execute Post', list: list });
                w.onmessage = function (event) {
                    switch (event.data.type) {
                        case 'Text Only':
                            console.log(event.data.data);
                            break;
                        case 'Processing Complete':
                            handleReturn(event.data.data.results, 'complete');
                            handleReturn(event.data.data.keys, 'incomplete');
                            stopWorker(i);
                            break;
                        case 'Processing Incomplete':
                            handleReturn(event.data.data, 'incomplete');
                            break;
                    }
                };
            }

        } else {
            console.log('No Web Worker Support.');
        }
    }

    stopWorker = id => {
        this.#workers.get(id).worker.terminate();
        this.#workers.delete(id);
    }

    getNextIndex = () => {
        this.#index++;
        return this.#index;
    }

    #sendMessage = msg => {
        this.publisher.publishMessage(msg);
    };

    handleReturn = (results, event) => {
        let msg;
        const data = { value: results };
        switch (event) {
            case 'complete':
                msg = new Message(DATA_MANAGER, WORKER_MANAGER, 'Pipeline Return Event', data);
                break;
            case 'incomplete':
                msg = new Message(ENVIRONMENT, WORKER_MANAGER, 'Partial Pipeline Return Event', data);
                break;
        }
        this.#sendMessage(msg);
    }

    destroyAllWorkers = () => {
        console.log('Die Minions');

        for (let key of this.#workers.keys()) {
            this.stopWorker(key);
        }
    }

}

document.addEventListener('keydown', e => {
    if (e.code === 'KeyF') {
        GM.WM.destroyAllWorkers();
    }
});