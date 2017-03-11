var records =  require('../../../schemas/users');



exports.findByToken = function (token, cb) {
    process.nextTick(function () {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.token === token) {
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
};
