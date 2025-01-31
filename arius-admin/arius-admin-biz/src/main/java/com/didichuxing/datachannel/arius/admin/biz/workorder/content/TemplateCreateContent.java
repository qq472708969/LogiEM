package com.didichuxing.datachannel.arius.admin.biz.workorder.content;

import com.didichuxing.datachannel.arius.admin.client.constant.template.DataTypeEnum;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author d06679
 * @date 2019-06-04
 */
@Data
@NoArgsConstructor
public class TemplateCreateContent extends BaseContent {

    /**************************************** 基本信息 ****************************************************/

    /**
     * 索引模板名称
     */
    private String  name;

    /**
     * 数据中心
     */
    private String  dataCenter;

    /**
     * 用户数据类型
     * @see DataTypeEnum
     */
    private Integer dataType;

    /**
     * 责任人
     */
    private String  responsible;

    /**
     * 部门id
     */
    private String  libraDepartmentId;

    /**
     * 部门名称
     */
    private String  libraDepartment;

    /**
     * 备注
     */
    private String  desc;

    /**
     * 逻辑集群id
     */
    private Long    resourceId;

    /**
     * 数据保存时长 单位天
     */
    private Integer expireTime;

    /**
     * 数据总量 单位G
     */
    private Double  diskQuota;

    /**
     * 周期性滚动  1 滚动   0 不滚动
     */
    private Boolean cyclicalRoll;

    /**************************************** Schema信息 ****************************************************/

    /**
     * 时间字段
     */
    private String  dateField;
    /**
     * 时间字段格式
     */
    private String  dateFieldFormat;

    /**
     * mapping信息 mapping导入的
     *
     *      {
     *       "key1": {
     *         "type": "integer"
     *       },
     *       "key2": {
     *         "type": "long"
     *       }
     *     }
     *
     */
    private String  mapping;

    /**
     * id字段
     */
    private String  idField;

    /**
     * routing字段
     */
    private String  routingField;

    /**************************************** 部署信息 ****************************************************/
    /**
     * 物理集群信息
     */
    private String  cluster;

    /**
     * rack信息
     */
    private String  rack;

    /**
     * 预创建索引标识
     */
    private Boolean preCreateFlags;

    /**
     * shard数量
     */
    private Integer shardNum;

    /**
     * 禁用索引_source标识
     */
    private Boolean disableSourceFlags;
}
