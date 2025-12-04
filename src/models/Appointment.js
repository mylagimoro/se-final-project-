const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  startAt: {
    type: Date,
    required: [true, 'Please add appointment start time']
  },
  endAt: {
    type: Date,
    required: [true, 'Please add appointment end time']
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for date queries
appointmentSchema.index({ startAt: 1, doctorId: 1 });
appointmentSchema.index({ patientId: 1, startAt: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);