import React from "react";

import { jobsStore, type Job } from "./store.js";

// TODO: change this to work more like a database than a store, so I wont have to constantly immutably replace all jobs...
export function useJobsHandler() {
    const jobs = React.useSyncExternalStore(
        jobsStore.subscribe,
        jobsStore.getSnapshot
    );

    const addJob = React.useCallback(function (job: Job): number {
        job.id = jobs.reduce((id, job) => job.id > id ? job.id : id, 0) + 1;
        const newJobs = [...jobs, { ...job }];
        jobsStore.set(newJobs);
        return job.id;
    }, [jobs]);

    const removeJob = React.useCallback(function (job: Job | number): boolean {
        let newJobs;
        if (job instanceof Object) {
            newJobs = jobs.filter((oldJob) => oldJob.id !== job.id);
        } else {
            newJobs = jobs.filter((oldJob) => oldJob.id !== job);
        }
        jobsStore.set(newJobs);
        return newJobs.length !== jobs.length;
    }, [jobs]);

    // TODO: add another method that sets or adds depending on index in bounds or not; same for useClientHandler
    const setJob = React.useCallback(function (job: Job): boolean {
        const index = jobs.findIndex((oldJob) => oldJob.id === job.id);

        if (index === -1) {
            return false;
        } else {
            jobsStore.set([...jobs.slice(0, index), { ...job }, ...jobs.slice(index + 1)]);
            return true;
        }
    }, [jobs]);

    const getJob = React.useCallback(function (id: number): Job | void {
        let job = jobs.find((job) => job.id === id);

        if (job === undefined)
            return;
        return { ...job };
    }, [jobs]);

    const getJobs = React.useCallback(function (): Job[] {
        return [...jobs];
    }, [jobs]);

    return {
        addJob,
        removeJob,
        setJob,
        getJob,
        getJobs
    };
}