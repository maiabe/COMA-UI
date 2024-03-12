let id = -1;
let messageDataObject = {};
const baseUrl = 'http://localhost:8080/';
//const baseUrl = 'http://localhost:1366/ ';
/*const coma_api = 'http://coma.ifa.hawaii.edu:8000/api/v1/';*/
const coma_api = 'http://coma.ifa.hawaii.edu:8001/api/v2/';
//const coma_api = 'http://localhost:8000/api/v1/';

const onMessageTable = new Map();
onMessageTable.set('Execute Pipeline', executePipeline);
onMessageTable.set('Set Worker Id', setWorkerId);
onMessageTable.set('Get Objects', getObjects);
onMessageTable.set('Get Routes', getRoutes);
onMessageTable.set('Get Metadata', getMetadata);
onMessageTable.set('Save Module', saveModule);
onMessageTable.set('Load Saved Modules', loadSavedModules);
onMessageTable.set('Query COMA Engine', queryDatabase);
onMessageTable.set('Get Remote Dropdown Options', getRemoteDropdownOptions);
onMessageTable.set('Get Remote Objects Suggestions', getRemoteObjectsSuggestions);
onMessageTable.set('Get Planet Orbits', getPlanetOrbits);
onMessageTable.set('Get Object Name', getObjectName);

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
    console.log(e.data);
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

function executePipeline(e) {
    console.log(e.data);
    /*postData(url, { type: 'Process Pipeline Request', data: e.data.list, clientId: id })
        .then(data => { handleReturn(data); });
    postMessage({ type: 'Text Only', data: 'Post Request Executed' });
    initiatePing();*/
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
/*handleReturnTable.set('Handle Query Return', handleQueryReturn);*/
handleReturnTable.set('Database Query Return', handleDatabaseQueryReturn);
handleReturnTable.set('Handle Fetch Error', handleFetchError);
handleReturnTable.set('Remote Dropdown Options Return', handleRemoteDropdownOptionsReturn);
handleReturnTable.set('Remote Objects Suggestions Return', handleRemoteObjectsSuggestionsReturn);
handleReturnTable.set('Handle Planet Orbits Return', handlePlanetOrbitsReturn);


function handlePlanetOrbitsReturn(response) {
    //console.log(id);
    postMessage({ type: 'Planet Orbits Return', clientId: id, response: response });
}

function handleRemoteDropdownOptionsReturn(moduleKey, fieldName, fieldWrapperId, response) {
    //console.log(data);
    postMessage({ type: 'Remote Dropdown Options Return', clientId: id, moduleKey: moduleKey, fieldName: fieldName, fieldWrapperId: fieldWrapperId, data: response });
}
function handleRemoteObjectsSuggestionsReturn(moduleKey, fieldWrapperId, response) {
    postMessage({ type: 'Remote Objects Suggestions Return', clientId: id, moduleKey: moduleKey, fieldWrapperId: fieldWrapperId, data: response });
}

function handleFetchError(queryType, query, reason) {
    postMessage({ type: 'Handle Fetch Error', clientId: id, queryType: queryType, query: query, message: reason });
}

function handleDatabaseQueryReturn(data, response) {
    console.log(response);
    let sourceData = response[data.responseKey];
    console.log(sourceData);
    // sort data if needed
    if (data.sortBy) {
        switch (data.sortBy) {
            case 'iso_date_mid':
                sourceData = sourceData.sort((x, y) => new Date(x[data.sortBy]) - new Date(y[data.sortBy]));
                break;
            default:
                sourceData = sourceData.sort((x, y) => x.date - y.date);
        }
    }

    var moduleData = {
        type: "Database Query Return",
        remoteData: data.remoteData,
        datasetType: data.datasetType,
        queryType: data.queryType,
        queryEntries: data.queryEntries,
        columnsToRender: data.columnsToRender,
        status: response.status,
        sourceData: sourceData,
        comet_orbit: response.comet_orbit,
    };
    postMessage(moduleData);
}
/*function handleQueryReturn(inputData, taskResult) {
    postMessage({
        type: 'Handle Query Return', clientId: id,
        queryType: inputData.queryType,
        queryEntries: inputData.queryEntries,
        taskResult: taskResult
    });
}*/

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
    try {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            //redirect: 'follow', // manual, *follow, error
            //referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });

        const data = await response.json();
        return data; // parses JSON response into native JavaScript objects
    }
    catch (error) {
        console.error(error);
        throw error;
    }
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


/**
 * Get the Remote Search Field
 * */
async function getRemoteDropdownOptions(msg) {
    const url_searchfield = coma_api + msg.data.data.dirName;
    // var url_taskResult = coma_api + 'task/result/';

    try {
        //var response = undefined;
        await getCOMAData(url_searchfield, msg.data.data.delay)
            /*.then(taskResult => {
                url_taskResult = url_taskResult + taskResult.task.id;
                const result = getCOMAData(url_taskResult);
                return result;
            })*/
            .then(response => {
                console.log(response);
                // handle response data
                handleRemoteDropdownOptionsReturn(msg.data.data.moduleKey, msg.data.data.dirName, msg.data.data.fieldWrapperId, response);
            })
            .catch(error => {
                console.error(error);
            });
    } catch (error) {
        console.log(error);
        // handle error func
    }
}

async function getRemoteObjectsSuggestions(msg) {
    console.log(msg.data.data);
    const url_searchfield = coma_api + 'ui/autocomplete?term=' + msg.data.data.term;
    try {
        //var response = undefined;
        await getCOMAData(url_searchfield, msg.data.data.delay)
            /*.then(taskResult => {
                url_taskResult = url_taskResult + taskResult.task.id;
                const result = getCOMAData(url_taskResult);
                return result;
            })*/
            .then(response => {
                // handle response data
                handleRemoteObjectsSuggestionsReturn(msg.data.data.moduleKey, msg.data.data.fieldWrapperId, response);
            })
            .catch(error => {
                console.error(error);
            });
    } catch (error) {
        console.log(error);
        // handle error func
    }
}


/** 
 * Post search data to get the task result back
 * @param {object} data object containing moduleKey, queryType, queryEntries
 * */
/*function queryDatabase(e) {
    postCOMATaskData(coma_api + e.data.queryType, formatQuery(e.data.queryEntries))
        .then(taskResult => {
            *//*console.log(e.data);
            console.log(taskResult);*//*
            handleQueryReturn(e.data, taskResult);
        })
        .catch(error => {
            handleFetchError(e.data.queryType, entries, error);
            console.error(error);
        });
}*/


/** 
 * queries the COMA database
 * @param {object} data object containing moduleKey, queryType, queryEntries
 * */
async function queryDatabase(e) {
    const url_searchfield = coma_api + e.data.queryType + '/' + formatQuery(e.data.queryEntries);
    console.log(e.data.queryEntries);
    console.log(url_searchfield);
    try {
        //var response = undefined;
        await getCOMAData(url_searchfield, e.data.delay)
            /*.then(taskResult => {
                url_taskResult = url_taskResult + taskResult.task.id;
                const result = getCOMAData(url_taskResult);
                return result;
            })*/
            .then(response => {
                // handle response data
                handleDatabaseQueryReturn(e.data, response);
            })
            .catch(error => {
                console.error(error);
            });
    } catch (error) {
        console.log(error);
        // handle error func
    }
}


// format body of the query
function formatQuery(queryEntries) {
    //console.log(queryEntries);
    let body = "";
    Object.keys(queryEntries).forEach((key) => (body += `${queryEntries[key]}/`));
    //body = body.slice(0, body.length - 1);
    return body;
}

async function getCOMATaskData(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    //const r = await response.json();
    //const result = await getCOMATaskResults(r.task.id);
    //console.log(result);
    return response;
}


// change func name to postRequest
async function postCOMATaskData(url, body) {
    console.log(body);
    console.log(url);
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'omit', // include, *same-origin, omit
        headers: {
            //'Content-Type': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: body // body data type must match "Content-Type" header
    });
    const r = await response.json();
    //console.log(r.task.id);

    /*const taskResultUrl = coma_api + 'task/result/' + r.task.id;
    const result = await getCOMAData(taskResultUrl);*/
    //console.log(result);
    //return JSON.stringify(result); // parses JSON response into native JavaScript objects

    // Promise as result
    //return result;
    return r;
}

// change func name to getRequest
async function getCOMAData(url, delay) {
    console.log(url);
    try {
        //const url = coma_api + `task/result/${id}`;
        const response = await fetch(url); 
        console.log(response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const responseData = await response.json();
        console.log(responseData);

        var counter = 0;
        while (responseData.status === "error" && counter < 10) {
            /*getCOMAData(url);
            counter++;
            console.log('counter: ' + counter);*/
            await new Promise((resolve) => setTimeout(resolve, delay));
            responseData = await fetch(url).then((response) => response.json());
            counter++;
            console.log('counter: ' + counter);
        }

        return responseData;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function getPlanetOrbits() {
    const url = coma_api + 'planets';
    await this.getCOMAData(url, 5)
        .then(response => {
            console.log(response);
            //localStorage.setItem('Planet Orbits', response);
            handlePlanetOrbitsReturn(response); // to kill the workers
        })
        .catch(error => {
            console.error(error);
        });
}

async function getObjectName(objectID) {
    const url = coma_api + 'objects/' + objectID;
    console.log(url);
    return url;
}
