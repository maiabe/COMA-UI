const {
    Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

class JobManager {
    dataMap;
    jobQueue;
    workerQueue;
    workerMap;

    constructor() {
        this.initializeDataMap();
        this.initializeWorkerMap();
        this.initializeJobQueue();
        this.initializeWorkerQueue();
        this.initializeWorkerPool(3, './customModules/jobManager/lib/workerFiles/workerScript.js');
    }

    initializeDataMap() {
        this.dataMap = new Map();
    }

    initializeJobQueue() {
        this.jobQueue = [];
    }

    initializeWorkerQueue() {
        this.workerQueue = [];
    }
    initializeWorkerMap() {
        this.workerMap = new Map();
    }

    testWorker(__filename) {
        if (isMainThread) {
            const worker = new Worker(__filename, {
                workerData: 'test'
            });
        }
    }

    /**
     * Gets a webworker by its id number
     * @param {number} workerId 
     * @returns the selected worker or undefined
     */
    getWorkerById(workerId) {
        return this.workerMap.has(workerId) ? this.workerMap.get(workerId) : undefined;
    }

    /**
     * Starts the worker pool and loads the queue.
     * @param {number} numberOfWorkers 
     * @param {string} __filename Worker Source file path
     */
    initializeWorkerPool(numberOfWorkers, __filename) {
        for (let i = 0; i < numberOfWorkers; i++) {
            const worker = new Worker(__filename, { workerData: 'test' }); // Create the worker
            this.workerMap.set(i, { worker: worker, onJob: false, id: i }); // Populate the worker Map
            if (i < 3) this.workerQueue.push(worker); // Populate the worker queue
            worker.on('message', this.handleMessage);
        }
    }

    handleMessage(e) {
        console.log(`Message: ${e}`);
    }

    addJob() {
        // TODO: This will add a new job to the queue
    }
}

module.exports = JobManager;