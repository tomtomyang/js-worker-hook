# JS Worker Hook

在 JavaScript 中实现运行时 Hook 可以做到修改或扩展现有函数的行为，而不改变其原始定义。这种技术通常用于代码调试、监控函数调用、性能分析等。本项目为 JavaScript Worker 代码添加运行时 Hook 机制，方便在特定函数执行前后进行自定义操作。

## Hook 原理

```js
console.log(1);
console.log(2);
```

对于上面这段 JS 代码，我们可以很轻易的添加一部分自定义逻辑进去：

```js
const oConsoleLog = console.log;

console.log = function () {
  oConsoleLog('Before original console.log');
  oConsoleLog.apply(console, arguments);
  oConsoleLog('After original console.log');
};

console.log(1);
console.log(2);
```

通过重新定义 `console.log`  函数，实现了在执行 `console.log(1)` 前后执行自定义逻辑，但是这样的实现存在以下问题：

1. **全局污染**：在全局作用域中直接修改 `console.log`，影响到所有使用 `console.log` 的地方，如 `console.log(2)`；
2. **原始方法暴露**：原始的 `console.log` 方法未经保护，容易被外部环境误用或再次修改，导致不可预见的行为；

可以使用复合闭包的方式，解决这个问题：

```js
(function () {
  let oConsole = console;

  (function (console) {
    console.log(1);
  })({
    ...oConsole,
    log: function () {
      oConsole.log('Before original console.log');
      oConsole.log.apply(oConsole, arguments);
      oConsole.log('After original console.log');
    },
  });

  oConsole = null;
})();

console.log(2);
```

## Hook 使用

将 Hook 设计为队列调用的形式，队列中的每一个 Hook 都是一个函数，可以在 Hook 函数中执行一些同步或异步操作。对于一个主函数，有 Before / After 两类 Hook 函数：

### Before Hook Function 运行在主函数之前

- 参数：参数与主函数相同；
- 返回：返回一个数组，数组的内容保持跟函数的参数列表一致，作为下一个 Before Hook 或主函数的调用参数；

### After Hook Function 运行在主函数之后

- 参数：参数主函数的返回值；
- 返回：返回一个数组，数组的内容保持与钩子的参数列表相同，作为下一个 After Hook 的调用参数；
