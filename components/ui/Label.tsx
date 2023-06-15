import { JSX } from "preact/jsx-runtime";

export function Label(props: JSX.HTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      {...props}
    />
  );
}
