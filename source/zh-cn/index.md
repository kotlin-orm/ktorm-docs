---
title: 概述
slogan: Kotlin ORM 框架
lang: zh-cn
related_path: '/'
layout: home
---

## Ktorm 是什么？

Ktorm 是直接基于纯 JDBC 编写的高效简洁的轻量级 Kotlin ORM 框架，它提供了强类型而且灵活的 SQL DSL 和方便的序列 API，以减少我们操作数据库的重复劳动。当然，所有的 SQL 都是自动生成的。Ktorm 基于 Apache 2.0 协议开放源代码，源码托管在 GitHub，如果对你有帮助的话，请留下你的 star：[kotlin-orm/ktorm](https://github.com/kotlin-orm/ktorm)[![GitHub Stars](https://img.shields.io/github/stars/kotlin-orm/ktorm.svg?style=social)](https://github.com/kotlin-orm/ktorm/stargazers)

## 特性

- 没有配置文件、没有 xml、没有注解、甚至没有任何第三方依赖、轻量级、简洁易用
- 强类型 SQL DSL，将低级 bug 暴露在编译期
- 灵活的查询，随心所欲地精确控制所生成的 SQL
- 实体序列 API，使用 `filter`、`map`、`sortedBy` 等序列函数进行查询，就像使用 Kotlin 中的原生集合一样方便
- 易扩展的设计，可以灵活编写扩展，支持更多运算符、数据类型、 SQL 函数、数据库方言等

## 最新文章

- 2020-10-08 [Ktorm 3.2 发布, 包名修改为 org.ktorm](https://github.com/kotlin-orm/ktorm/releases/tag/v3.2.0) <sup class="new-icon">NEW</sup>
- 2020-09-19 [Ktorm 3.1 发布, 升级 Kotlin 1.4，还有众多功能优化](https://github.com/kotlin-orm/ktorm/releases/tag/v3.1.0)
- 2020-06-17 [Ktorm 3.0 不兼容更新](/zh-cn/break-changes-in-ktorm-3.0.html)
- 2020-02-01 [Ktorm 2.7 发布，废弃 Database.global 对象，使 API 的设计更直观、更易扩展](/zh-cn/about-deprecating-database-global.html)
- 2019-08-12 [Ktorm 2.5 发布，支持使用 data class、POJO 或者任意的类型作为实体类](/zh-cn/define-entities-as-any-kind-of-classes.html)
- 2019-06-28 [Ktorm - 让你的数据库操作更具 Kotlin 风味](https://www.liuwj.me/posts/ktorm-write-database-operations-in-kotlin-style/)
- 2019-05-04 [你还在用 MyBatis 吗，Ktorm 了解一下？ - 专注于 Kotlin 的 ORM 框架](https://www.liuwj.me/posts/ktorm-introduction/)
