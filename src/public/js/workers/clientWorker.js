let id = -1;
let messageDataObject = {};
const baseUrl = 'http://localhost:8080/';

onmessage = e => {
    var workerResult = 'Result: ' + (e.data);
    let message;
    switch (e.data.type) {
        case 'Execute Post':
            postData(url, { type: 'Process Pipeline Request', data: e.data.list, clientId: id })
                .then(data => { handleReturn(data); });
            postMessage({ type: 'Text Only', data: 'Post Request Executed' });
            initiatePing();
            break;
        case 'Set Worker Id':
            id = e.data.id;
            postMessage({ type: 'Text Only', data: `Worker ID set to ${id}` });
            break;
        case 'Get Objects':
            message = { message: 'Get Objects' };
            postData(baseUrl, message)
                .then(data => {
                    console.log(data);
                    //  data.text().then(text => {
                    //     console.log(data);
                    // });
                });
            break;
        case 'Get Routes':
            message = { message: 'Get Routes' };
            postData(baseUrl, message)
                .then(data => {
                    console.log(data);
                    //  data.text().then(text => {
                    //     console.log(data);
                    // });
                });
            break;
        case 'test':
            message = { testData: 'This Is A test' };
            postData(baseUrl, message)
                .then(data => {
                    console.log(data);
                });
            break;
        case 'Save Module':
            message = { message: 'Save Module', groupInfo: e.data.groupInfo };
            postData(baseUrl, message)
                .then(data => {
                    //  data.text().then(text => {
                    //     console.log(data);
                    // });
                });
            break;
        case 'Load Saved Modules':
            message = { message: 'Get Saved Modules' };
            postData(baseUrl, message)
                .then(data => {
                    handleReturn(data);
                });
            break;
    }
}

let intervalId;
const initiatePing = () => {
    intervalId = setInterval(e => {
        postData(url, { type: 'Check Pipeline Status', clientId: id }).then(data => {
            handleReturn(data);
        });
    }, 1000);
}

const handleReturn = data => {
    if (data.response != 'No Saved Modules Found') {
        const responseJson = JSON.parse(data.response);
        let messageType = undefined;
        switch (responseJson.type) {
            case 'Initial Response':
                // console.log(data.status);
                break;
            case 'Status Check':
                if (data.status == 'Complete') {
                    clearInterval(intervalId);
                    postMessage({ type: 'Processing Complete', clientId: id, data: data.data });
                } else {
                    postMessage({ type: 'Processing Incomplete', clientId: id, data: data.data });
                }
                break;
            case 'Saved Modules':
                messageType = 'Saved Modules Return';
                break;
        }
        postMessage({ type: messageType, clientId: id, data: responseJson.returnData});
    } else {
        postMessage({ type: 'Saved Modules Return', clientId: id, data: data.response});
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