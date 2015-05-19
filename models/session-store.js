function createModel(mongoose) {
    var definition = {};
    var schema = new mongoose.Schema(definition);

    return mongoose.model('SessionStore', schema);
}

module.exports = {
    createModel: createModel
};