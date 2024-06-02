import React from "react";

import { twMerge } from "tailwind-merge";

type ModalProps = {
  children: React.ReactNode;
  onClickOutside: () => void;
  className?: string;
};

export function Modal({ children, onClickOutside, className }: ModalProps) {
  const handleClickOutside = React.useCallback(
    (event: React.MouseEvent) => {
      event.target === event.currentTarget && onClickOutside();
    },
    [onClickOutside]
  );
  return (
    <div
      onClick={handleClickOutside}
      className={twMerge(
        "fixed top-0 left-0 w-full h-full flex justify-center items-center bg-slate-400/40 cursor-pointer *:cursor-default",
        className
      )}
    >
      {children}
    </div>
  );
}
