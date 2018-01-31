/* eslint global-require: 0 prefer-destructuring: 0 */
jest.useFakeTimers();

const getMasterRef = api => api.data.refs.find(r => r.isMasterRef).ref;

describe('linkResolver', () => {
  let mod;
  let queryPrismic;
  let updateRef;
  beforeEach(() => {
    mod = require('./queryPrismic');
    queryPrismic = mod.default;
    mod.initPrismic({ endpoint: 'https://saturnfive.cdn.prismic.io/api/v2' });
    updateRef = require('prismic-javascript').updateRef;
  });
  afterEach(() => {
    jest.resetModules();
  });

  test('Fetches Prismic api and makes a content request', async (done) => {
    const getRes = queryPrismic([['at', 'document.type', 'site']]);
    jest.runAllTimers();
    const res = await getRes;
    expect(res).toMatchSnapshot();
    done();
  });

  test('Waits for Prismic API with back-to-back requests', async (done) => {
    // Request api the first time.
    const get1 = mod.getPrismic();

    // Immediately update the Prismic ref.
    updateRef('new-ref');

    // Request api the second time. Not enough time has elapsed to have
    // finished loading the original api request, so we should wait for it,
    // which means we don't get the new ref.
    const get2 = mod.getPrismic();

    // Advance timers by one second to ensure we have loaded the api.
    jest.runTimersToTime(1000);

    // Wait for the api requests to resolve.
    const api1 = await get1;
    const api2 = await get2;

    // Verify that both api requests got the same ref.
    expect(getMasterRef(api1)).toBe('test-starting-ref');
    expect(getMasterRef(api2)).toBe('test-starting-ref');

    done();
  });

  test('Gets new Prismic ref after enough time has passed', async (done) => {
    // Request api the first time.
    const get1 = mod.getPrismic();

    // Run all the timers out so we have a fresh start next request.
    jest.runAllTimers();

    // Wait for the first api request to resolve.
    const api1 = await get1;

    // Update the Prismic ref to simulate a new update in Prismic.
    updateRef('new-ref');

    // Request api the second time.
    const get2 = mod.getPrismic();

    // Run all the timers out again to give the new api time to load.
    jest.runAllTimers();
    const api2 = await get2;

    // Verify that the api requests have different refs.
    expect(getMasterRef(api1)).toBe('test-starting-ref');
    expect(getMasterRef(api2)).toBe('new-ref');

    done();
  });

  test('Uses the same Prismic ref if it hasn\'t changed', async (done) => {
    // Request api the first time.
    const get1 = mod.getPrismic();

    // Run all the timers out so we have a fresh start next request.
    jest.runAllTimers();

    // Wait for the first api request to resolve.
    const api1 = await get1;

    // Request api the second time.
    const get2 = mod.getPrismic();

    // Run all the timers out again to give the new api time to load.
    jest.runAllTimers();
    const api2 = await get2;

    // Verify that the api requests have different refs.
    expect(getMasterRef(api1)).toBe('test-starting-ref');
    expect(getMasterRef(api2)).toBe('test-starting-ref');

    done();
  });
});
