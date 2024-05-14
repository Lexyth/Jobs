import React from "react";

import { List, type Item as ListItem } from "../../utils/components/List/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "../Jobs/hook";

import { makeListItemsFromJobs } from "../Jobs/script";

import { JobStatus } from "../Jobs/store";

import { twMerge } from "tailwind-merge";

// TODO: add a list of all the past invoices, including a way to re-"print" them

// TODO: select all jobs button

// TODO: create an invoice entry, from which one can generate the pdf or click on it to overwrite all parameters (showing the original next to it)

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
    const filteredJobs = jobsHandler.getJobs().filter((job) => job.status === JobStatus.InvoicePending && (selectedClientsLength === 0 || selectedClient[job.clientId] === true));

    const clientItems: ListItem[] = clientsHandler.getClients().map((client) => ({
        id: client.id,
        summary: {
            "name": client.name
        }
    }));

    const filteredJobsItems = makeListItemsFromJobs(filteredJobs, clientsHandler);

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
                items={filteredJobsItems}
                selectedItems={selectedJobs}
                setSelectedItems={setSelectedJobs}
            />
        </div>
    );
}

