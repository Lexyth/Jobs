import React from "react";

import { List } from "../../utils/components/List/react";
import { Button } from "../../utils/components/Button/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";
import { Modal } from "../../utils/components/Modal/react";

import { useClientsHandler } from "../Clients/hook";
import { useJobsHandler } from "../Jobs/hook";
import { useEntry } from "../../utils/components/Entry/hook";
import { useFilter, useSelection } from "../../utils/components/List/hooks";

import { makeListItems as makeListItemsFromJobs } from "../Jobs/script";
import { makeListItems as makeListItemsFromClients } from "../Clients/script";
import { createInvoice } from "./script";

import { twMerge } from "tailwind-merge";

import { Status } from "../Jobs/store";
import type { Job } from "../Jobs/store";
import type { Client } from "../Clients/store";
import type { SummaryDataWithAttrs } from "../../utils/components/List/react";

// TODO!: Add an invoice editor, so that all data in an Invoice entry can be edited.

type AddressData = {
  name: string;
  company: string;
  address: string;
  zip: string;
  city: string;
  country: string;
};

type JobData = {
  // From Item:
  Ausgeführt: string;
  "Artikel-Nr.": string;
  "Artikel-Bez.": string;
  Beschreibung: string;
  Anzahl: string;
  Preis: string;
  "MwSt. %": string; // TODO?: consider displaying it as: 'X.XX€ (Y %)'
  Netto: string;
  Brutto: string;
};

type RechnungsAddressData = {
  [key in keyof AddressData as `r_${key}`]: AddressData[key];
};

type VersandAddressData = {
  [key in keyof AddressData as `v_${key}`]: AddressData[key];
};

type ClientData = {
  "UST-ID-Nr. Kunde": string;
  "Bestell-Nr.": string;
  Zahlungsbedingungen: string;
  "Liefer-Nr. Kunde": string;
  "Kunden-Nr.": string;
} & RechnungsAddressData &
  VersandAddressData;

type InvoiceData = {
  Datum: string;
  "Rechnungs-Nr.": string;
  "Abrechnung vom": string; // TODO?: is this necessary?
};

type UserData = {
  "UST-ID-Nr.": string;
  "Steuer-Nr.": string;
};

export type Invoice = UserData &
  ClientData &
  InvoiceData & {
    jobDataList: JobData[];
  } & {
    "Netto Summe": string;
    "MwSt. Summe": string;
    "Brutto Summe": string;
  };

export type InvoiceOrigin = {
  client: Client;
  jobList: Job[];
};

type InvoiceProps = {
  className?: string;
};

export function Invoices({ className }: InvoiceProps): JSX.Element {
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

  const clients = clientsHandler.loaded ? clientsHandler.getAll() : [];

  const { filteredItems: filteredClients, component: clientsFilterComponent } =
    useFilter(clients, [
      {
        entry: useEntry({
          title: "Client Name",
        }),
        test: (client, filterValue) =>
          filterValue === "" ||
          client.name.toLowerCase().includes(filterValue.toLowerCase()),
      },
    ]);

  const clientItems: SummaryDataWithAttrs[] =
    makeListItemsFromClients(filteredClients);

  const {
    selection: [selectedClientIndex_OrNull],
    handleSelect: handleSelectClient,
  } = useSelection(filteredClients, null);
  const selectedClientIndex = selectedClientIndex_OrNull ?? null;

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
  } = useSelection(filteredJobs, []);

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
        title={`Create Invoice for ${
          selectedJobs.length === 0 ? " all " : `(${selectedJobs.length}) `
        } Jobs`}
        onClick={() => {
          const selectedClientName_Fancy = `${selectedClient?.name}(#${selectedClient?.id})`;
          const jobsString = JSON.stringify(
            selectedJobs.length === 0 ? filteredJobs : selectedJobs
          );

          console.debug(
            `Creating an invoice for client ${selectedClientName_Fancy} from jobs ${jobsString}`
          );

          if (selectedClient === null) {
            throw new Error(
              "No client selected. Button should not have been pressable."
            );
          }

          if (selectedJobs.length === 0) {
            throw new Error(
              "No jobs selected. Button should not have been pressable."
            );
          }

          const Invoice: Invoice = createInvoice({
            client: selectedClient,
            jobList: selectedJobs,
          });

          console.debug(`Invoice: ${JSON.stringify(Invoice)}`);
        }}
        attrs={{ disabled }}
      />
    </div>
  );
}
