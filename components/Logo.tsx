// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { JSX } from "preact";
import { SITE_NAME } from "@/utils/constants.ts";

export default function Logo(props: JSX.HTMLAttributes<HTMLImageElement>) {
  const height = props.height ?? 96;
  const [t, ...rest] = SITE_NAME.split("");

  return (
    <h2 className="text-3xl font-bold">
      <span className="text-red-400">{t}</span>
      {rest}
    </h2>
  );
}
