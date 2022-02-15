
let id = -1;
let messageDataObject = {};
const baseUrl = 'http://localhost:8080/';


const onMessageTable = new Map();
onMessageTable.set('ExecutePost', executePost);
onMessageTable.set('Set Worker Id', setWorkerId);
onMessageTable.set('Get Objects', getObjects);
onMessageTable.set('Get Routes', getRoutes);
onMessageTable.set('Get Metadata', getMetadata);
onMessageTable.set('Save Module', saveModule);
onMessageTable.set('Load Saved Modules', loadSavedModules);


onmessage = e => onMessageTable.get(e.data.type)(e);

function loadSavedModules(e) {
    const message = { message: 'Get Saved Modules' };
    postData(baseUrl, message)
        .then(data => {
            handleReturn(data);
        });
}

function saveModule(e) {
    const message = { message: 'Save Module', groupInfo: e.data.groupInfo };
    postData(baseUrl, message)
        .then(data => {
            //  data.text().then(text => {
            //     console.log(data);
            // });
        });
}

function getMetadata(e) {
    const message = { message: 'Get Metadata', moduleName: e.data.moduleName }
    postData(baseUrl, message)
    .then(data => {
       handleReturn(data);
    });
}

function getRoutes(e) {
    const message = { message: 'Get Routes' };
    postData(baseUrl, message)
        .then(data => {
            console.log(data);
            //  data.text().then(text => {
            //     console.log(data);
            // });
        });
}

function getObjects(e) {
    const message = { message: 'Get Objects' };
    postData(baseUrl, message)
        .then(data => {
            console.log(data);
            //  data.text().then(text => {
            //     console.log(data);
            // });
        });
}
function setWorkerId(e) {
    id = e.data.id;
    postMessage({ type: 'Text Only', data: `Worker ID set to ${id}` });
}

function executePost(e) {
    postData(url, { type: 'Process Pipeline Request', data: e.data.list, clientId: id })
        .then(data => { handleReturn(data); });
    postMessage({ type: 'Text Only', data: 'Post Request Executed' });
    initiatePing();
}

let intervalId;
const initiatePing = () => {
    intervalId = setInterval(e => {
        postData(url, { type: 'Check Pipeline Status', clientId: id }).then(data => {
            handleReturn(data);
        });
    }, 1000);
}

const handleReturnTable = new Map();

handleReturnTable.set('InitialResponse', handleInitialResponseReturn);
handleReturnTable.set('Status Check', handleStatusCheckReturn);
handleReturnTable.set('Saved Modules', handleSavedModulesReturn)
handleReturnTable.set('Metadata Return', handleMetadataReturn);

function handleMetadataReturn(data) {
    postMessage({type: 'Metadata Return', clientId: id, data: data.returnData});
}

function handleSavedModulesReturn(responseJson) {
    postMessage({ type: 'Saved Modules Return', clientId: id, data: responseJson.returnData });
}
function handleInitialResponseReturn(data) {
    console.log(`Handle Initial Response: ${data}`);
}

function handleStatusCheckReturn(data) {
    if (data.status == 'Complete') {
        clearInterval(intervalId);
        postMessage({ type: 'Processing Complete', clientId: id, data: data.data });
    } else {
        postMessage({ type: 'Processing Incomplete', clientId: id, data: data.data });
    }
}

const noSavedModulesFound = data => postMessage({ type: 'Saved Modules Return', clientId: id, data: data.response });

const handleReturn = data => {
    if (data.response === 'No Saved Modules Found') noSavedModulesFound(data);
    else {
        const responseJson = JSON.parse(data.response);
        if (handleReturnTable.has(responseJson.type)) handleReturnTable.get(responseJson.type)(responseJson);
    }
}

const cbf = data => {
    console.log(data);
    console.log('response received');
}

// const url = 'http://localhost:';
// const myPort = '8080/';
// const sshPort = '5004/';
// const testDir = 'routes';

parseData = data => {
    console.log(data);
    plotData(data);
}

function buildURL(local, dir) {
    let theURL;
    const port = local ? myPort : sshPort;
    if (dir) theURL = `${url}${port}`;
    else theURL = url;
    return theURL;
}

async function getRequest(url) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    return response; // parses JSON response into native JavaScript objects
}

// Example POST method implementation:
async function postData(url, data) {
    //console.log(JSON.stringify(data));
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}