import Prismic from 'prismic-javascript';

// Initialize settings object.
const settings = { initialized: false, refresh: 10, fetchLinks: '' };
export function initPrismic(newSettings) {
  Object.assign(settings, newSettings);
  settings.initialized = true;
}

let api;
let apiPromise;
let stale = true;
let apiTimeout;

// Get the Prismic API object, using a cached version of it if we have one and
// checking every REFRESH seconds to see if there is a new Prismic release ref,
// reloading the api object if so.
export async function getPrismic() {
  // If we are currently loading a new api object and have a promise for it
  // wait for that promise to resolve before doing anything else. This prevents
  // us from requesting the api multiple times back-to-back.
  if (apiPromise) {
    await apiPromise;
  }

  // If our api object is stale, fetch it again.
  if (!api || stale) {
    // Set stale back to true after a few seconds so we don't have to keep
    // fetching the master ref from Prismic on back-to-back requests.
    // settings.refresh is the number of seconds to wait between Prismic calls
    // before checking if we have a new Prismic release ref or not.
    stale = false;
    clearTimeout(apiTimeout);
    apiTimeout = setTimeout(() => {
      stale = true;
    }, settings.refresh * 1000);

    // Get new api object from Prismic, with latest master ref.
    apiPromise = Prismic.getApi(settings.endpoint);
    const newApi = await apiPromise;
    apiPromise = undefined;

    // If the master ref has changed update our prismic api object. This will
    // clear the cache and ensure we are serving the latest content.
    const oldRef = api && api.data.refs.find(r => r.isMasterRef).ref;
    const newRef = newApi.data.refs.find(r => r.isMasterRef).ref;
    if (oldRef !== newRef) {
      api = newApi;
    }
  }

  // Return the api object.
  return api;
}

/**
 * Make a query request to Prismic. Return a promise for the request. This
 * function itself is mostly a light wrapper around the prismic api object's
 * query method, but it allows use to use the cache functionality defined
 * above in getPrismic() and simplifies syntax for making requests.
 *
 * The query param receives an array of query arrays, with each query array
 * containing three values: the method to be use, the key, and the value.
 * For example:
 *   [
 *     ['at', 'document.type', 'article'],
 *     ['at', 'document.id', '12345'],
 *   ]
 * Becomes:
 *   [
 *     Prismic.Predicates.at('document.type', 'article'),
 *     Prismic.Predicates.at('document.id', '12345'),
 *   ]
 * @param {Array[]} query - array of query arrays
 */
const queryPrismic = async (query) => {
  // First get the Prismic API object.
  const prismic = await getPrismic();

  // Convert array of queries into actual prismic predicate objects.
  const predicates = query.map(p => Prismic.Predicates[p[0]](p[1], p[2]));

  // Make the request to prismic and return the data when done.
  return prismic.query(predicates, { fetchLinks: settings.fetchLinks });
};

export default queryPrismic;
