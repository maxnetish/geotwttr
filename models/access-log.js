var _ = require('lodash');

function createModel(mongoose) {
    var definition = {
        timestamp: {
            type: Date
        },
        userId: {
            type: String
        },
        action: {
            type: String
        },
        actionParams: {}
    };
    var schemaOptions = {
        capped: 4194303
    };
    var schema = new mongoose.Schema(definition, schemaOptions);

    schema.statics.addRecord = function (userId, action, actionParams) {
        userId = userId || 'unknown';
        action = action || 'unknown';

        return this.create({
            timestamp: new Date(),
            userId: userId,
            action: action,
            actionParams: actionParams
        });
    };

    return mongoose.model('AccessLog', schema);
}

module.exports = {
    createModel: createModel
};
