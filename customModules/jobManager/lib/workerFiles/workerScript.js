const {
    parentPort, workerData
} = require('worker_threads');

onmessage = e => {
    console.log(e);
}

console.log(workerData);
parentPort.postMessage('Hello World');