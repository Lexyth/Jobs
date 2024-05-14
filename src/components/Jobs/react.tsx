import React from "react";

import { Modal } from "../../utils/components/Modal/react";
import { List, type Item as ListItem } from "../../utils/components/List/react";
import { Editor, type ItemValues as EditorItemValues, type ItemData as EditorItemData } from "../../utils/components/Editor/react";
import { Button } from "../../utils/components/Button/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "./hook";

import { makeListItemsFromJobs } from "./script";

import { JobStatus, type Job } from "./store";

import { twMerge } from "tailwind-merge";


type JobsProps = {
    className?: string
};

type JobEditorProps = {
    job: Job,
    onCancel: () => void,
}

type JobListProps = {
    jobs: Job[],
    onClickItem: (jobId: number) => void,
}

type AddNewJobButtonProps = {
    openJobEditor: (job: Job) => void
}

// TODO: merge with Clients and factor out the differences

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

    const openJobEditor = React.useCallback(function (job: Job) {
        setJobToEdit(job);
    }, []);

    const closeJobEditor = React.useCallback(function () {
        setJobToEdit(null);
    }, []);

    const handleClickJob = React.useCallback(function (jobId: number) {
        const job = jobsHandler.getJob(jobId);
        if (job !== undefined) {
            openJobEditor(job);
        }
    }, [jobsHandler, openJobEditor]);

    if (!clientsHandler.loaded || !jobsHandler.loaded) {
        return <LoadingSpinner />
    }

    const jobs = jobsHandler.getJobs();

    return (
        <div
            className={twMerge(
                "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
                className
            )}
        >
            {jobToEdit && <JobEditor job={jobToEdit} onCancel={closeJobEditor} />}

            <JobList jobs={jobs} onClickItem={handleClickJob} />

            <AddNewJobButton openJobEditor={openJobEditor} />
        </div>
    );
}

function JobEditor({
    job,
    onCancel,
}: JobEditorProps): JSX.Element {

    const clientsHandler = useClientsHandler();
    const jobsHandler = useJobsHandler();

    const handleEditJob = React.useCallback(function (newJobData: EditorItemValues) {
        onCancel();

        if (job === null)
            throw new Error("No job to edit");

        if (clientsHandler === undefined)
            throw new Error("clientsHandler is undefined");

        const newClient = clientsHandler.getClient(newJobData.clientName);
        if (newClient === undefined)
            throw new Error("Could not find client with id " + newJobData.clientId);

        const newJob = {
            ...job,
            ...newJobData,
            clientId: newClient.id
        }
        jobsHandler.setJob(newJob);
    }, [jobsHandler, job, clientsHandler]);

    const handleDeleteJob = React.useCallback(function () {
        onCancel();

        if (job)
            jobsHandler.removeJob(job);
    }, [jobsHandler, job]);

    if (!clientsHandler.loaded) {
        return (
            <div
                className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                role="status">
                <span
                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                >Loading...</span>
            </div>
        );
    }

    const itemData: EditorItemData = {
        clientName: {
            title: "Client",
            type: "select",
            defaultDatas: clientsHandler.getClients().map((client) => ({
                current: client.id === job.clientId,
                value: client.name
            }))
        },
        date: {
            title: "Date",
            inputType: "date",
            defaultDatas: [
                { current: true, value: job.date }
            ]
        },
        description: {
            title: "Description",
            type: "textarea",
            defaultDatas: [
                { current: true, value: job.description }
            ]
        },
        price: {
            title: "Price",
            type: "datalist",
            inputType: "number",
            defaultDatas: [
                { current: true, value: job.price },
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
                { current: true, value: job.count }
            ]
        },
        total: {
            title: "Total",
            inputType: "number",
            defaultDatas: [
                { current: true, value: job.total }
            ]
        },
        vat: {
            title: "Vat",
            type: "datalist",
            inputType: "number",
            defaultDatas: [
                { current: true, value: job.vat },
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
                current: defaultData.value === job.status
            }))
        }
    };

    return (
        <Modal onClickOutside={onCancel}>
            <Editor
                itemData={itemData}
                onSave={handleEditJob}
                onCancel={onCancel}
                onDelete={handleDeleteJob}
            />
        </Modal>
    );
}

// TODO: remove JobList and ClientList and just use the List directly in Jobs or Clients, respectively

export function JobList({
    jobs,
    onClickItem,
}: JobListProps): JSX.Element {
    const clientsHandler = useClientsHandler();

    const items: ListItem[] = makeListItemsFromJobs(jobs, clientsHandler);

    return <List items={items} onClickItem={onClickItem} />;
}

// TODO: remove AddNewJobButton component once we have something along the lines of a DEFAULT_JOB.

function AddNewJobButton({
    openJobEditor
}: AddNewJobButtonProps): JSX.Element {
    const jobsHandler = useJobsHandler();

    const handleAddNewJob = React.useCallback(function () {
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
    }, [jobsHandler, openJobEditor]);

    return <Button title="Add New Job" onClick={handleAddNewJob} />;
}