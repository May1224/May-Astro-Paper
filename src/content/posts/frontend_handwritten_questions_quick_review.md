---
author: AstroPaper
pubDatetime: 2026-06-22T21:30:00+08:00
title: 前端复习
tags:
  - 学习
description: 前端高频手写题、Promise、事件、缓存和常见算法的快速复习。
---

# 一、函数与对象手写

## 1. 手写 `call`

**考点：** 改变 `this` 指向、隐式绑定、Symbol 防止属性冲突。

```js
Function.prototype.myCall = function (context, ...args) {
  if (typeof this !== "function") {
    throw new TypeError("myCall must be called on a function");
  }

  context = context == null ? globalThis : Object(context);
  const key = Symbol("fn");
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};
```

**15秒解释：** `call` 的核心是把函数临时挂到目标对象上，以对象方法形式调用，让 `this` 指向该对象，执行完删除临时属性。

**常见追问：**

- 为什么用 Symbol？避免覆盖 context 上已有属性。
- `null/undefined` 怎么处理？非严格模式下指向全局对象，这里用 `globalThis`。
- 基本类型 context 怎么办？用 `Object(context)` 包装。

## 2. 手写 `apply`

**考点：** 和 call 的区别、数组参数。

```js
Function.prototype.myApply = function (context, args) {
  if (typeof this !== "function") {
    throw new TypeError("myApply must be called on a function");
  }

  context = context == null ? globalThis : Object(context);
  const key = Symbol("fn");
  context[key] = this;
  const result = args == null ? context[key]() : context[key](...args);
  delete context[key];
  return result;
};
```

**15秒解释：** `apply` 和 `call` 思路一样，只是参数以数组或类数组形式传入。

**常见追问：**

- apply 第二个参数必须是数组吗？真实实现接受类数组；面试简版可先处理可迭代数组。
- `args` 为空怎么办？直接无参调用。
- apply 常见用途？把数组展开传给函数。

## 3. 手写 `bind`

**考点：** 返回函数、预置参数、new 调用优先级。

```js
Function.prototype.myBind = function (context, ...presetArgs) {
  if (typeof this !== "function") {
    throw new TypeError("myBind must be called on a function");
  }

  const fn = this;

  function boundFn(...laterArgs) {
    const isNew = this instanceof boundFn;
    return fn.apply(isNew ? this : context, presetArgs.concat(laterArgs));
  }

  boundFn.prototype = Object.create(fn.prototype);
  return boundFn;
};
```

**15秒解释：** `bind` 不立即执行，而是返回新函数；新函数调用时把预置参数和后续参数合并，并绑定 this；如果被 new 调用，this 应指向新实例。

**常见追问：**

- bind 后还能用 call 改 this 吗？普通调用不能改。
- 为什么处理 new？原生 bind 返回函数可作为构造函数。
- 箭头函数 bind 有用吗？不能改变箭头函数 this，但可预置参数。

## 4. 手写 `new`

**考点：** 原型链、构造函数返回值。

```js
function myNew(Constructor, ...args) {
  if (typeof Constructor !== "function") {
    throw new TypeError("Constructor must be a function");
  }

  const obj = Object.create(Constructor.prototype);
  const result = Constructor.apply(obj, args);
  const isObject =
    result !== null &&
    (typeof result === "object" || typeof result === "function");

  return isObject ? result : obj;
}
```

**15秒解释：** `new` 创建对象，连接原型，用新对象作为 this 执行构造函数，最后按构造函数返回值决定返回对象。

**常见追问：**

- 构造函数返回基本类型怎么办？忽略，返回新实例。
- 返回对象怎么办？返回该对象。
- `Object.create` 做什么？创建一个指定原型的新对象。

## 5. 手写 `instanceof`

**考点：** 原型链查找。

```js
function myInstanceof(obj, Constructor) {
  if (obj == null || (typeof obj !== "object" && typeof obj !== "function")) {
    return false;
  }

  let proto = Object.getPrototypeOf(obj);
  const prototype = Constructor.prototype;

  while (proto) {
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}
```

**15秒解释：** `instanceof` 判断构造函数的 `prototype` 是否出现在对象的原型链上。

**常见追问：**

- 基本类型为什么返回 false？基本类型不是对象实例。
- 原型链终点是什么？`null`。
- 跨 iframe 判断数组为什么可能失败？不同 iframe 有不同的 Array 构造函数。

## 6. 手写深拷贝

**考点：** 递归、循环引用、数组/对象/Date/RegExp。

```js
function deepClone(value, cache = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value);

  if (cache.has(value)) return cache.get(value);

  const result = Array.isArray(value) ? [] : {};
  cache.set(value, result);

  Reflect.ownKeys(value).forEach(key => {
    result[key] = deepClone(value[key], cache);
  });

  return result;
}
```

**15秒解释：** 深拷贝递归复制嵌套对象；用 WeakMap 记录已拷贝对象，解决循环引用。

**常见追问：**

- JSON 深拷贝有什么问题？丢函数、undefined、Symbol、Date 类型，也不能处理循环引用。
- 为什么用 WeakMap？键是弱引用，不影响垃圾回收。
- Map/Set 怎么处理？面试基础版可说明需额外遍历 entries。

## 7. 手写对象扁平化

**考点：** 递归、路径拼接。

```js
function flattenObject(obj, prefix = "", result = {}) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, path, result);
    } else {
      result[path] = value;
    }
  });

  return result;
}

flattenObject({ a: { b: 1 }, c: 2 }); // { 'a.b': 1, c: 2 }
```

**15秒解释：** 遍历对象属性，遇到对象递归深入，把路径拼成 `a.b.c` 作为新 key。

**常见追问：**

- 数组要不要扁平？看题目，可用 `a[0].b` 或 `a.0.b` 表示路径。
- 循环引用怎么办？加 WeakSet 记录访问过的对象。
- null 为什么单独判断？`typeof null` 是 object。

# 二、数组、字符串与数据处理

## 8. 数组去重

**考点：** Set、哈希。

```js
function unique(arr) {
  return [...new Set(arr)];
}
```

**15秒解释：** Set 只保存唯一值，展开回数组即可。

**常见追问：**

- 对象数组怎么按 id 去重？用 Map，以 id 为 key。
- NaN 能去重吗？Set 中 NaN 等于 NaN，可以。
- 复杂对象去重怎么做？按业务 key 或序列化，但序列化有属性顺序问题。

```js
function uniqueBy(arr, key) {
  const map = new Map();
  arr.forEach(item => {
    if (!map.has(item[key])) map.set(item[key], item);
  });
  return [...map.values()];
}
```

## 9. 数组扁平化

**考点：** 递归、深度控制。

```js
function flatten(arr, depth = Infinity) {
  if (depth === 0) return arr.slice();

  return arr.reduce((res, item) => {
    if (Array.isArray(item)) {
      res.push(...flatten(item, depth - 1));
    } else {
      res.push(item);
    }
    return res;
  }, []);
}
```

**15秒解释：** 遍历数组，遇到子数组就递归展开，depth 控制展开层数。

**常见追问：**

- 原生怎么写？`arr.flat(depth)`。
- 递归太深怎么办？可用栈迭代实现。
- 会改变原数组吗？这个实现不会。

## 10. 数组分组 `groupBy`

**考点：** reduce、对象/Map 聚合。

```js
function groupBy(arr, getKey) {
  return arr.reduce((res, item) => {
    const key = typeof getKey === "function" ? getKey(item) : item[getKey];
    if (!res[key]) res[key] = [];
    res[key].push(item);
    return res;
  }, {});
}
```

**15秒解释：** 遍历数组，根据 key 把元素放进对应数组。

**常见追问：**

- key 是对象怎么办？用 Map 更合适。
- 时间复杂度？O(n)。
- 结果要保持顺序吗？数组内顺序保持原遍历顺序。

## 11. 字符串模板解析

**考点：** 正则、路径取值。

```js
function renderTemplate(template, data) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    return path.split(".").reduce((obj, key) => obj?.[key], data) ?? "";
  });
}

renderTemplate("hello {{ user.name }}", { user: { name: "Tom" } }); // hello Tom
```

**15秒解释：** 用正则匹配 `{{ path }}`，再按点路径从 data 中取值替换。

**常见追问：**

- 缺失值怎么处理？返回空字符串或保留原占位符，按需求定。
- 支持表达式吗？不建议直接 eval，有安全风险。
- 可选链有什么作用？避免路径中间为 null/undefined 报错。

## 12. 千分位格式化

**考点：** 正则或字符串处理。

```js
function formatThousands(num) {
  const [integer, decimal] = String(num).split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal ? `${formatted}.${decimal}` : formatted;
}
```

**15秒解释：** 用正则找到非单词边界且后面每三位成组的位置，插入逗号。

**常见追问：**

- 负数能处理吗？这个写法一般可以，但严谨版需单独处理符号。
- 小数怎么办？整数部分格式化，小数部分保留。
- 原生 API？`Number(num).toLocaleString()`。

## 13. 版本号比较

**考点：** 字符串拆分、逐段比较。

```js
function compareVersion(v1, v2) {
  const a = v1.split(".").map(Number);
  const b = v2.split(".").map(Number);
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }

  return 0;
}
```

**15秒解释：** 按点切分版本号，从左到右逐段数字比较，缺失段按 0 处理。

**常见追问：**

- `1.0` 和 `1.0.0`？相等。
- 包含 beta 怎么办？需要扩展语义化版本规则。
- 时间复杂度？O(n)，n 是版本段数。

# 三、异步与 Promise 手写

## 14. 手写防抖 debounce

**考点：** 定时器、this、参数。

```js
function debounce(fn, delay = 300) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

**15秒解释：** 连续触发时清掉上一个定时器，只在停止触发 delay 后执行最后一次。

**常见追问：**

- 适用场景？搜索输入、resize。
- 为什么用 apply？保留原函数 this 和参数。
- 怎么加立即执行？第一次触发先执行，等待期内不再执行。

## 15. 手写节流 throttle

**考点：** 控制执行频率。

```js
function throttle(fn, delay = 300) {
  let last = 0;

  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}
```

**15秒解释：** 在固定时间窗口内最多执行一次。

**常见追问：**

- 适用场景？scroll、mousemove、拖拽。
- 时间戳版特点？通常立即执行第一次。
- 定时器版特点？可保证尾部再执行一次。

## 16. 手写 Promise.all

**考点：** 并发、顺序、失败快速返回。

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(promises);
    const results = [];
    let count = 0;

    if (arr.length === 0) {
      resolve([]);
      return;
    }

    arr.forEach((promise, index) => {
      Promise.resolve(promise).then(value => {
        results[index] = value;
        count++;
        if (count === arr.length) resolve(results);
      }, reject);
    });
  });
}
```

**15秒解释：** 所有 Promise 成功才 resolve，结果顺序按输入顺序；任意一个失败就 reject。

**常见追问：**

- 空数组返回什么？立即 resolve `[]`。
- 普通值怎么办？用 `Promise.resolve` 包装。
- 结果顺序按完成顺序吗？不是，按输入顺序。

## 17. 手写 Promise.race

**考点：** 第一个 settle。

```js
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      Promise.resolve(promise).then(resolve, reject);
    }
  });
}
```

**15秒解释：** 谁先变成 fulfilled 或 rejected，返回的 Promise 就跟随谁的状态。

**常见追问：**

- 常见用途？请求超时。
- 空数组会怎样？永远 pending。
- race 只看成功吗？不是，成功失败谁先 settle 都算。

## 18. 请求超时封装

**考点：** Promise.race、AbortController。

```js
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timer);
  });
}
```

**15秒解释：** 用 AbortController 在超时后取消 fetch，请求结束后清理定时器。

**常见追问：**

- 只用 Promise.race 能真正取消请求吗？不能，只是外层 Promise 超时，底层请求仍可能继续。
- axios 怎么取消？新版支持 AbortController。
- 超时错误怎么识别？捕获 AbortError 或统一包装错误。

## 19. 并发请求控制

**考点：** 队列、并发池。

```js
function limitRequest(tasks, limit) {
  const results = [];
  let index = 0;
  let active = 0;

  return new Promise((resolve, reject) => {
    function run() {
      if (index === tasks.length && active === 0) {
        resolve(results);
        return;
      }

      while (active < limit && index < tasks.length) {
        const current = index++;
        active++;

        Promise.resolve()
          .then(() => tasks[current]())
          .then(value => {
            results[current] = value;
          })
          .then(() => {
            active--;
            run();
          }, reject);
      }
    }

    run();
  });
}
```

**15秒解释：** 维护当前执行数 active，低于并发上限就启动新任务；任务完成后补下一个。

**常见追问：**

- 结果顺序怎么保证？按任务 index 存结果。
- 失败后继续还是中断？看需求；这个实现失败即 reject。
- 应用场景？图片上传、批量接口、爬取资源。

## 20. 实现 sleep

**考点：** Promise、定时器。

```js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  await sleep(1000);
  console.log("after 1s");
}
```

**15秒解释：** 返回一个指定时间后 resolve 的 Promise，配合 await 实现暂停效果。

**常见追问：**

- sleep 会阻塞主线程吗？不会，只是 async 函数暂停。
- setTimeout 精确吗？不精确，会受主线程阻塞和浏览器调度影响。
- 用途？轮询间隔、动画步骤、重试退避。

# 四、事件、发布订阅与缓存

## 21. 手写发布订阅 EventEmitter

**考点：** 事件中心、on/off/once/emit。

```js
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(type, handler) {
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(handler);
  }

  off(type, handler) {
    this.events.get(type)?.delete(handler);
  }

  once(type, handler) {
    const wrapper = (...args) => {
      handler(...args);
      this.off(type, wrapper);
    };
    this.on(type, wrapper);
  }

  emit(type, ...args) {
    this.events.get(type)?.forEach(handler => handler(...args));
  }
}
```

**15秒解释：** 用 Map 保存事件名和回调集合，emit 时执行对应回调，once 用包装函数执行后自动解绑。

**常见追问：**

- Set 有什么好处？避免同一个 handler 重复注册。
- emit 时 off 会不会影响遍历？严谨版可先复制一份 handlers。
- 发布订阅和观察者区别？发布订阅有事件中心解耦，观察者通常直接持有订阅者。

## 22. 手写 LRU 缓存

**考点：** Map 插入顺序、最近使用淘汰。

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);

    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}
```

**15秒解释：** Map 保持插入顺序，访问或更新时删除再插入，超容量时删除最早的 key。

**常见追问：**

- 时间复杂度？get/put 平均 O(1)。
- 大厂更严格实现？哈希表 + 双向链表。
- Map 版本有什么限制？依赖 JS Map 顺序，面试基础够用。

## 23. 手写 once 函数

**考点：** 闭包、结果缓存。

```js
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}
```

**15秒解释：** 用闭包保存是否调用过和第一次结果，后续调用直接返回缓存结果。

**常见追问：**

- this 怎么保持？用 apply。
- 适用场景？初始化 SDK、只绑定一次事件、提交防重复。
- 如果第一次执行报错还算 called 吗？看需求，可把 called 放在成功后设置。

## 24. 手写 memoize

**考点：** 缓存、参数 key。

```js
function memoize(fn, resolver = (...args) => JSON.stringify(args)) {
  const cache = new Map();

  return function (...args) {
    const key = resolver(...args);
    if (cache.has(key)) return cache.get(key);

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

**15秒解释：** 根据参数生成 key，命中缓存直接返回，否则执行函数并缓存结果。

**常见追问：**

- JSON.stringify 有什么问题？对象属性顺序、循环引用、函数等情况不可靠。
- 缓存会无限增长吗？会，生产可结合 LRU。
- 异步函数能缓存吗？可以缓存 Promise，但要处理失败是否删除缓存。

# 五、DOM、场景与算法高频

## 25. 手写事件委托

**考点：** 冒泡、target、matches。

```js
function delegate(parent, selector, type, handler) {
  parent.addEventListener(type, function (event) {
    let target = event.target;

    while (target && target !== parent) {
      if (target.matches(selector)) {
        handler.call(target, event, target);
        return;
      }
      target = target.parentElement;
    }
  });
}
```

**15秒解释：** 把事件绑定到父元素，利用冒泡找到匹配 selector 的真实触发元素。

**常见追问：**

- 优点？减少监听器，支持动态添加子元素。
- `target` 和 `currentTarget` 区别？target 是实际触发元素，currentTarget 是绑定监听器元素。
- 为什么 while 向上找？点击的可能是目标元素内部子节点。

## 26. 实现图片懒加载

**考点：** IntersectionObserver。

```js
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
}
```

**15秒解释：** 用 IntersectionObserver 监听图片是否进入视口，进入后把 data-src 赋给 src 并取消观察。

**常见追问：**

- 原生懒加载怎么写？`<img loading="lazy">`。
- 首屏图要懒加载吗？不建议，会影响 LCP。
- 兼容旧浏览器怎么办？滚动监听 + 节流 + getBoundingClientRect。

## 27. 实现红绿灯

**考点：** async/await、循环。

```js
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function trafficLight() {
  while (true) {
    console.log("red");
    await wait(3000);
    console.log("green");
    await wait(2000);
    console.log("yellow");
    await wait(1000);
  }
}
```

**15秒解释：** 用 async/await 把异步定时流程写成顺序逻辑，while true 循环执行。

**常见追问：**

- 如何停止？增加 cancelled 标志或 AbortController。
- setTimeout 精确吗？不精确，受主线程影响。
- Promise 链怎么写？每一步 then 返回下一个 sleep。

## 28. 手写简版响应式

**考点：** Proxy、依赖收集、派发更新。

```js
let activeEffect = null;
const targetMap = new WeakMap();

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));

  let deps = depsMap.get(key);
  if (!deps) depsMap.set(key, (deps = new Set()));

  deps.add(activeEffect);
}

function trigger(target, key) {
  const deps = targetMap.get(target)?.get(key);
  deps?.forEach(fn => fn());
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      track(target, key);
      return value;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    },
  });
}
```

**15秒解释：** 读取属性时收集当前 effect，修改属性时找到依赖这个属性的 effect 并重新执行。

**常见追问：**

- 为什么 targetMap 用 WeakMap？target 不再被引用时可被回收。
- 这个版本缺什么？嵌套响应式、调度器、清理依赖、数组/集合特殊处理。
- Vue3 对基本类型怎么响应式？用 ref 包一层 value。

## 29. 手写虚拟 DOM 转真实 DOM

**考点：** 递归、DOM API。

```js
function render(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  const el = document.createElement(vnode.tag);

  Object.entries(vnode.props || {}).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  });

  (vnode.children || []).forEach(child => {
    el.appendChild(render(child));
  });

  return el;
}
```

**15秒解释：** 根据 vnode 的 tag 创建元素，设置属性和事件，然后递归渲染 children。

**常见追问：**

- React/Vue 的真实 render 复杂在哪？diff、组件、生命周期、事件系统、属性差异处理。
- className 怎么处理？真实项目要映射到 class。
- children 是字符串怎么办？创建文本节点。

## 30. 两数之和

**考点：** 哈希表。

```js
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }

  return [];
}
```

**15秒解释：** 遍历时用 Map 记录已见数字和下标，当前数只需查 target - 当前数是否出现过。

**复杂度：** 时间 O(n)，空间 O(n)。

**常见追问：**

- 为什么不能先 set 再查？可能同一个元素被用两次。
- 有重复数字怎么办？Map 可覆盖，但找到答案前不影响。
- 返回值是下标还是数字？按题目要求。

## 31. 最长无重复子串

**考点：** 滑动窗口、哈希表。

```js
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let left = 0;
  let max = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    max = Math.max(max, right - left + 1);
  }

  return max;
}
```

**15秒解释：** 用窗口维护无重复区间；遇到重复字符，就把左边界移动到上次出现位置之后。

**复杂度：** 时间 O(n)，空间 O(k)，k 是字符集大小。

**常见追问：**

- 为什么判断 `>= left`？忽略窗口外的旧重复字符。
- 返回子串怎么改？记录最大长度时同步记录起点。
- 中文字符怎么办？简单字符串索引按 UTF-16，严格场景用 Array.from。

## 32. 有效括号

**考点：** 栈。

```js
function isValidBrackets(s) {
  const stack = [];
  const map = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (stack.pop() !== map[ch]) {
      return false;
    }
  }

  return stack.length === 0;
}
```

**15秒解释：** 左括号入栈，右括号出现时必须和栈顶匹配，最后栈为空才合法。

**复杂度：** 时间 O(n)，空间 O(n)。

**常见追问：**

- 为什么用栈？括号匹配符合后进先出。
- 空字符串合法吗？通常合法。
- 包含其他字符怎么办？按题目要求忽略或返回 false。

# 高频背诵清单

1. 改 this：call/apply 临时挂对象，bind 返回新函数。
2. 原型链：new 创建对象并连接 prototype，instanceof 沿原型链查找。
3. 深拷贝：递归 + WeakMap 解决循环引用。
4. 防抖看最后一次，节流看固定频率。
5. Promise.all 全成功才成功，一失败就失败，结果按输入顺序。
6. 并发控制：维护 active 和 index，完成一个补一个。
7. 发布订阅：Map 保存事件和回调集合。
8. LRU：Map 删除再插入更新最近使用，超容量删最旧。
9. 事件委托：利用冒泡和 matches。
10. 响应式简版：track 收集依赖，trigger 触发 effect。
11. 算法最低掌握：哈希、栈、双指针、滑动窗口、递归。
12. 面试写代码要边界先说清楚：空值、重复、顺序、是否改变原数据。
