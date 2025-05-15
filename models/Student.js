const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  dateOfJoining: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  paidAdvance: { type: String, required: true },
  fees: {
    type: Map,
    of: {
      paid: { type: Boolean, default: false },
      paidDate: { type: Date, default: null }
    },
    default: {}
  },
  photo: { type: String, default: '' }
});

module.exports = mongoose.model('Student', studentSchema);
