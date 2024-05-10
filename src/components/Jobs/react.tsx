import React from "react";

import { Modal } from "../../utils/components/Modal/react.jsx";
import { List, type Item as ListItem } from "../../utils/components/List/react.jsx";
import { Editor, type ItemValues } from "../../utils/components/Editor/react.jsx";
import { Button } from "../../utils/components/Button/react.jsx";

import { useClientsHandler } from "../Clients/hook.js";
import { useJobsHandler } from "./hook.js";

import { type Job, JobStatus } from "./store.js";

import { twMerge } from "tailwind-merge";

type JobsProps = {
    className?: string
};

// TODO: addNewJobButton should directly open editor

// TODO: do this only once the database has been set up so sql can handle that
// TODO: add a search field to search for a job
// TODO: add a filter by client and/or status
// TODO: add sort by date or price, ascending and descending
// TODO: add find between date

export function Jobs({
    className
}: JobsProps): JSX.Element {
    const clientsHandler = useClientsHandler();
    const jobsHandler = useJobsHandler();

    const [jobToEdit, setJobToEdit] = React.useState<Job | null>(null);

    function openJobEditor(job: Job) {
        setJobToEdit(job);
    }

    function closeJobEditor() {
        setJobToEdit(null);
    }

    function handleEditJob(newJobData: ItemValues) {
        closeJobEditor();

        if (jobToEdit === null)
            throw new Error("No job to edit");

        const newClient = clientsHandler.getClient(newJobData.clientName);
        if (newClient === undefined)
            throw new Error("Could not find client with id " + newJobData.clientId);

        const newJob = {
            ...jobToEdit,
            ...newJobData,
            clientId: newClient.id
        }
        jobsHandler.setJob(newJob);
    }

    function handleDeleteJob() {
        closeJobEditor();

        if (jobToEdit)
            jobsHandler.removeJob(jobToEdit);
    }

    function handleAddNewJob() {
        const fullDate = new Date();
        const date = fullDate.getFullYear() + "-" + ("0" + (fullDate.getMonth() + 1)).slice(-2) + "-" + ("0" + fullDate.getDate()).slice(-2);

        const newJobData = {
            id: 0, // auto set when added via jobsHandler.addJob
            clientId: 0,
            date,
            description: "Description",
            price: 0,
            count: 1,
            total: 0,
            vat: 0,
            status: JobStatus.InProgress
        };

        jobsHandler.addJob(newJobData);

        openJobEditor(newJobData);

    }

    const jobs = jobsHandler.getJobs();
    const items: ListItem[] = jobs.map((job) => {
        const client = clientsHandler.getClient(job.clientId);

        if (client === undefined)
            throw new Error("Could not find client with id " + job.clientId + " for job " + job.id);

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

    return (
        <div
            className={twMerge(
                "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
                className
            )}
        >
            {jobToEdit
                && <Modal onClickOutside={closeJobEditor}>
                    <Editor
                        itemData={{
                            clientName: {
                                title: "Client",
                                type: "select",
                                defaultDatas: clientsHandler.getClients().map((client) => ({
                                    current: client.id === jobToEdit.clientId,
                                    value: client.name
                                }))
                            },
                            date: {
                                title: "Date",
                                inputType: "date",
                                defaultDatas: [
                                    { current: true, value: jobToEdit.date }
                                ]
                            },
                            description: {
                                title: "Description",
                                type: "textarea",
                                defaultDatas: [
                                    { current: true, value: jobToEdit.description }
                                ]
                            },
                            price: {
                                title: "Price",
                                type: "datalist",
                                inputType: "number",
                                defaultDatas: [
                                    { current: true, value: jobToEdit.price },
                                    { description: "Global", value: 0 },
                                    { description: "Client - Word Price", value: 0 },
                                    { description: "Client - Line Price", value: 0 },
                                    { description: "Client - Page Price", value: 0 },
                                    { description: "Suggested", value: 0 }
                                ]
                            },
                            count: {
                                title: "Count",
                                inputType: "number",
                                defaultDatas: [
                                    { current: true, value: jobToEdit.count }
                                ]
                            },
                            total: {
                                title: "Total",
                                inputType: "number",
                                defaultDatas: [
                                    { current: true, value: jobToEdit.total }
                                ]
                            },
                            vat: {
                                title: "Vat",
                                type: "datalist",
                                inputType: "number",
                                defaultDatas: [
                                    { current: true, value: jobToEdit.vat },
                                    { description: "Global", value: 0.19 },
                                    { description: "Client", value: 0.07 },
                                    { description: "Suggested", value: 0 }
                                ]
                            },
                            status: {
                                title: "Status",
                                type: "select",
                                defaultDatas: [
                                    { value: JobStatus.InProgress },
                                    { value: JobStatus.InvoicePending },
                                    { value: JobStatus.AwaitingPayment },
                                    { value: JobStatus.Closed }
                                ].map((defaultData) => ({
                                    ...defaultData,
                                    current: defaultData.value === jobToEdit.status
                                }))
                            }
                        }}
                        onSave={handleEditJob}
                        onCancel={closeJobEditor}
                        onDelete={handleDeleteJob}
                    />
                </Modal>
            }

            <List
                items={items}
                onClickItem={(jobId) => {
                    const job = jobs.find((job) => job.id === jobId);
                    if (job !== undefined) {
                        openJobEditor(job);
                    }
                }}
            />

            <Button
                title="Add New Job"
                onClick={handleAddNewJob}
            />
        </div>
    );
}