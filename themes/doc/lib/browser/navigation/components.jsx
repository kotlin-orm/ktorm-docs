const React = require('react');

function Navbar(props) {
  return (
    <nav className="doc-navbar">
      {props.children}
    </nav>
  );
}

function Logo({page, url_for}) {
  var homePath = page.lang === 'zh-cn' ? 'zh-cn/' : '/';

  return (
    <span className="doc-navbar__logo">
      <a href={url_for(homePath)}>
        <img src={url_for('images/logo.png')} className="doc-navbar__logo__img"/>
        <img src={url_for('images/logo-middle.png')} className="doc-navbar__logo__img-full"/>
      </a>
    </span>
  );
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.props.visibleHeaderId) {
      if ($(window).width() > 800) {
        setTimeout(function () {
          const $sidebar = $('.doc-sidebar');
          const $firstItem = $($('.doc-sidebar-list').children('.doc-sidebar-list__item--link').get(0));
          const $currentItem = $('.doc-sidebar-list__item--current');

          if ($currentItem.length > 0) {
            const offset = $currentItem.position().top - $firstItem.position().top;
            if (offset > 100) {
              $sidebar.animate({ scrollTop: offset }, 800);
            }
          }
        }, 100);
      }
    }
  }

  render() {
    const {items, page, url_for, config, uncollapse, tocItems, visibleHeaderId} = this.props;

    const renderItems = () => {
      return (items || []).map((item, i) => {
        return (<SidebarItem
            key={i + 'sidebar-item' }
            item={item}
            page={page}
            config={config}
            tocItems={tocItems}
            visibleHeaderId={visibleHeaderId}
            url_for={url_for} />
        );
      });
    };

    return (
      <nav className="doc-sidebar">
        <div className="doc-sidebar__vertical-menu">
          <SidebarToggle
            className="doc-sidebar-toggle--primary doc-sidebar__vertical-menu__item"
            onClick={uncollapse} />
          <i className="dc-icon
            dc-icon--search
            dc-icon--interactive
            doc-sidebar__vertical-menu__item
            doc-sidebar__vertical-menu__item--primary"
             onClick={uncollapse}>
          </i>
        </div>

        <div className="doc-sidebar-content">
          <div className="doc-sidebar__search-form">
            <div className="dc-search-form doc-search-form">
              <input type="search"
                     id="doc-search-input"
                     className="dc-input dc-search-form__input doc-search-form__input"
                     placeholder={page.lang === 'zh-cn' ? '搜索文档' : 'Search documents'}
                     autoFocus={true} />
              <button className="dc-btn dc-search-form__btn doc-search-form__btn" aria-label="Search">
                <i className="dc-icon dc-icon--search"/>
              </button>
            </div>
          </div>
          <ul className="doc-sidebar-list">
            { renderItems() }
          </ul>
        </div>
      </nav>
    );
  }
}

class SidebarItem extends React.Component  {
  constructor (props) {
    super(props);

    this.state = {
      hasChildren: false,
      childrenListIsVisible: false
    };
  }

  componentDidMount () {
    const {item, page} = this.props;
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const childrenListIsVisible = (item.children || []).find((child) => {
      return child.path === page.path;
    }) || (hasChildren && item.isCurrent) || (hasChildren && item.isCurrentAncestor);

    this.setState({
      hasChildren,
      childrenListIsVisible
    });
  }

  toggleChildrenVisibility () {
    if (!this.state.hasChildren) { return; }
    this.setState({
      childrenListIsVisible: !this.state.childrenListIsVisible
    });
  }

  render () {
    const {item, page, url_for, tocItems, config, visibleHeaderId, className} = this.props;
    const isLabel = item.type === 'label';
    const isCurrentAncestor = item.isCurrentAncestor;
    const isCurrent = item.isCurrent;
    const hasChildren = this.state.hasChildren;
    const childrenListIsVisible = this.state.childrenListIsVisible;

    let toc = null;
    let children = null;

    if (hasChildren) {
      children = (<SidebarChildrenList
        item={item}
        page={page}
        config={config}
        tocItems={tocItems}
        visibleHeaderId={visibleHeaderId}
        url_for={url_for}
        hidden={!childrenListIsVisible}
      />);
    }

    if (isCurrent) {
      toc = (
        <ul className="doc-sidebar-list__toc-list">
          {
            (tocItems || []).map(function (i, tocItem) {
              return (<SidebarTocItem
                key={i + 'sidebar-toc-item'}
                visibleHeaderId={visibleHeaderId}
                item={tocItem}
              />);
            })
          }
        </ul>
      );
    }

    const itemClassName = classNames({
      'doc-sidebar-list__item': true,
      'doc-sidebar-list__item--label': isLabel,
      'doc-sidebar-list__item--link': !isLabel,
      'doc-sidebar-list__item--current': isCurrent,
      'doc-sidebar-list__item--current-ancestor': !!isCurrentAncestor,
      'doc-sidebar-list__item--has-children': hasChildren,
      'doc-sidebar-list__item--no-children': !hasChildren,
      'doc-sidebar-list__item--children-list--hidden': hasChildren && !childrenListIsVisible,
      [className]: true
    });

    const toggleClassName = classNames({
      'doc-sidebar-list__item__children-toggle': hasChildren,
      'doc-sidebar-list__item__children-toggle--show': hasChildren && !childrenListIsVisible,
      'doc-sidebar-list__item__children-toggle--hide': hasChildren && childrenListIsVisible
    });

    return (
      <li className={itemClassName}>
        {
          isLabel ? 
          <span onClick={this.toggleChildrenVisibility.bind(this)} className={toggleClassName}>{item.text}</span> :
          <a
            className={toggleClassName}
            href={item.path ? url_for(item.path) : '/'}
            target={item.target ? item.target : '_self'}>
            <span>{item.text}</span>
          </a>
        }
        { toc }
        { children }
      </li>
    );
  }
}

function SidebarChildrenList ({item, page, config, tocItems, visibleHeaderId, url_for, hidden}) {

  return (<ul className={classNames({
    'doc-sidebar-list__children-list': true,
    'doc-sidebar-list__children-list--hidden': hidden
  })}>
    {
      item.children.map((child, i) => {
        return (
          <SidebarItem
            key={i + 'sidebar-child-item' }
            className="doc-sidebar-list__item--child"
            item={child}
            page={page}
            config={config}
            tocItems={tocItems}
            visibleHeaderId={visibleHeaderId}
            url_for={url_for} />
        );
      })
    }
  </ul>);
}

function SidebarTocItem ({item, visibleHeaderId}) {
  const handleOnClick = () => {
    $('#doc-search-results').hide();
    $('#page-content').show();
  };

  return (
    <li className={`doc-sidebar-list__toc-item ${item.id === visibleHeaderId ? 'doc-sidebar-list__toc-item--current' : '' }`}>
      <a href={ '#' + item.id } data-scroll onClick={handleOnClick}>
        <span>{ item.text }</span>
      </a>
    </li>);
}


function SidebarToggle ({className, onClick}) {
  return (
    <i className={'dc-icon dc-icon--menu dc-icon--interactive doc-sidebar-toggle ' + (className || '')} onClick={onClick}/>
  );
}

function SidebarClose ({className, onClick}) {
  return (
    <i className={'dc-icon dc-icon--close dc-icon--interactive doc-sidebar-close ' + (className || '')} onClick={onClick}/>
  );
}

function classNames (map = {}) {
  return Object.keys(map).reduce((acc, key) => {
    if (typeof key !== 'string' || key === 'undefined') { return acc; }
    if (map[key]) {
      return acc.concat(key);
    }
    return acc;
  }, []).join(' ');
}

module.exports = {Navbar, Logo, Sidebar, SidebarToggle, SidebarClose};
