export default {

    delay: function (time) {
        return new Promise(function (fulfill) {
            setTimeout(fulfill, time);
        });
    }

}