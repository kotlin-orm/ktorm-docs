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
    <#-- Custom styles -->
    <style>
      :root {
        --dokka-logo-image-url: url('/images/logo.png');
        --dokka-logo-height: 24px;
        --dokka-logo-width: 24px;
      }
      .footer {
        display: block;
        padding-top: 20px;
        font-size: 16px;
        color: #666;
        overflow: hidden;
        white-space: nowrap;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <!-- Google Analytics -->
    <script>
      window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
      ga('create', 'UA-180275463-1', 'auto');
      ga('send', 'pageview');
    </script>
    <script async src='https://www.google-analytics.com/analytics.js'></script>
    <!-- End Google Analytics -->

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
