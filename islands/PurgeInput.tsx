import { useRef } from "preact/hooks";
import { BUTTON_STYLES, INPUT_STYLES } from "../utils/constants.ts";
import { cn } from "../components/Table.tsx";

type Props = {
  projectId: string;
  queryKeys: string[];
};

export default function PurgeInput({ projectId, queryKeys }: Props) {
  const inputRef = useRef<HTMLSelectElement>(null);

  const onSubmit = async () => {
    const queryName = inputRef.current?.value;
    if (!queryName) {
      alert("Please enter a query name");
      return;
    }
    await fetch("/api/purge", {
      method: "POST",
      body: JSON.stringify({ queryName, projectId }),
    });

    alert("Purged!");
  };

  return (
    <div className="flex max-w-[600px] h-[60px]">
      <select
        ref={inputRef}
        className={cn(INPUT_STYLES, "rounded-r-none")}
      >
        {queryKeys.map((key) => <option value={key}>{key}</option>)}
      </select>
      <button
        onClick={onSubmit}
        className={cn(BUTTON_STYLES, "rounded-l-none w-[200px]")}
      >
        Purge Query
      </button>
    </div>
  );
}
