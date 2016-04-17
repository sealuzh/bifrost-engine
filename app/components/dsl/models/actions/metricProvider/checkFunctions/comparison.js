import _ from 'lodash'

export default {
    name: "comparison", check: function (providerResults, params) {

        var comparisonExpression = params.expression;
        var providerNames;

        if (comparisonExpression.indexOf(">=") > -1) {
            providerNames = comparisonExpression.split(">=");
            var result0 = _.find(providerResults, {name: providerNames[0]});
            var result1 = _.find(providerResults, {name: providerNames[1]});
            return result0.metric >= result1.metric;
        } else if (comparisonExpression.indexOf("<=") > -1) {
            providerNames = comparisonExpression.split("<=");
            var result0 = _.find(providerResults, {name: providerNames[0]});
            var result1 = _.find(providerResults, {name: providerNames[1]});
            return result0.metric <= result1.metric;
        } else if (comparisonExpression.indexOf("<") > -1) {
            providerNames = comparisonExpression.split("<");
            var result0 = _.find(providerResults, {name: providerNames[0]});
            var result1 = _.find(providerResults, {name: providerNames[1]});
            return result0.metric < result1.metric;
        } else if (comparisonExpression.indexOf(">") > -1) {
            providerNames = comparisonExpression.split(">");
            var result0 = _.find(providerResults, {name: providerNames[0]});
            var result1 = _.find(providerResults, {name: providerNames[1]});
            return result0.metric > result1.metric;
        }

    }
};