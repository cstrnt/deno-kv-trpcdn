export const kv = await Deno.openKv();

// Helpers
async function getValue<T>(
  key: Deno.KvKey,
  options?: { consistency?: Deno.KvConsistencyLevel },
) {
  const res = await kv.get<T>(key, options);
  return res.value;
}

async function getValues<T>(
  selector: Deno.KvListSelector,
  options?: Deno.KvListOptions,
) {
  const values = [];
  const iter = kv.list<T>(selector, options);
  for await (const { value } of iter) values.push(value);
  return values;
}

// User
interface InitUser {
  id: string;
  login: string;
  avatarUrl: string;
  sessionId: string;
}

export interface User extends InitUser {
  isSubscribed: boolean;
}

export async function createUser(initUser: InitUser) {
  const user: User = {
    isSubscribed: false,
    ...initUser,
  };

  const usersKey = ["users", user.id];
  const usersByLoginKey = ["users_by_login", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];

  const res = await kv.atomic()
    .check({ key: usersKey, versionstamp: null })
    .check({ key: usersByLoginKey, versionstamp: null })
    .check({ key: usersBySessionKey, versionstamp: null })
    .set(usersKey, user)
    .set(usersByLoginKey, user)
    .set(usersBySessionKey, user)
    .commit();

  if (!res.ok) throw new Error(`Failed to create user: ${user}`);

  return user;
}

export async function updateUser(user: User) {
  const usersKey = ["users", user.id];
  const usersByLoginKey = ["users_by_login", user.login];
  const usersBySessionKey = ["users_by_session", user.sessionId];

  const res = await kv.atomic()
    .set(usersKey, user)
    .set(usersByLoginKey, user)
    .set(usersBySessionKey, user)
    .commit();

  if (!res.ok) throw new Error(`Failed to update user: ${user}`);
}

export async function updateUserIsSubscribed(
  user: User,
  isSubscribed: User["isSubscribed"],
) {
  await updateUser({ ...user, isSubscribed });
}

/** This assumes that the previous session has been cleared */
export async function setUserSessionId(user: User, sessionId: string) {
  await updateUser({ ...user, sessionId });
}

export async function deleteUserBySession(sessionId: string) {
  await kv.delete(["users_by_session", sessionId]);
}

export async function getUserById(id: string) {
  return await getValue<User>(["users", id]);
}

export async function getUserByLogin(login: string) {
  return await getValue<User>(["users_by_login", login]);
}

export async function getUserBySessionId(sessionId: string) {
  const usersBySessionKey = ["users_by_session", sessionId];
  return await getValue<User>(usersBySessionKey, {
    consistency: "eventual",
  }) ?? await getValue<User>(usersBySessionKey);
}

// Project
export interface InitProject {
  name: string;
  slug: string;
  ownerId: string;
  domain: string;
}

export interface Project extends InitProject {
  id: string;
  cacheTtl: number;
}

export function createProject(initProject: InitProject) {
  const project: Project = {
    id: crypto.randomUUID(),
    // 5 minutes
    cacheTtl: 5 * 60 * 1000,
    ...initProject,
  };

  const projectsKey = ["projects", project.id];
  const projectsBySlug = ["projects_by_slug", project.slug];
  const projectsByUser = ["projects_by_user", project.ownerId];

  return kv.atomic()
    .check({ key: projectsKey, versionstamp: null })
    .check({ key: projectsBySlug, versionstamp: null })
    .check({ key: projectsByUser, versionstamp: null })
    .set(projectsKey, project)
    .set(projectsBySlug, project)
    .set(projectsByUser, project)
    .commit();
}

export async function updateProject(
  updatePayload: Pick<Project, "slug"> & Partial<InitProject>,
) {
  const project = await getProjectBySlug(updatePayload.slug);
  if (!project) throw new Error(`Project not found: ${updatePayload.slug}`);

  const projectsKey = ["projects", project.id];
  const projectsBySlug = ["projects_by_slug", project.slug];
  const projectsByUser = ["projects_by_user", project.ownerId];

  const newProject = {
    ...project,
    ...updatePayload,
  };

  return kv.atomic()
    .set(projectsKey, newProject)
    .set(projectsBySlug, newProject)
    .set(projectsByUser, newProject)
    .commit();
}

export function getProjectByUserId(userId: string) {
  return getValue<Project>(["projects_by_user", userId]);
}

export function getProjectBySlug(slug: string) {
  return getValue<Project>(["projects_by_slug", slug]);
}

type CacheValue = {
  createdAt: number;
  value: unknown;
};

export async function setCache({ input, projectSlug, queryName, value }: {
  projectSlug: string;
  queryName: string;
  input: string;
  value: unknown;
}) {
  const cacheKey = [
    "query_cache",
    projectSlug,
    queryName,
    input,
  ];
  return kv.set(cacheKey, {
    createdAt: Date.now(),
    value,
  });
}

export function getCache(
  projectSlug: string,
  queryName: string,
  input: string,
) {
  return getValue<CacheValue>([
    "query_cache",
    projectSlug,
    queryName,
    input,
  ]);
}

export async function purgeCache(
  projectSlug: string,
  queryName: string,
  input?: string,
) {
  const cacheKey = [
    "query_cache",
    projectSlug,
    queryName,
    ...(input ? [input] : []),
  ];

  if (input != null) {
    await kv.delete(cacheKey);
    return;
  }

  const entriesToDelete = kv.list({ prefix: cacheKey });

  for await (const { key } of entriesToDelete) {
    await kv.delete(key);
  }
}

export interface RequestLog {
  id: string;
  projectId: string;
  isCached: boolean;
  timeInMs: number;
  queryName: string;
  createdAt: Date;
  rawInput: string;
}

export async function logRequest(
  { isCached, projectId, queryName, timeInMs, rawInput }: {
    projectId: string;
    isCached: boolean;
    timeInMs: number;
    queryName: string;
    rawInput: string;
  },
) {
  const requestLog: RequestLog = {
    id: crypto.randomUUID(),
    projectId,
    isCached,
    timeInMs,
    queryName,
    rawInput,
    createdAt: new Date(),
  };

  const requestsByProjectId = [
    "requests_by_project_id",
    projectId,
    requestLog.id,
  ];
  const requestsByQueryName = [
    "requests_by_query_name",
    queryName,
    requestLog.id,
  ];

  const res = await kv.atomic()
    .check({ key: requestsByProjectId, versionstamp: null })
    .check({ key: requestsByQueryName, versionstamp: null })
    .set(requestsByProjectId, requestLog)
    .set(requestsByQueryName, requestLog)
    .commit();

  return res.ok;
}

export async function getRequestsByProjectId(projectId: string) {
  const requests = await getValues<RequestLog>({
    prefix: ["requests_by_project_id", projectId],
  });

  return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getCachedQueriesForProject(projectSlug: string) {
  const queryKeys: string[] = [];
  const queries = kv.list<CacheValue>({
    prefix: ["query_cache", projectSlug],
  });

  for await (const query of queries) {
    queryKeys.push(query.key[2].toString());
  }

  return queryKeys;
}
