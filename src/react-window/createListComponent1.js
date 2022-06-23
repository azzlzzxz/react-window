/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-18 17:40:52
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-23 13:14:46
 * @FilePath: /VirtualList/src/react-window/createListComponent1.js
 */
import React from "react";

function createListComponent({
  getEstimatedTotalSize,
  getItemSize,
  getItemOffset,
  getStartIndexForOffset,
  getStopIndexForStart,
}) {
  return class extends React.Component {
    static defaultProps = {
      overScanCount: 2, // 每次向上/向下划动时多渲染2条，作为缓冲
    };
    state = { scrollOffset: 0 }; // 👆卷去的高度
    render() {
      const { width, height, itemCount, children: Row } = this.props;
      const containerStyle = {
        position: "relative",
        width,
        height,
        overflow: "auto",
        willChange: "transform",
      };
      const contentStyle = {
        width: "100%",
        height: getEstimatedTotalSize(this.props),
      };
      const items = [];
      if (itemCount > 0) {
        // 获取渲染范围
        const [startIndex, stopIndex] = this.getRangeToRender();
        for (let index = startIndex; index <= stopIndex; index++) {
          items.push(
            <Row key={index} index={index} style={this.getItemStyle(index)} />
          );
        }
      }

      return (
        <div style={containerStyle} onScroll={this.onScroll}>
          <div style={contentStyle}>{items}</div>
        </div>
      );
    }
    // 监听滚动事件
    onScroll = (event) => {
      const { scrollTop } = event.currentTarget; // 向上卷去的高度
      this.setState({ scrollOffset: scrollTop });
    };
    // 获取容器内渲染范围
    getRangeToRender = () => {
      const { scrollOffset } = this.state;
      const { overScanCount, itemCount } = this.props;
      const startIndex = getStartIndexForOffset(this.props, scrollOffset);
      const stopIndex = getStopIndexForStart(this.props, startIndex);
      return [
        Math.max(0, startIndex - overScanCount),
        Math.min(itemCount - 1, stopIndex + overScanCount),
        startIndex,
        stopIndex,
      ];
    };
    // 获取每个条目样式
    getItemStyle = (index) => {
      const style = {
        position: "absolute",
        width: "100%",
        height: getItemSize(this.props),
        top: getItemOffset(this.props, index),
      };
      return style;
    };
  };
}

export default createListComponent;
