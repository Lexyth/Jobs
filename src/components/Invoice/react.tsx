import React from "react";

import { List } from "../../utils/components/List/react";
import { Button } from "../../utils/components/Button/react";
import { LoadingSpinner } from "../../utils/components/LoadingSpinner/react";
import { Modal } from "../../utils/components/Modal/react";

import { useHandler as useClientsHandler } from "../Clients/hooks";
import { useJobsHandler } from "../Jobs/hooks";
import { useEntry } from "../../utils/components/Entry/hook";
import { useFilter, useSelection } from "../../utils/components/List/hooks";

import { toSummaryData as toSummaryData_Job } from "../Jobs/script";
import { toSummaryData as toSummaryData_Client } from "../Clients/script";
import { createInvoice } from "./script";

import { twMerge } from "tailwind-merge";

import { Status } from "../Jobs/store";
import type { Job } from "../Jobs/store";
import type { Client } from "../Clients/store";

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

  const handleClickOutside = React.useCallback(() => {
    setShowCreator(false);
  }, [setShowCreator]);

  const handleClick = React.useCallback(() => {
    setShowCreator(!showCreator);
  }, [showCreator]);

  return (
    <div className={className}>
      {
        // eslint-disable-next-line no-constant-condition
        false ? (
          <>
            {showCreator && (
              <Modal onClickOutside={handleClickOutside}>
                <InvoiceCreator />
              </Modal>
            )}

            <Button
              title="Create"
              onClick={handleClick}
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

  const clientsLoaded = clientsHandler.loaded;

  const clients = React.useMemo(() => {
    return clientsLoaded ? clientsHandler.getAll() : [];
  }, [clientsHandler, clientsLoaded]);

  const clientNameEntry = useEntry("Client Name");

  const clientsFilterEntries = React.useMemo(() => {
    return [
      {
        entry: clientNameEntry,
        test: (client: Client, entryValue: string) =>
          entryValue === "" ||
          client.name.toLowerCase().includes(entryValue.toLowerCase()),
      },
    ];
  }, [clientNameEntry]);

  const clientsFilter = useFilter(clients, clientsFilterEntries);

  const filteredClients = clientsFilter.filteredItems;
  const clientsFilterComponent = clientsFilter.component;

  const selectedClientRef = React.useRef<Client | null>(null);

  const {
    selection: [selectedClientIndex_OrNull],
    handleSelect: handleSelectClient,
  } = useSelection(filteredClients, [], true);
  const selectedClientIndex = selectedClientIndex_OrNull ?? null;

  const selectedClient: Client | null =
    (selectedClientIndex === null
      ? null
      : filteredClients[selectedClientIndex]) ?? null;

  selectedClientRef.current = selectedClient;

  const jobsLoaded = jobsHandler.loaded;

  const filteredJobs: Job[] = React.useMemo(
    () =>
      jobsLoaded
        ? jobsHandler
            .getAll()
            .filter(
              (job) =>
                (selectedClient ? selectedClient.id === job.clientId : true) &&
                job.status === Status.InvoicePending
            )
        : [],
    [jobsHandler, jobsLoaded, selectedClient]
  );

  const {
    selection: selectedJobsIndexes,
    setSelection: setSelectedJobsIndexes,
    handleSelect: handleSelectJob,
  } = useSelection(filteredJobs, []);

  const handleToSummaryData_Client = React.useCallback(
    (client: Client) =>
      toSummaryData_Client(
        client,
        client === selectedClient
          ? {
              className:
                "bg-slate-300 hover:bg-slate-200 active:bg-slate-100 font-bold",
            }
          : undefined
      ),
    [selectedClient]
  );

  const handleOnClickSummary_Client = React.useCallback(
    (index: number) => {
      handleSelectClient(index);
      setSelectedJobsIndexes([]);
    },
    [handleSelectClient, setSelectedJobsIndexes]
  );

  const disabled = selectedClient === null || filteredJobs.length === 0;

  const selectedJobs: Job[] = React.useMemo(
    () =>
      selectedJobsIndexes.map((index) => {
        const job: Job | undefined = filteredJobs[index];
        if (!job) {
          throw new Error("Job at index " + index + " was undefined.");
        }
        return job;
      }),
    [selectedJobsIndexes, filteredJobs]
  );

  const handleToSummaryData_Job = React.useCallback(
    (job: Job) =>
      toSummaryData_Job(job, clientsHandler, {
        className: twMerge(
          disabled && "text-gray-400",
          selectedJobs.includes(job) &&
            "bg-slate-300 hover:bg-slate-200 active:bg-slate-100 font-bold"
        ),
      }),
    [selectedJobs, clientsHandler, disabled]
  );

  const handleOnClickSummary_Job = React.useCallback(
    (index: number) => {
      return disabled ? undefined : handleSelectJob(index);
    },
    [disabled, handleSelectJob]
  );

  const handleClick_Button = React.useCallback(() => {
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
  }, [selectedClient, selectedJobs, filteredJobs]);

  const buttonAttrs = React.useMemo(() => ({ disabled }), [disabled]);

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
      <h2 className="text-xl font-semibold">Clients</h2>

      {clientsFilterComponent}

      <List
        items={filteredClients}
        toSummaryData={handleToSummaryData_Client}
        onClick={handleOnClickSummary_Client}
      />

      <h2 className="text-xl font-semibold">Jobs</h2>

      <List
        items={filteredJobs}
        toSummaryData={handleToSummaryData_Job}
        onClick={handleOnClickSummary_Job}
      />

      <Button
        title={`Create Invoice for ${
          selectedJobs.length === 0 ? " all " : `(${selectedJobs.length}) `
        } Jobs`}
        onClick={handleClick_Button}
        attrs={buttonAttrs}
      />
    </div>
  );
}
