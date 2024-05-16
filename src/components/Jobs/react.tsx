import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "./hook";

import { makeListItemsFromJobs } from "./script";

import { JobStatus, type Job } from "./store";

import { EditableList } from "../../utils/components/EditableList/react";

type JobsProps = {
    className?: string
};

// TODO?: add a filter by client, status, and month (or whatever the files are split on)
// TODO?: add sort by date or price, ascending and descending

export function Jobs({
    className
}: JobsProps): JSX.Element {
    const clientsHandler = useClientsHandler();
    const jobsHandler = useJobsHandler();

    return <EditableList
        className={className}

        itemType="Job"

        loaded={jobsHandler.loaded && clientsHandler.loaded}

        createNewItem={(job, newJobData) => {
            const clientName = newJobData["clientName"];
            if (clientName === undefined)
                throw new Error("Missing clientName in newJobData");
            const newClient = clientsHandler.get(clientName);
            if (newClient === undefined)
                throw new Error(`Client not found (id: ${newJobData["clientId"]})`);

            return {
                ...job,
                ...newJobData,
                clientId: newClient.id
            };
        }}

        handler={jobsHandler}

        makeItemData={(job: Job) => ({
            clientName: {
                title: "Client",
                type: "select",
                defaultDatas: clientsHandler.getAll().map((client) => ({
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
        })}

        makeListItems={(jobs) => makeListItemsFromJobs(jobs, clientsHandler)}

        createDefaultItem={() => {
            const fullDate = new Date();
            const date = fullDate.getFullYear() + "-" + ("0" + (fullDate.getMonth() + 1)).slice(-2) + "-" + ("0" + fullDate.getDate()).slice(-2);

            return {
                id: 0,
                clientId: 0,
                date,
                description: "",
                price: 0,
                count: 1,
                total: 0,
                vat: 0,
                status: JobStatus.InProgress
            };
        }}
    />;
}