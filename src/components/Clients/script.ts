import type { Client } from "./store.js";
import type { SummaryDataWithAttrs } from "../../utils/components/List/react.js";

export function toSummaryData(
  client: Client,
  _attrs?: SummaryDataWithAttrs["_attrs"]
): SummaryDataWithAttrs {
  const summary: SummaryDataWithAttrs = {
    name: client.name,
  };

  if (_attrs) {
    summary._attrs = _attrs;
  }

  return summary;
}
