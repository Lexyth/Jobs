import React from "react";

import { List, type Item as ListItem, type SingleSelection as ListSingleSelection, type MultiSelection as ListMultiSelection } from "../../utils/components/List/react";
import { Button } from "../../utils/components/Button/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";
import { Modal } from "../../utils/components/Modal/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "../Jobs/hook";

import { makeListItemsFromJobs } from "../Jobs/script";
import { makeListItemsFromClients } from "../Clients/script";

import { JobStatus } from "../Jobs/store";

import { twMerge } from "tailwind-merge";
import { useDataEntry } from "../../utils/components/DataEntry/hook";

// TODO: add a list of all the past invoices, including a way to re-"print" them

// TODO: select all jobs button

// TODO!: create an invoice entry, from which one can generate the pdf or click on it to overwrite all parameters (showing the original next to it)

type InvoiceProps = {
    className?: string
};

export function Invoice({
    className
}: InvoiceProps): JSX.Element {
    const [showCreator, setShowCreator] = React.useState(false);

    return <div
        className={className}
    >
        {false
            ? (<>
                {showCreator && (
                    <Modal
                        onClickOutside={() => setShowCreator(false)}
                    >
                        <InvoiceCreator />
                    </Modal>
                )}

                <Button
                    title="Create"
                    onClick={() => setShowCreator(!showCreator)}
                />
            </>)
            : <InvoiceCreator />}
    </div >;
}

function InvoiceCreator({
    className
}: InvoiceProps): JSX.Element {
    const clientsHandler = useClientsHandler();
    const jobsHandler = useJobsHandler();

    const [selectedClientId, setSelectedClientId] = React.useState<ListSingleSelection>(null);
    const [selectedJobsIndexes, setSelectedJobsIndexes] = React.useState<ListMultiSelection>([]);
    const [selectedJobsIds, setSelectedJobsIds] = React.useState<ListMultiSelection>([]);

    const [clientsFilterClientName, setClientsFilterClientName, clientsFilterClientNameComponent] = useDataEntry({
        title: "Client Name"
    });

    const [jobsFilterClientName, setJobsFilterClientName, jobsFilterClientNameComponent] = useDataEntry({
        title: "Client Name"
    });

    if (!clientsHandler.loaded || !jobsHandler.loaded) {
        return <LoadingSpinner />
    }

    let clients = clientsHandler.getAll();
    const selectedClient = selectedClientId === null ? null : clientsHandler.get(selectedClientId);
    const clientSelected = selectedClient !== null && selectedClient !== undefined;

    if (clientsFilterClientName !== "") {
        clients = clients.filter((client) => client.name.toLowerCase().includes(clientsFilterClientName.toLowerCase()) || client.id === selectedClient?.id);
    }

    const jobs = jobsHandler.getAll();
    let filteredJobs = jobs.filter((job) => job.status === JobStatus.InvoicePending && (!clientSelected || selectedClient.id === job.clientId || selectedJobsIds.includes(job.id)));

    if (jobsFilterClientName !== "") {
        filteredJobs = filteredJobs.filter((job) => clientsHandler.get(job.clientId)?.name.toLowerCase().includes(jobsFilterClientName.toLowerCase()) || selectedJobsIds.includes(job.id));
    }

    const clientItems: ListItem[] = makeListItemsFromClients(clients);

    const filteredJobsItems: ListItem[] = makeListItemsFromJobs(filteredJobs, clientsHandler);

    const disabled = selectedClient === null || selectedJobsIds.length === 0;

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
                selection={clients.findIndex((client) => client.id === selectedClientId)}
                setSelection={(clientIndex) => {
                    if (Array.isArray(clientIndex))
                        throw new Error("Expected single selection");
                    setSelectedJobsIndexes([]);
                    const client = clientIndex === null ? null : clients[clientIndex];
                    setSelectedClientId(client?.id ?? null);
                }}
                filterEntries={[
                    [clientsFilterClientName, setClientsFilterClientName, clientsFilterClientNameComponent]
                ]}
            />

            <h2 className="text-xl font-semibold">Jobs</h2>

            <List
                items={filteredJobsItems}
                onClickItem={() => true}
                selection={filteredJobs.map((_job, index) => index).filter((jobIndex) => {
                    const jobId = filteredJobs[jobIndex]?.id;
                    if (jobId === undefined)
                        return false;
                    return selectedJobsIds.includes(jobId);
                })}
                setSelection={(newSelectedJobsIndexes) => {
                    console.log(newSelectedJobsIndexes);
                    if (Array.isArray(newSelectedJobsIndexes)) {
                        setSelectedJobsIds(newSelectedJobsIndexes
                            .filter((jobIndex) => filteredJobs[jobIndex]?.id !== undefined)
                            .map((jobIndex) => {
                                const jobId = filteredJobs[jobIndex]?.id;
                                if (jobId === undefined)
                                    throw new Error("Expected id at index " + jobIndex + "; instead got undefined");
                                return jobId;
                            })
                        );
                    } else
                        throw new Error("Expected multi selection");
                }}
                filterEntries={[
                    [jobsFilterClientName, setJobsFilterClientName, jobsFilterClientNameComponent]
                ]}
            />

            <Button
                title="Create Invoice"
                onClick={() => {
                    const selectedClientName = selectedClient?.id;
                    const selectedJobs = filteredJobsItems.filter((_value, index) => selectedJobsIndexes.includes(index));
                    const jobsString = JSON.stringify(selectedJobs);

                    console.debug(`Creating an invoice for client ${selectedClientName} from jobs ${jobsString}`);
                }}
                attributes={{ disabled }}
            />
        </div>
    );
}

