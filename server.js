// server.js
const express = require('express');
const axios = require('axios');
const https = require('https')
const JobManager = require('./customModules/jobManager');
const SavedModuleManager = require('./customModules/savedModuleManager');

const dataTable = new Map();

// Define Express App
const app = express();
app.use(express.json())
app.use(express.static('./src/public'));
app.use('/echarts', express.static(__dirname + './node_modules/echarts'));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('Server connected at:', PORT);
});


const handleCompletedJob = () => {
  console.log('Job Done');
}
const JM = new JobManager(handleCompletedJob);
const SM = new SavedModuleManager();

function postToClient() {
  axios
    .post('https://coma.ifa.hawaii.edu/api/fits/header/', {
      fits_file: '/COMA/bundles/coma.9p/deepimpact/990318/990318.122'
    }, {
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

app.post('/', function (req, res) {
  res.set({
     "Content-Type": "application/json",
     "Access-Control-Allow-Origin": "*",
  });
  const data = handleIncomingPost(req.body);
  res.end(JSON.stringify({response: data}));
});

function handleIncomingPost(requestBody) {
  switch(requestBody.message) {
    case 'Get Objects':
      return dataTable.get('Objects');
    case 'Get Routes':
      return dataTable.get('Routes');
    case 'Save Module':
      return SM.addModule(requestBody.groupInfo);
    case 'Get Saved Modules':
      return SM.getAllModules();
  }
  return 'Got The message';
}

function updateSavedDataFromServer() {
  dataTable.set('Routes', {a: 'routeA', b: 'routeB'});
  dataTable.set('Objects', {a: 'Object A', b: 'Object B'});
}

updateSavedDataFromServer();
