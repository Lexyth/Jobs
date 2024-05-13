import { twMerge } from "tailwind-merge";

type LoadingSpinnerProps = {
    className?: string
}

export function LoadingSpinner({
    className
}: LoadingSpinnerProps): JSX.Element {
    return (
        <div
            className={twMerge(
                "inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white",
                className
            )}
            role="status"
        >
            <span
                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Loading...</span>
        </div>
    );

}