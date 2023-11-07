export function loadSavedModules(req, res) {
  console.log("Loading saved modules...");
  fs.readFile("./assets/savedModules.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      res.send("An error occurred while loading saved modules.");
      return;
    }
    const dataMap = new Map(Object.entries(JSON.parse(data)));
    const object = JSON.stringify({
      returnData: Object.fromEntries(dataMap),
      type: "Saved Modules",
    });
    console.log(object);
    res.end(JSON.stringify({ response: object }));
  });
}
