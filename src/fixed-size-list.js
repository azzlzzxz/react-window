/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-18 17:23:01
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-23 13:14:33
 * @FilePath: /VirtualList/src/fixed-size-list.js
 */
import React from "react";
import { FixedSizeList } from "./react-window";
import "./fixed-size-list.css";

const Row = ({index, style}) => {
    return(
    <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
        Row{index}
    </div>
    )
}

const App = () => {
  return (
    <FixedSizeList
      className="List"
      height={200}
      width={300}
      itemSize={50}
      itemCount={1000}
    >
      {Row}
    </FixedSizeList>
  );
};

export default App;
