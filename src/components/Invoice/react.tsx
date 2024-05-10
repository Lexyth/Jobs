import React from "react";

import { List, type Item as ListItem } from "../../utils/components/List/react.jsx";

import { useClientsHandler } from "../Clients/hook.js";
import { useJobsHandler } from "../Jobs/hook.js";

import { JobStatus } from "../Jobs/store.js";

import { twMerge } from "tailwind-merge";

type InvoiceProps = {
    className?: string
};

export function Invoice({
    className
}: InvoiceProps): JSX.Element {
    const clientsHandler = useClientsHandler();
    const jobsHandler = useJobsHandler();

    const [selectedClient, setSelectedClient] = React.useState<Record<string, boolean>>({});
    const [selectedJobs, setSelectedJobs] = React.useState<Record<string, boolean>>({});

    const selectedClientsLength = Object.keys(selectedClient).length;
    const jobs = jobsHandler.getJobs().filter((job) => job.status === JobStatus.InvoicePending && (selectedClientsLength === 0 || selectedClient[job.clientId] === true));

    const clientItems: ListItem[] = clientsHandler.getClients().map((client) => ({
        id: client.id,
        summary: {
            "name": client.name
        }
    }));

    const jobItems: ListItem[] = jobs.map((job) => {
        const client = clientsHandler.getClient(job.clientId);
        if (client === undefined)
            throw new Error("Could not find client with id " + job.clientId + " for job " + job.id);
        const item: ListItem = {
            id: job.id,
            summary: {
                "client": client.name,
                "date": { value: job.date, className: "whitespace-nowrap" },
                "description": job.description,
                "total": job.total,
                "status": { value: job.status, className: "whitespace-nowrap" }
            }
        };

        return item;
    });

    return (
        <div
            className={twMerge(
                "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
                className
            )}
        >
            <h2 className="text-xl font-semibold">Clients</h2>

            <List
                items={clientItems}
                selectedItems={selectedClient}
                setSelectedItems={(client) => {
                    setSelectedClient(client);
                    setSelectedJobs({});
                }}
                singleSelection
            />

            <h2 className="text-xl font-semibold">Jobs</h2>

            <List
                items={jobItems}
                selectedItems={selectedJobs}
                setSelectedItems={setSelectedJobs}
            />
        </div>
    );
}

