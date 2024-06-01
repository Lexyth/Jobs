import { store } from "./store";

import type { Job } from "./store";

// TODO!: make actions async and return a promise, so we can wait for results and disable buttons or such while loading

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
    return store.loaded;
  }

  get rev(): number {
    return store.rev;
  }

  add(job: Job): number {
    job.id =
      store.get().reduce((id, job) => (job.id > id ? job.id : id), 0) + 1;
    const newJobs = [...store.get(), { ...job }];
    store.set(newJobs);
    return job.id;
  }

  remove(job: Job | number): boolean {
    let newJobs;
    if (job instanceof Object) {
      newJobs = store.get().filter((oldJob) => oldJob.id !== job.id);
    } else {
      newJobs = store.get().filter((oldJob) => oldJob.id !== job);
    }
    store.set(newJobs);
    return newJobs.length !== store.get().length;
  }

  set(job: Job): boolean {
    const index = store.get().findIndex((oldJob) => oldJob.id === job.id);

    if (index === -1) {
      return false;
    } else {
      store.set([
        ...store.get().slice(0, index),
        { ...job },
        ...store.get().slice(index + 1),
      ]);
      return true;
    }
  }

  get(id: number): Job | void {
    const job = store.get().find((job) => job.id === id);

    if (job === undefined) return;
    return { ...job };
  }

  getAll(): Job[] {
    return [...store.get()];
  }
}
