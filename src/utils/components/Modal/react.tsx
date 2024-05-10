type ModalProps = {
    children: React.ReactNode,
    onClickOutside: () => void
}

export function Modal({
    children,
    onClickOutside
}: ModalProps) {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-slate-400/40 cursor-pointer *:cursor-default" onClick={(event) => event.target === event.currentTarget && onClickOutside()}>
            {children}
        </div>
    );
}