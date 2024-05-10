import { createStore } from "../../utils/store.js";

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

export const jobsStore = createStore<Job[]>([
    {
        id: 0,
        clientId: 0,
        date: '2022-01-01',
        description: 'Description 1',
        price: 100,
        count: 1,
        total: 100,
        vat: 0,
        status: JobStatus.InProgress,
    },
    {
        id: 1,
        clientId: 1,
        date: '2022-01-02',
        description: 'Description 2 fdsfd',
        price: 200,
        count: 2,
        total: 400,
        vat: 0.7,
        status: JobStatus.InvoicePending,
    },
    {
        id: 2,
        clientId: 2,
        date: '2022-01-03',
        description: 'Description 3 fdsfdf fdsfdsfs fdsfsd',
        price: 300,
        count: 3,
        total: 900,
        vat: 0.17,
        status: JobStatus.AwaitingPayment,
    },
    {
        id: 3,
        clientId: 3,
        date: '2022-01-04',
        description: 'Description 4 fdsfsdfsdf fsdfsdfsf fdsfsdfsdf dfssdfsfs fsdfdsfsd',
        price: 400,
        count: 4,
        total: 1600,
        vat: 0.19,
        status: JobStatus.Closed,
    }
]);