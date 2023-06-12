---
title: React useEffect 正确使用姿势
date: 2023-06-12
tags:
  - React
author: qinghuanI
location: wuhan
---

## 前言

自从 Meta 推出 React hooks 后，前端开发人员开始在项目中大量使用 hooks 方法，但是任何技术都有心智模型，React hooks 使用姿势不当会带来严重问题

本篇文章主要讲述在浏览器环境中，使用 React 框架需要注意的副作用，如何正确使用 React useEffect hook 方法，尽量避免未知问题

## 纯函数

在程序设计中，若一个函数符合以下要求，则它可能被认为是纯函数：

- 此函数在相同输入值时，需产生相同输出。函数的输出和输入值以外的其他隐藏信息或状态无关，也和由 I/O 设备产生的外部输出无关
- 该函数不能有语义上可观察的**函数副作用**，诸如 “触发事件”，使输出设备输出，或更改输出值以外物件的内容等

纯函数的输出可以不用和所有的输入值有关，甚至可以和所有的输入值都无关。但纯函数的输出不能和输入值以外的任何状态有关。纯函数可以传回多个输出值，但上述的原则需针对所有输出值都要成立。若引数是传引用调用，若有对参数物件的更改，就会影响函数以外物件的内容，因此就不是纯函数

![Side Effects](./images/react/side_effects.png)

在纯函数的定义中，可以发现提到一个非常重要的概念——函数副作用。那么什么是函数副作用？

副作用是在计算结果的过程中，系统状态的一种变化或者与外部世界进行的可观察的交互。换句大白话讲，只要涉及系统外状态的改变都是副作用。系统的副作用包括不限于如下：

- 网络请求
- 定时器
- console.log
- 在 DOM 元素上绑定事件
- 更改全局变量或应用状态

那么在 React 项目中，我们需要在 React useEffect 里处理这些副作用

## useEffect

由于副作用非常多，所以钩子有许多种。React 为许多常见的操作（副作用），都提供了专用的 hooks

- useState()：保存状态
- useContext()：保存上下文
- useRef()：保存引用

上面这些钩子，都是引入某种特定的副作用，而 useEffect() 是通用的副作用钩子

React useEffect 是一个接受两个参数的钩子函数。传递给 `useEffect` 的第一个参数是一个名为 `effect` 的函数，第二个参数（是可选的）是一个存储依赖关系的数组。下面是它的使用说明

```tsx
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { ReactElement } from "react";

const Example = (): ReactElement => {
  // scene1
  useEffect(() => {
    console.log("Effect called at every re-render");
  });

  // scene2
  useEffect(() => {
    // 此处是伪代码
    if (deps) {
      console.log("Effect called");
    }
  }, [deps]);

  return <h1> Hi, React hooks! </h1>;
};

const root = document.getElementById("root");
createRoot(root).render(<Example />);
```

- scene1 - 如果不传第二个参数，组件每次重渲染时，`useEffect` 里的 `effect` 都会执行。因此不推荐不传递第二个参数
- scene2 - 传递第二个参数，只要第二个参数的引用发生变化，`useEffect` 里的 `effect` 才会执行

> 特别说明 useEffect 的 effect 和 cleanup 执行逻辑，当组件 render 时，先执行 effect，等下一次 render 时，先执行上一次的 cleanup，再执行这一次的 effect

### 网络请求(http/websocket)

如果你不想在项目中使用 mobx/redux-saga 等第三方状态管理库处理网络请求，也可以在组件里获取数据。代码如下所示：

```tsx
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

const controller = new AbortController();
const signal = controller.signal;

function Example(): ReactElement {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    function fetchUsers(): void {
      // 伪代码
      fetch(url, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((users) => {
          setUsers(users);
        })
        .catch((err) => console.error("failed to fetch users", err));
    }

    void fetchUsers();

    return (): void => {
      controller.abort();
    };
  }, []);
  // ...
}

const root = document.getElementById("root");
createRoot(root).render(<Example />);
```

### 定时器(setInterval/setTimeout)

当组件里需要使用定时器函数时，我们需要在 useEffect 里处理定时器相关的业务逻辑，并在 `cleanup` 中清除定时器

```tsx
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

function Example(): ReactElement {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval((): void => {
      setCount((count) => count + 1);
    }, 1000);

    return (): void => {
      clearInterval(timer);
    };
  }, []);
  // ...
}

const root = document.getElementById("root");
createRoot(root).render(<Example />);
```

### 在 DOM 元素上绑定事件

在 React 中，由于有 vdom 概念，开发人员不需要操作 DOM，通常情况下，只需要使用 React 提供的合成事件。但是在某些业务场景下，依旧需要操作 DOM 元素，在 DOM 元素上绑定/取消事件，操作 DOM 元素需要放在 `useEffect` 里

在 DOM 元素上绑定事件后，一定要在 `cleanup` 中取消事件绑定，避免内存泄露

```tsx
import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

function Example(): ReactElement {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function listener() {
      console.log("it clicked!");
    }

    btnRef.current.addEventListener("click", listener);

    return () => {
      btnRef.current.removeEventListener("click", listener);
    };
  }, []);
  // ...

  return <button ref={btnRef}>click</button>;
}

const root = document.getElementById("root");
createRoot(root).render(<Example />);
```

### 更改全局变量或应用状态

在前端的业务里，更改全局变量的场景太多了，下面举个简单的例子

```tsx
import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

function Example(): ReactElement {
  useEffect(() => {
    document.title = "title 被改变了";
  }, []);
  // ...
}

const root = document.getElementById("root");
createRoot(root).render(<Example />);
```

### console.log

平常在写代码的过程中，调试代码需要在控制台查看变量，那么推荐在将该逻辑写在 `useEffect` 里，如下图所示

```tsx
import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

function Example(): ReactElement {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log("count =", count);
  }, [count]);
  // ...
}

const root = document.getElementById("root");
createRoot(root).render(<Example />);
```

## 与 useLayoutEffect 对比

`useEffect` 和 `useLayoutEffect` 是两个非常相似的 React hook

## 参考链接

- [React 官方文档](https://react.dev/reference/react/useEffect)
- [纯函数](https://zh.wikipedia.org/wiki/%E7%BA%AF%E5%87%BD%E6%95%B0)
- [轻松学会 React 钩子：以 useEffect () 为例](https://www.ruanyifeng.com/blog/2020/09/react-hooks-useeffect-tutorial.html)
