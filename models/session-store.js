function createModel(mongoose) {
    var definition = {
        accessToken: {
            type: String,
            index: {unique: true}
        },
        userId: {
            type: String,
            index: {unique: true}
        },
        tokenSecret: {
            type: String
        }
    };
    var schema = new mongoose.Schema(definition);

    return mongoose.model('SessionStore', schema);
}

module.exports = {
    createModel: createModel
};