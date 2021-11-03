let id = -1;

onmessage = e => {
    var workerResult = 'Result: ' + (e.data);
    switch (e.data.type) {
        case 'Execute Post':
            postData(url, { type: 'Process Pipeline Request', data: e.data.list, clientId: id}).then(data => {
                handleReturn(data);
            });
            postMessage({ type: 'Text Only', data: 'Post Request Executed' });
            initiatePing();
            break;
        case 'Set Worker Id':
            id = e.data.id;
            postMessage({ type: 'Text Only', data: `Worker ID set to ${id}` });
            break;
    }
}

let intervalId;
const initiatePing = () => {
     intervalId = setInterval(e => {
        postData(url, { type: 'Check Pipeline Status', clientId: id }).then(data => {
            handleReturn(data);
        });
    }, 500);
}

const handleReturn = data => {
    switch (data.type) {
        case 'Initial Response':
           // console.log(data.status);
            break;
        case 'Status Check':
            if (data.status == 'Complete') {
                clearInterval(intervalId);
                postMessage({type: 'Processing Complete', clientId: id, data: data.data});
            } else {
                postMessage({type: 'Processing Incomplete', clientId: id, data: data.data});
            }
            break;
    }
}

const cbf = data => {
    console.log(data);
    console.log('response received');
}

const url = 'http://127.0.0.1:8081/';

parseData = data => {
    console.log(data);
    plotData(data);
}

function getRequest(theUrl) {
    fetch(theUrl, { mode: 'cors' })
        .then(response => response.json())
        .then(data => parseData(data));
}
// Example POST method implementation:
async function postData(url, data) {
    data.clientId = id;
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