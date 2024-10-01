---
title: 方言与原生 SQL
lang: zh-cn
related_path: en/dialects-and-native-sql.html
---

# 方言与原生 SQL

我们知道，SQL 语言虽然存在统一的标准，但是在标准之外，各种数据库都有着自己独特的特性。Ktorm 的核心模块（ktorm-core）仅对标准 SQL 提供了支持，如果希望使用某个数据库中特有的功能，我们就会用到方言模块。

## 启用方言

在 Ktorm 中，方言被抽象为一个接口 `SqlDialect`。Ktorm 目前支持多种数据库方言，每种方言都作为一个独立于 ktorm-core 的模块发布，他们都会提供一个自己的 `SqlDialect` 实现类：

| 数据库类型 | 模块名                   | SqlDialect 实现类                              |
| ---------- | ------------------------ | ---------------------------------------------- |
| MySQL      | ktorm-support-mysql      | org.ktorm.support.mysql.MySqlDialect           |
| PostgreSQL | ktorm-support-postgresql | org.ktorm.support.postgresql.PostgreSqlDialect |
| SQLite     | ktorm-support-sqlite     | org.ktorm.support.sqlite.SQLiteDialect         |
| SqlServer  | ktorm-support-sqlserver  | org.ktorm.support.sqlserver.SqlServerDialect   |
| Oracle     | ktorm-support-oracle     | org.ktorm.support.oracle.OracleDialect         |

现在我们以 MySQL 的 `on duplicate key update` 功能为例，介绍如何在 Ktorm 中启用方言。

MySQL 的 `on duplicate key update` 功能可以在插入记录时，判断是否存在键冲突，如果有冲突则自动执行更新操作，这是标准 SQL 中不支持的用法。要使用这个功能，我们首先需要在项目中添加 ktorm-support-mysql 模块的依赖，如果你使用 Maven：

```
<dependency>
    <groupId>org.ktorm</groupId>
    <artifactId>ktorm-support-mysql</artifactId>
    <version>${ktorm.version}</version>
</dependency>
```

或者 gradle：

```groovy
compile "org.ktorm:ktorm-support-mysql:${ktorm.version}"
```

添加完依赖后，我们需要修改 `Database.connect` 函数的调用处，这个函数用于创建一个 `Database` 对象，Ktorm 正是用这个对象来连接到数据库。我们需要指定 `dialect` 参数，告诉 Ktorm 需要使用哪个 `SqlDialect` 的实现类：

````kotlin
val database = Database.connect(
    url = "jdbc:mysql://localhost:3306/ktorm", 
    driver = "com.mysql.jdbc.Driver", 
    user = "root", 
    password = "***", 
    dialect = MySqlDialect()
)
````

> 从 2.4 版本开始，Ktorm 的各个方言模块遵从了 JDK `ServiceLoader` SPI 的约定，因此在创建 `Database` 实例时，我们不必再显式指定 `dialect` 参数。Ktorm 会自动从 classpath 中检测出我们使用的方言，只需要保证依赖中包含具体的方言模块即可。

现在，我们就已经启用了 MySQL 的方言，可以使用它的功能了。尝试调用一下 `insertOrUpdate` 函数：

```kotlin
database.insertOrUpdate(Employees) {
    set(it.id, 1)
    set(it.name, "vince")
    set(it.job, "engineer")
    set(it.salary, 1000)
    set(it.hireDate, LocalDate.now())
    set(it.departmentId, 1)
    onDuplicateKey {
        set(it.salary, it.salary + 900)
    }
}
```

生成 SQL：

````sql
insert into t_employee (id, name, job, salary, hire_date, department_id) values (?, ?, ?, ?, ?, ?) 
on duplicate key update salary = salary + ? 
````

完美！

## 方言功能列表

那么，除了前面出现过的那些，Ktorm 内置的方言还提供了什么功能呢？

**ktorm-support-mysql**：

- 支持 Ktorm 的标准分页函数，自动翻译为 MySQL 的 `limit ?, ?` 语句
- 支持 insert 语句的扩展语法，如 [insertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/insert-or-update.html)、[bulkInsert](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/bulk-insert.html)、[bulkInsertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/bulk-insert-or-update.html) 等函数
- 通过 [locking](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/locking.html) 函数支持 `select ... for update` 等加锁语法
- 支持基于 [match](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/match.html) 和 [against](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/against.html) 的全文搜索
- 支持常用的 json 操作函数，如 [jsonContains](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/json-contains.html)、[jsonExtract](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/json-extract.html)
- 支持 [IF](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/-i-f.html)、[ifNull](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/if-null.html)、[greatest](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/greatest.html)、[least](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/least.html)、[replace](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/replace.html) 等常用函数
- 更多功能请参考详细的 API 文档 https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/index.html

**ktorm-support-postgresql**：

- 支持 Ktorm 的标准分页函数，自动翻译为 PostgreSQL 中的 `limit ? offset ?` 语句
- 支持 insert 语句的扩展语法，如 [insertReturning](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/insert-returning.html)、[insertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/insert-or-update.html)、[bulkInsert](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/bulk-insert.html)、[bulkInsertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/bulk-insert-or-update.html) 等函数
- 通过 [locking](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/locking.html) 函数支持 `select ... for update` 等加锁语法
- 支持 [hstore](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/hstore.html) 数据类型及其操作符
- 支持 [cube](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/cube.html) 和 [earth](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/earth.html) 数据类型及其相关的函数
- 更多功能请参考详细的 API 文档 https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/index.html

**ktorm-support-sqlite**：

- 支持 Ktorm 的标准分页函数，自动翻译为 SQLite 的 `limit ?, ?` 语句
- 支持 insert 语句的扩展语法，如 [insertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/insert-or-update.html)、[bulkInsert](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/bulk-insert.html)、[bulkInsertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/bulk-insert-or-update.html) 等函数
- 支持常用的 json 操作函数，如 [jsonExtract](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/json-extract.html)、[jsonPatch](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/json-patch.html)
- 支持 [iif](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/iif.html)、[ifNull](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/if-null.html)、[instr](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/instr.html)、[replace](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/replace.html) 等常用函数
- 更多功能请参考详细的 API 文档 https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/index.html

**ktorm-support-sqlserver**：

- 支持 Ktorm 的标准分页函数，自动翻译为 SqlServer 中使用 `top` 和 `row_number() over(...)` 筛选分页的写法
- 支持 SqlServer 特有的 [datetimeoffset](https://www.ktorm.org/api-docs/ktorm-support-sqlserver/org.ktorm.support.sqlserver/datetimeoffset.html) 数据类型
- 更多功能请参考详细的 API 文档 https://www.ktorm.org/api-docs/ktorm-support-sqlserver/org.ktorm.support.sqlserver/index.html

**ktorm-support-oracle**：

- 支持 Ktorm 的标准分页函数，自动翻译为 Oracle 中使用 `rownum` 筛选分页的写法
- 更多功能请参考详细的 API 文档：https://www.ktorm.org/api-docs/ktorm-support-oracle/org.ktorm.support.oracle/index.html

老实说，Ktorm 对许多数据库方言的特殊语法的支持确实存在不足，这是因为作者本人的精力有限，只能做到支持工作中常用的功能，对于其他纷繁复杂的特殊语法只能暂时把优先级降低。

但好在核心库中支持的标准 SQL 已经能够实现我们的大部分需求，即使不使用特殊语法，只用标准 SQL 的功能子集也不会影响我们的业务功能。

Ktorm 的设计是开放的，为其增加功能十分容易，我们在前面的章节中就曾经示范过如何对 Ktorm 进行扩展。因此如果你需要的话，完全可以自己编写扩展，同时，欢迎 fork 我们的仓库，提交 PR，我们会合并你编写的扩展，让更多的人受益。期待您的贡献！

## 原生 SQL

在极少数情况下，我们会遇到一些特殊的业务，Ktorm 可能暂时无法支持。比如 Ktorm 目前并不支持的复杂查询（如相关子查询），或者某些数据库中的特殊功能（如 SQL Server 中的 cross apply），再或者是对表结构进行操作的 DDL。

为了应对这种场景，Ktorm 提供了直接执行原生 SQL 的方式，这只需要我们写一点 JDBC 的代码。我们需要使用 `Database` 类中的 `useConnection` 函数获取数据库连接，获取到 `Connection` 实例之后，剩下的事情就和其他 JDBC 程序没有任何区别了。下面是一个例子：

```kotlin
val names = database.useConnection { conn ->
    val sql = """
        select name from t_employee
        where department_id = ?
        order by id
    """

    conn.prepareStatement(sql).use { statement ->
        statement.setInt(1, 1)
        statement.executeQuery().asIterable().map { it.getString(1) }
    }
}

names.forEach { println(it) }
```

乍一看，上面的代码只是单纯的 JDBC 操作，但是它其实也受益于 Ktorm 提供的便利的支持：

- `useConnection` 函数用于获取或创建连接。如果当前线程已开启事务，在闭包中传入开启了事务的当前连接；否则，新建一个连接，在使用完毕后将其关闭。这正是 Ktorm 内部执行生成的 SQL 时用于获取数据库连接的函数，使用这个函数，可以与 Ktorm 内部执行的 SQL 共享连接池或者事务。
- `asIterable` 函数用于将 `ResultSet` 对象包装成 `Iterable`，这样我们就能够使用 for-each 循环对其进行迭代，也可以使用 `map`、`flatMap` 等扩展函数对结果集进行二次处理。 

>  注意：尽管 Ktorm 对原生 SQL 也提供了方便的支持，但我们并不推荐你使用它，因为这严重违背了 Ktorm 的设计哲学。当你使用原生 SQL 时，Ktorm 原本提供的强类型 DSL 的优势都荡然无存。因此，在你开始考虑使用原生 SQL 解决问题的时候，不妨先思考一下是否真的有必要，一般来说，大部分复杂的 SQL 查询都可以转换为等价的简单多表连接或自连接查询，大部分数据库中特殊关键字或函数也可以通过前面章节中介绍的方法编写扩展来实现。