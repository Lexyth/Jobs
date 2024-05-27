import { twMerge } from "tailwind-merge";

type ButtonProps = {
  title: string;
  onClick: () => void;
  attrs?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  className?: string;
};

export function Button({
  title,
  onClick,
  attrs: attributes,
  className,
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      {...attributes}
      className={twMerge(
        "m-4 px-4 py-2 rounded bg-slate-100 shadow shadow-slate-500 transition duration-300 cursor-pointer hover:bg-slate-200 active:shadow-none disabled:text-gray-300",
        className
      )}
    >
      {title}
    </button>
  );
}
