'use strict';

const path = require('path');

require('@babel/register')({
  presets: [
    path.resolve(__dirname, '../node_modules/@babel/preset-env'),
    path.resolve(__dirname, '../node_modules/@babel/preset-react')
  ]
});

const React = require('react');
const ReactDOM = require('react-dom/server');

const components = {
  Navigation: require('../lib/browser/navigation/containers.jsx').Navigation,
  SupportFooter: require('../lib/browser/support/components.jsx').SupportFooter,
  LangSwitcher: require('../lib/browser/lang-switcher/components.jsx').LangSwitcher
};

/**
 * "Server-side render" a React component
 * @param  {String} componentName - The componentName
 * @param  {Object} [props={}] - injected props
 * @return {string}
 */
function reactComponent(componentName, props = {}) {
    const Component = components[componentName];
    return ReactDOM.renderToString(React.createElement(Component, props));
}

hexo.extend.helper.register('react_component', reactComponent);
