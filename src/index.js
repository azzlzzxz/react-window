/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-16 16:28:26
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-23 17:43:42
 * @FilePath: /VirtualList/src/index.js
 */
import React from "react";
import ReactDOM from "react-dom/client";
import FixedSizeList from "./fixed-size-list";
import VariableSizeList from "./variable-size-list";
import DynamicSizeList from "./dynamic-size-list";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div>固定高度列表</div>
    <FixedSizeList />
    <br />
    <div>不固定高度列表</div>
    <VariableSizeList />
    <br />
    <div>动态高度列表</div>
    <DynamicSizeList />
  </React.StrictMode>
);
