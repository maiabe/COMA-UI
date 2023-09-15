import { Message, Publisher } from '../communication/index.js';
import { invalidVariables, varTest, printErrorMessage } from '../errorHandling/errorHandlers.js';
import { ENVIRONMENT, DATA_MANAGER, WORKER_MANAGER, OUTPUT_MANAGER } from '../sharedVariables/constants.js';
import { GM } from '../main.js';

export class WorkerManager {
    #workers;
    publisher;
    #index;
    constructor() {
        this.publisher = new Publisher();
        this.#workers = new Map();
        this.#index = -1;
    }

    /**
     * Starts a new WebWorker object with clientWorker.js file.
     * @returns a newly created webWorker
     */
    startWorker = () => {
        if (typeof (Worker) !== "undefined") return new Worker("js/workers/clientWorker.js");
        else console.log('ERROR: No Web Worker Support for this browser.');
        return undefined;
    }

    /**
     * Adds a worker to the hash table
     * @param {object (Worker)} worker the worker to add 
     * @returns the id of the worker if successful
     */
    addWorkerToDataTable = worker => {
        if (invalidVariables([varTest(worker, 'worker', 'object')], 'WorkerManager', 'addWorkerToDataTable')) return -1;
        let workerId = this.getNextIndex();
        this.#workers.set(workerId, { id: workerId, worker: worker, stopWorkerFunction: undefined, handleReturnFunction: undefined, returnMessageRecipient: undefined, returnMessage: undefined });
        return workerId;
    };

    /**
     * Sends a message to the worker so that it can set its id
     * @param {number} id the id of the worker
     * @returns this (workerManager) for chaining
     */
    notifyWorkerOfId = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'notifyWorkerOfId')) return undefined;
        if (this.#workers.has(id)) this.#workers.get(id).worker.postMessage({ type: 'Set Worker Id', id: id });
        return this;
    };

    /**
     * Sets the callback that can stop the worker.
     * @param {number} id the worker id
     * @returns this (workerManager)for chaining
     */
    setStopWorkerFunction = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'setStopWorkerFunction')) return undefined;
        if (this.#workers.has(id)) this.#workers.get(id).stopWorkerFunction = this.stopWorker;
        return this;
    };

    /**
     * Sets the callback for when server returns data.
     * @param {number} id the worker id
     * @returns this (WorkerManager) for chaining
     */
    setHandleReturnFunction = (id, fn) => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'setHandleReturnFunction')) return undefined;
        if (this.#workers.has(id)) this.#workers.get(id).handleReturnFunction = fn === undefined ? this.handleReturn : fn;
        return this;
    };

    setWorkerReturnMessageRecipient = (id, recipient) => {
        if (invalidVariables([varTest(id, 'id', 'number'), varTest(recipient, 'recipient', 'number')], 'WorkerManager', 'setReturnMessageRecipient')) return undefined;
        if (this.#workers.has(id)) this.#workers.get(id).returnMessageRecipient = recipient;
        return this;
    }

    setWorkerReturnMessage = (id, message, moduleKey) => {
        if (invalidVariables([varTest(id, 'id', 'number'), varTest(message, 'message', 'string'), varTest(moduleKey, 'moduleKey', 'number')], 'WorkerManager', 'setReturnMessage')) return undefined;
        if (this.#workers.has(id)) {
            this.#workers.get(id).returnMessage = { moduleKey: moduleKey, message: message };
            return this;
        } else return undefined;
    }

    /**
     * Sets the algorithm for onmessage events.
     * @param {number} id the worker id 
     * @returns this (workerManager) for chaining
     */
    setWorkerMessageHandler = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'setWorkerMessageHandler')) return undefined;
        if (this.#workers.has(id)) {
            const workerObject = this.#workers.get(id);
            console.log(workerObject);
            workerObject.worker.onmessage = event => {
                switch (event.data.type) {
                    case 'Text Only':
                        console.log(event.data.data);
                        break;
                    case 'Processing Complete':
                        workerObject.handleReturnFunction(event.data.data.results, 'complete');
                        workerObject.handleReturnFunction(event.data.data.keys, 'incomplete');
                        workerObject.stopWorkerFunction(id);
                        this.removeWorkerFromDataTable(id);
                        break;
                    case 'Processing Incomplete':
                        workerObject.handleReturnFunction(event.data.data, 'incomplete');
                        break;
                    case 'Server Return Event':
                        this.#sendMessage(new Message(workerObject.returnMessageRecipient, WORKER_MANAGER, workerObject.returnMessage.message, event.data));
                        workerObject.stopWorkerFunction(id);
                        break;
                    case 'Saved Modules Return':
                        this.#sendMessage(new Message(workerObject.returnMessageRecipient, WORKER_MANAGER, workerObject.returnMessage.message, event.data));
                        break;
                    case 'Metadata Return':
                        workerObject.handleReturnFunction(event.data.data);
                        break;
                    case 'Task Result Return':
                        workerObject.stopWorkerFunction(id);
                        break;
                    /*case 'Handle Query Return':
                        console.log(event.data);
                        const taskResult = {
                            val: {
                                queryType: event.data.queryType,
                                queryEntries: event.data.queryEntries,
                                resultData: event.data.taskResult
                            },
                            moduleKey: workerObject.returnMessage.moduleKey,
                        }
                        this.#sendMessage(new Message(workerObject.returnMessageRecipient, WORKER_MANAGER, workerObject.returnMessage.message, taskResult));
                        workerObject.stopWorkerFunction(id);
                        break;*/
                    case 'Database Query Return':
                        console.log(event.data);
                        const moduleData = event.data;
                        moduleData["moduleKey"] = workerObject.returnMessage.moduleKey;
                        moduleData["sourceData"] = event.data.sourceData;
                        this.#sendMessage(new Message(workerObject.returnMessageRecipient, WORKER_MANAGER, workerObject.returnMessage.message, moduleData));
                        workerObject.stopWorkerFunction(id);
                        break;
                    case 'Handle Fetch Error':
                        const data = {
                            moduleKey: workerObject.returnMessage.moduleKey,
                            queryType: event.data.queryType,
                            query: event.data.query,
                            message: event.data.message
                        }
                        workerObject.returnMessage.message = 'Handle Fetch Error';
                        this.#sendMessage(new Message(workerObject.returnMessageRecipient, WORKER_MANAGER, workerObject.returnMessage.message, data));
                        workerObject.stopWorkerFunction(id);
                        break;
                    case 'Remote Dropdown Options Return':
                        this.#sendMessage(new Message(workerObject.returnMessageRecipient, WORKER_MANAGER, workerObject.returnMessage.message, event.data));
                        workerObject.stopWorkerFunction(id);
                        break;
                    case 'Remote Objects Suggestions Return':
                        //console.log(event.data);
                        this.#sendMessage(new Message(workerObject.returnMessageRecipient, WORKER_MANAGER, workerObject.returnMessage.message, event.data));
                        workerObject.stopWorkerFunction(id);
                        break;
                    case 'Planet Orbits Return':
                        const response = event.data.response;
                        console.log(event.data);
                        if (response.status === 'success') {
                            localStorage.setItem('Planet Orbits', JSON.stringify(response.planet_coordinates));
                        }
                        workerObject.stopWorkerFunction(id);
                        break;
                }
            }
        }
        return this;
    };

    /**
     * notifies worker to send a post request with pipeline data for processing
     * @param {number} id the worker id
     * @param {object (Constructed Pipeline)} pipelineArray the pipeline data
     * @returns true if successful
     */
    sendPipelineToServer = (id, pipelineArray) => {
        if (invalidVariables([varTest(id, 'id', 'number'), varTest(pipelineArray, 'pipelineArray', 'object')], 'WorkerManager', 'sendPipelineToServer')) return false;
        if (this.#workers.has(id)) this.#workers.get(id).worker.postMessage({ type: 'Execute Pipeline', list: pipelineArray });
        console.log(pipelineArray);
        // resolve the sequence of server request here?

        return true;
    }

    requestMetadata(id, moduleName) {
        if (this.#workers.has(id)) this.#workers.get(id).worker.postMessage({ type: 'Get Metadata', moduleName: moduleName });
    }

    sendCompositeModuleInfoToServer = (id, groupInfo) => {
        if (this.#workers.has(id)) this.#workers.get(id).worker.postMessage({ type: 'Save Module', groupInfo: groupInfo });
    }

    /**
     * 
     * @param {number} id the worker id 
     * @returns true if successful
     */
    getObjectsFromServer = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'getObjectsFromServer')) return false;
        if (this.#workers.has(id)) {
            this.#workers.get(id).worker.postMessage({ type: `Get Objects` });
            return true;
        } else return false;
    }
    /**
     * 
     * @param {number} id the worker id 
     * @returns true if successful
     */
    getRoutesFromServer = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'getRoutesFromServer')) return false;
        if (this.#workers.has(id)) {
            this.#workers.get(id).worker.postMessage({ type: `Get Routes` });
            return true;
        } else return false;
    }

    getSavedModulesFromServer = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'getSavedModulesFromServer')) return false;
        if (this.#workers.has(id)) {
            this.#workers.get(id).worker.postMessage({ type: `Load Saved Modules` });
            return true;
        } else return false;
    }

    /**
     * Stops a webworker process
     * @param {number} id the id of the process to stop.
     */
    stopWorker = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'stopWorker')) return false;
        if (id >= 0) {
            if (this.#workers.has(id)) this.#workers.get(id).worker.terminate();
            else console.log(`ERROR: cannot delete worker, no worker found for key: ${key}. -- WorkerManager -> stop Worker`);
        } else console.log(`ERROR: id: ${id}. -- WorkerManager -> stopWorker.`);
    }

    /**
     * Removes a worker from the hash table after it has been terminated
     * @param {number} id the id of the worker to remove
     * @returns true if successful
     */
    removeWorkerFromDataTable = id => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'removeWorkerFromDataTable')) return false;
        if (id >= 0) {
            if (this.#workers.has(id)) this.#workers.delete(id);
            else console.log(`ERROR: cannot delete worker, no worker found for key: ${key}. -- WorkerManager -> stop Worker`);
        } else console.log(`ERROR: id: ${id}. -- WorkerManager -> stopWorker.`);
    }

    requestNewJob = (id, method, url) => {
        if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'requestNewJob')) return false;
        if (this.#workers.has(id)) {
            this.#workers.get(id).worker.postMessage({ type: `test`, method: method });
            return true;
        } else return false;
    }

    requestMetadata(id, moduleName) {
        if (this.#workers.has(id)) {
            this.#workers.get(id).worker.postMessage({ type: `Get Metadata`, moduleName: moduleName });
            return true;
        } else return false;
    }

    /**
     * Webworkers have a unique id. When one is created, the id is generated from this function.
     * @returns the next webworker id.
     */
    getNextIndex = () => {
        return ++this.#index;
    }

    #sendMessage = msg => {
        //console.log(msg);
        this.publisher.publishMessage(msg);
    };

    /**
     * Callback called by web workers when data is returned from the server.
     * @param {object} results Results object varies based on event status. If Complete, contains data, if incomplete, contains array of completed keys.
     */
    handleReturn = (results) => {
        if (invalidVariables([varTest(results, 'results', 'object'), varTest(event, 'event', 'string')], 'WorkerManager', 'handleReturn')) return false;
        // let msg;
        // switch (event) {
        //     case 'complete':
        //         // msg = new Message(DATA_MANAGER, WORKER_MANAGER, 'Pipeline Return Event', { value: results });
        //         break;
        //     case 'incomplete':
        //         // sg = new Message(ENVIRONMENT, WORKER_MANAGER, 'Partial Pipeline Return Event', { value: results });
        //         break;
        //     default:
        //         console.log(`ERROR: invalid event: ${event}. -- WorkerManager -> handleReturn.`);
        //         return;
        // }
        //this.#sendMessage(msg);
        console.log(results);
    }

    // sendGetRequest(id){
    //     if (invalidVariables([varTest(id, 'id', 'number')], 'WorkerManager', 'sendGetRequest')) return false;
    //     if (this.#workers.has(id)) this.#workers.get(id).worker.postMessage({ type: 'Get Routes'});
    //     return true;
    // }

    /**
     * Kills All Outstanding webworkers.
     */
    destroyAllWorkers = () => {
        console.log('Die Minions');
        for (let key of this.#workers.keys()) this.stopWorker(key);
    }

    /** Processes Search to the Database
     * 
     * */
    processSearch(workerId, data) {
        // post data to get taskId back
        if (this.#workers.has(workerId)) {
            /*const entries = {};
            if (data.formdata) {
                data.formdata.forEach((value, key) => { entries[key] = value });
            }*/
            this.#workers.get(workerId).worker.postMessage(
                {
                    type: 'Query COMA Engine',
                    remoteData: data.remoteData,
                    datasetType: data.datasetType,
                    queryType: data.queryType,
                    queryEntries: data.queryEntries,
                    responseKey: data.responseKey,
                    sortBy: data.sortBy,
                    columnsToRender: data.columnsToRender,
                });
        }
    }

    getRemoteDropdownOptions(workerId, data) {
        // call clientworker to query the database
        if (this.#workers.has(workerId)) {
            this.#workers.get(workerId).worker.postMessage({ type: 'Get Remote Dropdown Options', data: data });
        }
    }

    getRemoteObjectsSuggestions(workerId, data) {
        if (this.#workers.has(workerId)) {
            this.#workers.get(workerId).worker.postMessage({ type: 'Get Remote Objects Suggestions', data: data });
        }
    }

    getPlanetOrbits(workerId) {
        if (this.#workers.has(workerId)) {
            this.#workers.get(workerId).worker.postMessage(
                {
                    type: 'Get Planet Orbits',
                });
        }
    }




}



/**
 * If user presses f, all workers are destroyed.
 */
document.addEventListener('keyup', e => {
    if (e.code === 'KeyF') {
        GM.WM.destroyAllWorkers();
    }
});




