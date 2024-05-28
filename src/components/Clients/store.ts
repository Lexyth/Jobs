import { createPersistentCSVStore } from "../../utils/store";

export type Client = {
  id: number;
  name: string;
  company?: string;
  address?: string;
  zip?: string;
  city?: string;
  country?: string;
  "UST-ID-Nr."?: string;
  "Bestell-Nr."?: string;
  Zahlungsbedingungen?: string;
  "Liefer-Nr."?: string;
  "Nr."?: string;
};

export const clientsStore = createPersistentCSVStore<Client>(
  [],
  "clients.csv",
  (client) => {
    return [client.id.toString(), client.name];
  },
  (arr: string[]): Client => {
    if (arr[0] === undefined)
      throw new Error("Parsed id at index 0 from " + arr + " was undefined.");
    const id = parseInt(arr[0]);
    if (Number.isNaN(id))
      throw new Error(
        "Parsed id at index 0 from " + arr + " was not a number."
      );
    if (arr[1] === undefined)
      throw new Error("Parsed name at index 1 from " + arr + " was undefined.");
    return {
      id: parseInt(arr[0]),
      name: arr[1],
    };
  }
);
