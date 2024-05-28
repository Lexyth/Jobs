import { createPersistentCSVStore } from "../../utils/store.js";

import { enumMemberFromString } from "../../utils/utils.js";

export enum Status {
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
  count: number;
  price: number;
  net: number;
  vat: number;
  gross: number;
  status: Status;
  dateOfCompletion?: string;
};

export const store = createPersistentCSVStore<Job>(
  [],
  "jobs.csv",
  (job) => {
    return [
      job.id.toString(),
      job.clientId.toString(),
      job.date,
      job.description,
      job.count.toString(),
      job.price.toString(),
      job.net.toString(),
      job.vat.toString(),
      job.gross.toString(),
      job.status.toString(),
    ];
  },
  (arr: string[]): Job => {
    const id = parseInt(arr[0] ?? "");
    if (Number.isNaN(id))
      throw new Error(
        "Parsed id at index 0 from " + arr + " was not a number."
      );

    const clientId = parseInt(arr[1] ?? "");
    if (Number.isNaN(clientId))
      throw new Error(
        "Parsed clientId at index 1 from " + arr + " was not a number."
      );

    const date = arr[2];
    if (date === undefined)
      throw new Error("Parsed date at index 2 from " + arr + " was undefined.");

    const description = arr[3];
    if (description === undefined)
      throw new Error(
        "Parsed description at index 3 from " + arr + " was undefined."
      );

    const count = parseFloat(arr[4] ?? "");
    if (Number.isNaN(count))
      throw new Error(
        "Parsed count at index 4 from " + arr + " was not a number."
      );

    const price = parseFloat(arr[5] ?? "");
    if (Number.isNaN(price))
      throw new Error(
        "Parsed price at index 5 from " + arr + " was not a number."
      );

    const net = parseFloat(arr[6] ?? "");
    if (Number.isNaN(net))
      throw new Error(
        "Parsed net at index 6 from " + arr + " was not a number."
      );

    const vat = parseFloat(arr[7] ?? "");
    if (Number.isNaN(vat))
      throw new Error(
        "Parsed vat at index 7 from " + arr + " was not a number."
      );

    const gross = parseFloat(arr[8] ?? "");
    if (Number.isNaN(gross))
      throw new Error(
        "Parsed gross at index 8 from " + arr + " was not a number."
      );

    if (arr[9] === undefined)
      throw new Error(
        "Parsed status at index 9 from " + arr + " was undefined."
      );
    const status = enumMemberFromString(arr[9], Status);

    return {
      id,
      clientId,
      date,
      description,
      count,
      price,
      net,
      vat,
      gross,
      status,
    };
  }
);
