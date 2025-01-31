package com.didichuxing.datachannel.arius.admin.client.mapping;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@ApiModel(description = "索引模板分词器setting信息")
public class AriusIndexTemplateSetting implements Serializable {

    @ApiModelProperty("分词器")
    private JSONObject         analysis;

    private static final String       ANALYSIS_KEY_PREFIX     = "index.analysis.";

    private static final String       ANALYZER_KEY            = "analyzer";
    private static final String       TOKENIZER_KEY           = "tokenizer";
    private static final String       CHAR_FILTER_KEY         = "char_filter";
    private static final String       FILTER_KEY              = "filter";

    private static final List<String> ANALYSIS_SUPPORTED_KEYS = Arrays.asList(ANALYZER_KEY, TOKENIZER_KEY, CHAR_FILTER_KEY,
        FILTER_KEY);

    /**
     * to formatted json.
     * @return
     */
    public Map<String, String> toJSON() {
        if (analysis != null) {
            Map<String, String> reAnalysisDict = new HashMap<>();

            Map<String, String> analysisDict = flat(analysis);

            for(Map.Entry<String, String> entry : analysisDict.entrySet()){
                String analysisKey = entry.getKey();
                reAnalysisDict.put(ANALYSIS_KEY_PREFIX + analysisKey, analysisDict.get(analysisKey));
            }

            return reAnalysisDict;
        }

        return new HashMap<>();
    }

    public static Map<String, String> flat(JSONObject obj) {
        Map<String, String> ret = new HashMap<>();

        if (obj == null) {
            return ret;
        }

        for(Map.Entry<String, Object> entry : obj.entrySet()){
            String key = entry.getKey();
            Object o = obj.get(key);

            JSONObject json = parseJsonObject(o);
            if (json != null) {
                Map<String, String> m = flat(json);

                for(Map.Entry<String, String> fEntry : m.entrySet()){
                    String k = fEntry.getKey();
                    ret.put(key.replace(".", "#") + "." + k, m.get(k));
                }
            } else {
                ret.put(key.replace(".", "#"), o.toString());
            }
        }

        return ret;
    }

    /**
     * 尝试获取JSON Object
     * @param o 对象
     * @return
     */
    private static JSONObject parseJsonObject(Object o) {
        if (o instanceof JSONObject) {
            return (JSONObject) o;
        } else {
            try {
                return JSON.parseObject(JSON.toJSONString(o));
            } catch (JSONException e) {
                return null;
            }
        }
    }
}