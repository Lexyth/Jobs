import { ClientsHandler } from "../Clients/clientsHandler.js";
import { SummaryDataWithAttrs } from "../../utils/components/List/react.js";

import type { Job } from "./store.js";

export function makeListItems(
  jobs: Job[],
  clientsHandler: ClientsHandler
): SummaryDataWithAttrs[] {
  const summaries: SummaryDataWithAttrs[] = jobs.map((job) => {
    const client = clientsHandler.get(job.clientId);
    if (client === undefined) {
      throw new Error(
        "Could not find client with id " +
          job.clientId +
          " for job " +
          job.id +
          " in " +
          JSON.stringify(clientsHandler.getAll())
      );
    }

    const summary: SummaryDataWithAttrs = {
      client: client.name,
      date: job.date,
      description: job.description,
      gross: job.gross.toString(),
      status: job.status,
    };

    return summary;
  });

  return summaries;
}
