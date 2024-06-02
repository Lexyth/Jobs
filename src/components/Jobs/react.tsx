import React from "react";

import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";
import { List } from "../../utils/components/List/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "./hook";
import { useEntry } from "../../utils/components/Entry/hook";
import { useEditor, useFilter } from "../../utils/components/List/hooks";

import { toSummaryData } from "./script";

import { twMerge } from "tailwind-merge";

import { Status } from "./store";
import type { Job } from "./store";
import type { EntryDataMap } from "../../utils/components/Editor/react";

type JobsProps = {
  className?: string;
};

// TODO: add a filter by date range (showing all from x to y). Show all jobs for the past two months (2 latest files) if no date is selected.

export function Jobs({ className }: JobsProps): JSX.Element {
  const clientsHandler = useClientsHandler();
  const jobsHandler = useJobsHandler();

  const { filteredItems: filteredJobs, component: jobsFilterComponent } =
    useFilter(jobsHandler.getAll(), [
      {
        entry: useEntry("Client Name"),
        test: (job, filterValue) =>
          filterValue === "" ||
          !!clientsHandler
            .get(job.clientId)
            ?.name.toLowerCase()
            .includes(filterValue.toLowerCase()),
      },
      {
        entry: useEntry("Status", "select", [
          { value: "" },
          ...Object.entries(Status).map(([, status]) => ({
            value: status,
          })),
        ]),
        test: (job, filterValue) =>
          filterValue === "" || job.status === filterValue,
      },
    ]);

  const toEntryDataMap = React.useCallback(
    (job: Job): EntryDataMap => {
      return {
        clientName: {
          title: "Client",
          type: "select",
          defaultDatas: [
            { value: "" },
            ...clientsHandler.getAll().map((client) => ({
              current: client.id === job.clientId,
              value: client.name,
            })),
          ],
        },
        date: {
          title: "Date",
          attributes: { type: "date" },
          defaultDatas: [{ current: true, value: job.date }],
        },
        description: {
          title: "Description",
          type: "textarea",
          defaultDatas: [{ current: true, value: job.description }],
        },
        count: {
          title: "Count",
          attributes: { type: "number" },
          defaultDatas: [{ current: true, value: job.count.toString() }],
        },
        price: {
          title: "Price",
          type: "datalist",
          attributes: { type: "number" },
          defaultDatas: [
            { current: true, value: job.price.toString() },
            { description: "Global", value: "0" },
            { description: "Client - Word Price", value: "0" },
            { description: "Client - Line Price", value: "0" },
            { description: "Client - Page Price", value: "0" },
            { description: "Suggested", value: "0" },
          ],
        },
        net: {
          title: "Net",
          attributes: { type: "number" },
          defaultDatas: [{ current: true, value: job.net.toString() }],
        },
        vat: {
          title: "Vat",
          type: "datalist",
          attributes: { type: "number" },
          defaultDatas: [
            { current: true, value: job.vat.toString() },
            { description: "Global", value: "0.19" },
            { description: "Client", value: "0.07" },
            { description: "Suggested", value: "0" },
          ],
        },
        gross: {
          title: "Gross",
          attributes: { type: "number" },
          defaultDatas: [{ current: true, value: job.gross.toString() }],
        },
        status: {
          title: "Status",
          type: "select",
          defaultDatas: Object.entries(Status).map(([, value]) => ({
            value: value,
            current: value === job.status,
          })),
        },
      };
    },
    [clientsHandler]
  );

  const createDefaultItem = React.useCallback((): Job => {
    const fullDate = new Date();
    const date =
      fullDate.getFullYear() +
      "-" +
      ("0" + (fullDate.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + fullDate.getDate()).slice(-2);

    return {
      id: 0,
      clientId: 0,
      date,
      description: "Description",
      count: 1,
      price: 0,
      net: 0,
      vat: 0,
      gross: 0,
      status: Status.InProgress,
    };
  }, []);

  const {
    handleEditItem: handleEditJob,
    editorComponent,
    addButton,
  } = useEditor(
    (job: Job, entryValues) => {
      const clientName = entryValues["clientName"];
      if (clientName === undefined)
        throw new Error("Expected clientName in entryValues");

      if (clientName === "") {
        // TODO!: notify user in a better way than an alert
        alert("Please select a client.");
        return false;
      }

      const jobClient = clientsHandler.get(clientName);
      if (jobClient === undefined)
        throw new Error(`Client not found (id: ${entryValues["clientId"]})`);

      const newJob = { ...job, ...entryValues, clientId: jobClient.id };

      if (!jobsHandler.set(newJob)) {
        jobsHandler.add(newJob);
      }
    },
    (job: Job) => {
      jobsHandler.remove(job);
    },
    toEntryDataMap,
    createDefaultItem
  );

  const handleToSummaryData = React.useCallback(
    (job: Job) => toSummaryData(job, clientsHandler),
    [clientsHandler]
  );

  const handleClick_List = React.useCallback(
    (index: number) => {
      const job = filteredJobs[index];
      if (job === undefined)
        throw new Error(`Expected item at index ${index}.`);
      handleEditJob(job);
    },
    [handleEditJob, filteredJobs]
  );

  if (!clientsHandler.loaded || !jobsHandler.loaded) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className={twMerge(
        "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
        className
      )}
    >
      {jobsFilterComponent}

      {editorComponent}

      <List
        items={filteredJobs}
        toSummaryData={handleToSummaryData}
        onClick={handleClick_List}
      />

      {addButton}
    </div>
  );
}
