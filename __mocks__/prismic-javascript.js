import mockData from './mockData/prismic';

// Starting ref value, and function to enable tests to update the ref,
// simulating a change in content on Prismic while the site is running.
let ref = 'test-starting-ref';
export function updateRef(newRef) {
  ref = newRef;
}

export default {
  getApi: endpoint => new Promise((resolve, reject) => {
    const thisRef = ref;
    setTimeout(() => {
      if (endpoint !== 'https://saturnfive.cdn.prismic.io/api/v2') {
        reject();
        return;
      }
      resolve({
        query: (args) => {
          let predicates = args;
          if (!Array.isArray(predicates[0])) {
            predicates = [predicates];
          }

          const docType = predicates.find(p => p[0] === 'document.type')[1];

          let results = mockData[docType];
          predicates.forEach((p) => {
            const queryParts = p[0].split('.');
            if (queryParts[0] === 'my') {
              results = results.filter(r => r.data[queryParts[2]] === p[1]);
            }
          });
          return Promise.resolve({ results });
        },
        data: {
          refs: [{ ref: thisRef, isMasterRef: true }],
        },
      });
    }, 10);
  }),
  Predicates: {
    at: (...args) => args,
  },
};
