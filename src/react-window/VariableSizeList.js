/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-16 17:00:49
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-23 17:29:49
 * @FilePath: /VirtualList/src/react-window/VariableSizeList.js
 */
// createListComponent 为了方便代码复用，高阶函数组件
import createListComponent from "./createListComponent2";

const DEFAULT_ESTIMATED_SIZE = 50; // 条目默认高度（根据真实情况动态调整）

const getEstimatedTotalSize = (
  { itemCount },
  { estimatedItemSize, itemMetadataMap, lastMeasureIndex }
) => {
  // 测量过的总高度
  let totalSizeOfMeasuredItems = 0;
  if (lastMeasureIndex >= 0) {
    const itemMetaData = itemMetadataMap[lastMeasureIndex];
    totalSizeOfMeasuredItems = itemMetaData.offset + itemMetaData.size;
  }
  // 未测量过的条目数量
  const numUnMeasuredItems = itemCount - lastMeasureIndex - 1;
  // 未测量过的条目总高度
  const totalSizeofUnMeasuresItems = numUnMeasuredItems * estimatedItemSize;

  // 总高度 = 测量过的高度 + 未测量过的预估高度
  return totalSizeofUnMeasuresItems + totalSizeOfMeasuredItems;
};

const findNearestItem = (props, offset, instanceProps) => {
  // debugger
  const { lastMeasureIndex, itemMetadataMap } = instanceProps;
  //   for (let index = 0; index < lastMeasureIndex; index++) {
  //     const currentOffset = getItemMetaData(props, index, instanceProps).offset;
  //     // currentOffset:当前条目的offset，offset:容器向上卷去的高度(scrollTop)
  //     if (currentOffset >= offset) {
  //       return index;
  //     }
  //   }
  //   return 0;

  let lastMeasureItemOffset =
    lastMeasureIndex > 0 ? itemMetadataMap[lastMeasureIndex].offset : 0;
  // 最后测量过的条目的offset > 容器卷去的高度，说明此卷去的高度对应的条目已测量过，直接查找
  if (lastMeasureItemOffset >= offset) {
    return findNearestItemBinarySearch(
      props,
      instanceProps,
      lastMeasureIndex,
      0,
      offset
    );
  } else {
    // 滚动过快，导致offset很大，出现白屏
    return findNearestItemExponentialSearch(
      props,
      instanceProps,
      Math.max(0, lastMeasureIndex),
      offset
    );
  }
};

// 二分查找
const findNearestItemBinarySearch = (
  props,
  instanceProps,
  high,
  low,
  offset
) => {
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const currentOffset = getItemMetaData(props, middle, instanceProps).offset;
    if (currentOffset === offset) {
      return middle;
    } else if (currentOffset < offset) {
      low = middle + 1;
    } else if (currentOffset > offset) {
      high = middle - 1;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};

// 指数递增查找
const findNearestItemExponentialSearch = (
  props,
  instanceProps,
  index,
  offset
) => {
  const { itemCount } = props;
  let interval = 1;
  while (
    index < itemCount &&
    getItemMetaData(props, index, instanceProps).offset < offset
  ) {
    index += interval;
    interval *= 2;
  }

  return findNearestItemBinarySearch(
    props,
    instanceProps,
    Math.min(index, itemCount - 1),
    Math.floor(index / 2), // 找到的这个在index/2 -> index 之间
    offset
  );
};

// 获取每个条目源数据
const getItemMetaData = (props, index, instanceProps) => {
  const { itemSize } = props;
  const { itemMetadataMap, lastMeasureIndex } = instanceProps;
  // 当想要获取的条目索引比上一次测量过的索引大，说明此条目未被测量，不知道此条目的真实size、offset
  if (index > lastMeasureIndex) {
    let offset = 0;
    if (lastMeasureIndex >= 0) {
      // 获取最后一个测量过的源数据
      const itemMeatData = itemMetadataMap[lastMeasureIndex];
      // 最后一个测量过的条目的size+offset = 下一个的offset
      offset = itemMeatData.size + itemMeatData.offset;
    }
    // 找到这个未被测量的条目
    for (let i = lastMeasureIndex + 1; i <= index; i++) {
      //通过调用itemSize方法获取此索引对应的条目的高度
      const size = itemSize(i);
      // 保存条目的size，offset
      itemMetadataMap[i] = { size, offset };
      // 下一条目的offset = 自己的offset + 自己的高度size
      offset += size;
    }
    // 让最后一次测量过的索引=当前index
    instanceProps.lastMeasureIndex = index;
  }
  return itemMetadataMap[index];
};

const VariableSizeList = createListComponent({
  // 获取预计高度(条目高度*个数)(先把容器撑起来，之后动态计算高度)
  getEstimatedTotalSize,
  // 获取条目高度
  getItemSize: (props, index, instanceProps) =>
    getItemMetaData(props, index, instanceProps).size,
  // 获取每个条目的偏移量(条目高度*索引)
  getItemOffset: (props, index, instanceProps) =>
    getItemMetaData(props, index, instanceProps).offset,
  // 根据卷去的高度计算开始索引
  getStartIndexForOffset: (props, offset, instanceProps) =>
    findNearestItem(props, offset, instanceProps),
  // 根据开始索引和容器高度计算结束索引
  getStopIndexForStart: (props, startIndex, scrollOffset, instanceProps) => {
    const { height, itemCount } = props;
    // 获取开始索引条目的源数据
    const itemMetaData = getItemMetaData(props, startIndex, instanceProps);
    // 获取最大offset值(开始条目的offset+容器高度)
    const maxOffset = itemMetaData.offset + height;
    // 开始条目的下一个条目的offset
    let offset = itemMetaData.offset + itemMetaData.size;

    let stopIndex = startIndex;
    // 不要越界 && offset < 最大offset
    while (stopIndex < itemCount - 1 && offset < maxOffset) {
      stopIndex++;
      // 每次索引+1，offset+当前条目的高度
      offset += getItemMetaData(props, stopIndex, instanceProps).size;
    }
    return stopIndex;
  },
  // 存放每个条目的高度和偏移量
  initInstanceProps: (props) => {
    // 获取预估的条目高度
    const { estimatedItemSize } = props;
    // 在渲染过程中测量每个条目的真实高度和top值
    const instanceProps = {
      // 预计条目高度
      estimatedItemSize: estimatedItemSize || DEFAULT_ESTIMATED_SIZE,
      // 记录每个条目信息: {size: 每个索引对应条目的高度, offset: 每个索引对用条目的top值(偏移量)}
      itemMetadataMap: {},
      // 上一个测量过的索引
      lastMeasureIndex: -1,
    };
    return instanceProps;
  },
});

export default VariableSizeList;
