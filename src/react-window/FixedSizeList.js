/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-16 17:00:49
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-18 22:26:25
 * @FilePath: /VirtualList/src/react-window/FixedSizeList.js
 */
// createListComponent 为了方便代码复用，高阶函数组件
import createListComponent from "./createListComponent1";

const FixedSizeList = createListComponent({
  // 获取预计高度(条目高度*个数)
  getEstimatedTotalSize: ({ itemSize, itemCount }) => itemSize * itemCount,
  getItemSize: ({ itemSize }) => itemSize,
  // 获取每个条目的偏移量(条目高度*索引)
  getItemOffset: ({ itemSize }, index) => itemSize * index,
  // 根据卷去的高度计算开始索引
  getStartIndexForOffset: ({ itemSize }, offset) =>
    Math.floor(offset / itemSize),
  // 根据开始索引和容器高度计算结束索引
  getStopIndexForStart: ({ height, itemSize }, startIndex) => {
    const numVisibleItems = Math.ceil(height / itemSize);
    return startIndex + numVisibleItems - 1;
  },
});

export default FixedSizeList;
