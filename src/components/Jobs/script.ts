import type { Job } from "./store.js";
import type { Item as ListItem } from "../../utils/components/List/react";

export function makeListItemsFromJobs(jobs: Job[], clientsHandler: any) {
    const items: ListItem[] = jobs.map((job) => {
        const client = clientsHandler.get(job.clientId);
        if (client === undefined)
            throw new Error("Could not find client with id " + job.clientId + " for job " + job.id + " in " + JSON.stringify(clientsHandler.getAll()));

        const item: ListItem = {
            "id": job.id,
            "client": client.name,
            "date": { value: job.date, className: "whitespace-nowrap" },
            "description": { value: job.description, className: "basis-1/3" },
            "total": job.total,
            "status": { value: job.status, className: "whitespace-nowrap" }
        };

        return item;
    });

    return items;
}