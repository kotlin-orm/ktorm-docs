module.exports = function(md) {
  md.renderer.rules.table_open = function() {
    return '<figure class="table-wrapper"><table>'
  }

  md.renderer.rules.table_close = function() {
    return '</table></figure>'
  }
};
