var mongoose = require("mongoose");



var bisikletSchema = new mongoose.Schema({
  tip: String,
  marka: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bisiklet_marka"
    }
  },
  model: String,
  sene: String,
  kadro: String,
  kadroboy: String,
  img: { data: Buffer, contentType: String }
});

module.exports = mongoose.model("Bisiklet", bisikletSchema);
