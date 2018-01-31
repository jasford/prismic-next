import React from 'react';
import renderer from 'react-test-renderer';

import RichText from './RichText';

// Sample linkResolver function for use in tests.
function linkResolver(data) {
  if (data.link_type === 'Web') {
    return { href: data.url };
  }
  if (data.type === 'page') {
    return {
      href: `/content?slug=${data.data.slug}&folder=${data.data.folder}`,
      as: `/content/${data.data.slug}`,
    };
  }
  return { href: '/' };
}

describe('ui/RichText', () => {
  test('Renders simple standard tag content', () => {
    const content = [
      {
        type: 'heading1',
        text: 'This is an h1.',
        spans: [],
      },
      {
        type: 'heading2',
        text: 'This is an h2.',
        spans: [],
      },
      {
        type: 'heading3',
        text: 'This is an h3.',
        spans: [],
      },
      {
        type: 'heading4',
        text: 'This is an h4.',
        spans: [],
      },
      {
        type: 'heading5',
        text: 'This is an h5.',
        spans: [],
      },
      {
        type: 'heading6',
        text: 'This is an h6.',
        spans: [],
      },
      {
        type: 'paragraph',
        text: 'This is a paragraph',
        spans: [],
      },
      {
        type: 'preformatted',
        text: 'This is a preformatted text',
        spans: [],
      },
      {
        type: 'strong',
        text: 'This is a bold (strong) text',
        spans: [],
      },
      {
        type: 'em',
        text: 'This is a emphasized (em) text',
        spans: [],
      },
      {
        type: 'list-item',
        text: 'This is an un-ordered list item.',
        spans: [],
      },
      {
        type: 'list-item',
        text: 'This is another un-ordered list item.',
        spans: [],
      },
      {
        type: 'o-list-item',
        text: 'This is an ordered list item.',
        spans: [],
      },
      {
        type: 'o-list-item',
        text: 'This is another ordered list item.',
        spans: [],
      },
    ];
    const tree = renderer.create((
      <RichText linkResolver={linkResolver} data={content} />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Renders spans', () => {
    const content = [
      {
        type: 'heading1',
        text: 'This is a bold h1.',
        spans: [{
          start: 10,
          end: 14,
          type: 'strong',
        }],
      },
      {
        type: 'heading2',
        text: 'This is an paragraph features emphasized text.',
        spans: [{
          start: 30,
          end: 40,
          type: 'em',
        }],
      },
    ];
    const tree = renderer.create((
      <RichText linkResolver={linkResolver} data={content} />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Renders more complex content blocks', () => {
    const content = [
      {
        type: 'paragraph',
        text: 'This is a test of the content system, using all the ' +
          'features of Prismic rich text.\nThis line is not a new ' +
          'paragraph. It should just have a line break before it.',
        spans: [
          {
            start: 8,
            end: 14,
            type: 'strong',
          }, {
            start: 10,
            end: 36,
            type: 'em',
          }, {
            start: 64,
            end: 71,
            type: 'hyperlink',
            data: {
              link_type: 'Web',
              url: 'https://www.prismic.com',
            },
          },
        ],
      },
      {
        type: 'paragraph',
        text: 'This entire line has a label',
        spans: [],
        label: 'awesome',
      },
      {
        type: 'paragraph',
        text: 'Just this one word has a label.',
        spans: [{
          start: 14,
          end: 18,
          type: 'label',
          data: {
            label: 'super-hot',
          },
        }],
      },
      {
        type: 'image',
        url: 'https://webapp-starter.cdn.prismic.io/webapp-starter/f68a6e7' +
          'b08a5192cfacf0edc4f12d3f8d51dacf0_desktop.png',
        alt: null,
        copyright: null,
        dimensions: {
          width: 2048,
          height: 2600,
        },
        linkTo: {
          id: 'WdJRuCwAAFdPj0la',
          data: {
            slug: 'getting-started',
            folder: 'content',
          },
          type: 'page',
          tags: [],
          slug: 'getting-started',
          lang: 'en-us',
          link_type: 'Document',
          isBroken: false,
        },
      },
      {
        type: 'paragraph',
        text: 'The image above has a link. The one below does not:',
        spans: [],
      },
      {
        type: 'image',
        url: 'https://webapp-starter.cdn.prismic.io/webapp-starter/a078e201' +
          '71f6125a25b37ae80dcfe3e772639142_business-card.png',
        alt: 'Business card.',
        copyright: 'Super top secret.',
        dimensions: {
          width: 512,
          height: 404,
        },
      },
      {
        type: 'embed',
        oembed: {
          type: 'video',
          embed_url: 'https://www.youtube.com/watch?v=ferZnZ0_rSM',
          title: 'Anderson .Paak & The Free Nationals: NPR Music Tiny Desk ' +
            'Concert',
          provider_name: 'YouTube',
          thumbnail_url: 'https://i.ytimg.com/vi/ferZnZ0_rSM/hqdefault.jpg',
          author_url: 'https://www.youtube.com/user/nprmusic',
          thumbnail_width: 480,
          author_name: 'NPR Music',
          height: 270,
          width: 480,
          version: '1.0',
          html: '<iframe width="480" height="270" src="https://www.youtube' +
            '.com/embed/ferZnZ0_rSM?feature=oembed" frameborder="0" allowf' +
            'ullscreen></iframe>',
          provider_url: 'https://www.youtube.com/',
          thumbnail_height: 360,
        },
      },
    ];
    const tree = renderer.create((
      <RichText linkResolver={linkResolver} data={content} />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Ignores things without valid data.', () => {
    const content = [
      {
        type: 'bogus',
        text: 'This is some bogus content that should be ignored.',
        spans: [],
      },
    ];
    const tree = renderer.create((
      <RichText linkResolver={linkResolver} data={content} />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Renders null when not passed any data', () => {
    const tree = renderer.create((
      <RichText linkResolver={linkResolver} data={undefined} />
    )).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
