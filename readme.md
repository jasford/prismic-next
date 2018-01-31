## prismic-next
Utils to help use the Prismic CMS with Next.js.

### Installation
```
yarn add prismic-next
```
or
```
npm install prismic-next
```

### Usage

#### queryPrismic
Use in your page components (e.g. `pages/some-page.js`):

```js
import { initPrismic, queryPrismic } from 'prismic-next';
import propTypes from 'prop-types';
import React from 'react';

// Render Page component.
const SomePage = props => ([
  <Head key="head">
    <title>{props.siteDoc.title}</title>
    <meta name="description" content={props.siteDoc.description} />
  </Head>,
  <h1>Hi there.</h1>,
]);
HomePage.propTypes = {
  siteDoc: PropTypes.shape({
    description: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

// Fetch site doc.
HomePage.getInitialProps = async () => {
  initPrismic({
    endpoint: 'https://saturnfive.cdn.prismic.io/api/v2',
    fetchLinks: 'my.page.name,my.other-doc.something',
  });
  const siteDocRes = await queryPrismic([['at', 'document.type', 'site']]);
  return { siteDoc: siteDocRes.results[0].data };
};
```

#### <RichText />
The `<RichText />` component renders structured text content fields from
Prismic into DOM elements, and it uses Next's `<Link >` component to render
internal links via a link resolver function, which you must pass via props.

The `linkResolver` function must return an object with `href` at a minimum,
and can include an optional `as` attribute for use with the Next.js `<Link />`
component.

```js
require { RichText } from 'prismic-next';

// Sample linkResolver function.
function linkResolver(data) {
  // If this is a web link, simply use the URL.
  if (data.link_type === 'Web') {
    return { href: data.url };
  }

  // If this is a document link to a `page` document, generate the URL.
  if (data.type === 'page') {
    return {
      href: `/content?slug=${data.data.slug}&folder=${data.data.folder}`,
      as: `/content/${data.data.slug}`,
    };
  }

  // If we don't know what this is, simply redirect to the home page.
  return { href: '/' };
}

// Component to render a simple Prismic doc with
const Page = ({ prismicDoc }) => (
  <div className="page">
    <h1>{ prismicDoc.title }</h1>
    <RichText linkResolver={linkResolver} data={prismicDoc.body} />
  </div>
);
```
