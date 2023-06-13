export function parseQueryUrl(url: URL, projectSlug: string) {
  const cleanedPathName = url.pathname.replace(`/${projectSlug}`, "")
    .replaceAll("/", "");
  const queries = cleanedPathName.split(",");
  const isBatch = url.searchParams.get("batch") === "1";
  const input = url.searchParams.get("input") ?? "";

  const parsedInput = JSON.parse(input);

  if (!isBatch) {
    return [{
      queryName: queries[0],
      input: parsedInput,
      rawInput: input,
    }];
  }

  return queries.map((queryName, index) => ({
    queryName,
    input: parsedInput[index],
    rawInput: input,
  }));
}
