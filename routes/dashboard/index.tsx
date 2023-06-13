// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import Layout from "@/components/Layout.tsx";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import { getRequestsByProjectId, RequestLog } from "@/utils/db.ts";
import { ComponentChild } from "preact";
import { DashboardState } from "./_middleware.ts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table.tsx";

interface RowProps {
  title: string;
  children?: ComponentChild;
  text: string;
  img?: string;
}

function Row(props: RowProps) {
  return (
    <div class="flex flex-wrap py-8">
      {props.img && (
        <img
          height="48"
          width="48"
          src={props.img}
          alt="user avatar"
          class="rounded-full"
        />
      )}
      <div class="px-4">
        <div class="flex flex-wrap justify-between">
          <span>
            <strong>{props.title}</strong>
          </span>
          {props.children && <span>{props.children}</span>}
        </div>
        <p>
          {props.text}
        </p>
      </div>
    </div>
  );
}

type DashboardProps = {
  requests: RequestLog[];
  averageExecutionTime: number;
  cacheHitRate: number;
  averageCacheExecutionTime: number;
  averageUncachedExecutionTime: number;
} & DashboardState;

export const handler: Handlers<DashboardProps, DashboardState> = {
  async GET(_request, ctx) {
    const requests = await getRequestsByProjectId(ctx.state.project.id);

    const cachedRequests = requests.filter((req) => req.isCached);
    const uncachedRequests = requests.filter((req) => !req.isCached);

    const averageExecutionTime = requests.reduce(
      (acc, req) => acc + req.timeInMs,
      0,
    ) / requests.length;

    const cacheHitRate = (cachedRequests.length / requests.length) * 100;

    const averageCacheExecutionTime = cachedRequests.reduce(
      (acc, req) => acc + req.timeInMs,
      0,
    ) / cachedRequests.length;

    const averageUncachedExecutionTime = uncachedRequests.reduce(
      (acc, req) => acc + req.timeInMs,
      0,
    ) / uncachedRequests.length;

    return ctx.render({
      requests,
      averageExecutionTime,
      cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate,
      averageCacheExecutionTime: isNaN(averageCacheExecutionTime)
        ? 0
        : averageCacheExecutionTime,
      averageUncachedExecutionTime: isNaN(averageUncachedExecutionTime)
        ? 0
        : averageUncachedExecutionTime,
      ...ctx.state,
    });
  },
};

export default function DashboardPage(props: PageProps<DashboardProps>) {
  const project = props.data.project;

  return (
    <>
      <Head title={props.data.project.name} href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4`}>
          <Row
            title={props.data.project.name}
            text={`Domain: ${props.data.project.domain}`}
          />
          <pre>{JSON.stringify(project, null, 2)}</pre>

          <p>
            Cache Hit Rate: {props.data.cacheHitRate.toFixed(2)}% (
            {props.data.averageCacheExecutionTime.toFixed(2)} ms) | Uncached: (
            {props.data.averageUncachedExecutionTime.toFixed(2)} ms)
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query Key</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>Cached</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.data.requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.queryName}
                  </TableCell>
                  <TableCell className="ellipsis max-w-[150px]">
                    {request.rawInput}
                  </TableCell>
                  <TableCell>{request.timeInMs} ms</TableCell>
                  <TableCell>{request.isCached ? "✅" : "❌"}</TableCell>
                  <TableCell className="text-right">
                    {request.createdAt.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Layout>
    </>
  );
}
