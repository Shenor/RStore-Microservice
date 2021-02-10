const { Schema, model } = require('mongoose');
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    contractStatus: {
        type: Boolean,
        required: true,
        default: false
    },
    organizations: [{
        type: Schema.Types.ObjectId,
        ref: "Nomenclature"
    }],
    token: {
        type: String,
        default: ""
    },
    site: Array,
});
module.exports = model('Users', UserSchema);