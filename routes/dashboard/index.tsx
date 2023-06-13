// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import Layout from "@/components/Layout.tsx";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import {
  getCachedQueriesForProject,
  getRequestsByProjectId,
  RequestLog,
} from "@/utils/db.ts";
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
import PurgeInput from "../../islands/PurgeInput.tsx";

type DashboardProps = {
  requests: RequestLog[];
  averageExecutionTime: number;
  cacheHitRate: number;
  averageCacheExecutionTime: number;
  averageUncachedExecutionTime: number;
  queryKeys: string[];
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

    const queryKeys = await getCachedQueriesForProject(ctx.state.project.slug);

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
      queryKeys,
      ...ctx.state,
    });
  },
};

export default function DashboardPage(props: PageProps<DashboardProps>) {
  const project = props.data.project;

  return (
    <>
      <Head title={project.name} href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4 space-y-4 py-8`}>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p>
            <strong>Project Name:</strong> {project.name}
            <br />
            <strong>Project Slug:</strong> {project.slug}
            <br />
            <strong>Project Domain:</strong> {project.domain}
            <br />
            <strong>
              Your tRPC Url: {" "}
            </strong>
            https://trpcdn.deno.dev/{project.slug}
          </p>
          <PurgeInput
            projectId={project.id}
            queryKeys={props.data.queryKeys}
          />
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
                <TableHead>Cache Hit</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.data.requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.queryName}
                  </TableCell>
                  <TableCell
                    className="text-ellipsis overflow-hidden max-w-[150px]"
                    title={request.rawInput}
                  >
                    {request.rawInput}
                  </TableCell>
                  <TableCell>{request.timeInMs} ms</TableCell>
                  <TableCell>
                    {request.isCached ? "✅" : "❌"}
                  </TableCell>
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
