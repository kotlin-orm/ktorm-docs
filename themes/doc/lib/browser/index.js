const React = require('react');
const ReactDOM = require('react-dom/client');
const urljoin = require('url-join');
const { Navigation } = require('./navigation/containers.jsx');

const props = Object.assign({}, window.__INITIAL_STATE__, {log: console});

props.url_for = function(path) {
  if (/^(f|ht)tps?:\/\//i.test(path)) {
    return path;
  }

  const url = urljoin(props.config.root, path);
  return url.replace(/\/{2,}/g, '/');
};

// React client rendering.
const container = document.getElementById('navigation-container');
ReactDOM.hydrateRoot(container, React.createElement(Navigation, props));

// Fix code highlight.
$(".kotlin .code .keyword").each(function() {
  const node = $(this);
  if (node.text() === "where" || node.text() === "set") {
    node.removeClass("keyword");
  }
});

// Fix style for pure links.
$(".doc-formatting a").each(function() {
  const text = $(this).text();
  if (text.startsWith("http://") || text.startsWith("https://")) {
    $(this).css("line-break", "anywhere");
  }
});
