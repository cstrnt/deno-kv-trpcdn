import { ComponentChildren } from "preact";

export function InputGroup({ children }: { children: ComponentChildren }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      {children}
    </div>
  );
}
