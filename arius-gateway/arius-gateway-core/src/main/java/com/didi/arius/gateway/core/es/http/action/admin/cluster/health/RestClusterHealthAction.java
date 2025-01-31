/*
 * Licensed to Elasticsearch under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package com.didi.arius.gateway.core.es.http.action.admin.cluster.health;

import com.didi.arius.gateway.common.metadata.IndexTemplate;
import com.didi.arius.gateway.common.metadata.QueryContext;
import com.didi.arius.gateway.core.es.http.StatAction;
import com.didi.arius.gateway.elasticsearch.client.ESClient;
import com.google.common.collect.Lists;
import org.elasticsearch.common.Strings;
import org.elasticsearch.rest.RestChannel;
import org.elasticsearch.rest.RestRequest;
import org.springframework.stereotype.Component;

import java.util.List;

import static com.didi.arius.gateway.common.utils.CommonUtil.isIndexType;

/**
 *
 */
@Component
public class RestClusterHealthAction extends StatAction {

    @Override
    public String name() {
        return "restClusterHealth";
    }

    public RestClusterHealthAction() {
        // pass
    }

    @Override
    protected void handleInterRequest(QueryContext queryContext, RestRequest request, RestChannel channel, ESClient client)
            throws Exception {
        String index = request.param("index");
        if (index != null && isIndexType(queryContext)) {
            String[] indicesArr = Strings.splitStringByCommaToArray(request.param("index"));
            List<String> indices = Lists.newArrayList(indicesArr);
            IndexTemplate indexTemplate = getTemplateByIndexTire(indices, queryContext);

            client = esClusterService.getClient(queryContext, indexTemplate, actionName);
        }

        if (client == null) {
            client = esRestClientService.getAdminClient(actionName);
        }

        directRequest(client, queryContext);
    }
}
