/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-19 20:38:19
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-19 22:45:37
 * @FilePath: /VirtualList/src/dynamic-size-list.js
 */
import React from "react";
import { DynamicSizeList } from "./react-window";
import "./fixed-size-list.css";

const items = [];
const itemCount = 1000;
for (let i = 0; i < itemCount; i++) {
  // const height = 30 + Math.floor(Math.random() * 20) + "px";
  const style = {
    // height,
    width: "100%",
    backgroundColor: i % 2 ? "green" : "orange",
    display: "flex",
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: "center",
  };
  items.push(
    <div style={style}>
      Row{i}
      {i % 2 ? (
        <img
          src="https://static.tuandongdong.cn/dev/pic/20220523/263d5664746202c8af5eaf7074236c9e.png?x-oss-process=image/auto-orient,1/resize,m_lfit,w_120"
          alt=""
        />
      ) : (
        ""
      )}
    </div>
  );
}

const Row = ({ index }) => items[index];

const App = () => {
  return (
    <DynamicSizeList
      className="List"
      height={200}
      width={300}
      itemCount={itemCount}
    >
      {Row}
    </DynamicSizeList>
  );
};

export default App;
