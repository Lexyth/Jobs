import { jobsStore } from "./store";

import type { Job } from "./store";

export class JobsHandler {
    static #instance: JobsHandler | null = null;

    constructor() {
        if (JobsHandler.#instance !== null) {
            return JobsHandler.#instance;
        } else {
            JobsHandler.#instance = this;
        }
    }

    get loaded(): boolean {
        return jobsStore.loaded;
    }

    addJob(job: Job): number {
        job.id = jobsStore.get().reduce((id, job) => job.id > id ? job.id : id, 0) + 1;
        const newJobs = [...jobsStore.get(), { ...job }];
        jobsStore.set(newJobs);
        return job.id;
    }

    removeJob(job: Job | number): boolean {
        let newJobs;
        if (job instanceof Object) {
            newJobs = jobsStore.get().filter((oldJob) => oldJob.id !== job.id);
        } else {
            newJobs = jobsStore.get().filter((oldJob) => oldJob.id !== job);
        }
        jobsStore.set(newJobs);
        return newJobs.length !== jobsStore.get().length;
    }

    setJob(job: Job): boolean {
        const index = jobsStore.get().findIndex((oldJob) => oldJob.id === job.id);

        if (index === -1) {
            return false;
        } else {
            jobsStore.set([
                ...jobsStore.get().slice(0, index),
                { ...job },
                ...jobsStore.get().slice(index + 1)
            ]);
            return true;
        }
    }

    getJob(id: number): Job | void {
        let job = jobsStore.get().find((job) => job.id === id);

        if (job === undefined)
            return;
        return { ...job };
    }

    getJobs(): Job[] {
        return [...jobsStore.get()];
    }
}