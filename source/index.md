---
title: Overview
slogan: Kotlin ORM lib with SQL DSL
lang: en
related_path: zh-cn/
layout: home
---

## What's Ktorm?

Ktorm is a lightweight and efficient ORM Framework for Kotlin directly based on pure JDBC. It provides strong-typed and flexible SQL DSL and convenient sequence APIs to reduce our duplicated effort on database operations. All the SQL statements, of course, are generated automatically. Ktorm is open source and available under the Apache 2.0 license, and its code can be found on GitHub. Please leave a star if you've found this library helpful: [kotlin-orm/ktorm](https://github.com/kotlin-orm/ktorm)[![GitHub Stars](https://img.shields.io/github/stars/kotlin-orm/ktorm.svg?style=social)](https://github.com/kotlin-orm/ktorm/stargazers)

## Features

- No configuration files, no XML, no annotations, even no third-party dependencies, lightweight, easy to use.
- Strong typed SQL DSL, exposing low-level bugs at compile time.
- Flexible queries, fine-grained control over the generated SQLs as you wish.
- Entity sequence APIs, writing queries via sequence functions such as `filter`, `map`, `sortedBy`, etc., just like using Kotlin's native collections and sequences. 
- Extensible design, write your own extensions to support more operators, data types, SQL functions, database dialects, etc.

## Latest Posts

- 2020-09-19 [Ktorm 3.1 Released, Upgrade to Kotlin 1.4 & Many Other Optimizations](https://github.com/kotlin-orm/ktorm/releases/tag/v3.1.0) <sup class="new-icon">NEW</sup>
- 2020-06-17 [Ktorm 3.0 Released with the New ktorm-global Module](/en/break-changes-in-ktorm-3.0.html)
- 2020-02-01 [Ktorm 2.7 Released, Deprecate Database.global, Making APIs More Intuitive and Easier to Extend](/en/about-deprecating-database-global.html)
- 2019-08-24 [Ktorm 2.5 Released, Support Defining Entities as Any Kind of Classes, Such as Data Class or POJO](/en/define-entities-as-any-kind-of-classes.html)
- 2019-06-28 [Ktorm - Write Your Database Operations in Kotlin Style](https://www.liuwj.me/posts/ktorm-write-database-operations-in-kotlin-style/)
- 2019-05-04 [Still Using MyBatis? Try Ktorm, an ORM Framework for Kotlin!](https://www.liuwj.me/posts/ktorm-introduction/)
