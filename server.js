// server.js
const express = require('express');
const axios = require('axios');
const https = require('https')
const JobManager = require('./customModules/jobManager');
const SavedModuleManager = require('./customModules/savedModuleManager');
const DatabaseSimulator = require('./customModules/databaseSimulator');
const req = require('express/lib/request');

//const CSVtoJSON = require('./customModules/csvToJSON');

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
const DB = new DatabaseSimulator();

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



const getMetadata = requestBody => DB.getMetadata(requestBody.moduleName)
const getObjects = requestBody => dataTable.get('Objects');
const getRoutes = requestBody => dataTable.get('Routes');
const saveModule = requestBody => SM.addModule(requestBody.groupInfo.groupInfo, requestBody.groupInfo.name, requestBody.groupInfo.description);
const getSavedModules = requestBody => SM.getAllModules();

const handleIncomingPostFunctions = new Map();
handleIncomingPostFunctions.set('Get Objects', getObjects);
handleIncomingPostFunctions.set('Get Routes', getRoutes);
handleIncomingPostFunctions.set('Save Module', saveModule);
handleIncomingPostFunctions.set('Get Saved Modules', getSavedModules);
handleIncomingPostFunctions.set('Get Metadata', getMetadata);

function handleIncomingPost(requestBody) {
  if (handleIncomingPostFunctions.has(requestBody.message)) return handleIncomingPostFunctions.get(requestBody.message)(requestBody);
  else return 'Got The message';
}

function updateSavedDataFromServer() {
  dataTable.set('Routes', {a: 'routeA', b: 'routeB'});
  dataTable.set('Objects', {a: 'Object A', b: 'Object B'});
}

updateSavedDataFromServer();

// const CTJ = new CSVtoJSON();
// CTJ.convertCSVFileToJSON('./localFileStorage/comaCSVFile.csv');
