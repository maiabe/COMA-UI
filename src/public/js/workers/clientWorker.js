
let id = -1;
let messageDataObject = {};
//const baseUrl = 'http://localhost:8080/';
const baseUrl = 'http://localhost:1674/ ';


const onMessageTable = new Map();
onMessageTable.set('ExecutePost', executePost);
onMessageTable.set('Set Worker Id', setWorkerId);
onMessageTable.set('Get Objects', getObjects);
onMessageTable.set('Get Routes', getRoutes);
onMessageTable.set('Get Metadata', getMetadata);
onMessageTable.set('Save Module', saveModule);
onMessageTable.set('Load Saved Modules', loadSavedModules);
onMessageTable.set('Query COMA Engine', queryDatabase);

onmessage = e => onMessageTable.get(e.data.type)(e);

function queryDatabase(e) {
    const message = { message: 'Query COMA Engine', data: formatQuery(e.data.query) }
    console.log(formatQuery(e.data.query));
    postCOMAData('https://coma.ifa.hawaii.edu/api/lightcurve', message.data)
        // Promise fulfilled
        .then(data => {
            //console.log(data.status);
            // e.data = form query
            handleDatabaseQueryReturn(e.data.query, data);
        },
        // Promise rejected
        reason => {
            handleFetchError(e.data.query, reason);
            // api call fail
            return reason;
        }
    );
}

// format body of the query
function formatQuery(query) {
    let body = "";
    Object.keys(query).forEach((key) => (body += `${key}=${query[key]}&`));
    body = body.slice(0, body.length - 1);
    //console.log(body);
    return body;
}


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
    // const message = { message: 'Get Routes' };
    // postData(baseUrl, message)
    //     .then(data => {
    //         console.log(data);
    //         //  data.text().then(text => {
    //         //     console.log(data);
    //         // });
    //     });
}
 
function getObjects(e) {
    // const message = { message: 'Get Objects' };
    // postData(baseUrl, message)
    //     .then(data => {
    //         console.log(data);
    //         //  data.text().then(text => {
    //         //     console.log(data);
    //         // });
    //     });
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
handleReturnTable.set('Saved Modules', handleSavedModulesReturn);
handleReturnTable.set('Metadata Return', handleMetadataReturn);
handleReturnTable.set('Database Query Return', handleDatabaseQueryReturn);
handleReturnTable.set('Handle Fetch Error', handleFetchError);

function handleFetchError(query, reason) {
    console.log(reason);
    postMessage({ type: 'Handle Fetch Error', clientId: id, query: query, message: reason });
}

function handleDatabaseQueryReturn(query, data) {
    console.log(query);
    postMessage({ type: 'Database Query Return', clientId: id, status: data.status, query: query, data: data.data });
}

function handleMetadataReturn(data) {
    postMessage({ type: 'Metadata Return', clientId: id, data: data.returnData });
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
    console.log(JSON.stringify(data));
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
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

// Example POST method implementation:
async function postCOMAData(url, body) {
    //console.log(body.data);
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'omit', // include, *same-origin, omit
        headers: {
            //'Content-Type': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'Access-Control-Allow-Origin': '*'
        },
        //redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: body.data // body data type must match "Content-Type" header
    });
    console.log(body);
    const r = await response.json();
    //console.log(r);

    const result = getCOMATaskResults(r.task.id);
    //console.log(result);
    //return JSON.stringify(result); // parses JSON response into native JavaScript objects

    // Promise as result
    return result
}



// Example POST method implementation:
async function getCOMATaskResults(id) {
    const url = `https://coma.ifa.hawaii.edu/api/task/result/${id}`;
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'omit', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
            // 'Access-Control-Allow-Origin': '*'
        },
        //redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    const r = await response.json();
    var counter = 0;
    while ((r.status == "error") && (counter < 50)) {
        getCOMATaskResults(id)
        counter++;
    }
    //const result = JSON.stringify(r);
    if ((r == undefined) || (counter >= 10)) {
        console.log("GET Failed: Maximum number of requests attempted");
    }

    //console.log(r);
    return r;
}
