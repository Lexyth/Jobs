import { twMerge } from "tailwind-merge";

type ModalProps = {
    children: React.ReactNode,
    onClickOutside: () => void,
    className?: string
}

export function Modal({
    children,
    onClickOutside,
    className
}: ModalProps) {
    return (
        <div
            className={twMerge(
                "fixed top-0 left-0 w-full h-full flex justify-center items-center bg-slate-400/40 cursor-pointer *:cursor-default",
                className
            )}
            onClick={(event) => event.target === event.currentTarget && onClickOutside()}
        >
            {children}
        </div>
    );
}