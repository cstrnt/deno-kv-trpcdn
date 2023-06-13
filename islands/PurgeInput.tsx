import { useRef } from "preact/hooks";

type Props = {
  projectId: string;
};

export default function PurgeInput({ projectId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={onSubmit}>
        Purge Query
      </button>
    </div>
  );
}
