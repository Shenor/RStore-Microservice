const { Schema, model } = require('mongoose');
const NomenclatureSchema = new Schema({
    groups: {
        type: [Object]
    },
    productCategories: {
        type: [Object]
    },
    products: {
        type: [Object]
    },
    stopList: {
        type: [Object]
    },
    revision: String,
    uploadDate: String,
    organizationID: {
        type: String,
        required: true
    }
});
module.exports = model('Nomenclature', NomenclatureSchema);