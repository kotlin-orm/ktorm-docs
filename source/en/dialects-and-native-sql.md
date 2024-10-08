---
title: Dialects and Native SQL
lang: en
related_path: zh-cn/dialects-and-native-sql.html
---

# Dialects & Native SQL

It's known that there is a uniform standard for SQL language, but beyond the standard, many databases still have their special features. The core module of Ktorm (ktorm-core) only provides support for standard SQL, if we want to use some special features of a database, we need to support dialects. 

## Enable Dialects

In Ktorm, `SqlDialect` interface is the abstraction of dialects. Ktorm supports many dialects now, each of them is published as a separated module independent of ktorm-core, and they all provide their own implementation of `SqlDialect`. 

| Database Name | Module Name              | SqlDialect Implementation                      |
| ------------- | ------------------------ | ---------------------------------------------- |
| MySQL         | ktorm-support-mysql      | org.ktorm.support.mysql.MySqlDialect           |
| PostgreSQL    | ktorm-support-postgresql | org.ktorm.support.postgresql.PostgreSqlDialect |
| SQLite        | ktorm-support-sqlite     | org.ktorm.support.sqlite.SQLiteDialect         |
| SqlServer     | ktorm-support-sqlserver  | org.ktorm.support.sqlserver.SqlServerDialect   |
| Oracle        | ktorm-support-oracle     | org.ktorm.support.oracle.OracleDialect         |

Now let's take MySQL's `on duplicate key update` feature as an example, learning how to enable dialects in Ktorm. 

This feature can determine if there is a conflict while records are being inserted into databases, and automatically performs updates if any conflict exists, which is not supported by standard SQL. To use this feature, we need to add the dependency of ktorm-support-mysql to our projects. If we are using Maven: 

```
<dependency>
    <groupId>org.ktorm</groupId>
    <artifactId>ktorm-support-mysql</artifactId>
    <version>${ktorm.version}</version>
</dependency>
```

Or Gradle: 

```groovy
compile "org.ktorm:ktorm-support-mysql:${ktorm.version}"
```

Having the dependency, we also need to modify the calling of the `Database.connect` function, this function is used to create `Database` objects. We need to specify its `dialect` parameter, telling Ktorm which `SqlDialect` implementation should be used. 

```kotlin
val database = Database.connect(
    url = "jdbc:mysql://localhost:3306/ktorm", 
    driver = "com.mysql.jdbc.Driver", 
    user = "root", 
    password = "***", 
    dialect = MySqlDialect()
)
```
> Since version 2.4, Ktorm's dialect modules start following the convention of JDK `ServiceLoader` SPI, so we don't need to specify the `dialect` parameter explicitly anymore while creating `Database` instances. Ktorm auto detects one for us from the classpath. We just need to insure the dialect module exists in the dependencies. 

Now we have enabled MySQL's dialect implementation and all of its features are available. Try to call the `insertOrUpdate` function: 

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

Generated SQL: 

```sql
insert into t_employee (id, name, job, salary, hire_date, department_id) values (?, ?, ?, ?, ?, ?) 
on duplicate key update salary = salary + ? 
```

Perfect！

## Built-in Dialects' Features

Now, let's talk about Ktorm's built-in dialects' features. 

**ktorm-support-mysql**: 

- Support standard pagination functions of Ktorm, translating to MySQL's `limit ?, ?` clause. 
- Support extended syntax for insert statements, like [insertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/insert-or-update.html), [bulkInsert](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/bulk-insert.html), [bulkInsertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/bulk-insert-or-update.html), etc.
- Support locking clause via [locking](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/locking.html) function, eg. `select ... for update`.
- Support fulltext search via [match](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/match.html) and [against](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/against.html) functions. 
- Support some common-used JSON operating functions, like [jsonContains](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/json-contains.html), [jsonExtract](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/json-extract.html).
- Support some common-used functions like [IF](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/-i-f.html), [ifNull](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/if-null.html), [greatest](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/greatest.html), [least](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/least.html), [replace](https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/replace.html), etc.
- For more functionality, please refer to the API docs https://www.ktorm.org/api-docs/ktorm-support-mysql/org.ktorm.support.mysql/index.html

**ktorm-support-postgresql**: 

- Support standard pagination functions of Ktorm, translating to PostgreSQL's `limit ? offset ?` clause.
- Support extended syntax for insert statements, like [insertReturning](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/insert-returning.html), [insertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/insert-or-update.html), [bulkInsert](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/bulk-insert.html), [bulkInsertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/bulk-insert-or-update.html), etc. 
- Support locking clause via [locking](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/locking.html) function, eg. `select ... for update`. 
- Support [hstore](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/hstore.html) data type and a series of operators for it. 
- Support [cube](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/cube.html) & [earth](https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/earth.html) data type and their utility functions.
- For more functionality, please refer to the API docs https://www.ktorm.org/api-docs/ktorm-support-postgresql/org.ktorm.support.postgresql/index.html

**ktorm-support-sqlite**: 

- Support standard pagination functions of Ktorm, translating to SQLite's `limit ?, ?` statement. 
- Support extended syntax for insert statements, like [insertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/insert-or-update.html), [bulkInsert](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/bulk-insert.html), [bulkInsertOrUpdate](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/bulk-insert-or-update.html), etc.
- Support some common-used JSON operating functions, like [jsonExtract](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/json-extract.html), [jsonPatch](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/json-patch.html).
- Support some common-used functions like [iif](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/iif.html), [ifNull](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/if-null.html), [instr](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/instr.html), [replace](https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/replace.html), etc.
- For more functionality, please refer to the API docs https://www.ktorm.org/api-docs/ktorm-support-sqlite/org.ktorm.support.sqlite/index.html

**ktorm-support-sqlserver**: 

- Support standard pagination functions of Ktorm, translating to SqlServer's paging SQL using `top` and `row_number over(...)`
- Support [datetimeoffset](https://www.ktorm.org/api-docs/ktorm-support-sqlserver/org.ktorm.support.sqlserver/datetimeoffset.html) data type. 
- For more functionality, please refer to the API docs https://www.ktorm.org/api-docs/ktorm-support-sqlserver/org.ktorm.support.sqlserver/index.html

**ktorm-support-oracle**: 

- Support standard pagination functions of Ktorm, translating to Oracle's paging SQL using `rownum`.
- For more functionality, please refer to the API docs https://www.ktorm.org/api-docs/ktorm-support-oracle/org.ktorm.support.oracle/index.html

To be honest, Ktorm's support for special syntax of many database dialects is really not enough. This is because my time and energy are really limited, so I have to lower the precedence of some infrequently used dialect features. 

However, the standard SQL supported by the core module is enough for most scenarios, so there is little influence on us even if some dialect features are lacking. 

Ktorm's design is open, it's easy to add features to it, and we have learned how to write our own extensions in the former sections, so it's possible for everyone to implement dialects by themselves. Welcome to fork the repository and send your pull requests to me, I'm glad to review and merge your code. Looking forward to your contributions!

## Native SQL

In some rare situations, we have to face some special businesses that Ktorm may not be able to support now, such as some complex queries (eg. correlated subqueries), special features of a dialect (eg. SQL Server's cross apply), or DDL that operates the table schemas. 

To solve the problem, Ktorm provides a way for us to execute native SQLs directly. We need to obtain a database connection via `database.useConnection` first, then perform our operations by writing some code with JDBC. Here is an example: 

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

At first glance, there are only boilerplate JDBC code in the example, but actually, it's also benefited from some convenient functions of Ktorm: 

- `useConnection` function is used to obtain or create connections. If the current thread has opened a transaction, then this transaction's connection will be passed to the closure. Otherwise, Ktorm will pass a new-created connection to the closure and auto close it after it's not useful anymore. Ktorm also uses this function to obtain connections to execute generated SQLs. So, by calling `useConnection`, we can share the transactions or connection pools with Ktorm's internal SQLs. 
- `asIterable` function is used to wrap `ResultSet` instances as `Iterable`, then we can iterate the result sets by for-each loops, or process them via extension functions of Kotlin standard lib, such as `map`, `flatMap`, etc. 

> Note: Although Ktorm provides supports for native SQLs, we don't recommend you to use it, because it violates the design philosophy of Ktorm. Once native SQL is used, we will lose the benefits of the strong typed DSL, so please ensure whether it's really necessary to do that. In general, most complex SQLs can be converted to equivalent simple joining queries, and most special keywords and SQL functions can also be implemented by writing some extensions with Ktorm. 

