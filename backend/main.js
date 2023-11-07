// server.js
const express = require("express");
const JobManager = require("./customModules/jobManager");
const cors = require("cors");
const fs = require("fs");

// Define Express App
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// app.use(express.static('./src/public'));

//app.use('/tabulator-tables', express.static(__dirname + 'node_modules/tabulator-tables'));

/*var corsOptions = {
    host: 'coma.ifa.hawaii.edu',
    origin: 'http://localhost:8080',
    headers: { 'Access-Control-Request-Origin': '*' },
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST']
}*/

/*app.get('https://coma.ifa.hawaii.edu/api/', cors(corsOptions), function (req, res, next) {
    res.json({ msg: 'This is CORS-enabled for only coma.ifa.hawaii.edu.' })
})*/
app.get("/get-object-orbits", (req, res) => {
  //const csvFilePath = './localFileStorage/planetary-xyz.csv'; // Replace with the actual path
  const csvFilePath = "./localFileStorage/object_orbits.csv"; // Replace with the actual path
  const csvContent = fs.readFileSync(csvFilePath, "utf-8");

  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
  res.setHeader("Content-Type", "text/csv");
  res.send(csvContent);
});
app.get("/get-ecliptic", (req, res) => {
  //const csvFilePath = './localFileStorage/planetary-xyz.csv'; // Replace with the actual path
  const csvFilePath = "./localFileStorage/xyz_ephem_ecliptic.csv"; // Replace with the actual path
  const csvContent = fs.readFileSync(csvFilePath, "utf-8");

  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
  res.setHeader("Content-Type", "text/csv");
  res.send(csvContent);
});

app.get("/get-images-names", (req, res) => {
  //const csvFilePath = './localFileStorage/planetary-xyz.csv'; // Replace with the actual path
  var fs = require("fs");
  var files = fs.readdirSync("./src/public/images/fits_demo/Object_Images/");
  console.log(files);

  //res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
  //res.setHeader('Content-Type', 'text/csv');
  res.send(JSON.stringify({ names: files }));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server connected at:", PORT);
});

const JM = new JobManager();

/*module.exports = {
  go: go,
};*/

app.post("/", function (req, res) {
  res.set({
    "Content-Type": "application/json",
    //"Access-Control-Allow-Origin": "*",
  });
  const data = JM.addJob(req.body);
  res.end(JSON.stringify({ response: data }));
});

// app.get("/", function (req, res) {
//   res.set({
//     "Content-Type": "application/json",
//     //"Access-Control-Allow-Origin": "*"
//   });
//   const data = handleIncomingPost(req.body);
//   res.end(JSON.stringify({ response: data }));
// });
