const mongoose = require("mongoose");

const premiumSchema = mongoose.Schema({
  id: String,
  guilds: Array
});

module.exports = mongoose.model("Premium", premiumSchema);