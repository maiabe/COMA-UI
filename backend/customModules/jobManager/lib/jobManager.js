const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const SavedModuleManager = require("../../savedModuleManager");
const DatabaseSimulator = require("../../databaseSimulator");

class JobManager {
  dataMap;
  jobQueue;
  workerQueue;
  workerMap;

  constructor() {
    this.SM = new SavedModuleManager();
    this.DB = new DatabaseSimulator();
    this.handleIncomingPostFunctions = new Map();
    this.setLocalPostHandler();
    this.jobID = 0;
    this.jobTable = new Map();
    this.routesTable = new Map();
    this.initializeJobTable();
    this.initializeDataMap();
    this.initializeWorkerMap();
    this.initializeJobQueue();
    this.initializeWorkerQueue();
    this.initializeWorkerPool(
      3,
      "./customModules/jobManager/lib/workerFiles/workerScript.js"
    );
    this.initializeRoutesTable();
    this.addJob({ message: "objects" });
  }

  setLocalPostHandler() {
    this.handleIncomingPostFunctions.set(
      "Get Objects",
      this.getObjects.bind(this)
    );
    this.handleIncomingPostFunctions.set(
      "Get Routes",
      this.getRoutes.bind(this)
    );
    this.handleIncomingPostFunctions.set(
      "Save Module",
      this.saveModule.bind(this)
    );
    this.handleIncomingPostFunctions.set(
      "Get Saved Modules",
      this.getSavedModules.bind(this)
    );
    this.handleIncomingPostFunctions.set(
      "Get Metadata",
      this.getMetadata.bind(this)
    );
  }

  getMetadata = (requestBody) => this.DB.getMetadata(requestBody.moduleName);
  getObjects = (requestBody) => dataTable.get("Objects");
  getRoutes = (requestBody) => dataTable.get("Routes");
  saveModule = (requestBody) =>
    this.SM.addModule(
      requestBody.groupInfo.groupInfo,
      requestBody.groupInfo.name,
      requestBody.groupInfo.description
    );
  getSavedModules = (requestBody) => this.SM.getAllModules();
  initializeRoutesTable = () => this.addJob({ message: "routes" });
  populateRoutesTable = (routes) =>
    Object.entries(routes).forEach(([key, value]) =>
      this.routesTable.set(key, value)
    );

  initializeDataMap() {
    this.dataMap = new Map();
  }

  initializeJobQueue() {
    this.jobQueue = [];
  }

  initializeWorkerQueue() {
    this.workerQueue = [];
  }
  initializeWorkerMap() {
    this.workerMap = new Map();
  }

  testWorker(__filename) {
    if (isMainThread) {
      const worker = new Worker(__filename, {
        workerData: "test",
      });
    }
  }

  /**
   * Gets a webworker by its id number
   * @param {number} workerId
   * @returns the selected worker or undefined
   */
  getWorkerById(workerId) {
    return this.workerMap.has(workerId)
      ? this.workerMap.get(workerId)
      : undefined;
  }

  /**
   * Starts the worker pool and loads the queue.
   * @param {number} numberOfWorkers
   * @param {string} __filename Worker Source file path
   */
  initializeWorkerPool(numberOfWorkers, __filename) {
    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker(__filename, { workerData: "I am a worker" }); // Create the worker
      this.workerMap.set(i, {
        worker: worker,
        onJob: false,
        id: worker.threadId,
        callback: undefined,
      }); // Populate the worker Map
      if (i < 3) this.workerQueue.push(worker); // Populate the worker queue
      worker.on("message", this.handleMessage.bind(this));
    }
  }

  handleMessage(e) {
    const worker = this.workerMap.get(e.id);
    if (e.success) if (worker.callback) worker.callback(e.data);
    worker.onJob = false;
    this.enqueueWorker(worker);
    this.assignNextJob();
  }

  addJob(requestBody) {
    if (this.jobTable.has(requestBody.message)) {
      if (this.jobTable.get(requestBody.message).local === true) {
        return this.handleIncomingPostFunctions.get(requestBody.message)(
          requestBody
        );
      } else return this.enqueueNewJob(requestBody);
    }
  }

  initializeJobTable() {
    this.jobTable.set("objects", {
      url: this.getObjectsUrl(),
      local: false,
      method: "GET",
    });
    this.jobTable.set("routes", {
      url: "routes/",
      callback: this.populateRoutesTable.bind(this),
      local: false,
      method: "GET",
    });
    this.jobTable.set("Get Saved Modules", { local: true });
    this.jobTable.set("Save Module", { local: true });
    this.jobTable.set("Get Objects", { local: true });
    this.jobTable.set("Get Routes", { local: true });
    this.jobTable.set("Get Metadata", { local: true });
  }

  getObjectsUrl() {
    if (!this.routesTable.has("objects")) return "objects";
    return this.routesTable.get("objects").url;
  }

  getNewJobID() {
    return this.jobID++;
  }

  enqueueWorker = (worker) => this.workerQueue.push(worker);
  dequeueWorker = () => this.workerQueue.shift();
  dequeueJob = () => this.jobQueue.shift();

  enqueueNewJob(requestBody) {
    if (this.jobTable.has(requestBody.message)) {
      const id = this.getNewJobID();
      this.jobQueue.push({
        id: id,
        job: this.jobTable.get(requestBody.message),
        requestBody: requestBody,
      });
      this.assignNextJob();
      return id;
    }
    return -1;
  }

  assignNextJob() {
    if (this.workerQueue.length > 0 && this.jobQueue.length > 0) {
      const worker = this.dequeueWorker();
      const job = this.dequeueJob();
      const workerObject = this.workerMap.get(worker.threadId);
      if (job.job.callback) workerObject.callback = job.job.callback;
      workerObject.onJob = true;
      worker.postMessage(JSON.stringify(job));
    } else console.log("worker Idle");
  }
}

module.exports = JobManager;
