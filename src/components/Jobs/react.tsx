import React from "react";

import { EditableList } from "../../utils/components/EditableList/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "./hook";
import { useDataEntry } from "../../utils/components/DataEntry/hook";

import { makeListItemsFromJobs } from "./script";

import { Status } from "./store";
import type { Job } from "./store";
import type {
  ItemValues as EditorItemValues,
  ItemData as EditorItemData,
} from "../../utils/components/Editor/react";

type JobsProps = {
  className?: string;
};

export function Jobs({ className }: JobsProps): JSX.Element {
  const clientsHandler = useClientsHandler();
  const jobsHandler = useJobsHandler();

  const [filterClientName, setFilterClientName, filterClientNameComponent] =
    useDataEntry({
      title: "Client Name",
    });

  const [filterStatus, setFilterStatus, filterStatusComponent] = useDataEntry({
    title: "Status",
    type: "select",
    defaultDatas: [
      { value: "" },
      ...Object.entries(Status).map(([, value]) => ({
        value: value,
      })),
    ],
  });

  const handleCreateNewItem = React.useCallback(
    function (job: Job, newJobData: EditorItemValues) {
      const clientName = newJobData["clientName"];
      if (clientName === undefined)
        throw new Error("Missing clientName in newJobData");
      const newClient = clientsHandler.get(clientName);
      if (newClient === undefined)
        throw new Error(`Client not found (id: ${newJobData["clientId"]})`);

      return {
        ...job,
        ...newJobData,
        clientId: newClient.id,
      };
    },
    [clientsHandler]
  );

  const handleMakeItemData = React.useCallback(
    function (job: Job): EditorItemData {
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

  const handleCreateDefaultItem = React.useCallback(function (): Job {
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

  if (!clientsHandler.loaded || !jobsHandler.loaded) {
    return <LoadingSpinner />;
  }

  let jobs: Job[] = jobsHandler.getAll();

  if (filterClientName !== "") {
    jobs = jobs.filter((job) =>
      clientsHandler
        .get(job.clientId)
        ?.name.toLowerCase()
        .includes(filterClientName.toLowerCase())
    );
  }

  if (filterStatus !== "") {
    jobs = jobs.filter((job) => job.status === filterStatus);
  }

  return (
    <EditableList<Job>
      items={jobs}
      createNewItem={handleCreateNewItem}
      handler={jobsHandler}
      makeItemData={handleMakeItemData}
      makeListItems={(jobs) => makeListItemsFromJobs(jobs, clientsHandler)}
      createDefaultItem={handleCreateDefaultItem}
      filterEntries={[
        [filterClientName, setFilterClientName, filterClientNameComponent],
        [filterStatus, setFilterStatus, filterStatusComponent],
      ]}
      className={className}
    />
  );
}
