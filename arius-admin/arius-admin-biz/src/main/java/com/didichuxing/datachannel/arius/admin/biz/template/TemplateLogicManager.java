package com.didichuxing.datachannel.arius.admin.biz.template;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.didichuxing.datachannel.arius.admin.client.bean.common.PaginationResult;
import com.didichuxing.datachannel.arius.admin.client.bean.common.Result;
import com.didichuxing.datachannel.arius.admin.client.bean.dto.template.IndexTemplateLogicDTO;
import com.didichuxing.datachannel.arius.admin.client.bean.dto.template.TemplateConditionDTO;
import com.didichuxing.datachannel.arius.admin.client.bean.vo.template.ConsoleTemplateVO;
import com.didichuxing.datachannel.arius.admin.client.constant.app.AppTemplateAuthEnum;
import com.didichuxing.datachannel.arius.admin.common.bean.entity.app.App;
import com.didichuxing.datachannel.arius.admin.common.bean.entity.cluster.ClusterLogic;
import com.didichuxing.datachannel.arius.admin.common.bean.entity.template.IndexTemplateLogic;
import com.didichuxing.datachannel.arius.admin.common.bean.entity.template.IndexTemplateLogicAggregate;
import com.didichuxing.datachannel.arius.admin.common.bean.entity.template.IndexTemplateLogicWithLabels;
import com.didichuxing.datachannel.arius.admin.common.exception.AdminOperateException;

/**
 * 逻辑模板管理Biz类
 *
 * @author wangshu
 * @date 2020/09/11
 */
@Component
public interface TemplateLogicManager {

    /**
     * 默认模板价值分
     */
    int DEFAULT_TEMPLATE_VALUE = 61;

    /**
     * 校验所有逻辑模板元数据信息
     *
     * @return
     */
    boolean checkAllLogicTemplatesMeta();

    /**
     * 获取模板信息
     * @param excludeLabelIds 排除的Label ID列表
     * @param includeLabelIds 包含的Label ID列表
     * @return list
     */
    List<IndexTemplateLogicWithLabels> getByLabelIds(String includeLabelIds, String excludeLabelIds);

    /**
     * 获取最近访问该模板的APP
     *
     * @param logicId logicId
     * @return result
     */
    List<App> getLogicTemplateAppAccess(Integer logicId);

    /**
     * 获取模板的标签信息
     * @param logicId 模板id
     * @return label
     */
    IndexTemplateLogicWithLabels getLabelByLogicId(Integer logicId);

    /**
     * 新建逻辑模板 无参数校验
     *
     * @param param    模板信息
     * @param operator 操作人
     * @return result
     */
    @Transactional(rollbackFor = Exception.class)
    Result<Integer> addTemplateWithoutCheck(IndexTemplateLogicDTO param, String operator) throws AdminOperateException;

    /**
     * 新建逻辑模板
     * @param param 模板信息
     * @param operator 操作人
     * @return result
     * @throws AdminOperateException 操作es失败 或者保存物理模板信息失败
     */
    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    Result<Integer> createLogicTemplate(IndexTemplateLogicDTO param, String operator) throws AdminOperateException;

    /**
     * 获取所有逻辑模板聚合
     *
     * @param appId 当前App Id
     * @return
     */
    List<IndexTemplateLogicAggregate> getAllTemplatesAggregate(Integer appId);

    /**
     * 获取逻辑集群所有逻辑模板聚合
     *
     * @param logicClusterId 逻辑集群ID
     * @param appId 操作的App Id
     * @return
     */
    List<IndexTemplateLogicAggregate> getLogicClusterTemplatesAggregate(Long logicClusterId, Integer appId);

    /**
     * 拼接集群名称
     * @param logicClusters 逻辑集群详情列表
     * @return
     */
    String jointCluster(List<ClusterLogic> logicClusters);

    /**
     *
     * @param aggregates 聚合列表
     * @return
     */
    List<ConsoleTemplateVO> fetchConsoleTemplates(List<IndexTemplateLogicAggregate> aggregates);

    /**
     * 获取模板VO
     * @param aggregate 模板聚合
     * @return
     */
    ConsoleTemplateVO fetchConsoleTemplate(IndexTemplateLogicAggregate aggregate);

    /**
     * 获取逻辑集群所有逻辑模板列表
     */
    List<ConsoleTemplateVO> getConsoleTemplateVOSForClusterLogic(Long clusterLogicId, Integer appId);

    /**
     * 获取逻辑索引列表
     */
    List<ConsoleTemplateVO> getConsoleTemplatesVOS(Integer appId);

    /**
     * 根据项目和权限类型获取模板信息
     * @param appId                 项目Id
     * @param authType              权限类型
     * @see   AppTemplateAuthEnum
     * @return
     */
    List<IndexTemplateLogic> getTemplatesByAppIdAndAuthType(Integer appId, Integer authType);

    /**
     * 根据项目获取有管理\读写\读权限的逻辑模版
     */
    List<String> getTemplateLogicNames(Integer appId);

    Result<Void> editTemplate(IndexTemplateLogicDTO param, String operator) throws AdminOperateException;

    Result<Void> delTemplate(Integer logicTemplateId, String operator) throws AdminOperateException;

    /**
     * 模糊（精确）/分页查询模板列表接口
     * @param condition  查询条件
     * @param appId      项目
     * @return
     */
    PaginationResult<ConsoleTemplateVO> pageGetConsoleTemplateVOS(TemplateConditionDTO condition, Integer appId);

    /**
     * 校验创建模板名称是否合法
     * @param templateName   模板名称
     * @return
     */
    Result<Void> checkTemplateValidForCreate(String templateName);

    /**
     * 校验模板大小资源是否充足
     * @param param
     * @return
     */
    Result<Void> checkTemplateDataSizeValidForCreate(IndexTemplateLogicDTO param);

    /**
     * 校验模板mapping可否编辑
     * @param templateId
     * @return
     */
    Result<Boolean> checkTemplateEditMapping(Integer templateId);
}
