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
2. **临时方法暴露**：临时创建的 `oConsoleLog` 方法未经保护，容易被外部环境误用或再次修改，导致不可预见的行为；

我们可以通过 IIFE 的方式，给 `console.log(1)` 创造一个单独的执行上下文，实现仅修改内部 `console` 对象：

```js
(function (console) {
  console.log(1);
})({
  ...console,
  log: function (...args) {
    console.log('Before original console.log');
    console.log(...args);
    console.log('After original console.log');
  },
});

console.log(2);

```

如果需要支持更复杂的 Before、After 逻辑插入，可以进一步修改为双层 IIFE 的形式：

```js
// 写法 1
(function () {
  const consoleBeforeHooks = [];
  const consoleAfterHooks = [];

  consoleBeforeHooks.push((...args) => {
    console.log('Before original console.log 1');
  });

  consoleBeforeHooks.push((...args) => {
    console.log('Before original console.log 2');
  });

  consoleAfterHooks.push((...args) => {
    console.log('After original console.log 1');
  });

  consoleAfterHooks.push((...args) => {
    console.log('After original console.log 2');
  });

  (function (console) {
    console.log(1);
  })({
    ...console,
    log: function (...args) {
      consoleBeforeHooks.forEach((hook) => hook(...args));
      console.log(...args);
      consoleAfterHooks.forEach((hook) => hook(...args));
    },
  });
})();

console.log(2);


// 写法 2
(function (console) {
  console.log(1);
})(
  (function () {
    const consoleBeforeHooks = [];
    const consoleAfterHooks = [];

    consoleBeforeHooks.push((...args) => {
      console.log('Before original console.log 1');
    });

    consoleBeforeHooks.push((...args) => {
      console.log('Before original console.log 2');
    });

    consoleAfterHooks.push((...args) => {
      console.log('After original console.log 1');
    });

    consoleAfterHooks.push((...args) => {
      console.log('After original console.log 2');
    });

    return {
      ...console,
      log: function (...args) {
        consoleBeforeHooks.forEach((hook) => hook(...args));
        console.log(...args);
        consoleAfterHooks.forEach((hook) => hook(...args));
      },
    };
  })(),
);

console.log(2);

```

上面的写法存在另一个执行效率的问题，即每次都需要执行 Hook 队列初始化，`console.log` 函数重写等操作。

```js
// 对于 console.log(1)
(function (console) {
  console.log(1);
})(
  (function () {
    const consoleBeforeHooks = [];
    const consoleAfterHooks = [];

    consoleBeforeHooks.push((...args) => {
      console.log('Before original console.log 1');
    });

    consoleBeforeHooks.push((...args) => {
      console.log('Before original console.log 2');
    });

    consoleAfterHooks.push((...args) => {
      console.log('After original console.log 1');
    });

    consoleAfterHooks.push((...args) => {
      console.log('After original console.log 2');
    });

    return {
      ...console,
      log: function (...args) {
        consoleBeforeHooks.forEach((hook) => hook(...args));
        console.log(...args);
        consoleAfterHooks.forEach((hook) => hook(...args));
      },
    };
  })(),
);

// 对于 console.log(2)
(function (console) {
  console.log(2);
})(
  (function () {
    const consoleBeforeHooks = [];
    const consoleAfterHooks = [];

    consoleBeforeHooks.push((...args) => {
      console.log('Before original console.log 1');
    });

    consoleBeforeHooks.push((...args) => {
      console.log('Before original console.log 2');
    });

    consoleAfterHooks.push((...args) => {
      console.log('After original console.log 1');
    });

    consoleAfterHooks.push((...args) => {
      console.log('After original console.log 2');
    });

    return {
      ...console,
      log: function (...args) {
        consoleBeforeHooks.forEach((hook) => hook(...args));
        console.log(...args);
        consoleAfterHooks.forEach((hook) => hook(...args));
      },
    };
  })(),
);

console.log(3);

```

每当我想要添加运行时 Hook 时，都需要创建一次双重的 IIFE 执行上下文，如上文所说，这是为了解决全局污染与临时方法暴露的问题。可见执行效率和隔离性其实是互斥的，如果要解决执行效率的问题，就必须修改对全局函数下手：

```js
(function () {
  console.log(1);
})(
  (function () {
    if (console.__hooked) {
      return;
    }

    console.__hooked = true;
    const oConsoleLog = console.log;
    console.log = function (...args) {
      oConsoleLog('Before original console.log');
      oConsoleLog(...args);
      oConsoleLog('After original console.log');
    };
  })(),
);

(function () {
  console.log(2);
})(
  (function () {
    if (console.__hooked) {
      return;
    }

    console.__hooked = true;

    const oConsoleLog = console.log;
    console.log = function (...args) {
      oConsoleLog('Before original console.log');
      oConsoleLog(...args);
      oConsoleLog('After original console.log');
    };
  })(),
);

console.log(3);

```

这样的写法可以解决 Hook 逻辑被重复执行的问题，且不会暴露临时方法，但是会导致全局的 `console.log` 被修改。在使用时要根据实际需求，在隔离性和执行效率之间做好权衡。

## Hook 使用

将 Hook 设计为队列调用的形式，队列中的每一个 Hook 都是一个函数，可以在 Hook 函数中执行一些同步或异步操作。对于一个主函数，有 Before / After 两类 Hook 函数：

### Before Hook Function 运行在主函数之前

- 参数：参数与主函数相同；
- 返回：返回一个数组，数组的内容保持跟函数的参数列表一致，将会作为下一个 Before Hook 或者主函数运行的参数；

### After Hook Function 运行在主函数之后

- 参数：参数主函数的返回值；
- 返回：返回一个数组，数组的内容保持与钩子的参数列表相同，作为下一个 After Hook 的调用参数；
