import React from "react";

import { List } from "../../utils/components/List/react";
import { Button } from "../../utils/components/Button/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";
import { Modal } from "../../utils/components/Modal/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "../Jobs/hook";
import { useDataEntry } from "../../utils/components/DataEntry/hook";
import { useFilter, useSelection } from "../../utils/components/List/hooks";

import { makeListItemsFromJobs } from "../Jobs/script";
import { makeListItemsFromClients } from "../Clients/script";
import { createInvoice } from "./script";

import { twMerge } from "tailwind-merge";

import { Status } from "../Jobs/store";
import type { Job } from "../Jobs/store";
import type { Client } from "../Clients/store";
import type { SummaryDataWithAttrs } from "../../utils/components/List/react";

// TODO?: add a list of all the past invoices, including a way to re-"print" them

// TODO: only show any jobs when a client is selected. We need a client to create an invoice, not just a list of jobs. Also, remove the filter for jobs by client name, since they'll all be by the same client.

// TODO: select all jobs button

// TODO!: create an invoice entry, from which one can generate the pdf or click on it to overwrite all parameters (showing the original next to it)

// TODO!: All data in an Invoice entry must be editable.

/* Invoice needs following data:
 *
 * From User:
 * UST-ID-Nr.
 * Steuer-Nr.

 * From Invoice (changes with each invoice):
 * Datum
 * Rechnungs-Nr.

 * From Client:
 * Rechnung an
 * Versand an
 * 
 * UST-ID-Nr. Kunde
 * Bestell-Nr.
 * Zahlungsbedingungen
 * Liefer-Nr. Kunde
 * Kunden-Nr.
 * ? Abrechnung vom

 * From Item:
 * Position
 * Ausgeführt
 * Artikel-Nr.
 * Artikel-Bez.
 * Beschreibung
 * Anzahl 
 * Preis
 * MwSt. %
 * MwSt. (consider displaying it as: X.XX€ (Y %))
 * Netto Summe
 * Brutto Summe
 
 * Netto Summe
 * MwSt. Summe
 * Brutto Summe
*/

type InvoiceProps = {
  className?: string;
};

export function Invoice({ className }: InvoiceProps): JSX.Element {
  const [showCreator, setShowCreator] = React.useState(false);

  return (
    <div className={className}>
      {
        // eslint-disable-next-line no-constant-condition
        false ? (
          <>
            {showCreator && (
              <Modal onClickOutside={() => setShowCreator(false)}>
                <InvoiceCreator />
              </Modal>
            )}

            <Button
              title="Create"
              onClick={() => setShowCreator(!showCreator)}
            />
          </>
        ) : (
          <InvoiceCreator />
        )
      }
    </div>
  );
}

function InvoiceCreator({ className }: InvoiceProps): JSX.Element {
  const clientsHandler = useClientsHandler();
  const jobsHandler = useJobsHandler();

  const clientNameFilterEntry = useDataEntry({
    title: "Client Name",
  });

  const clients = clientsHandler.loaded ? clientsHandler.getAll() : [];

  const { filteredItems: filteredClients, component: clientsFilterComponent } =
    useFilter(clients, [
      {
        get: clientNameFilterEntry[0],
        set: clientNameFilterEntry[1],
        component: clientNameFilterEntry[2],
        test: (client) =>
          clientNameFilterEntry[0] === "" ||
          client.name
            .toLowerCase()
            .includes(clientNameFilterEntry[0].toLowerCase()),
      },
    ]);

  const clientItems: SummaryDataWithAttrs[] =
    makeListItemsFromClients(filteredClients);

  const {
    selection: [selectedClientIndex_],
    handleSelect: handleSelectClient,
  }: { selection: (number | null)[]; handleSelect: (index: number) => void } =
    useSelection(clientItems, null);
  const selectedClientIndex = selectedClientIndex_ ?? null;

  const selectedClient: Client | null =
    (selectedClientIndex === null
      ? null
      : filteredClients[selectedClientIndex]) ?? null;

  const filteredJobs: Job[] = jobsHandler.loaded
    ? jobsHandler
        .getAll()
        .filter(
          (job) =>
            (selectedClient ? selectedClient.id === job.clientId : true) &&
            job.status === Status.InvoicePending
        )
    : [];

  const filteredJobsItems: SummaryDataWithAttrs[] = clientsHandler.loaded
    ? makeListItemsFromJobs(filteredJobs, clientsHandler)
    : [];

  const {
    selection: selectedJobsIndexes,
    setSelection: setSelectedJobsIndexes,
    handleSelect: handleSelectJob,
  } = useSelection(filteredJobsItems, []);

  const selectedJobs: Job[] = selectedJobsIndexes.map((index) => {
    const job: Job | undefined = filteredJobs[index];
    if (!job) {
      throw new Error("Job at index " + index + " was undefined.");
    }
    return job;
  });

  if (!clientsHandler.loaded || !jobsHandler.loaded) {
    return <LoadingSpinner />;
  }

  const disabled: boolean =
    selectedClient === null || filteredJobs.length === 0;

  if (disabled) {
    filteredJobsItems.forEach((summaryData) => {
      if (!summaryData._attrs) {
        summaryData._attrs = {};
      }
      summaryData._attrs.className = twMerge(
        "text-gray-400",
        summaryData._attrs.className
      );
    });
  }

  return (
    <div
      className={twMerge(
        "m-4 p-4 flex flex-col justify-first items-center gap-4 overflow-x-hidden overflow-y-auto rounded bg-slate-300 shadow shadow-slate-400",
        className
      )}
    >
      <h2 className="text-xl font-semibold">Clients</h2>

      {clientsFilterComponent}

      <List
        summaries={clientItems}
        onClick={(index) => {
          handleSelectClient(index);
          setSelectedJobsIndexes([]);
        }}
      />

      <h2 className="text-xl font-semibold">Jobs</h2>

      <List
        summaries={filteredJobsItems}
        onClick={(index) => (disabled ? undefined : handleSelectJob(index))}
      />

      <Button
        title="Create Invoice"
        onClick={() => {
          const selectedClientName = `${selectedClient?.name}(#${selectedClient?.id})`;
          const selectedJobs = filteredJobs.filter((job) =>
            selectedJobsIds.includes(job.id)
          );
          const jobsString = JSON.stringify(selectedJobs);

          console.debug(
            `Creating an invoice for client ${selectedClientName} from jobs ${jobsString}`
          );
        }}
        attrs={{ disabled }}
      />
    </div>
  );
}
