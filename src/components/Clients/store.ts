import { createPersistentCSVStore } from "../../utils/store";

export type Client = {
    id: number;
    name: string;
}

const defaultClients: Client[] = [
    {
        id: 0,
        name: "Client"
    }
];

export const clientsStore = createPersistentCSVStore<Client>(
    defaultClients,
    "clients.csv",
    (client) => {
        return [
            client.id.toString(),
            client.name
        ];
    },
    (arr: string[]): Client => {
        return {
            id: parseInt(arr[0]),
            name: arr[1]
        };
    }
);