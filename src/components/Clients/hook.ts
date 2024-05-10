import React from "react";

import { clientsStore, type Client } from "./store.js";

export function useClientsHandler() {
    const clients = React.useSyncExternalStore(
        clientsStore.subscribe,
        clientsStore.getSnapshot
    );

    const addClient = React.useCallback(function (client: Client): number {
        client.id = clients.reduce((id, client) => client.id > id ? client.id : id, 0) + 1;
        const newClients = [...clients, { ...client }];
        clientsStore.set(newClients);
        return client.id;
    }, [clients]);

    const removeClient = React.useCallback(function (client: Client | number): boolean {
        let newClients;
        if (client instanceof Object) {
            newClients = clients.filter((oldClient) => oldClient.id !== client.id);
        } else {
            newClients = clients.filter((oldClient) => oldClient.id !== client);
        }
        clientsStore.set(newClients);
        return newClients.length !== clients.length;
    }, [clients]);

    const setClient = React.useCallback(function (client: Client): boolean {
        const index = clients.findIndex((oldClient) => oldClient.id === client.id);

        if (index === -1) {
            return false;
        } else {
            clientsStore.set([...clients.slice(0, index), { ...client }, ...clients.slice(index + 1)]);
            return true;
        }
    }, [clients]);

    const getClient = React.useCallback(function (identifier: string | number): Client | void {
        let client: Client | undefined;
        if (typeof identifier === "string") {
            client = clients.find((client) => client.name === identifier);
        } else {
            client = clients.find((client) => client.id === identifier);
        }

        if (client === undefined)
            return;
        return { ...client };
    }, [clients]);

    const getClients = React.useCallback(function (): Client[] {
        return [...clients];
    }, [clients]);

    return {
        addClient,
        removeClient,
        setClient,
        getClient,
        getClients
    };
}