const { Schema, model } = require('mongoose');
const UserSchema = new Schema({
    chatId: Number,
    lastName: String,
    firstName: String,
    connectionAt: Date,
    phone: {
        type: String,
        unique: true,
        required: true
    },
    organizationId: {
        type: String,
        required: true
    },
    subscribe_new_orders: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: new Date().toISOString()
    }
});
module.exports = model('Users', UserSchema);
