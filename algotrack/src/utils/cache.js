const cache = {};

export const cachedFetch = async (key, fetchFn, ttl = 30000) => {
  const now = Date.now();
  if (cache[key] && now - cache[key].time < ttl) {
    return cache[key].data;
  }
  const data = await fetchFn();
  cache[key] = { data, time: now };
  return data;
};