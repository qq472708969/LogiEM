import { IMenuItem, IBaseInfo } from "@types/base-types";
import {
  IOpPhysicsClusterDetail,
  ITemplateSrvData,
} from "@types/cluster/cluster-types";
import React from "react";
import {
  DeleteOutlined,
  EditOutlined,
  EditTwoTone,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Modal, Tooltip, notification, message, Input } from "antd";
import { cellStyle } from "constants/table";
import { ROLE_TYPE, ROLE_TYPE_NO, colorTheme, isOpenUp } from "constants/common";
import { ClusterInfo } from "./base-info";
import { IndexList } from "./index-list";
import { NavRouterLink, renderOperationBtns } from "container/custom-component";
import { PlugnList } from "./plugn-list";
import moment from "moment";
import { timeFormat } from "constants/time";
import {
  INDEX_AUTH_TYPE_MAP,
  opTemplateIndexRoleMap,
  PHY_CLUSTER_TYPE,
} from "constants/status-map";
import { IPlug } from "@types/plug-types";
import { IWorkOrder } from "@types/params-types";
import { submitWorkOrder } from "api/common-api";
import { editPlug, userDelPlug } from "api/plug-api";
import store from "store";
import { IPhyConfig } from "@types/cluster/physics-type";
import { PhysicsConfigInfo } from "./physics-config-info.tsx";
import { IIndex, INodeDivide } from "@types/index-types";
import { NodeDivide } from "./node-divide";
import { opNodeStatusMap } from "./constants";
import { clusterRegionDelete } from "api/op-cluster-region-api";
import {
  deletePhysicsClusterTemplateSrv,
  setPhysicsClusterTemplateSrv,
} from "api/cluster-api";
import { ITableBtn } from "component/dantd/dtable";
import { EditList } from "./edit-list";
import { PageIFrameContainer } from 'container/iframe-page';

const appInfo = {
  app: store.getState().app,
  user: store.getState().user,
};

export enum TAB_LIST_KEY {
  info = "info",
  index = "index",
  indexTemplate = "indexTemplate",
  search = "search",
  monitor = "monitor",
  pluggin = "pluggin",
  node = "node",
  region = "region",
  diary = "diary",
  editList = 'editList',
  sense = 'sense',
}

export const TAB_LIST = [
  {
    name: "集群概览",
    key: TAB_LIST_KEY.info,
    content: (logicBaseInfo: IOpPhysicsClusterDetail) => (
      <ClusterInfo phyBaseInfo={logicBaseInfo} />
    ),
  },
  {
    name: "动态配置",
    key: TAB_LIST_KEY.editList,
    content: () => (
      <EditList />
    ),
  },
  {
    name: "静态配置",
    key: TAB_LIST_KEY.node,
    content: (logicBaseInfo: IOpPhysicsClusterDetail) => <PhysicsConfigInfo />,
  },
  // {
  //   name: "物理模版",
  //   key: TAB_LIST_KEY.index,
  //   content: (logicBaseInfo: IOpPhysicsClusterDetail) => <IndexList />,
  // },
  {
    name: "节点划分",
    key: TAB_LIST_KEY.indexTemplate,
    content: (logicBaseInfo: IOpPhysicsClusterDetail) => <NodeDivide />,
  },
  {
    name: "Sense管控",
    key: TAB_LIST_KEY.sense,
    content: () => <div style={{ height: '700px' }}><PageIFrameContainer src={`/console/arius/kibana7/app/kibana#/dev_tools/console`} /></div>,
  },
  {
    name: "插件列表",
    key: TAB_LIST_KEY.pluggin,
    content: (logicBaseInfo: IOpPhysicsClusterDetail) => <PlugnList />,
  }
];

const menuMap = new Map<string, IMenuItem>();
TAB_LIST.forEach((d) => {
  menuMap.set(d.key, d);
});

export const DETAIL_MENU_MAP = menuMap;

export const baseInfo: any = [
  [
    {
      label: "ES版本",
      key: "esVersion",
    },
    {
      label: "Gateway地址",
      key: "gatewayAddress",
    },
  ],
  [
    {
      label: "读地址",
      key: "httpAddress",
      render: (value: string) => (
        <>
          <span>
            {value?.length > 56 ? (
              <Tooltip title={value}>{value?.substring(0, 54) + "..."}</Tooltip>
            ) : (
              value
            )}
          </span>
        </>
      ),
    },
    {
      label: "创建时间",
      key: "createTime",
      render: (time: number) => moment(time).format(timeFormat),
    },
  ],
  [
    {
      label: "写地址",
      key: "httpWriteAddress",
      render: (value: string) => (
        <>
          <span>
            {value?.length > 56 ? (
              <Tooltip title={value}>{value?.substring(0, 54) + "..."}</Tooltip>
            ) : (
              value
            )}
          </span>
        </>
      ),
    },
    {
      label: "描述",
      key: "desc",
      render: (value: string) => (
        <>
          <span>
            {value?.length > 56 ? (
              <Tooltip title={value}>{value?.substring(0, 54) + "..."}</Tooltip>
            ) : (
              value || '-'
            )}
          </span>
        </>
      ),
    },
  ],
];

const formatNodeInfo = (node: any, str: string) => {
  const esRoleClusterVOSItem = node?.find((item: any) => {
    return item?.role === str;
  });
  const machineSpecArr = esRoleClusterVOSItem?.machineSpec.split("-");
  return esRoleClusterVOSItem
    ? `${esRoleClusterVOSItem.podNumber} * CPU${machineSpecArr[0]}核-内存${
        machineSpecArr[1] || "(-)"
      }-磁盘${machineSpecArr[2] || "(-)"}`
    : "-";
};

export const configInfo: any = [
  [
    {
      label: "Masternode",
      key: "esRoleClusterVOS",
      render: (value: any) => (
        <>
          <span>{formatNodeInfo(value, "masternode")}</span>
        </>
      ),
    },
    {
      label: "Datanode",
      key: "esRoleClusterVOS",
      render: (value: any) => (
        <>
          <span>{formatNodeInfo(value, "datanode")}</span>
        </>
      ),
    },
  ],
  [
    {
      label: "Clientnode",
      key: "esRoleClusterVOS",
      render: (value: any) => (
        <>
          <span>{formatNodeInfo(value, "clientnode")}</span>
        </>
      ),
    },
  ],
];
interface ICardInfo {
  label: string;
  configList: IBaseInfo[];
  btns?: JSX.Element[];
  col: number;
}

export const cardInfo = [
  {
    label: "基本信息",
    configList: baseInfo,
  },
] as ICardInfo[];

export const getNodeColumns = () => {
  const cols = [
    {
      title: "节点名称",
      dataIndex: "hostname",
      key: "hostname",
      width: "15%",
    },
    {
      title: "节点ip",
      dataIndex: "ip",
      key: "ip",
      width: "20%",
      onCell: () => ({
        style: cellStyle,
      }),
      render: (text: string) => {
        return (
          <Tooltip placement="bottomLeft" title={text}>
            {text}
          </Tooltip>
        );
      },
    },
    {
      title: "节点规格",
      dataIndex: "nodeSpec",
      key: "nodeSpec",
      width: "20%",
    },
    {
      title: "节点角色",
      dataIndex: "role",
      key: "role",
      width: "15%",
      render: (role: number) => {
        return <>{ROLE_TYPE[role].label}</>;
      },
    },
  ];
  return cols;
};

export const DESC_LIST = [
  {
    label: "集群类型",
    key: "type",
    render: (value) => (
      <>
        <span>
          {PHY_CLUSTER_TYPE.find((row) => row.value === value)?.label || ""}
        </span>
      </>
    ),
  },
  {
    label: "所属项目",
    key: "belongAppName",
    render: (value) => (
      <>
        <span>{value || "_"}</span>
      </>
    ),
  },
  {
    label: "所属项目ID",
    key: "belongAppId",
    render: (value) => (
      <>
        <span>{value || "_"}</span>
      </>
    ),
  },
  // {
  //   label: "责任人",
  //   key: "responsible",
  //   render: (value) => (
  //     <>
  //       <Tooltip placement="bottomLeft" title={value}>
  //         {value
  //           ? value.length > 20
  //             ? value.slice(0, 20) + "..."
  //             : value
  //           : "_"}
  //       </Tooltip>
  //     </>
  //   ),
  // },
];

export const getLogicNodeColumns = () => {
  const columns = [
    {
      title: "节点名称",
      dataIndex: "hostname",
      key: "hostname",
    },
    {
      title: "节点IP",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "节点规格",
      dataIndex: "nodeSpec",
      key: "nodeSpec",
    },
    {
      title: "节点角色",
      dataIndex: "role",
      key: "role",
      render: (t: number) => ROLE_TYPE[t].label,
    },
    {
      title: "所属region",
      dataIndex: "regionId",
      key: "regionId",
    },
    {
      title: "所属物理集群",
      dataIndex: "cluster",
      key: "cluster",
    },
  ];
  return columns;
};

export const onHandleServerTag = (
  data: ITemplateSrvData,
  physicsCluster: string,
  reloadData: Function
) => {
  Modal.confirm({
    title: data.status
      ? `是否确认关闭索引${data.item?.serviceName}服务？`
      : `是否确认打开索引${data.item?.serviceName}服务?`,
    content: data.status
      ? `关闭服务后会可能使相应业务受影响，请谨慎操作！`
      : `打开服务后会可能使相应业务受影响，请谨慎操作！`,
    icon: <QuestionCircleOutlined style={{ color: colorTheme }} />,
    okText: "提交",
    cancelText: "取消",
    onOk: () => {
      if (!data.status) {
        return setPhysicsClusterTemplateSrv(
          physicsCluster,
          data.item.serviceId
        ).then(() => {
          message.success("操作成功");
          reloadData();
          // clusterOp.getPhyClusterTemplateSrvList(physicsCluster); // 如有其他引用可作入参传入
        });
      }
      deletePhysicsClusterTemplateSrv(physicsCluster, data.item.serviceId).then(
        () => {
          reloadData();
          // clusterOp.getPhyClusterTemplateSrvList(physicsCluster); // 如有其他引用可作入参传入
        }
      );
    },
  });
};

export const indexExplain = [
  {
    label: "预创建",
    content: "对于分区创建的索引，支持预创建，减轻集群负担，提高稳定性",
  },
  {
    label: "过期删除",
    content: "支持索引根据保存周期自动清理，避免磁盘过满",
  },
  {
    label: "Pipeline",
    content: "提供索引分区规则（索引模版到具体的物理索引的映射）和写入限流能力",
  },
  {
    label: "Mapping设置",
    content: "提供修改索引的 mapping 的信息的功能",
  },
  {
    label: "Setting设置",
    content: "提供修改索引 Setting 的信息的功能",
  },
  {
    label: "写入限流",
    content: "对索引写入量进行限制，避免过大影响集群稳定性",
  },
  {
    label: "跨集群同步(DCDR)",
    content: "跨集群数据复制功能，用于集群间的数据复制，类似ES官方的CCR能力",
  },
  {
    label: "索引别名",
    content: "支持通过接口来设置和修改索引别名",
  },
  {
    label: "资源管控",
    content: "支持对索引资源(磁盘)大小的管控，超过设定值会被限流",
  },
  {
    label: "安全管控",
    content: "提供了引擎原生的租户和安全管控能力，可以保证引擎层面的数据安全",
  },
  {
    label: "容量规划",
    content: "保障集群节点的容量均衡，避免索引在节点上的分布不合理问题",
  },
  {
    label: "冷热分离",
    content: "提供SSD和HDD两种类型的磁盘来保存索引，从而降低成本",
  },
  {
    label: "Shard调整",
    content: "根依据索引写入的历史数据来每天定时计算未来一天索引的 shard 个数，保障索引 shard 个数的合理性",
  },
];

export const getIndexListColumns = () => {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "7%",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "物理模版名称",
      dataIndex: "name",
      key: "name",
      onCell: () => ({
        style: { ...cellStyle, maxWidth: 100 },
      }),
      render: (name: string, record: IIndex) => {
        return (
          <Tooltip placement="bottomLeft" title={name}>
            <NavRouterLink
              needToolTip={true}
              element={name}
              href={`/index/physics/detail?data=${encodeURI(
                JSON.stringify(record)
              )}`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "role",
      dataIndex: "role",
      key: "role",
      render: (index: number) => {
        return <>{opTemplateIndexRoleMap[index]}</>;
      },
    },
    {
      title: "所属逻辑模版",
      dataIndex: "logicName",
      key: "logicName",
      onCell: () => ({
        style: { ...cellStyle, maxWidth: 100 },
      }),
      render: (name: string, record: IIndex) => {
        return (
          <Tooltip placement="bottomLeft" title={name}>
            <NavRouterLink
              needToolTip={true}
              element={name}
              href={`/index/logic/detail?id=${record.logicId}`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "所属项目",
      dataIndex: "appName",
      key: "appName",
      render: (t: string) => t,
    },
    {
      title: "权限",
      dataIndex: "authType",
      key: "authType",
      render: (authType: number) => {
        return <>{INDEX_AUTH_TYPE_MAP[authType] || "-"}</>;
      },
    },
    {
      title: "描述",
      dataIndex: "memo",
      key: "memo",
    },
  ];
  return columns;
};

export const getNodeDivideColumns = (
  dataList: INodeDivide[],
  setModalId: any,
  setDrawerId: any,
  reloadDataFn: any,
  clusterName: string
) => {
  const columns = [
    {
      title: "region ID",
      dataIndex: "regionId",
      key: "regionId",
      // sorter: (a, b) => a.sortId - b.sortId,
      sorter: true,
      render: (value, row, index) => {
        const dataListIndex = row.index;
        const obj = {
          children: value,
          props: {} as any,
        };
        if (index === 0 || value !== dataList[dataListIndex - 1]?.regionId) {
          obj.props.rowSpan = row.rowSpan;
        }
        if (index > 0) {
          if (
            value === dataList[dataListIndex - 1]?.regionId &&
            value !== "_"
          ) {
            obj.props.rowSpan = 0;
          }
        }
        return obj;
      },
    },
    {
      title: "关联逻辑集群",
      dataIndex: "clusterLogicNames",
      key: "clusterLogicNames",
      onCell: () => ({
        style: { ...cellStyle, maxWidth: 100 },
      }),
      render: (name: string, row, index: number) => {
        const ele = (
          <Tooltip placement="bottomLeft" title={name}>
            {name || "_"}
          </Tooltip>
        );
        const obj = {
          children: ele,
          props: {} as any,
        };
        if (row.regionId !== "_") {
          obj.props.rowSpan = row.clusterRowSpan;
        }
        return obj;
      },
    },
    {
      title: "rack",
      dataIndex: "rack",
      key: "rack",
      render: (rack: string, row) => {
        const ele = <>{rack || "_"}</>;
        const obj = {
          children: ele,
          props: {} as any,
        };
        if (row.regionId !== "_") {
          obj.props.rowSpan = row.racksRowSpan;
        }
        return obj;
      },
    },
    {
      title: "节点IP",
      dataIndex: "ip",
      key: "ip",
      render: (ip: string, record: INodeDivide) => {
        const btns = [
          {
            label: ip,
            clickFunc: () => {
              setDrawerId("nodeMonitorDrawer", { node: "" }, reloadDataFn);
            },
          },
        ];
        // return renderOperationBtns(btns, record);
        return ip;
      },
    },
    {
      title: "节点角色",
      dataIndex: "role",
      key: "role",
      render: (t: any) => {
        let str;
        if (Array.isArray(t)) {
          str = t
            .map((index) => {
              return ROLE_TYPE_NO[index].label || index;
            })
            .toString();
        } else {
          str = ROLE_TYPE_NO[t].label || t;
        }
        return str;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number | number[]) => {
        let str;
        if (Array.isArray(status)) {
          str = status
            .map((index) => {
              return opNodeStatusMap[index];
            })
            .toString();
        } else {
          str = opNodeStatusMap[status];
        }
        return str;
        return <>{opNodeStatusMap[status]}</>;
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (value: number, record: any, index: number) => {
        let btns = [
          {
            label: "编辑",
            clickFunc: () => {
              setModalId(
                "newRegionModal",
                { clusterName, nodeDivideList: dataList, record },
                reloadDataFn
              );
            },
          },
          // {
          //   label: '任务',
          //   clickFunc: () => {
          //     setDrawerId('regionTaskList', record, reloadDataFn);
          //   }
          // }
        ];
        const del = {
          label: "删除",
          clickFunc: () => {
            Modal.confirm({
              title: "提示",
              content: "您确定要执行删除操作吗？",
              width: 500,
              okText: "确认",
              cancelText: "取消",
              onOk() {
                clusterRegionDelete(record.regionId).then((res) => {
                  notification.success({ message: "操作成功！" });
                  reloadDataFn();
                });
              },
            });
          },
        };
        if (!record.logicClusterName || record.logicClusterName === "") {
          btns.push(del);
        }
        if (record.regionId === "_" || !record.regionId) {
          btns = [];
        }
        const obj = {
          children: renderOperationBtns(btns, record),
          props: {} as any,
        };
        const dataListIndex = record.index;

        if (
          index === 0 ||
          record.regionId !== dataList[dataListIndex - 1]?.regionId
        ) {
          obj.props.rowSpan = record.rowSpan;
        }
        if (index > 0) {
          if (
            record.regionId === dataList[dataListIndex - 1]?.regionId &&
            record.regionId !== "_"
          ) {
            obj.props.rowSpan = 0;
          }
        }
        return obj;
      },
    },
  ];
  return columns;
};

// const unintallPlugn = (data, reloadDataFn) => {
//   Modal.confirm({
//     title: `是否确定卸载该${data.name}插件`,
//     content: `插件卸载、安装需要重启集群，点击确认后，将自动提交工单。`,
//     width: 500,
//     okText: "确定",
//     cancelText: "取消",
//     onOk() {
//       const contentObj = {
//         operationType: 4,
//         logicClusterId: data.id,
//         logicClusterName: data.name,
//         plugIds: data.id,
//         plugName: data.name,
//         plugDesc: data.plugDesc,
//         type: "6",
//         pluginId: data.id,
//         pluginFileName: data.name,
//         url: data.url,
//       };
//       const params: IWorkOrder = {
//         contentObj,
//         submitorAppid: appInfo.app.appInfo()?.id,
//         submitor: appInfo.user.getName("domainAccount"),
//         description: "",
//         type: "clusterOpPluginRestart",
//         // type: "logicClusterPlugOperation",
//       };
//       return submitWorkOrder(params, () => {
//         reloadDataFn();
//       });
//     },
//   });
// };

// const intallPlugn = (data, reloadDataFn) => {
//   Modal.confirm({
//     title: `是否确定安装该${data.name}插件`,
//     content: `插件卸载、安装需要重启集群，点击确认后，将自动提交工单。`,
//     width: 500,
//     okText: "确定",
//     cancelText: "取消",
//     onOk() {
//       const contentObj = {
//         operationType: 3,
//         logicClusterId: data.id,
//         logicClusterName: data.name,
//         plugIds: data.id,
//         plugName: data.name,
//         pluginId: data.id,
//         pluginFileName: data.name,
//         url: data.url,
//         plugDesc: data.plugDesc,
//         type: "6",
//       };
//       const params: IWorkOrder = {
//         contentObj,
//         submitorAppid: appInfo.app.appInfo()?.id,
//         submitor: appInfo.user.getName("domainAccount"),
//         description: "",
//         type: "clusterOpPluginRestart",
//         // "logicClusterPlugOperation",
//       };
//       return submitWorkOrder(params, () => {
//         reloadDataFn();
//       });
//     },
//   });
// };

const delPlugn = (data, reloadDataFn) => {
  Modal.confirm({
    title: `是否确定删除该${data.name}插件`,
    icon: <DeleteOutlined style={{ color: "red" }} />,
    content: `插件删除将永久在列表消失，请谨慎操作。`,
    width: 500,
    okText: "确定",
    cancelText: "取消",
    onOk() {
      userDelPlug(data.id).then((res) => {
        reloadDataFn();
      });
    },
  });
};
const editPlugn = (data, reloadDataFn) => {
  Modal.confirm({
    title: `是否编辑该${data.name}插件`,
    icon: <EditOutlined />,
    content: (
      <Input
        className="physics-edit-plugin-input"
        defaultValue={data?.desc || ""}
      />
    ),
    width: 500,
    okText: "确定",
    cancelText: "取消",
    onOk() {
      let { value } = document.querySelector(".physics-edit-plugin-input");
      editPlug(data.id, value).then((res) => {
        reloadDataFn();
      });
      // userDelPlug(data.id).then((res) => {
      //   reloadDataFn();
      // });
    },
  });
};

const getPlugnBtnList = (record: IPlug, reloadDataFn: any, setModalId) => {
  const install = {
    label: "安装",
    isOpenUp: isOpenUp,
    clickFunc: () => {
      setModalId("installplugin", record, reloadDataFn);
    },
  };

  const uninstall = {
    label: "卸载",
    isOpenUp: isOpenUp,
    clickFunc: () => {
      setModalId("uninstallPlugin", record, reloadDataFn);
    },
  };

  const edit = {
    label: "编辑",
    clickFunc: () => {
      setModalId("EditPluginDesc", { record }, reloadDataFn);
    },
  };

  const del = {
    label: "删除插件包",
    // needConfirm: true,
    isOpenUp: isOpenUp,
    // confirmText: "删除插件包",
    clickFunc: (record: any) => {
      delPlugn(record, reloadDataFn);
    },
  };

  const btnList = [];
  if (record.pdefault) {
    return btnList;
  }
  if (record.installed) {
    btnList.push(uninstall, edit);
  } else {
    btnList.push(install, edit, del);
  }
  return btnList;
};

export const getPlugnListColumns = (fn: () => any, setModalId) => {
  const columns = [
    {
      title: "插件名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "插件类型",
      dataIndex: "pdefault",
      key: "pdefault",
      render: (value: boolean) => {
        return <>{value ? "系统默认插件" : "自定义插件"}</>;
      },
    },
    {
      title: "使用版本",
      dataIndex: "version",
      key: "version",
    },
    {
      title: "状态",
      dataIndex: "installed",
      key: "installed",
      render: (value: boolean) => {
        return <>{value ? "已安装" : "未安装"}</>;
      },
    },
    {
      title: "描述",
      dataIndex: "desc",
      key: "desc",
      width: '25%',
      render: (value: string) => {
        return value || '-'
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (id: number, record: IPlug) => {
        const btns = getPlugnBtnList(record, fn, setModalId);
        return renderOperationBtns(btns, record);
      },
    },
  ];
  return columns;
};

export const getConfigInfoColumns = (
  fn: any,
  reloadData: () => any,
  setDrawerId: any
) => {
  const operationList = [
    {
      label: "编辑",
      isOpenUp: isOpenUp,
      clickFunc: (record: IPhyConfig) => {
        fn("editConfig", record, reloadData);
        return;
      },
    }
  ] as ITableBtn[];
  const columns = [
    {
      title: "节点角色",
      dataIndex: "enginName",
      key: "enginName",
    },
    {
      title: "配置类别",
      dataIndex: "typeName",
      key: "typeName",
      render: (value: string) => <span>{value || "-"}</span>,
    },
    {
      title: "配置内容",
      dataIndex: "configData",
      key: "configData",
      onCell: () => ({
        style: cellStyle,
      }),
      render: (text: string) => {
        return (
          <a
            onClick={() => {
              setDrawerId("configDetail", text);
            }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: "描述",
      dataIndex: "desc",
      key: "desc",
      render: (desc: string, record: IPhyConfig) => {
        return (
          <>
            {desc.length > 20 ? desc.slice(0, 20) + "..." : desc}

            <EditTwoTone
              onClick={() => {
                fn("editConfigDesc", record, reloadData);
              }}
            />
          </>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "id",
      key: "operation",
      width: "20%",
      render: (id: number, record: IPhyConfig) => {
        const btns = operationList;
        return renderOperationBtns(btns, record);
      },
    },
  ];
  return columns;
};
