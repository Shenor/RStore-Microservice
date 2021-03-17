const { Schema, model } = require('mongoose');
const OrganizationSchema = new Schema({
   address: String,
   averageCheque: String,
   contact: Object,
   currencyIsoName: String,
   description: String,
   fullName: String,
   homePage: String,
   id: String,
   isActive: Boolean,
   logo: String,
   maxBonus: Number,
   minBonus: Number,
   name: String,
   networkId: String,
   organizationType: Number,
   timezone: String,
   website: String,
   workTime: String,
   email: {
      type: String,
      default: ""
   },
   yandexToken: {
      type: String,
      default: ""
   },
   nomenclature: {
      type: Schema.Types.ObjectId,
      ref: "Nomenclature"
   },
   orders: {
      type: Schema.Types.ObjectId,
      ref: "Orders"
   }
});
module.exports = model('Organization', OrganizationSchema);