import React from "react";

import { Modal } from "../Modal/react";
import { Button } from "../Button/react";

import { useEntry } from "../Entry/hook";

import { twMerge } from "tailwind-merge";

import type { EntryProps } from "../Entry/hook";

export type EntryDataMap = Record<string, EntryProps>;
export type EntryValueMap = Record<string, string>;

type EntryComponentMap = Record<string, JSX.Element>;

type EditorProps = {
  entryDataMap: EntryDataMap;
  onSave: (newEntryValueMap: EntryValueMap) => void;
  onCancel: () => void;
  onDelete?: () => void;
  className?: string;
};

type DeleteModalProps = {
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  onDelete: () => void;
  className?: string;
};

export function Editor({
  entryDataMap,
  onSave,
  onCancel,
  onDelete,
  className,
}: EditorProps): JSX.Element {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const entryValueMap: EntryValueMap = {};
  const entryComponentMap: EntryComponentMap = {};
  for (const [key, data] of Object.entries(entryDataMap)) {
    //eslint-disable-next-line react-hooks/rules-of-hooks
    const { value, component } = useEntry({
      ...data,
    });

    entryValueMap[key] = value;
    entryComponentMap[key] = component;
  }

  return (
    <div
      className={twMerge(
        "w-11/12 h-5/6 m-4 p-4 flex flex-col justify-first items-center overflow-x-hidden overflow-y-auto rounded bg-slate-100 shadow shadow-slate-400",
        className
      )}
    >
      <h1>Editor</h1>

      {showDeleteModal && onDelete && (
        <DeleteModal
          setShowDeleteModal={setShowDeleteModal}
          onDelete={onDelete}
        />
      )}

      <div className="w-full m-4 p-4 flex flex-row justify-evenly items-center flex-wrap">
        {Object.values(entryComponentMap)}
      </div>

      <div className="w-full m-4 mt-auto p-4 flex flex-row justify-evenly items-center gap-4">
        <Button
          title="Save"
          onClick={() => onSave(entryValueMap)}
        />

        <Button
          title="Cancel"
          onClick={() => onCancel()}
        />

        {onDelete && (
          <Button
            title="Delete"
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 text-white hover:bg-red-400 active:bg-red-300"
          />
        )}
      </div>
    </div>
  );
}

function DeleteModal({
  setShowDeleteModal,
  onDelete,
  className,
}: DeleteModalProps): JSX.Element {
  const hideModal = React.useCallback(() => {
    setShowDeleteModal(false);
  }, [setShowDeleteModal]);

  return (
    <Modal onClickOutside={hideModal}>
      <div
        className={twMerge(
          "m-4 p-4 flex flex-col justify-between items-center gap-4 rounded bg-slate-100 shadow shadow-slate-400",
          className
        )}
      >
        <h1>Are you sure you want to delete this?</h1>

        <div className="flex flex-row justify-between items-center gap-4">
          <Button
            title="No"
            onClick={hideModal}
          />

          <Button
            title="Yes"
            onClick={() => {
              hideModal();
              onDelete();
            }}
            className="bg-red-500 text-white hover:bg-red-400 active:bg-red-300"
          />
        </div>
      </div>
    </Modal>
  );
}
