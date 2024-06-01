import type { Client } from "./store.js";
import type { SummaryDataWithAttrs } from "../../utils/components/List/react.js";

export function makeListItems(clients: Client[]) {
  const items: SummaryDataWithAttrs[] = clients.map((client) => {
    const item: SummaryDataWithAttrs = {
      name: client.name,
    };

    return item;
  });

  return items;
}
