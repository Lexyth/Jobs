import type { InvoiceOrigin, Invoice } from "./react";

export function createInvoice(invoiceOrigin: InvoiceOrigin): Invoice {
  const invoice: Invoice = {
    Datum: "TODO",
    "Rechnungs-Nr.": "TODO",
    "Abrechnung vom": "TODO", // TODO?: is this necessary?
    "UST-ID-Nr.": "TODO", // gotten from User
    "Steuer-Nr.": "TODO", // gotten from User

    r_name: client.name,
    r_company: client.company ?? "",
    r_address: client.address ?? "",
    r_zip: client.zip ?? "",
    r_city: client.city ?? "",
    r_country: client.country ?? "",

    v_name: client.name,

    v_company: client.company ?? "",
    v_address: client.address ?? "",
    v_zip: client.zip ?? "",
    v_city: client.city ?? "",
    v_country: client.country ?? "",

    "UST-ID-Nr. Kunde": client["UST-ID-Nr."] ?? "",
    "Bestell-Nr.": client["Bestell-Nr."] ?? "",
    Zahlungsbedingungen: client.Zahlungsbedingungen ?? "",
    "Liefer-Nr. Kunde": client["Liefer-Nr."] ?? "",
    "Kunden-Nr.": client["Nr."] ?? "",

    jobDataList: jobList.map((job) => {
      return {
        Ausgeführt: job.dateOfCompletion ?? "",
        "Artikel-Nr.": "TODO",
        "Artikel-Bez.": "TODO",
        Beschreibung: job.description,
        Anzahl: job.count.toString(),
        Preis: job.price.toString(),
        "MwSt. %": job.vat.toString(),
        Netto: job.net.toString(),
        Brutto: job.gross.toString(),
      };
    }),

    "Netto Summe": "TODO",
    "MwSt. Summe": "TODO",
    "Brutto Summe": "TODO",
  };
  return invoice;
}
