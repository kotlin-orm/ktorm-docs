---
title: 运算符
lang: zh-cn
related_path: en/operators.html
---

# 运算符

在前面的章节中，我们已经对运算符有了一定的了解，现在，我们来对它进行详细的介绍。

## 内置运算符

Ktorm 的每个运算符实际上都是一个返回 `SqlExpression` 的 Kotlin 函数，下面是目前我们支持的所有运算符的列表及使用示例：

| Kotlin 函数名   | SQL 关键字/符号 | 使用示例                                                     |
| --------------- | --------------- | ------------------------------------------------------------ |
| isNull          | is null         | Ktorm: Employees.name.isNull()<br />SQL: t_employee.name is null |
| isNotNull       | is not null     | Ktorm: Employees.name.isNotNull()<br />SQL: t_employee.name is not null |
| unaryMinus (-)  | -               | Ktorm: -Employees.salary<br />SQL: -t_employee.salary        |
| unaryPlus (+)   | +               | Ktorm: +Employees.salary<br />SQL: +t_employee.salary        |
| not (!)         | not             | Ktorm: !Employees.name.isNull()<br />SQL: not (t_employee.name is null) |
| plus (+)        | +               | Ktorm: Employees.salary + Employees.salary<br />SQL: t_employee.salary + t_employee.salary |
| minus (-)       | -               | Ktorm: Employees.salary - Employees.salary<br />SQL: t_employee.salary - t_employee.salary |
| times (*)       | *               | Ktorm: Employees.salary \* 2<br />SQL: t_employee.salary \* 2 |
| div (/)         | /               | Ktorm: Employees.salary / 2<br />SQL: t_employee.salary / 2  |
| rem (%)         | %               | Ktorm: Employees.id % 2<br />SQL: t_employee.id % 2          |
| like            | like            | Ktorm: Employees.name like "vince"<br />SQL: t_employee.name like 'vince' |
| notLike         | not like        | Ktorm: Employees.name notLike "vince"<br />SQL: t_employee.name not like 'vince' |
| and             | and             | Ktorm: Employees.name.isNotNull() and (Employees.name like "vince")<br />SQL: t_employee.name is not null and t_employee.name like 'vince' |
| or              | or              | Ktorm: Employees.name.isNull() or (Employees.name notLike "vince")<br />SQL: t_employee.name is null or t_employee.name not like 'vince' |
| xor             | xor             | Ktorm: Employees.name.isNotNull() xor (Employees.name notLike "vince")<br />SQL: t_employee.name is not null xor t_employee.name not like 'vince' |
| lt / less       | <               | Ktorm: Employees.salary lt 1000<br />SQL: t_employee.salary < 1000 |
| lte / lessEq    | <=              | Ktorm: Employees.salary lte 1000<br />SQL: t_employee.salary <= 1000 |
| gt / greater    | >               | Ktorm: Employees.salary gt 1000<br />SQL: t_employee.salary > 1000 |
| gte / greaterEq | >=              | Ktorm: Employees.salary gte 1000<br />SQL: t_employee.salary >= 1000 |
| eq              | =               | Ktorm: Employees.id eq 1<br />SQL: t_employee.id = 1         |
| neq / notEq     | <>              | Ktorm: Employees.id neq 1<br />SQL: t_employee.id <> 1       |
| between         | between         | Ktorm: Employees.id between 1..3<br />SQL: t_employee.id between 1 and 3 |
| notBetween      | not between     | Ktorm: Employees.id notBetween 1..3<br />SQL: t_employee.id not between 1 and 3 |
| inList          | in              | Ktorm: Employees.departmentId.inList(1, 2, 3)<br />SQL: t_employee.department_id in (1, 2, 3) |
| notInList       | not in          | Ktorm: Employees.departmentId notInList db.from(Departments).selectDistinct(Departments.id)<br />SQL: t_employee.department_id not in (select distinct t_department.id from t_department) |
| exists          | exists          | Ktorm: exists(db.from(Employees).select())<br />SQL: exists (select * from t_employee) |
| notExists       | not exists      | Ktorm: notExists(db.from(Employees).select())<br />SQL: not exists (select * from t_employee) |

这些运算符按照实现方式大概可以分为两类：

**使用 operator 关键字重载的 Kotlin 内置运算符**：这类运算符一般用于实现加减乘除等基本的运算，由于重载了 Kotlin 的内置运算符，它们使用起来就像是真的执行了运算一样，比如 `Employees.salary + 1000`。但实际上并没有，它们只是创建了一个 SQL 表达式，这个表达式会被 `SqlFormatter` 翻译为 SQL 中的对应符号。下面是加号运算符的代码实现，可以看到，它只是创建了一个 `BinaryExpression<T>` 而已：

```kotlin
infix operator fun <T : Number> ColumnDeclaring<T>.plus(expr: ColumnDeclaring<T>): BinaryExpression<T> {
    return BinaryExpression(BinaryExpressionType.PLUS, asExpression(), expr.asExpression(), sqlType)
}
```

**普通的运算符函数**：然而，Kotlin 重载运算符还有许多限制，比如 `equals` 方法要求必须返回 `Boolean`，然而 Ktorm 的运算符需要返回 SQL 表达式，因此，Ktorm 提供了另外一个 `eq` 函数用于相等比较。除此之外，还有许多 SQL 中的运算符在 Kotlin 中并不存在，比如 like，Ktorm 就提供了一个 `like` 函数用于字符串匹配。下面是 `like` 函数的实现，这类函数一般都具有 infix 关键字修饰：

```kotlin
infix fun ColumnDeclaring<*>.like(argument: String): BinaryExpression<Boolean> {
    return BinaryExpression(
        type = BinaryExpressionType.LIKE, 
        left = asExpression(), 
        right = ArgumentExpression(argument, VarcharSqlType), 
        sqlType = BooleanSqlType
    )
}
```

## 运算符优先级

运算符可以连续使用，但是，当我们一次使用多个运算符时，它们的优先级就成了一个问题。在一个表达式中可能包含多个运算符，不同的运算顺序可能得出不同的结果甚至出现运算错误，因为当表达式中含多种运算时，必须按一定顺序进行结合，才能保证运算的合理性和结果的正确性、唯一性。

例如 1 + 2 \* 3，乘号的优先级比较高，则 2 \* 3 优先结合，运算结果为 7；若不考虑运算符的优先级，从前往后结合，那么运算结果为 9，这是完全错误的。一般来说，乘除的优先级高于加减，与的优先级高于或，但是，在 Ktorm 中，情况却有些不同。

对于重载的 Kotlin 内置运算符，其优先级遵循 Kotlin 语言自己的规范。例如表达式 `Employees.salary + 1000 * 2`，由于乘号的优先级较高，最终翻译出来的 SQL 是 `t_employee.salary + 2000`。

**但是对于普通的运算符函数，却并没有优先级一说**。在 Kotlin 语言的层面，它们实际上都只是普通的函数调用，因此只需要遵循从前往后结合的原则，尽管这有时可能会违反我们的直觉。比如 `a or b and c`，这里的 `or` 和 `and` 都是运算符函数，直觉上，`and` 的优先级应该比 `or` 高，因此应该优先结合，但实际上，它们只是普通的 Kotlin 函数而已。如果对这一点没有清楚的认识，可能导致一些意料之外的 bug，为了解决这个问题，我们可以在需要的地方使用括号，比如 `a or (b and c)`。

关于表达式优先级的具体顺序，请参考 [Kotlin 语言规范](https://kotlinlang.org/docs/reference/grammar.html#expressions)中的相关规定。

## 自定义运算符

前面已经介绍过 Ktorm 核心模块的内置运算符，这些运算符为标准 SQL 中的运算符提供了支持，但如果我们想使用一些数据库方言中特有的运算符呢？下面我们以 PostgreSQL 中的 `ilike` 运算符为例，了解如何增加自己的运算符。

`ilike` 是 PostgreSQL 中特有的运算符，它的功能与 `like` 一样，也是进行字符串匹配，但是忽略大小写。我们首先创建一个表达式类型，它继承于 `ScalarExpression<Boolean>`，表示一个 ilike 操作：

```kotlin
data class ILikeExpression(
    val left: ScalarExpression<*>,
    val right: ScalarExpression<*>,
    override val sqlType: SqlType<Boolean> = BooleanSqlType,
    override val isLeafNode: Boolean = false
) : ScalarExpression<Boolean>()
```

有了表达式类型之后，我们只需要再增加一个扩展函数，这就是运算符函数，为了函数使用起来真的像一个运算符，我们需要添加 infix 关键字：

```kotlin
infix fun ColumnDeclaring<*>.ilike(argument: String): ILikeExpression {
    return ILikeExpression(asExpression(), ArgumentExpression(argument, VarcharSqlType)
}
```

这样我们就能使用这个运算符函数了，就像使用其他运算符一样。不过现在 Ktorm 还无法识别我们自己创建的 `ILikeExpression`，无法为我们生成正确的 SQL。因此，我们需要扩展 `SqlFormatter` 类，重写它的 `visitUnknown` 方法，在里面检测我们的自定义表达式，为其生成正确的 SQL：

```kotlin
class CustomSqlFormatter(database: Database, beautifySql: Boolean, indentSize: Int)
    : PostgreSqlFormatter(database, beautifySql, indentSize) {

    override fun visitUnknown(expr: SqlExpression): SqlExpression {
        if (expr is ILikeExpression) {
            if (expr.left.removeBrackets) {
                visit(expr.left)
            } else {
                write("(")
                visit(expr.left)
                removeLastBlank()
                write(") ")
            }

            write("ilike ")

            if (expr.right.removeBrackets) {
                visit(expr.right)
            } else {
                write("(")
                visit(expr.right)
                removeLastBlank()
                write(") ")
            }

            return expr
        } else {
            super.visitUnknown(expr)
        }
    }
}
```

最后，使用方言（Dialect）将这个自定义的 SqlFormatter 注册到 `Database` 对象中。更多关于[方言](./dialects-and-native-sql.html)的细节，可参考后面的章节。

```kotlin
val database = Database.connect(
    url = "jdbc:postgresql://localhost:5432/ktorm",
    dialect = object : SqlDialect {
        override fun createSqlFormatter(database: Database, beautifySql: Boolean, indentSize: Int): SqlFormatter {
            return CustomSqlFormatter(database, beautifySql, indentSize)
        }
    }
)
```

大功告成，`ilike` 的使用方式如下：

```kotlin
val query = database.from(Employees).select().where { Employees.name ilike "VINCE" }
```

这样，Ktorm 就能够无缝支持 `ilike` 运算符，事实上，这正是 ktorm-support-postgresql 模块的功能之一，如果你真的需要使用 PostgreSQL 的 `ilike` 运算符，请直接在项目中添加依赖，不必再写一遍上面的代码，这里仅作示范。

Maven 依赖：

```
<dependency>
    <groupId>org.ktorm</groupId>
    <artifactId>ktorm-support-postgresql</artifactId>
    <version>${ktorm.version}</version>
</dependency>
```

或者 gradle：

```groovy
compile "org.ktorm:ktorm-support-postgresql:${ktorm.version}"
```



