const React = require('react');

module.exports.SupportFooter = function ({page, data, url_for}) {
  let navigation;
  if (page.lang === 'zh-cn') {
    navigation = data['navigation-zh-cn'].main.filter((item) => item.type === 'link');
  } else {
    navigation = data['navigation-en'].main.filter((item) => item.type === 'link');
  }

  function renderLinks() {
    const links = [];
    const currentIndex = navigation.findIndex((item) => {
      const itemPath = (item.path || '').replace(/index\.html$/, '').replace(/\/$/, '');
      const pagePath = (page.path || '').replace(/index\.html$/, '').replace(/\/$/, '');
      return itemPath === pagePath;
    });

    if (currentIndex !== -1 && currentIndex !== 0) {
      const previous = navigation[currentIndex - 1];
      links.push(
        <div className="doc-footer-link" key={previous.path}>
          {page.lang === 'zh-cn' ? '上一篇：' : 'Prev Article: '}
          <a href={url_for(previous.path)}>
            {previous.text}
          </a>
        </div>
      );
    }

    if (currentIndex !== -1 && currentIndex !== navigation.length - 1) {
      const next = navigation[currentIndex + 1];
      links.push(
        <div className="doc-footer-link" key={next.path}>
          {page.lang === 'zh-cn' ? '下一篇：' : 'Next Article: '}
          <a href={url_for(next.path)}>
            {next.text}
          </a>
        </div>
      );
    }

    return links;
  }

  if (page.lang === 'zh-cn') {
    return (
      <div className="doc-support-footer">
        {renderLinks()}
        对文档内容有疑问？请在侧边栏尝试搜索或者在 GitHub <a href="https://github.com/kotlin-orm/ktorm/issues/new">提出 issue</a>
      </div>
    );
  } else {
    return (
      <div className="doc-support-footer">
        {renderLinks()}
        Any questions about the document? Try searching again on the left menu or <a href="https://github.com/kotlin-orm/ktorm/issues/new">raise an issue on GitHub</a>
      </div>
    );
  }
};
