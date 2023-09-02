const {
    parentPort, workerData, threadId
} = require('worker_threads');
const axios = require('axios');
var sslRootCAs = require('ssl-root-cas');
sslRootCAs.inject()
.addFile('./cert/intermediate.cer');
const jobManager = require('../..');

parentPort.on('message', (message) => { 
    message = JSON.parse(message);
    if (message.job.method === 'GET') get(message.job.url);
    else if (message.job.method === 'POST') post(message.job.url);
  });



  function post(apiPath, jsonData) {
    axios
        .post(`http://coma.ifa.hawaii.edu:8000/`, jsonData, {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        })
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            console.log(res)
        })
        .catch(error => {
            console.error(error)
        })
}

function get(apiPath) {
    axios({
        method: 'get',
        "rejectUnauthorized": false,
        url: `http://coma.ifa.hawaii.edu:8000/`
    })
        .then(res => {
            handleGetReturn(res);
        })
        .catch(error => {
            console.error(error)
        });
}

function handleGetReturn(res) {
    if (res.status === 200) parentPort.postMessage({success: true, data: res.data, id: threadId});
    else console.log(res)
}
