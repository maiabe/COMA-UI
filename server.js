// server.js
const express = require('express');
const axios = require('axios');
const https = require('https')
const JobManager = require('./customModules/jobManager');



// Define Express App
const app = express();
app.use(express.static('./src/public'));
app.use('/echarts', express.static(__dirname + './node_modules/echarts'));

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log('Server connected at:', PORT);
});


// axios
//   .post('https://coma.ifa.hawaii.edu/api/fits/header/', {
//     fits_file: '/COMA/bundles/coma.9p/deepimpact/990318/990318.122'
//   }, {
//     httpsAgent: new https.Agent({
//       rejectUnauthorized: false
//     })
//   })
//   .then(res => {
//     console.log(`statusCode: ${res.status}`)
//     console.log(res)
//   })
//   .catch(error => {
//     console.error(error)
//   })

  const JM = new JobManager();
  console.log(JM);

  