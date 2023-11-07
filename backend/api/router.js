// Route Imports
import { loadSavedModules } from "./loadSavedModules.js";

// Express Imports
import express from "express";

export function apiRouter() {
  console.log("API Router Loaded");
  // Express routing
  const router = express.Router();

  // Load Saved Modules
  router.post("/load_saved_modules", (res, req) => {
    console.log(5);
  });

  return router;
}
