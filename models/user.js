import mongoose from 'mongoose';

//user schema is defined
const userSchema = new mongoose.Schema({
  email: { type: String, required:true, unique:true },
  first_name: { type: String },
  last_name: { type: String },
  password: { type: String },
  token:{ type: String },
});

export default mongoose.model("user", userSchema);