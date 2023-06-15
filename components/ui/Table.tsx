import { JSX } from "preact/jsx-runtime";
import { cn } from "@/utils/cn.ts";

const Table = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableElement>,
) => (
  <div className="w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
);

const TableHeader = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableSectionElement>,
) => <thead className={cn("[&_tr]:border-b", className)} {...props} />;

const TableBody = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableSectionElement>,
) => (
  <tbody
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
);

const TableFooter = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableSectionElement>,
) => (
  <tfoot
    className={cn("bg-primary font-medium text-primary-foreground", className)}
    {...props}
  />
);

const TableRow = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableRowElement>,
) => (
  <tr
    className={cn(
      "border-b transition-colors hover:bg-gray-700/50 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
);

const TableHead = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableCellElement>,
) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
);

const TableCell = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableCellElement>,
) => (
  <td
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
);

const TableCaption = (
  { className, ...props }: JSX.HTMLAttributes<HTMLTableCaptionElement>,
) => (
  <caption
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
);

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
