import type { Job } from "./store.js";
import type { Item as ListItem } from "../../utils/components/List/react";

// TODO: once ClientsHandler can be used statically (ie: ClientsHandler.getClients()), use it here

export function makeListItemsFromJobs(jobs: Job[], clientsHandler: any) {
    const items: ListItem[] = jobs.map((job) => {
        const client = clientsHandler.getClient(job.clientId);
        if (client === undefined)
            throw new Error("Could not find client with id " + job.clientId + " for job " + job.id + " in " + JSON.stringify(clientsHandler.getClients()));

        const item: ListItem = {
            id: job.id,
            summary: {
                "client": client.name,
                "date": { value: job.date, className: "whitespace-nowrap" },
                "description": { value: job.description, className: "basis-1/3" },
                "total": job.total,
                "status": { value: job.status, className: "whitespace-nowrap" }
            },
        };

        return item;
    });

    return items;
}