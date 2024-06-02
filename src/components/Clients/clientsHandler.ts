import { store as store } from "./store";

import type { Client } from "./store";

export class ClientsHandler {
  static #instance: ClientsHandler | null = null;

  constructor() {
    if (ClientsHandler.#instance) {
      return ClientsHandler.#instance;
    } else {
      ClientsHandler.#instance = this;
    }
  }

  get loaded(): boolean {
    return store.loaded;
  }

  get rev(): number {
    return store.rev;
  }

  add(client: Client): number {
    client.id =
      store.get().reduce((id, client) => (client.id > id ? client.id : id), 0) +
      1;
    const newClients = [...store.get(), { ...client }];
    store.set(newClients);
    return client.id;
  }

  remove(client: Client | number): boolean {
    let newClients;
    if (client instanceof Object) {
      newClients = store
        .get()
        .filter((oldClient) => oldClient.id !== client.id);
    } else {
      newClients = store.get().filter((oldClient) => oldClient.id !== client);
    }
    store.set(newClients);
    return newClients.length !== store.get().length;
  }

  set(client: Client): boolean {
    const index = store
      .get()
      .findIndex((oldClient) => oldClient.id === client.id);

    if (index === -1) {
      return false;
    } else {
      store.set([
        ...store.get().slice(0, index),
        { ...client },
        ...store.get().slice(index + 1),
      ]);
      return true;
    }
  }

  get(identifier: string | number): Client | undefined {
    let client: Client | undefined;
    if (typeof identifier === "string") {
      client = store.get().find((client) => client.name === identifier);
    } else {
      client = store.get().find((client) => client.id === identifier);
    }

    if (client === undefined) return;
    return { ...client };
  }

  getAll(): Client[] {
    return [...store.get()];
  }
}
