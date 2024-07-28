---
title: Joining
lang: en
related_path: zh-cn/joining.html
---

# Joining

We have talked about the SQL DSL for querying in the former section, there were all single-table queries, and that was enough in most cases. However, only a single table is not possible to support our business systems, that's why joining is an essential feature for an ORM framework. 

## Joining Functions

Ktorm supports joining queries by some extension functions, there are four built-in join types provided in the core module: 

| Join Type  | Extension Function Name | Corresponding SQL Key Word |
| ---------- | ----------------------- | -------------------------- |
| inner join | innerJoin               | inner join                 |
| left join  | leftJoin                | left join                  |
| right join | rightJoin               | right join                 |
| cross join | crossJoin               | cross join                 |
| full outer join | fullOuterJoin      | full outer join            |

The functions above are all extensions of `QuerySource`, a simple usage is given as follows: 

```kotlin
val joining = database.from(Employees).crossJoin(Departments)
```

Here, the function `from` wraps a table object as a `QuerySource` instance, then `crossJoin` cross joins the instance to another table and returns a new `QuerySource` as the result. For most of the time, it's useless for us to hold a `QuerySource` instance, we need a `Query` object instead to perform a query and obtain our results.  

Remember how to create a `Query` from a `QuerySource`? Yes, we just need to call `select`: 

```kotlin
val query = database.from(Employees).crossJoin(Departments).select()
```

This query cross joins the `Employees` table to the `Departments` table and returns all records of the joining (cartesian product). Generated SQL: 

```sql
select * 
from t_employee 
cross join t_department 
```

That's so simple, but honestly, such a simple joining query doesn't make any sense to us in practical use. Here is a more practical example, we want to list those employees whose salary is greater than 100, and return their names and the departments they are from. Here, we specify the second parameter `on` of the function `leftJoin`, that's the joining condition. 

```kotlin
val query = database
    .from(Employees)
    .leftJoin(Departments, on = Employees.departmentId eq Departments.id)
    .select(Employees.name, Departments.name)
    .where { Employees.salary gt 100L }
```

Generated SQL: 

```sql
select t_employee.name as t_employee_name, t_department.name as t_department_name 
from t_employee 
left join t_department on t_employee.department_id = t_department.id 
where t_employee.salary > ? 
```

## Self Joining & Table Aliases

Self joining is a special usage of SQL joining, it joins a table to itself as if the table were two tables. The SQL below uses self joining and returns all employees' names, their immediate managers, and the departments they are from: 

```sql
select emp.name as emp_name, mgr.name as mgr_name, dept.name as dept_name 
from t_employee emp 
left join t_employee mgr on emp.manager_id = mgr.id 
left join t_department dept on emp.department_id = dept.id 
order by emp.id 
```

It can be seen that the `t_employee` table appears twice with different aliases, `emp` and `mgr`, in the SQL above. It is exactly the aliases that distinguish the two same tables in the self joining query. Then how can we achieve this with Ktorm?  

You might have noticed that there is an `aliased` function in the `Table` class, this function returns a new created table object with all properties (including the table name and columns and so on) being copied from current table, but applying a new alias given by the parameter. Using the `aliased` function, try to implement the self joining above, we may write code like this: 

```kotlin
data class Names(val name: String?, val managerName: String?, val departmentName: String?)

val emp = Employees.aliased("emp") // Line 3, give an alias to the Employees table. 
val mgr = Employees.aliased("mgr") // Line 4, give another alias to the Employees table. 
val dept = Departments.aliased("dept")

val results = database
    .from(emp)
    .leftJoin(mgr, on = emp.managerId eq mgr.id) // Line 8, join one Employees table to the other. 
    .leftJoin(dept, on = emp.departmentId eq dept.id)
    .select(emp.name, mgr.name, dept.name)
    .orderBy(emp.id.asc())
    .map { row -> 
        Names(
            name = row[emp.name],
            managerName = row[mgr.name],
            departmentName = row[dept.name]
        )
    }
```

It's intuitive and actually the code style recommended by Ktorm's SQL DSL, but unfortunately, it may not compile. To help us analyze the error, the definition of `Employees` table is given below, being copied from [Schema Definition - Table Objects](./schema-definition.html#Table-Objects). 

```kotlin
object Employees : Table<Nothing>("t_employee") {
    val id = int("id").primaryKey()
    val name = varchar("name")
    val job = varchar("job")
    val managerId = int("manager_id")
    val hireDate = date("hire_date")
    val salary = long("salary")
    val departmentId = int("department_id")
}
```

Here is the signature of the `aliased` function in the super class `Table`: 

```kotlin
open fun aliased(alias: String): Table<E> { ... }
```

Obviously, according to the signature of the `aliased` function, the return value's type of `Employees.aliased("emp")` at line 3 should be `Table<E>`, and the type of the variable `mgr` at line 4 is also `Table<E>`. Then, the `emp.managerId eq mrg.id` at line 8 is clearly incorrect because properties `id` and `managerId` are defined in the `Employees` object, and the two aliased table objects are typed of `Table<E>` instead of `Employees`. 

Limited to the Kotlin language, although the `Table.aliased` can create a copied table object with a specific alias, it's return type cannot be the same as the caller's type but only `Table<E>`. Here we define the `Employees` table by an object keyword, and because the keyword defines a singleton object, it's not possible for Ktorm to create a new object of type `Employees`. 

To use self joining normally, we recommend that **if we need to use table aliases, please don't define tables as Kotlin's singleton objects, please use classes instead, and override the `aliased` function to return the same type as the concrete table classes:**

```kotlin
class Employees(alias: String?) : Table<Nothing>("t_employee", alias) {
    override fun aliased(alias: String) = Employees(alias)
    // Omit column definitions here...
}
```

However, there can be problems by changing objects to classes, for example, we can not use `Employees.name` to obtain a column object anymore because an instance is needed to access a class member. So we also recommend that **while defining our tables as classes, please also provide a companion object for each class as the default table object without an alias.** Finally the definition of `Employees` is:  

```kotlin
open class Employees(alias: String?) : Table<Nothing>("t_employee", alias) {
    companion object : Employees(null)
    override fun aliased(alias: String) = Employees(alias)

    val id = int("id").primaryKey()
    val name = varchar("name")
    val job = varchar("job")
    val managerId = int("manager_id")
    val hireDate = date("hire_date")
    val salary = long("salary")
    val departmentId = int("department_id")
}
```

That's the Ktorm's support for table aliases. Now you can try to run the self joining query above again, it should be able to generate a SQL perfectly and obtaining your results. 

## More Joining Types

Ktorm only provides four built-in join types in its core module (see [Joining Functions](#Joining-Functions)). That's enough in most cases, but what if we want to use some special join types provided by a special database? Let's take MySQL's natural join as an example, learning how to extend more joining types with Ktorm. 

By reading the source code, we can know that the `JoinExpression` extends from an abstract class `QuerySourceExpression`. We can also create a class extending from the abstract class by ourselves, let's name it as `NaturalJoinExpression`: 

```kotlin
data class NaturalJoinExpression(
    val left: QuerySourceExpression,
    val right: QuerySourceExpression,
    override val isLeafNode: Boolean = false
) : QuerySourceExpression()
```

Having the custom expression type, we also need an extension function to replace the value of `expression` property in `QuerySource` instances, just like the functions of `crossJoin`, `leftJoin` in the core module. 

```kotlin
fun QuerySource.naturalJoin(right: BaseTable<*>): QuerySource {
    return this.copy(expression = NaturalJoinExpression(left = expression, right = right.asExpression()))
}
```

By default, Ktorm cannot recognize our custom expression type `NaturalJoinExpression`, and are not able to generate SQLs using `natural join`. To solve the problem, we can extend the `SqlFormatter` class, override the `visitUnknown` function, detect our custom expression types and generate proper SQLs: 

```kotlin
class CustomSqlFormatter(database: Database, beautifySql: Boolean, indentSize: Int)
    : MySqlFormatter(database, beautifySql, indentSize) {

    override fun visitUnknown(expr: SqlExpression): SqlExpression {
        if (expr is NaturalJoinExpression) {
            visitQuerySource(expr.left)
            newLine(Indentation.SAME)
            write("natural join ")
            visitQuerySource(expr.right)
            return expr
        } else {
            return super.visitUnknown(expr)
        }
    }
}
```

Finally, register this custom SQL formatter into the `Database` object by dialect support. Refer to the later chapters for more details about [dialects](./dialects-and-native-sql.html).

```kotlin
val database = Database.connect(
    url = "jdbc:mysql://localhost:3306/ktorm", user = "root", password = "***",
    dialect = object : SqlDialect {
        override fun createSqlFormatter(database: Database, beautifySql: Boolean, indentSize: Int): SqlFormatter {
            return CustomSqlFormatter(database, beautifySql, indentSize)
        }
    }
)
```

All done! The usage of `naturalJoin`: 

```kotlin
val query = database.from(Employees).naturalJoin(Departments).select()
```

In this way, Ktorm supports natural join now. Actually, this is one of the features of ktorm-support-mysql module, if you really need to use natural join, you don't have to repeat the code above, please add the dependency to your project.

Maven dependency: 

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

