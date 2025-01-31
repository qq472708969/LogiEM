import { ECOption } from "./components/line";
import React from "react";
import { Tooltip } from "antd";
import moment from "moment";
import { toFixedNum } from "lib/utils";

 // 图表单位映射
export const unitMap = {
  none: {
    // 图表单位名称
    name: "",
    // 图表数据格式化
    formatter: toFixedNum,
  },
  percent: {
    name: "%",
    formatter: toFixedNum,
  },
  count: {
    name: "个",
    formatter: toFixedNum,
  },
  GB: {
    name: "GB",
    formatter: (num) => {
      return toFixedNum(num / 1024 / 1024 / 1024, 3);
    },
  },
  MB: {
    name: "MB",
    formatter: (num) => {
      return toFixedNum(num / 1024 / 1024, 3);
    },
  },
  ms: {
    name: "ms",
    formatter: toFixedNum,
  },
  countS: {
    name: "个/s",
    formatter: (num) => {
      return toFixedNum(num, 1);
    },
  },
  mbS: {
    name: "MB/s",
    formatter: (num) => {
      return toFixedNum(num / 1024 / 1024, 3);
    },
  },
  s: {
    name: "s",
    formatter: toFixedNum,
  },
  numS: {
    name: "次",
    formatter: toFixedNum,
  },
  ss: {
    name: "次/s",
    formatter: (num) => {
      return toFixedNum(num, 3);
    },
  },
  mins: {
    name: "次/min",
    formatter: toFixedNum,
  },
  item: {
    name: "条",
    formatter: toFixedNum,
  },
  itemMin: {
    name: "条/min",
    formatter: toFixedNum,
  },
  byte: {
    name: "Bytes",
    formatter: toFixedNum,
  },
};

// 图表标题
const title = function () {
  const unit = this.unit.name ? `(${this.unit.name})` : "";
  return this.name + unit;
}

// 给图标的指标项添加标题
export const addChartTitle = (data: {[key: string]: any}) => {
  for(let key in data) {
    data[key].title = title;
  }
}

export const colorList = [
  "#5B73F0",
  "#5998FF",
  "#3DDCDC",
  "#21CAB8",
  "#89D9CA",
  "#BCE2E8",
  "#CBE681",
  "#FFEE8F",
  "#F3D930",
  "#F0BC18",
  "#F7B977",
  "#FF9C6E",
  "#FF8686",
  "#FF7043",
  "#E17B34",
  "#EB767F",
  "#FF85C0",
  "#B88EFA",
  "#B37FEB",
  "#7779FF",
  "#7F6DE7",
  "#A5A0EE",
  "#9DABF6",
  "#C4CCF9",
  "#A0BDEE",
  "#89C3EB",
  "#85CFF3",
  "#C2E8FA",
  "#EAEEFA",
];

export interface metricsContentsType {
  metricsContentCells: { timeStamp: number; value: number }[];
  name: string;
}
export interface metricsType {
  metricsContents: metricsContentsType[];
  type: string;
}

interface seriesType {
  name: string;
  data: number[] | { timestamp: number; value: number }[];
}

const markLine = (val1 = 50000, val2 = 100000) => ({
  data: [
    {
      name: "预警线5W",
      yAxis: val1,
      label: {
        formatter: "{b}",
        position: "insideStartTop",
      },
      lineStyle: {
        color: "#F39419",
      },
    },
    {
      name: "预警线10w",
      yAxis: val2,
      label: {
        formatter: "{b}",
        position: "insideStartTop",
      },
      lineStyle: {
        color: "#F11919",
      },
    },
  ],
});

// 图表 tooltip 展示的样式
const tooltipFormatter = (date, arr, unit, isShowTooltipModal, metricsType) => {
  const str = arr
    .map(
      (item) => `<div style="margin: 3px 0;line-height:1;">
          <div style="margin: 0px 0 0;line-height:1;">
          ${item.marker}
          <span style="font-size:14px;color:#666;font-weight:400;margin-left:2px;${isShowTooltipModal ? 'cursor: pointer' : ''}" 
            ${isShowTooltipModal ? `onclick="window.showTooltipModal('${item.seriesName}', '${metricsType}')"}` : ""}>
              ${item.seriesName}
            </span>
            <span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">
              ${item.value > 10000
              ? toFixedNum(item.value / 10000, 2) + "W"
              : item.value
            } ${unit || ""}
            </span>
            <div style="clear:both"></div>
          </div>
          <div style="clear:both"></div>
        </div>
      <div style="clear:both"></div>`
    )
    .join("");

  return `<div style="margin: 0px 0 0;line-height:1; position: relative; z-index: 99;">
    <div style="margin: 0px 0 0;line-height:1;">
      <div style="font-size:14px;color:#666;font-weight:400;line-height:1;">
        ${date}
      </div>
      <div style="margin: 10px 0 0;line-height:1;">
        ${str}
      </div>
      <div style="clear:both"></div>
    </div>
  </div>`;
};

// 图表 tooltip 展示位置
const tooltipPosition = (pos, params, dom, rect, size, showLegend) => {
  const [x, y] = pos;
  const [width, height] = size.viewSize;

  let domHeight = (dom as any).offsetHeight;
  
  if(domHeight > 350) {
    domHeight = 250;
  }
  
  const domWidth = (dom as any).offsetWidth || 390;
  
  const obj = { top: y - domHeight - 10 };

  // showLegend 是否展示左侧 legend 
  const chartPosition =  showLegend ?  width / 2 - 100 : width / 2 - 20;

  if(x > chartPosition) {
    // 在鼠标左侧展示
    obj["left"] = x - domWidth - 10;
  } else {
    // 在鼠标右侧展示
    obj["left"] = x + 10;
  }
 
  return obj;
};

// 判断 ms 是否需要转换成 s，只判断峰值
const isConversion = (series) => {
  return series.some((item) => {
    return item.data.some((item) => {
      if (typeof item == "object") {
        if (item.value > 1000) {
          return true;
        }
      }
      return item > 1000;
    })
  });
}
interface lineOptionType {
  title: string,
  xAxisData: number[],
  series: seriesType[],
  unitMap?: { [key: string]: any },
  isMoreDay?: boolean,
  isMarkLine?: boolean,
  color?: string[],
  isShowTooltipModal?: boolean,
  metricsType?: string
  showLegend?: boolean
}

export const getLineOption = ({
  title,
  xAxisData,
  series,
  // 单位名称，单位格式化
  unitMap,
  // 是否大于一天
  isMoreDay = false,
  // 是否展示警戒线
  isMarkLine = false,
  color = colorList,
  // 是否展示可以点击 Tooltip 并展示弹窗 
  isShowTooltipModal = false,
  // 后端图表指标名称，帮助弹窗获取数据
  metricsType,
  // 是否显示左侧 legend
  showLegend = true,
}: lineOptionType) => {
  let seriesData;
  let unitFormatter = unitMap.formatter;
  let unitName = unitMap.name;

  if (unitFormatter) {
    // 根据数值大小判断单位是否需要进行转换
    if (unitName === 'ms' && isConversion(series)) {
      unitFormatter = (num) => {
        let val = Number(num);
        return toFixedNum(val / 1000, 3);
      }
      unitName = 's';
      title = title.replace('ms', 's');
    }

    seriesData = series.map((item) => ({
      name: item?.name || "",
      data: item.data.map((item) => {
        if (typeof item == "object") {
          return {
            timestamp: item.timestamp,
            value: unitFormatter(item.value),
          };
        }
        return unitFormatter(item);
      }),
      type: "line",
      markLine: isMarkLine ? markLine() : {},
      showSymbol: false,
    }));
  } else {
    seriesData = series.map((item) => ({
      ...item,
      type: "line",
      markLine: isMarkLine ? markLine() : {},
      showSymbol: false,
    }));
  }

  return {
    color: color,
    title: {
      text: title,
      top: showLegend ? "20" : 0,
      left: showLegend ? "20" : 0,
    },
    tooltip: {
      trigger: "axis",
      position: (pos, params, dom, rect, size,) => {
        return tooltipPosition(pos, params, dom, rect, size, showLegend)
      },
      formatter: (params: any) => {
        let res = "";
        if (params != null && params.length > 0) {
          res += tooltipFormatter(
            moment(Number(params[0].name)).format("YYYY-MM-DD HH:mm"),
            params,
            unitName,
            isShowTooltipModal,
            metricsType
          );
        }
        return res;
      },
    },
    legend: showLegend ? {
      type: "scroll",
      orient: "vertical",
      right: "5%",
      top: "20%",
      bottom: "20%",
      icon: "rect",
      itemHeight: 2,
      itemWidth: 12,
      textStyle: {
        width: 70,
        overflow: "truncate",
        ellipsis: "...",
      },
      tooltip: {
        show: true,
      },
    } : null,
    grid: {
      left: showLegend ? "20" : 0,
      right: showLegend ? "25%" : 20,
      bottom: showLegend ? "3%" : 0,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [...xAxisData],
      axisLabel: {
        formatter: (value: number) => {
          value = Number(value);
          if (!isMoreDay) {
            return moment(value).format("HH:mm");
          } else {
            return (
              moment(value).format("HH:mm") +
              "\n" +
              moment(value).format("MM/DD")
            );
          }
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: function (value) {
          if (value < 10000) {
            return value;
          }
          return Math.ceil(value / 10000) + "W";
        },
      },
    },
    series: [...seriesData],
    animation: false,
  } as ECOption;
};

export const getOption = (
  metrics: metricsType,
  configData,
  isMoreDay: boolean = false,
  isMarkLine: boolean = false,
  isShowTooltipModal: boolean = false,
  showLegend: boolean = true
) => {
  if (!metrics || !metrics.type) {
    return {};
  }

  const title =
    (configData[metrics.type] && configData[metrics.type].title()) ||
    metrics.type;

  const xAxisData = [];

  const series = metrics.metricsContents.map((item, index) => ({
    name: item.name,
    data: item.metricsContentCells.sort((a, b) => a.timeStamp - b.timeStamp).map((item) => {
      if (index === 0) {
        xAxisData.push(item.timeStamp);
      }
      return {
        value: item.value,
        timestamp: item.timeStamp,
      };
    }),
  }));

  return getLineOption({
    title,
    xAxisData,
    series,
    unitMap: configData[metrics.type].unit,
    isMoreDay,
    isMarkLine,
    isShowTooltipModal,
    metricsType: metrics.type,
    showLegend
  });
};

export const objFlat = (data: { [key: string]: any[] }) => {
  const arr = [];

  for (let key in data) {
    arr.push(...data[key]);
  }

  return arr;
};

export const ellipsis = (
  str: string | number,
  num: number,
  unit: string = ""
) => {
  return String(str).length > num ? (
    <Tooltip placement="top" title={`${str}${unit || ""}`}>
      {String(str).substring(0, num) + "..."}
      {unit}
    </Tooltip>
  ) : (
    str + unit
  );
};

export interface IPeriod {
  label: string;
  key: string;
  dateRange: [number, moment.Moment];
}

const oneHour = 1000 * 60 * 60;
const oneDay = 24 * oneHour;

export const PERIOD_RADIO = [
  {
    label: "近1小时",
    key: "oneHour",
    get dateRange() {
      const timestamp = new Date().getTime();
      return [moment(timestamp - oneHour), moment(timestamp)];
    },
  },
  {
    label: "近1天",
    key: "oneDay",
    get dateRange() {
      const timestamp = new Date().getTime();
      return [moment(timestamp - oneDay), moment(timestamp)];
    },
  },
  {
    label: "近3天",
    key: "threeDay",
    get dateRange() {
      const timestamp = new Date().getTime();
      return [moment(timestamp - oneDay * 3), moment(timestamp)];
    },
  },
  {
    label: "近7天",
    key: "sevenDay",
    get dateRange() {
      const timestamp = new Date().getTime();
      return [moment(timestamp - oneDay * 7), moment(timestamp)];
    },
  },
] as IPeriod[];

const periodRadioMap = new Map<string, IPeriod>();

PERIOD_RADIO.forEach((p) => {
  periodRadioMap.set(p.key, p);
});

export const PERIOD_RADIO_MAP = periodRadioMap;

export const formatterTimeYMDHMS = (timestamp) => {
  return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
};
