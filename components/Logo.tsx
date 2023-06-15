// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { JSX } from "preact";
import { SITE_NAME } from "@/utils/constants.ts";
import { cn } from "@/utils/cn.ts";

export default function Logo(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  const [t, ...rest] = SITE_NAME.split("");

  return (
    <h2 className={cn("text-3xl font-bold", props.className)}>
      <span className="text-red-400">{t}</span>
      {rest}
    </h2>
  );
}
