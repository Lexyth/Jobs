import { createPersistentCSVStore } from "../../utils/store.js";

import { enumMemberFromString } from "../../utils/utils.js";

export enum JobStatus {
  InProgress = "In Progress",
  InvoicePending = "Invoice Pending",
  AwaitingPayment = "Awaiting Payment",
  Closed = "Closed",
}

export type Job = {
  id: number;
  clientId: number;
  date: string;
  description: string;
  price: number;
  count: number;
  total: number;
  vat: number;
  status: JobStatus;
};

const defaultJobs: Job[] = [
  {
    id: 0,
    clientId: 0,
    date: "1970-01-01",
    description: "Description",
    price: 0,
    count: 1,
    total: 0,
    vat: 0,
    status: JobStatus.InProgress,
  },
];

export const jobsStore = createPersistentCSVStore<Job>(
  defaultJobs,
  "jobs.csv",
  (job) => {
    return [
      job.id.toString(),
      job.clientId.toString(),
      job.date,
      job.description,
      job.price.toString(),
      job.count.toString(),
      job.total.toString(),
      job.vat.toString(),
      job.status.toString(),
    ];
  },
  (arr: string[]): Job => {
    if (arr[0] === undefined)
      throw new Error("Parsed id at index 0 from " + arr + " was undefined.");
    const id = parseInt(arr[0]);
    if (Number.isNaN(id))
      throw new Error(
        "Parsed id at index 0 from " + arr + " was not a number."
      );
    if (arr[1] === undefined)
      throw new Error(
        "Parsed clientId at index 1 from " + arr + " was undefined."
      );
    const clientId = parseInt(arr[1]);
    if (Number.isNaN(clientId))
      throw new Error(
        "Parsed clientId at index 1 from " + arr + " was not a number."
      );
    if (arr[2] === undefined)
      throw new Error("Parsed date at index 2 from " + arr + " was undefined.");
    if (arr[3] === undefined)
      throw new Error(
        "Parsed description at index 3 from " + arr + " was undefined."
      );
    if (arr[4] === undefined)
      throw new Error(
        "Parsed price at index 4 from " + arr + " was undefined."
      );
    const price = parseFloat(arr[4]);
    if (Number.isNaN(price))
      throw new Error(
        "Parsed price at index 4 from " + arr + " was not a number."
      );
    if (arr[5] === undefined)
      throw new Error(
        "Parsed count at index 5 from " + arr + " was undefined."
      );
    const count = parseFloat(arr[5]);
    if (Number.isNaN(count))
      throw new Error(
        "Parsed count at index 5 from " + arr + " was not a number."
      );
    if (arr[6] === undefined)
      throw new Error(
        "Parsed total at index 6 from " + arr + " was undefined."
      );
    const total = parseFloat(arr[6]);
    if (Number.isNaN(total))
      throw new Error(
        "Parsed total at index 6 from " + arr + " was not a number."
      );
    if (arr[7] === undefined)
      throw new Error("Parsed vat at index 7 from " + arr + " was undefined.");
    const vat = parseFloat(arr[7]);
    if (Number.isNaN(vat))
      throw new Error(
        "Parsed vat at index 7 from " + arr + " was not a number."
      );
    if (arr[8] === undefined)
      throw new Error(
        "Parsed status at index 8 from " + arr + " was undefined."
      );
    const status = enumMemberFromString(arr[8], JobStatus);
    return {
      id: parseInt(arr[0]),
      clientId: parseInt(arr[1]),
      date: arr[2],
      description: arr[3],
      price: parseFloat(arr[4]),
      count: parseFloat(arr[5]),
      total: parseFloat(arr[6]),
      vat: parseFloat(arr[7]),
      status,
    };
  }
);
