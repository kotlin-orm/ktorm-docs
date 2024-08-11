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

const container = document.getElementById('navigation-container');
ReactDOM.hydrateRoot(container, React.createElement(Navigation, props));
