const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient
} = require('../controllers/appointmentController');

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(deleteAppointment);

router.route('/doctor/:doctorId')
  .get(getAppointmentsByDoctor);

router.route('/patient/:patientId')
  .get(getAppointmentsByPatient);

module.exports = router;