/* eslint react/no-danger: 0, jsx-a11y/alt-text: 0 */
import Link from 'next/link';
import PropTypes from 'prop-types';
import React from 'react';
import PrismicRichText, { Elements } from 'prismic-richtext';

const RichText = ({ data, linkResolver }) => {
  if (!data) return null;

  let keyIndex = 0;

  const getProps = (element) => {
    const props = { key: keyIndex };
    if (element.label) props.className = element.label;
    return props;
  };

  const serializeEmbed = element => (
    <div
      data-oembed={element.oembed.embed_url}
      data-oembed-type={element.oembed.type}
      data-oembed-provider={element.oembed.provider_name}
      {...getProps(element)}
      dangerouslySetInnerHTML={{ __html: element.oembed.html }}
    />
  );

  const serializeHyperlink = (element, children) => {
    const link = linkResolver(element.data);
    const p = getProps(element);
    if (link.href.substr(0, 4) === 'http') {
      return <a href={link.href} target="_blank" {...p}>{children}</a>;
    }
    return (
      <Link {...linkResolver(element.data)} {...p}>
        <a>{children}</a>
      </Link>
    );
  };

  const serializeImage = (element) => {
    const imgProps = { src: element.url };
    if (element.alt) imgProps.alt = element.alt;
    if (element.copyright) imgProps.copyright = element.copyright;
    const main = <img {...imgProps} {...getProps(element)} />;
    if (element.linkTo) {
      return serializeHyperlink({ data: element.linkTo }, main);
    }
    return main;
  };

  const serializeSpan = (content) => {
    const contents = content.split('\n');
    if (contents.length < 2) return content;
    const output = [];
    contents.forEach((el) => {
      keyIndex += 1;
      output.push(<span key={keyIndex}>{el}</span>);
      keyIndex += 1;
      output.push(<br key={keyIndex} />);
    });
    return output.slice(0, -1);
  };

  const serializeLabel = (element, children) => (
    <span {...getProps(element.data)}>{children}</span>
  );

  function serialize(type, element, content, children) {
    keyIndex += 1;
    const standardEl = {
      [Elements.heading1]: 'h1',
      [Elements.heading2]: 'h2',
      [Elements.heading3]: 'h3',
      [Elements.heading4]: 'h4',
      [Elements.heading5]: 'h5',
      [Elements.heading6]: 'h6',
      [Elements.paragraph]: 'p',
      [Elements.preformatted]: 'pre',
      [Elements.strong]: 'strong',
      [Elements.em]: 'em',
      [Elements.listItem]: 'li',
      [Elements.oListItem]: 'li',
      [Elements.list]: 'ul',
      [Elements.oList]: 'ol',
    }[type];
    if (standardEl) {
      return React.createElement(standardEl, getProps(element), children);
    }
    switch (type) {
      case Elements.image: return serializeImage(element);
      case Elements.embed: return serializeEmbed(element);
      case Elements.hyperlink: return serializeHyperlink(element, children);
      case Elements.label: return serializeLabel(element, children);
      case Elements.span: return serializeSpan(content);
      default: return '';
    }
  }

  const serialized = PrismicRichText.serialize(data, serialize);
  return (
    <div>
      <style jsx>{`
        div :global(img) {
          max-width: 100%;
        }
      `}
      </style>
      {serialized}
    </div>
  );
};

RichText.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
  })),
  linkResolver: PropTypes.func.isRequired,
};

RichText.defaultProps = {
  data: null,
};

export default RichText;
