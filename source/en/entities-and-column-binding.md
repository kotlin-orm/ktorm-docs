---
title: Entities and Column Binding
lang: en
related_path: zh-cn/entities-and-column-binding.html
---

# Entities & Column Binding

We've learned Ktorm's SQL DSL in former sections, but Ktorm is still far from being an ORM framework if it only provides the DSL. Now, we will introduce entities, and learn how to bind relational tables to them. That's exactly the core of an ORM framework: object-relational mapping. 

## Define Entities

We still take the two tables `t_department` and `t_employee` as an example, creating two entity classes with Ktorm to present our departments and employees: 

```kotlin
interface Department : Entity<Department> {
    val id: Int
    var name: String
    var location: String
}

interface Employee : Entity<Employee> {
    val id: Int
    var name: String
    var job: String
    var manager: Employee?
    var hireDate: LocalDate
    var salary: Long
    var department: Department
}
```

We can see classes above both extends from `Entity<E>` interface, which injects some useful functions into entities. Their properties are defined by keyword *var* or *val*, you can mark the types as nullable or not depending on your business requirements. It may be counterintuitive that entities in Ktorm are not data classes, even not normal classes, but interfaces instead, that's a design requirement of Ktorm. By defining entities as interfaces, Ktorm can implement some special features, you will see the significance later.

> Since Ktorm 2.5, it's also supported to define entities as data classes or any other classes, see [Define Entities as Any Kind of Classes](./define-entities-as-any-kind-of-classes.html).

As everyone knows, interfaces cannot be instantiated, now that all entities are interfaces, how can we create their instances? Ktorm provides an `Entity.create` function, which generates implementations for entity interfaces via JDK dynamic proxy, and creates their instances for us. To create a department object, we can do this: 

```kotlin
val department = Entity.create<Department>()
```

If you don't like creating objects in that way, Ktorm also provides an abstract class `Entity.Factory`. We can add a companion object to our entity class extending from `Entity.Factory`: 

```kotlin
interface Department : Entity<Department> {
    companion object : Entity.Factory<Department>()
    val id: Int
    var name: String
    var location: String
}
```

The `Entity.Factory` class overloads the `invoke` operator, so we can use brackets to call the companion object as it's a function. The code creating a department object: 

```kotlin
val department = Department()
```

That's the charm of Kotlin, `Department` is an interface, but we can still create its instances, just like calling a constructor function. Moreover, we can also init some properties when creating entity objects: 

```kotlin
val department = Department {
    name = "tech"
    location = "Guangzhou"
}
```

## Column Binding

The core feature of an ORM framework is to bind database tables to entities, bind tables' columns to entities' properties. Now let's learn how to do that with Ktorm. 

In former sections learning SQL DSL, we created two table objects, they are `Departments` and `Employees`. In these table objects, we defined columns by calling column definition functions such as `int`, `long`, `varchar`, etc. The return type of them is `Column<C>`, in which, `C` is the declaring column's type.

It's easy to bind a column to an entity's property, we just need to chaining call the `bindTo` or `references` extension function on the `Column` instance. The code below modifies those two table objects and completes the O-R bindings: 

```kotlin
object Departments : Table<Department>("t_department") {
    val id = int("id").primaryKey().bindTo { it.id }
    val name = varchar("name").bindTo { it.name }
    val location = varchar("location").bindTo { it.location }
}

object Employees : Table<Employee>("t_employee") {
    val id = int("id").primaryKey().bindTo { it.id }
    val name = varchar("name").bindTo { it.name }
    val job = varchar("job").bindTo { it.job }
    val managerId = int("manager_id").bindTo { it.manager.id }
    val hireDate = date("hire_date").bindTo { it.hireDate }
    val salary = long("salary").bindTo { it.salary }
    val departmentId = int("department_id").references(Departments) { it.department }
}
```

> Naming Strategy: It's highly recommended to name your entity classes by singular nouns, name table objects by plurals (eg. Employee/Employees, Department/Departments).

Comparing the table objects with before, we can find two differences: 

1. The type parameter of `Table` is specified to the entity's type now, that's the way we bind table objects to entity classes. We set this parameter to `Nothing` before, that meant the table object was not bound to any entity class. 
2. After calling the column definition functions, we chaining call `bindTo` or `references` functions to bind the current column to a property in the entity class. If we don't do that, the column won't be bound to any property. 

The significance of column bindings is that, while obtaining entities from databases, Ktorm will use our binding configurations to fill columns' values to their corresponding properties, and while updating entities' changes back to the databases (using `flushChanges` function), Ktorm will also use the configurations to find corresponding columns of entity properties.  

Ktorm provides the following different binding types: 

1. **Simple Binding:** Use `bindTo` function to bind a column to a simple property, eg. `c.bindTo { it.name }`. 
2. **Nested Binding:** Use `bindTo` function to bind a column to nested properties, for example `c.bindTo { it.manager.department.id }`. While obtaining entities from databases, the value of this column will be filled to `employee.manager.department.id`. With only a single level of properties, simple binding is a special case of nested binding. 
3. **Reference Binding:** Use `references` function to bind a column to another table, eg. `c.references(Departments) { it.department }`, equivalent to the foreign key in databases. Using reference binding, while obtaining entities from databases, Ktorm will auto left join all its reference tables, obtaining the referenced entity objects at the same time. 

Additionally, multiple bindings are supported since Ktorm version 2.6, so we can bind a column to multiple properties by calling the `bindTo` or `references` functions continuously. In this way, when an entity object is retrieved from the database, the value of this column will be filled to each property it binds.

```kotlin
interface Config : Entity<Config> {
    val key: String
    var value1: String
    var value2: String
}

object Configs : Table<Config>("t_config") {
    val key = varchar("key").primaryKey().bindTo { it.key }
    val value = varchar("value").bindTo { it.value1 }.bindTo { it.value2 }
}
```

In the example above, we bound the `value` column to both `value1` and `value2`, so the values of these two properties would be the same in an entity object obtained from the database. 

> Please note that multiple bindings are only available for query operations. When we are inserting or updating an entity, the first binding will prevail, and other bindings will be ignored.

## More About Entities

We know that Ktorm's entity classes should be defined as interfaces extending from `Entity`, and we create entity objects via JDK dynamic proxy. If you have used dynamic proxy before, you may know proxy objects are created by `Proxy.newProxyInstance` method, providing an instance of `InvocationHandler`. When a method is invoked on a proxy instance, the method invocation is encoded and dispatched to the invocation handler. In Ktorm, `EntityImplementation` is the implementation of entities' invocation handler. It's marked as internal, so we can not use it outside Ktorm, but we can still learn its basic principles. 

### Getting and Setting Properties

When we define a property `var name: String` in Kotlin, we actually define two methods in Java byte code, they are `public String getName()` and `public void setName(String name)`. The invocations on these two methods will also be dispatched to `EntityImplementation`. 

There is a `values` property in `EntityImplementation`, its type is `LinkedHashMap<String, Any?>`, and it holds all property values of the entity object. When we use `e.name` to obtain the property's value, `EntityImplementation` receives an invocation on `getName()` method, then it will get the value from the `values` using the key "name". When we use `e.name = "foo"` to modify the property, `EntityImplementation` also receives an invocation on `setName()` method, then it will put the given value to `values` and save some additional information to track the entity's status changes. 

That is to say, behind every entity object, there is a value table that holds all the values of its properties. Any operation of getting or setting a property is actually operating the underlying value table. However, what if the value doesn't exist while we are getting a property? It's possible because any new-created entity object has an empty underlying value table. Ktorm defines a set of rules for this situation: 

- If the value doesn't exist and the property's type is marked nullable, eg `var name: String?`, then we'll return null. 
- If the value doesn't exist and the property's type is not nullable, eg `var name: String`, then we can not return null anymore, because the null value here can cause an unexpected null pointer exception, we'll return the type's default value instead. 

The default values of different types are well-defined: 

- For `Boolean` type, the default value is false.
- For `Char` type, the default value is \u0000. 
- For number types (such as `Int`, `Long`, `Double`, etc), the default value is zero. 
- For `String` type, the default value is an empty string. 
- For entity types, the default value is a new-created entity object which is empty. 
- For enum types, the default value is the first value of the enum, whose ordinal is 0. 
- For array types, the default value is a new-created empty array. 
- For collection types (such as `Set`, `List`, `Map`, etc), the default value is a new created mutable collection of the concrete type. 
- For any other types, the default value is an instance created by its no-args constructor. If the constructor doesn't exist, an exception is thrown. 

Moreover, there is a cache mechanism for default values in `EntityImplementation`, that ensures a property always returns the same default value instance even if it's called twice or more. This can avoid some counterintuitive bugs. 

### Non-abstract Members

If we are using domain driven design, then entities are not only data containers that hold property values, there are also some behaviors, so we need to add some business functions to our entities. Fortunately, Kotlin allows us to define non-abstract functions in interfaces, that's why we don't lose anything even if Ktorm's entity classes are all interfaces. Here is an example: 

```kotlin
interface Foo : Entity<Foo> {
    companion object : Entity.Factory<Foo>()
    val name: String
    
    fun printName() {
        println(name)
    }
}
```

Then if we call `Foo().printName()`, the value of the property `name` will be printed. 

> That looks natural, but the underlying implementation is not that simple. We know that Ktorm creates entity objects via JDK dynamic proxy, and the invocation on `printName` function will also be delegated into `EntityImplementation`. As the calling function is not abstract, when `EntityImplementation` receives the invocation, we will find out the default implementation by some tricks and call it. That's transparent to us, just like directly calling the function. If you are interested in the underlying story, you can refer to our [source code](https://github.com/kotlin-orm/ktorm/blob/master/ktorm-core/src/main/kotlin/org/ktorm/entity/DefaultMethodHandler.kt).

Besides of non-abstract functions, Kotlin also allows us to define properties with custom getters or setters in interfaces. For example, in the following code, if we call the `upperName` property, then the value of the `name` property will be returned in upper case. The principle is the same as we discussed above. 

```kotlin
interface Foo : Entity<Foo> {
    val name: String
    val upperName get() = name.toUpperCase()
}
```

### Serialization

The `Entity` interface extends from `java.io.Serializable`, so all entity objects are serializable by default. We can save them to our disks, or transfer them between systems through networks. 

Note that Ktorm only saves entities' property values when serialization, any other data that used to track entity status are lost (marked as transient). So we can not obtain an entity object from one system, then flush its changes into the database in another system. 

> Java uses `ObjectOutputStream` to serialize objects, and uses `ObjectInputStream` to deserialize them, you can refer to their documentation for more details. 

Besides of JDK serialization, the ktorm-jackson module also supports serializing entities in JSON format. This module provides an extension for Jackson, the famous JSON framework in Java world. It supports serializing entity objects into JSON format and parsing JSONs as entity objects. We just need to register the `KtormModule` into an `ObjectMapper`: 

```kotlin
val objectMapper = ObjectMapper()
objectMapper.registerModule(KtormModule())
```

Or use `findAndRegisterModules` method to auto detect and register it: 

```kotlin
val objectMapper = ObjectMapper()
objectMapper.findAndRegisterModules()
```

Now, we can use this `objectMapper` to do the serialization and deserialization for entities, please refer to Jackson's documentation for more details. 

That's the two serialization formats supported by Ktorm, if you need more serialization formats, please raise your issue, or you can do it by yourself and send a pull request to me. Welcome for your contributions!