import { createStore } from "../../utils/store";

export type Client = {
    id: number;
    name: string;
}

export const clientsStore = createStore<Client[]>([
    {
        id: 0,
        name: 'Bob',
    },
    {
        id: 1,
        name: 'Sally',
    },
    {
        id: 2,
        name: 'Joe',
    },
    {
        id: 3,
        name: 'Jane',
    }
]);