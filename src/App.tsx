import React from "react";

import { Clients } from "./components/Clients/react";
import { Jobs } from "./components/Jobs/react";
import { Invoice } from "./components/Invoice/react";

import { Button } from "./utils/components/Button/react";

const clientsView = {
  title: "Client",
  element: <Clients className="w-11/12" />
};

const jobsView = {
  title: "Jobs",
  element: <Jobs className="w-11/12" />
};

const invoiceView = {
  title: "Invoice",
  element: <Invoice className="w-11/12" />
};

export default function App() {
  const [view, setView] = React.useState(jobsView);

  return (
    <div className="min-w-[1000px] min-h-screen p-4 flex flex-col justify-start items-center gap-4 bg-slate-500 text-center text-slate-700 select-none">

      <div className="w-5/6 p-4 flex flex-row justify-evenly gap-4 rounded bg-slate-400 shadow shadow-slate-600">

        <Button className="font-bold" title="Clients" onClick={() => setView(clientsView)} />

        <Button className="font-bold" title="Jobs" onClick={() => setView(jobsView)} />

        <Button className="font-bold" title="Invoice" onClick={() => setView(invoiceView)} />

      </div>

      <h1 className="w-min p-4 rounded bg-slate-400 text-3xl font-bold underline">{view.title}</h1>

      {view ? view.element : <div>Nothing to see here</div>}
    </div>
  );
}