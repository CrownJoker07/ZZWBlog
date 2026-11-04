---
title: "C# 基础面试题"
date: "2026-11-04T00:00:00+08:00"
draft: false
license: false
---

这是一份 C# 基础面试题速记，按类型、面向对象、常用语言特性和运行时行为整理。每题先记住核心区别，再通过代码确认实际行为。

### 值类型和引用类型有什么区别？

**值类型变量直接保存数据，引用类型变量保存对象的引用**。给另一个变量赋值时，前者复制值，后者复制引用。`int`、`bool`、`struct` 是值类型；`class`、数组、`string` 是引用类型。不要把两者简单等同于“栈上”和“堆上”：存储位置取决于使用场景，例如值类型被装箱后也会位于托管堆上。[来源：Microsoft Learn 的 C# 类型系统](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types)。

```csharp
int a = 1;
int b = a;
b = 2;
Console.WriteLine(a); // 1

int[] first = [1];
int[] second = first;
second[0] = 2;
Console.WriteLine(first[0]); // 2
```

### `class` 和 `struct` 有什么区别？

`class` 定义引用类型，`struct` 定义值类型。结构体赋值通常复制其数据；类变量赋值复制对象引用。结构体不能继承其他类或结构体，但可以实现接口。选择类型时应先看所需的**值语义或引用语义**，不能只凭“结构体一定更快”判断。[来源：Microsoft Learn 的类说明](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes)、[结构体说明](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs)。

### 什么是装箱和拆箱？

**装箱**把值类型转换为 `object` 或其实现的接口类型，并创建对象保存该值；**拆箱**从对象中取回值类型，需要显式转换。装箱会产生分配，频繁发生时应检查是否可以使用泛型集合等方式避免。[来源：Microsoft Learn 的装箱与拆箱说明](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing)。

```csharp
int number = 42;
object boxed = number;      // 装箱
int restored = (int)boxed; // 拆箱
Console.WriteLine(restored);
```

### 参数按值传递与 `ref`、`out`、`in` 有什么区别？

默认按值传递：传入值类型时复制值，传入引用类型时复制引用。`ref` 按引用传递变量，调用前必须赋值，方法可以修改它；`out` 允许调用前不赋值，但方法返回前必须赋值；`in` 按只读引用传递，方法不能给形参重新赋值。[来源：Microsoft Learn 的方法参数说明](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters)。

常见误区：默认传入一个类对象时，方法可以修改对象的成员，但给形参重新赋值不会改变调用方的变量；要改变调用方变量本身，需要 `ref`。

### `const`、`readonly` 和 `static` 分别做什么？

`const` 是编译时常量，声明时就要给出可确定的值。`readonly` 字段可以在声明处或构造函数中赋值，之后不能再给该字段赋值。`static` 表示成员属于类型，而不是某个实例；它本身不表示不可修改。三者解决的问题不同，`static readonly` 可以组合使用。[来源：Microsoft Learn 的常量说明](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/constants)、[静态类与成员说明](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members)。

### `string` 是值类型吗？为什么拼接字符串可能产生新对象？

`string` 是**不可变的引用类型**。拼接或 `Replace` 等操作不会修改原字符串，而是得到新字符串。循环中大量拼接时，可以考虑 `StringBuilder`；少量拼接不必机械替换。[来源：Microsoft Learn 的字符串说明](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/strings/)、[`StringBuilder` 说明](https://learn.microsoft.com/en-us/dotnet/standard/base-types/stringbuilder)。

### 重载、重写和隐藏有什么区别？

**重载**是在同一类型中使用相同方法名、不同参数列表。**重写**用 `override` 提供继承来的 `virtual` 或 `abstract` 成员的新实现，调用结果取决于对象的运行时类型。**隐藏**用 `new` 声明同名成员，调用哪个成员取决于变量的编译时类型。返回类型不同本身不足以构成重载。[来源：Microsoft Learn 的方法重载说明](https://learn.microsoft.com/en-us/dotnet/csharp/methods#method-overloading)、[`override` 与 `new` 的区别](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/knowing-when-to-use-override-and-new-keywords)。

### `virtual`、`abstract` 和 `sealed` 如何影响继承？

`virtual` 成员有默认实现，并允许派生类重写；`abstract` 成员没有实现，要求非抽象派生类提供实现。`sealed` 类不能再被继承；`sealed override` 可以阻止后续派生类继续重写该成员。没有标记为可重写的普通实例方法不能用 `override` 重写。[来源：Microsoft Learn 的 `virtual`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual)、[`abstract`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/abstract)、[`sealed`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed) 说明。

### 抽象类和接口有什么区别？

抽象类可以保存实例状态、定义构造函数，并提供已实现或未实现的成员；类只能继承一个直接基类。接口描述类型应提供的成员，一个类或结构体可以实现多个接口。现代 C# 也允许接口提供默认实现，所以“接口绝对没有实现”并不准确。[来源：Microsoft Learn 的抽象类说明](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/abstract)、[接口说明](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces)。

### 字段和属性有什么区别？

字段直接存储数据；属性通过 `get`、`set` 等访问器提供读取和写入入口。自动属性让编译器生成隐藏的后备字段。属性可以只读，也可以在访问器中执行逻辑；对外公开数据时通常使用属性。[来源：Microsoft Learn 的属性说明](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties)。

### 泛型解决了什么问题？`List<T>` 与数组有什么区别？

泛型把类型作为参数，让同一套类或方法适用于多种类型，同时保持类型检查。`List<int>` 是存储整数的泛型列表；数组创建后长度固定，`List<T>` 可以通过 `Add` 等方法增减元素。`List<T>` 扩容可能重新分配内部数组，因此不要假设每次添加都没有成本。[来源：Microsoft Learn 的泛型说明](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics)、[`List<T>` 文档](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1)。

### 委托和事件有什么区别？

**委托**是表示一组特定参数与返回类型的方法引用的类型，可用于回调。**事件**建立在委托之上，外部代码通常只能订阅和取消订阅，不能直接触发声明该事件的对象的事件。需要通知多个订阅者时常用事件；需要传入一个可调用的操作时常用委托。[来源：Microsoft Learn 的委托说明](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/)、[委托与事件的区别](https://learn.microsoft.com/en-us/dotnet/csharp/distinguish-delegates-events)。

### `async` 和 `await` 会创建新线程吗？

不会必然创建新线程。`async` 允许方法中使用 `await`；等待尚未完成的异步操作时，`await` 可以让出控制权，操作完成后继续执行。I/O 异步操作通常不需要为等待过程占用一个线程；要把 CPU 密集计算移到线程池，可考虑 `Task.Run`。[来源：Microsoft Learn 的异步编程场景](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios)。

### GC 与 `IDisposable`、`using` 是什么关系？

垃圾回收器（GC）管理托管对象的内存，不能保证文件句柄等资源在特定时刻释放。对象提供 `IDisposable.Dispose` 时，使用 `using` 可以在离开作用域时调用清理逻辑，即使作用域内发生异常也一样。`Dispose` 不等于立即回收对象内存。[来源：Microsoft Learn 的垃圾回收基础](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals)、[`using` 语句说明](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/using)。

### `try`、`catch`、`finally` 各有什么作用？

`try` 包住可能抛出异常的操作；`catch` 处理匹配的异常；`finally` 执行收尾代码。若无法合理处理异常，应让它继续向调用方传播，而不是空 `catch` 后忽略错误。管理可释放资源时，优先使用 `using` 表达释放意图。[来源：Microsoft Learn 的异常处理说明](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions)、[`using` 语句说明](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/using)。

### `string?` 与 `int?` 中的问号含义相同吗？

两者都用于表达“可能为空”，机制不同：`int?` 是 `Nullable<int>`，让值类型可以没有值；启用可空引用类型分析后，`string?` 表示引用可能为 `null`，编译器会据此给出警告，但不会创建另一种运行时字符串类型。[来源：Microsoft Learn 的可空值类型说明](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types)、[可空引用类型说明](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)。
