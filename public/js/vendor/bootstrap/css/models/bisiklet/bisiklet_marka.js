var mongoose = require("mongoose");


var bisiklet_markaSchema = new mongoose.Schema({
  name: String,
  origin: String,
});



module.exports = mongoose.model("Bisiklet_marka", bisiklet_markaSchema);
