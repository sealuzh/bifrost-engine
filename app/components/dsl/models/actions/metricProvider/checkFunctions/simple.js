import _ from 'lodash'

export default {
    name: "simple", check: function (providerResults, params) {

        var returnValue = false;

        providerResults.forEach(providerResult => {

            var floatResult = parseFloat(providerResult.metric);

            if (_.startsWith(params.expression, ">=")) {
                returnValue = floatResult >= parseFloat(params.expression.substr(2));
            } else if (_.startsWith(params.expression, ">")) {
                returnValue = floatResult > parseFloat(params.expression.substr(1));
            } else if (_.startsWith(params.expression, "<=")) {
                returnValue = floatResult <= parseFloat(params.expression.substr(2));
            } else if (_.startsWith(params.expression, "<")) {
                returnValue = floatResult < parseFloat(params.expression.substr(1));
            } else if (_.startsWith(params.expression, "!=")) {
                returnValue = parseFloat(params.expression.substr(2)) != floatResult;
            } else {
                returnValue = parseFloat(params.expression.substr(1)) == floatResult;
            }

        });

        return returnValue;
    }
};