var _ = require('lodash');

function createModel(mongoose) {
    var definition = {
        timestamp: {
            type: Date
        },
        err: { } // any
    };
    var schemaOptions = {
        capped: 4194303
    };
    var schema = new mongoose.Schema(definition, schemaOptions);

    schema.statics.addRecord = function (errObject) {
        return this.create({
            timestamp: new Date(),
            err: errObject
        });
    };

    return mongoose.model('ErrorLog', schema);
}

module.exports = {
    createModel: createModel
};