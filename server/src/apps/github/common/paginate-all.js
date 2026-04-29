function parseLinkHeader(link) {
  const parsed = {};
  if (!link) return parsed;
  const items = link.split(',');

  for (const item of items) {
    const [rawUriReference, ...rawLinkParameters] = item.split(';');
    const trimmedUriReference = rawUriReference.trim();
    const reference = trimmedUriReference.slice(1, -1);
    const parameters = {};

    for (const rawParameter of rawLinkParameters) {
      const trimmedRawParameter = rawParameter.trim();
      const [key, value] = trimmedRawParameter.split('=');
      parameters[key.trim()] = value.slice(1, -1);
    }

    parsed[parameters.rel] = {
      uri: reference,
      parameters,
    };
  }

  return parsed;
}

export default async function paginateAll($, request) {
  const response = await request;
  const aggregatedResponse = {
    data: [...response.data],
  };

  let links = parseLinkHeader(response.headers?.link);

  while (links.next) {
    const nextPageResponse = await $.http.get(links.next.uri);

    aggregatedResponse.data.push(...nextPageResponse.data);
    links = parseLinkHeader(nextPageResponse.headers?.link);
  }

  return aggregatedResponse;
}
