const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty')
      .sort({ startAt: -1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Public
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone birthDate')
      .populate('doctorId', 'name specialty');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create appointment with availability check
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res) => {
  try {
    // Parse dates
    if (req.body.startAt) {
      req.body.startAt = new Date(req.body.startAt);
    }
    if (req.body.endAt) {
      req.body.endAt = new Date(req.body.endAt);
    }
    
    // Validate dates
    if (!req.body.startAt || !req.body.endAt) {
      return res.status(400).json({
        success: false,
        error: 'Start and end times are required'
      });
    }
    
    if (req.body.startAt >= req.body.endAt) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }
    
    // Check if patient exists
    const patient = await Patient.findById(req.body.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }
    
    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({
      doctorId: req.body.doctorId,
      startAt: { $lt: req.body.endAt },
      endAt: { $gt: req.body.startAt },
      status: { $ne: 'cancelled' }
    });
    
    if (overlappingAppointment) {
      return res.status(400).json({
        success: false,
        error: 'Doctor is not available at this time'
      });
    }
    
    const appointment = await Appointment.create(req.body);
    
    // Populate the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty');
    
    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Public
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    // Parse dates if provided
    if (req.body.startAt) {
      req.body.startAt = new Date(req.body.startAt);
    }
    if (req.body.endAt) {
      req.body.endAt = new Date(req.body.endAt);
    }
    
    // If updating time, check for conflicts
    if (req.body.startAt || req.body.endAt || req.body.doctorId) {
      const startAt = req.body.startAt || appointment.startAt;
      const endAt = req.body.endAt || appointment.endAt;
      const doctorId = req.body.doctorId || appointment.doctorId;
      
      // Validate dates
      if (startAt >= endAt) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }
      
      const overlappingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctorId: doctorId,
        startAt: { $lt: endAt },
        endAt: { $gt: startAt },
        status: { $ne: 'cancelled' }
      });
      
      if (overlappingAppointment) {
        return res.status(400).json({
          success: false,
          error: 'Doctor is not available at this time'
        });
      }
    }
    
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('patientId', 'name email phone')
     .populate('doctorId', 'name specialty');
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Public
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    await appointment.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get appointments by doctor
// @route   GET /api/appointments/doctor/:doctorId
// @access  Public
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty')
      .sort({ startAt: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments by doctor error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get appointments by patient
// @route   GET /api/appointments/patient/:patientId
// @access  Public
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty')
      .sort({ startAt: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments by patient error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};