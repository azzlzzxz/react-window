/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-18 22:09:00
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-19 17:59:40
 * @FilePath: /VirtualList/src/variable-size-list.js
 */
import React from "react";
import { VariableSizeList } from "./react-window";
import "./variable-size-list.css";

const rowSizes = new Array(1000)
  .fill(true)
  .map(() => 25 + Math.round(Math.random() * 50));

const getItemSize = index => rowSizes[index];
 
const Row = ({ index, style, forwardRef }) => {
  return (
    <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style} ref={forwardRef}>
      Row{index}
    </div>
  );
};

const App = () => {
  return (
    <VariableSizeList
      className="List"
      height={200}
      width={300}
      itemSize={getItemSize}
      itemCount={1000}
    >
      {Row}
    </VariableSizeList>
  );
};

export default App;
