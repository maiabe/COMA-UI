
const cbf = data => {
  console.log(data);
  console.log('response received');
}

const url = 'http://127.0.0.1:8081/process_get';

parseData = data => {
  console.log(data);
  plotData(data);
}

function getRequest(theUrl) {
    fetch(theUrl, {mode:'cors'})
  .then(response => response.json())
  .then(data => parseData(data));
}

