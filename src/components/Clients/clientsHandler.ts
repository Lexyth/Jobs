import { clientsStore } from "./store";

import type { Client } from "./store";

export class ClientsHandler {
    static #instance: ClientsHandler | null = null;

    constructor() {
        if (ClientsHandler.#instance) {
            return ClientsHandler.#instance;
        } else {
            ClientsHandler.#instance = this;
        }
    }

    get loaded(): boolean {
        return clientsStore.loaded;
    }

    add(client: Client): number {
        client.id = clientsStore.get().reduce((id, client) => client.id > id ? client.id : id, 0) + 1;
        const newClients = [...clientsStore.get(), { ...client }];
        clientsStore.set(newClients);
        return client.id;
    };

    remove(client: Client | number): boolean {
        let newClients;
        if (client instanceof Object) {
            newClients = clientsStore.get().filter((oldClient) => oldClient.id !== client.id);
        } else {
            newClients = clientsStore.get().filter((oldClient) => oldClient.id !== client);
        }
        clientsStore.set(newClients);
        return newClients.length !== clientsStore.get().length;
    }

    set(client: Client): boolean {
        const index = clientsStore.get().findIndex((oldClient) => oldClient.id === client.id);

        if (index === -1) {
            return false;
        } else {
            clientsStore.set([
                ...clientsStore.get().slice(0, index),
                { ...client },
                ...clientsStore.get().slice(index + 1)
            ]);
            return true;
        }
    }

    get(identifier: string | number): Client | void {
        let client: Client | undefined;
        if (typeof identifier === "string") {
            client = clientsStore.get().find((client) => client.name === identifier);
        } else {
            client = clientsStore.get().find((client) => client.id === identifier);
        }

        if (client === undefined)
            return;
        return { ...client };
    }

    getAll(): Client[] {
        return [...clientsStore.get()];
    }
}