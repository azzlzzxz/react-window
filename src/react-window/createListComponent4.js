/*
 * @Author: xinxu azzlzzxz@gmail.com
 * @Date: 2022-06-18 17:40:52
 * @LastEditors: xinxu azzlzzxz@gmail.com
 * @LastEditTime: 2022-06-23 13:09:57
 * @FilePath: /VirtualList/src/react-window/createListComponent4.js
 */
import React from "react";

class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
    this.resizeObserver = null; // 尺寸观察器
  }

  componentDidMount() {
    if (this.domRef.current) {
      const domNode = this.domRef.current.firstChild;
      const { index, onSizeChange } = this.props;
      this.resizeObserver = new ResizeObserver(() => {
        onSizeChange(index, domNode);
      });
      this.resizeObserver.observe(domNode);
    }
  }

  componentWillUnmount() {
    if (this.resizeObserver && this.domRef.current.firstChild) {
      this.resizeObserver.unobserve(this.domRef.current.firstChild);
    }
  }

  render() {
    const { style, index, ComponentType } = this.props;
    return (
      <div style={style} ref={this.domRef}>
        <ComponentType index={index} />
      </div>
    );
  }
}

function createListComponent({
  getEstimatedTotalSize,
  getItemSize,
  getItemOffset,
  getStartIndexForOffset,
  getStopIndexForStartIndex,
  initInstanceProps,
}) {
  return class extends React.Component {
    initInstanceProps = initInstanceProps && initInstanceProps(this.props);
    state = { scrollOffset: 0 }; // 👆卷去的高度
    itemStyleCache = new Map(); // 存放每个条目的样式缓存
    outerRef = React.createRef();
    oldFirstRef = React.createRef();
    oldLastRef = React.createRef();
    firstRef = React.createRef();
    lastRef = React.createRef();
    static defaultProps = {
      overScanCount: 2, // 每次向上/向下划动时多渲染2条，作为缓冲
    };

    // 初次渲染
    componentDidMount() {
      this.observe((this.oldFirstRef.current = this.firstRef.current)); // 观察第一条
      this.observe((this.oldLastRef.current = this.lastRef.current)); // 观察最后一条
    }

    // 每次更新后
    componentDidUpdate() {
      if (this.oldFirstRef.current !== this.firstRef.current) {
        this.observe(this.firstRef.current);
        this.oldFirstRef.current = this.firstRef.current;
      }
      if (this.oldLastRef.current !== this.lastRef.current) {
        this.observe(this.lastRef.current);
        this.oldLastRef.current = this.lastRef.current;
      }
    }

    observe = (dom) => {
      let observerOuter = new IntersectionObserver(
        (entries) => {
          // 被观察的条目
          entries.forEach(() => this.onScroll());
        },
        { root: this.outerRef.current }
      );
      // 容器观察dom进入、离开
      observerOuter.observe(dom);
    };

    // 当DOM尺寸发生变化的回调
    onSizeChange = (index, domNode) => {
      // 获取DOM真实高度
      const height = domNode.offsetHeight;
      const { itemMetadataMap, lastMeasureIndex } = this.initInstanceProps;
      const itemMetaData = itemMetadataMap[index];
      // 更改条目源数据
      itemMetaData.size = height;
      let offset = 0;
      for (let i = 0; i <= lastMeasureIndex; i++) {
        const itemMetadata = itemMetadataMap[i];
        itemMetadata.offset = offset;
        offset = offset + itemMetadata.size;
      }
      this.itemStyleCache.clear();
      this.forceUpdate();
    };

    render() {
      const { width, height, itemCount, children: ComponentType } = this.props;
      const containerStyle = {
        position: "relative",
        width,
        height,
        overflow: "auto",
        willChange: "transform",
      };
      const contentStyle = {
        width: "100%",
        height: getEstimatedTotalSize(this.props, this.initInstanceProps),
      };
      const items = [];
      if (itemCount > 0) {
        // 获取渲染范围
        const [startIndex, stopIndex, originStartIndex, originStopIndex] =
          this.getRangeToRender();
        for (let index = startIndex; index <= stopIndex; index++) {
          const style = this.getItemStyle(index);
          if (index === originStartIndex) {
            items.push(
              <React.Fragment key={index}>
                <span
                  ref={this.firstRef}
                  style={{ ...style, width: 0, height: 0 }}
                ></span>
                <ListItem
                  index={index}
                  style={style}
                  ComponentType={ComponentType}
                  onSizeChange={this.onSizeChange}
                />
              </React.Fragment>
            );
          } else if (index === originStopIndex) {
            items.push(
              <React.Fragment key={index}>
                <span
                  ref={this.lastRef}
                  style={{ ...style, width: 0, height: 0 }}
                ></span>
                <ListItem
                  index={index}
                  style={style}
                  ComponentType={ComponentType}
                  onSizeChange={this.onSizeChange}
                />
              </React.Fragment>
            );
          } else {
            items.push(
              <ListItem
                key={index}
                index={index}
                style={style}
                ComponentType={ComponentType}
                onSizeChange={this.onSizeChange}
              />
            );
          }
        }
      }

      return (
        <div style={containerStyle} ref={this.outerRef}>
          <div style={contentStyle}>{items}</div>
        </div>
      );
    }
    // 监听滚动事件
    onScroll = () => {
      const { scrollTop } = this.outerRef.current; // 向上卷去的高度
      this.setState({ scrollOffset: scrollTop });
    };
    // 获取容器内渲染范围
    getRangeToRender = () => {
      const { scrollOffset } = this.state;
      const { overScanCount, itemCount } = this.props;
      const startIndex = getStartIndexForOffset(
        this.props,
        scrollOffset,
        this.initInstanceProps
      );
      const stopIndex = getStopIndexForStartIndex(
        this.props,
        startIndex,
        scrollOffset,
        this.initInstanceProps
      );
      return [
        Math.max(0, startIndex - overScanCount),
        Math.min(itemCount - 1, stopIndex + overScanCount),
        startIndex,
        stopIndex,
      ];
    };
    // 获取每个条目样式
    getItemStyle = (index) => {
      let style;
      if (this.itemStyleCache.has(index)) {
        style = this.itemStyleCache.get(index);
      } else {
        style = {
          position: "absolute",
          width: "100%",
          height: getItemSize(this.props, index, this.initInstanceProps),
          top: getItemOffset(this.props, index, this.initInstanceProps),
        };
        this.itemStyleCache.set(index, style);
      }
      return style;
    };
  };
}

export default createListComponent;
