import React from "react";

import { Modal } from "../Modal/react.jsx";
import { Button } from "../Button/react.jsx";

import { useDataEntry, type DataEntryProps, type Value } from "../DataEntry/hook.jsx";

import { twMerge } from "tailwind-merge";

export type ItemData = Record<string, DataEntryProps>;
export type ItemValues = Record<string, Value>;

type DataEntries = Record<string, JSX.Element>;

type EditorProps = {
    itemData: ItemData,
    onSave: (newItemValues: ItemValues) => void,
    onCancel: () => void,
    onDelete?: () => void,
    className?: string
}

type DeleteModalProps = {
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>,
    onDelete: () => void,
    className?: string
}

export function Editor({
    itemData,
    onSave,
    onCancel,
    onDelete,
    className
}: EditorProps): JSX.Element {
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    const newItemValues: ItemValues = {};
    const itemDataEntries: DataEntries = {};
    for (const [key, dataEntryData] of Object.entries(itemData)) {
        //eslint-disable-next-line react-hooks/rules-of-hooks
        const [value, dataEntry] = useDataEntry({
            ...dataEntryData
        });

        newItemValues[key] = value;
        itemDataEntries[key] = dataEntry;
    }

    return (
        <div
            className={twMerge(
                "w-11/12 h-5/6 m-4 p-4 flex flex-col justify-first items-center overflow-x-hidden overflow-y-auto rounded bg-slate-100 shadow shadow-slate-400",
                className
            )}
        >
            <h1>Editor</h1>

            {showDeleteModal && onDelete &&
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    onDelete={onDelete}
                />
            }

            <div className="w-full m-4 p-4 flex flex-row justify-evenly items-center flex-wrap">
                {Object.values(itemDataEntries)}
            </div>

            <div className="w-full m-4 mt-auto p-4 flex flex-row justify-evenly items-center gap-4">
                <Button
                    title="Save"
                    onClick={() => onSave(newItemValues)}
                />

                <Button
                    title="Cancel"
                    onClick={() => onCancel()}
                />

                {onDelete &&
                    <Button
                        className="bg-red-500 text-white hover:bg-red-400 active:bg-red-300"
                        title="Delete"
                        onClick={() => setShowDeleteModal(true)}
                    />
                }
            </div>
        </div>
    );
}

function DeleteModal({
    setShowDeleteModal,
    onDelete,
    className
}: DeleteModalProps): JSX.Element {

    const hideModal = React.useCallback(() => {
        setShowDeleteModal(false);
    }, []);

    return (
        <Modal onClickOutside={hideModal}>
            <div
                className={twMerge(
                    "m-4 p-4 flex flex-col justify-between items-center gap-4 rounded bg-slate-100 shadow shadow-slate-400",
                    className
                )}
            >
                <h1>Are you sure you want to delete this?</h1>

                <div
                    className="flex flex-row justify-between items-center gap-4"
                >
                    <Button
                        title="No"
                        onClick={hideModal}
                    />

                    <Button
                        className="bg-red-500 text-white hover:bg-red-400 active:bg-red-300"
                        title="Yes"
                        onClick={() => {
                            hideModal();
                            onDelete();
                        }}
                    />
                </div>
            </div>
        </Modal>
    );
}