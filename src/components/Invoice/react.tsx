import React from "react";

import { List, type Item as ListItem, type SingleSelection as ListSingleSelection, type MultiSelection as ListMultiSelection } from "../../utils/components/List/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "../Jobs/hook";

import { makeListItemsFromJobs } from "../Jobs/script";

import { JobStatus } from "../Jobs/store";

import { twMerge } from "tailwind-merge";

// TODO: add a list of all the past invoices, including a way to re-"print" them

// TODO: select all jobs button

// TODO!: create an invoice entry, from which one can generate the pdf or click on it to overwrite all parameters (showing the original next to it)

type InvoiceProps = {
    className?: string
};

export function Invoice({
    className
}: InvoiceProps): JSX.Element {
    const clientsHandler = useClientsHandler();
    const jobsHandler = useJobsHandler();

    const [selectedClientIndex, setSelectedClientIndex] = React.useState<ListSingleSelection>(null);
    const [selectedJobsIndexes, setSelectedJobsIndexes] = React.useState<ListMultiSelection>([]);

    if (!clientsHandler.loaded || !jobsHandler.loaded) {
        return <LoadingSpinner />
    }

    const clients = clientsHandler.getAll();
    const selectedClient = selectedClientIndex === null ? null : clients[selectedClientIndex];
    const clientSelected = selectedClient !== null && selectedClient !== undefined;

    const jobs = jobsHandler.getAll();
    const filteredJobs = jobs.filter((job) => job.status === JobStatus.InvoicePending && (!clientSelected || selectedClient.id === job.clientId));

    const clientItems: ListItem[] = clients.map((client) => ({
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
                onClickItem={() => true}
                selection={selectedClientIndex}
                setSelection={(client) => {
                    if (Array.isArray(client))
                        throw new Error("Expected single selection");
                    setSelectedClientIndex(client);
                    setSelectedJobsIndexes([]);
                }}
                singleSelection
            />

            <h2 className="text-xl font-semibold">Jobs</h2>

            <List
                items={filteredJobsItems}
                onClickItem={() => true}
                selection={selectedJobsIndexes}
                setSelection={(newSelectedJobs) => {
                    console.log(newSelectedJobs);
                    if (Array.isArray(newSelectedJobs))
                        setSelectedJobsIndexes(newSelectedJobs);
                    else
                        throw new Error("Expected multi selection");
                }}
            />
        </div>
    );
}

