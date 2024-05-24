import React from "react";

import { jobsStore } from "./store.js";

import { JobsHandler } from "./jobsHandler.js";

// TODO: useJobs should become obsolete and JobsHandler should expose subscribe and getSnapshot methods; maybe get() suffices if JobsHandler can guarantee immutability

export function useJobs() {
  const jobs = React.useSyncExternalStore(
    jobsStore.subscribe,
    jobsStore.getSnapshot
  );

  return jobs;
}

export function useJobsHandler() {
  useJobs();

  return new JobsHandler();
}
