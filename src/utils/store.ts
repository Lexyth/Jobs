import { load, save } from "./persistence";

export type Store<Type> = {
    get: () => Type;
    set: (newValue: Type) => void;
    subscribe: (listener: () => void) => () => void;
    getSnapshot: () => Type;
}

export type PersistentStore<Type> = (
    Store<Type>
    & {
        loaded: boolean,
        isSaved: boolean,
        save: () => Promise<boolean>,
        load: () => Promise<Type>
    }
);

export function createStore<Type>(
    initialValue: Type
): Store<Type> {
    let value: Type = initialValue;

    let listeners: (() => void)[] = [];

    function unsubscribe(listener: () => void) {
        listeners = listeners.filter((l) => l !== listener);
    }

    function subscribe(listener: () => void) {
        listeners.push(listener);

        return () => unsubscribe(listener);
    }

    function getSnapshot(): Type {
        return value;
    }

    function emit() {
        listeners.forEach((listener) => { listener(); });
    }

    function get(): Type {
        return value;
    }

    function set(newValue: Type): void {
        value = newValue;
        emit();
    }

    const store: Store<Type> = {
        get,
        set,
        subscribe,
        getSnapshot
    }

    return store;
}

export function createPersistentStore<Type>(
    initialValue: Type,
    load: () => Promise<Type>,
    save: (snapshot: Type) => Promise<boolean>,
    saveDelay: number = 10000
): PersistentStore<Type> {
    const store = createStore(initialValue) as PersistentStore<Type>;

    store.loaded = false;

    store.isSaved = true;

    let saveDelayTimeoutId: number | undefined;

    const set = store.set;
    store.set = (newValue: Type) => {
        store.isSaved = false;
        set(newValue);
        clearTimeout(saveDelayTimeoutId);
        saveDelayTimeoutId = setTimeout(() => {
            if (store.loaded && store.isSaved === false) {
                store.save();
            }
        }, saveDelay);
    };

    store.load = async () => {
        store.loaded = false;
        const result = await load();
        store.loaded = true;
        store.set(result);
        store.isSaved = true;
        return result;
    };

    store.save = async () => {
        store.isSaved = true;
        clearTimeout(saveDelayTimeoutId);
        const result = await save(store.getSnapshot());
        return result;
    }

    store.load();

    return store;
}

export function createPersistentCSVStore<Type>(
    initialValue: Type[],
    path: string,
    toArray: (obj: Type) => string[],
    fromArray: (arr: string[]) => Type,
    saveDelay?: number
): PersistentStore<Type[]> {
    const loadCSV = async () => {
        const csvText = await load(path);
        if (!csvText) {
            console.warn("Loading CSV failed. No text in file.");
            return initialValue;
        }

        const csvArray = csvText.split("\n");

        let result: Type[] = [];

        for (let i = 0; i < csvArray.length; i++) {
            const csv = csvArray[i];
            if (csv === undefined) {
                continue;
            }

            const data = csv.split(",");

            const obj = fromArray(data);
            result.push(obj);
        }

        return result;
    };
    const saveCSV = async (snapshot: Type[]) => {
        const csv: string = snapshot.map((obj) => toArray(obj).join(",")).join("\n");
        const result: boolean = await save(path, csv, "text/csv");

        return result;
    };
    return createPersistentStore(initialValue, loadCSV, saveCSV, saveDelay);
}