import request from 'request-promise'
import _ from 'lodash'

export default {
    name: "request", check: async function (providerResults, params) {
        var url = params.expression;
        var response = await request({method: 'POST', body: _.pluck(providerResults, "metric"), uri: url, json: true, simple: false, resolveWithFullResponse: true});
        return response.statusCode == 200;
    }
};