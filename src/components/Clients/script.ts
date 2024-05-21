import type { Client } from "./store.js";
import type { Item as ListItem } from "../../utils/components/List/react";

// TODO: once ClientsHandler can be used statically (ie: ClientsHandler.getAll()), use it here

export function makeListItemsFromClients(clients: Client[]) {
    const items: ListItem[] = clients.map((client) => {
        const item: ListItem = {
            "id": client.id,
            "name": client.name
        };

        return item;
    });

    return items;
}