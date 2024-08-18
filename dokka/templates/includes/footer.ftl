<#macro display>
  <div class="footer">
    <#assign now = .now>
    &copy; ${now?string.yyyy} KTORM.ORG. Licensed under <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache 2.0</a> <br/>
    Hosted by
    <a href="https://github.com/kotlin-orm/ktorm">GitHub</a>
    <a href="https://github.com/kotlin-orm/ktorm/stargazers" >
      <img src="https://img.shields.io/github/stars/kotlin-orm/ktorm.svg?style=social" alt="Stars">
    </a>
  </div>
</#macro>
