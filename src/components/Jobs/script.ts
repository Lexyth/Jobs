import { RootLogger } from "../../utils/logging";
const logger = RootLogger.getLogger("Jobs:script");

import type { ClientsHandler } from "../Clients/clientsHandler.js";
import type { SummaryDataWithAttrs } from "../../utils/components/List/react.js";
import type { Job } from "./store.js";

export function toSummaryData(
  job: Job,
  clientsHandler: ClientsHandler,
  _attrs?: SummaryDataWithAttrs["_attrs"]
): SummaryDataWithAttrs {
  const client = clientsHandler.get(job.clientId);
  if (client === undefined) {
    logger["WARN"](
      "Could not find client with id " +
        job.clientId +
        " for job " +
        job.id +
        " in " +
        JSON.stringify(clientsHandler.getAll())
    );
  }

  const clientName = client?.name ?? `Unknown Client (${job.clientId})`;

  const summary: SummaryDataWithAttrs = {
    client: clientName,
    date: job.date,
    description: job.description,
    gross: job.gross.toString(),
    status: job.status,
  };

  if (_attrs) {
    summary._attrs = _attrs;
  }

  return summary;
}
