import { createPersistentCSVStore } from "../../utils/store.js";

import { enumMemberFromString } from "../../utils/utils.js";

export enum JobStatus {
    InProgress = "In Progress",
    InvoicePending = "Invoice Pending",
    AwaitingPayment = "Awaiting Payment",
    Closed = "Closed"
};

export type Job = {
    id: number,
    clientId: number,
    date: string,
    description: string,
    price: number,
    count: number,
    total: number,
    vat: number,
    status: JobStatus
}

const defaultJobs: Job[] = [
    {
        id: 0,
        clientId: 0,
        date: '1970-01-01',
        description: 'Description',
        price: 0,
        count: 1,
        total: 0,
        vat: 0,
        status: JobStatus.InProgress,
    }
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
            status
        };
    }
);