<#import "includes/page_metadata.ftl" as page_metadata>
<#import "includes/header.ftl" as header>
<#import "includes/footer.ftl" as footer>
<!DOCTYPE html>
<html class="no-js" lang="en">
  <head>
    <@page_metadata.display/>
    <@template_cmd name="pathToRoot">
    <script>
      var pathToRoot = "${pathToRoot}";
    </script>
    </@template_cmd>
    <script>
      document.documentElement.classList.replace("no-js","js");

      const storage = localStorage.getItem("dokka-dark-mode")
      if (storage == null) {
        const osDarkSchemePreferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        if (osDarkSchemePreferred === true) {
          document.getElementsByTagName("html")[0].classList.add("theme-dark")
        }
      } else {
        const savedDarkMode = JSON.parse(storage)
        if (savedDarkMode === true) {
          document.getElementsByTagName("html")[0].classList.add("theme-dark")
        }
      }
    </script>
    <#-- Resources (scripts, stylesheets) are handled by Dokka. Use customStyleSheets and customAssets to change them. -->
    <@resources/>
  </head>
  <body>
    <div class="root">
      <@header.display/>
      <div id="container">
        <div class="sidebar" id="leftColumn">
          <div class="sidebar--inner" id="sideMenu"></div>
        </div>
        <div id="main">
          <@content/>
          <@footer.display/>
        </div>
      </div>
    </div>
  </body>
</html>
