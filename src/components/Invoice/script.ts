import type { InvoiceOrigin, Invoice } from "./react";

export function createInvoice(invoiceOrigin: InvoiceOrigin): Invoice {
  const invoice: Invoice = {
    Datum: "TODO",
    "Rechnungs-Nr.": "TODO",
    "Abrechnung vom": "TODO", // TODO?: is this necessary?
    "UST-ID-Nr.": "TODO", // gotten from User
    "Steuer-Nr.": "TODO", // gotten from User

    r_name: invoiceOrigin.client.name,
    r_company: invoiceOrigin.client.company ?? "",
    r_address: invoiceOrigin.client.address ?? "",
    r_zip: invoiceOrigin.client.zip ?? "",
    r_city: invoiceOrigin.client.city ?? "",
    r_country: invoiceOrigin.client.country ?? "",

    v_name: invoiceOrigin.client.name,

    v_company: invoiceOrigin.client.company ?? "",
    v_address: invoiceOrigin.client.address ?? "",
    v_zip: invoiceOrigin.client.zip ?? "",
    v_city: invoiceOrigin.client.city ?? "",
    v_country: invoiceOrigin.client.country ?? "",

    "UST-ID-Nr. Kunde": invoiceOrigin.client["UST-ID-Nr."] ?? "",
    "Bestell-Nr.": invoiceOrigin.client["Bestell-Nr."] ?? "",
    Zahlungsbedingungen: invoiceOrigin.client.Zahlungsbedingungen ?? "",
    "Liefer-Nr. Kunde": invoiceOrigin.client["Liefer-Nr."] ?? "",
    "Kunden-Nr.": invoiceOrigin.client["Nr."] ?? "",

    jobDataList: invoiceOrigin.jobList.map((job) => {
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
