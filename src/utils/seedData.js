const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Note: dotenv is loaded from server.js, so we don't need it here

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    
    console.log('Data cleared...');
    
    // Create patients
    const patients = await Patient.create([
      {
        name: 'John Doe',
        birthDate: new Date('1985-05-15'),
        email: 'john.doe@example.com',
        phone: '+1234567890'
      },
      {
        name: 'Jane Smith',
        birthDate: new Date('1990-08-22'),
        email: 'jane.smith@example.com',
        phone: '+0987654321'
      },
      {
        name: 'Bob Johnson',
        birthDate: new Date('1978-12-10'),
        email: 'bob.johnson@example.com',
        phone: '+1122334455'
      },
      {
        name: 'Alice Williams',
        birthDate: new Date('1995-03-30'),
        email: 'alice.williams@example.com',
        phone: '+5566778899'
      },
      {
        name: 'Charlie Brown',
        birthDate: new Date('1982-11-05'),
        email: 'charlie.brown@example.com',
        phone: '+9988776655'
      }
    ]);
    
    console.log(`${patients.length} patients created...`);
    
    // Create doctors
    const doctors = await Doctor.create([
      {
        name: 'Dr. Sarah Miller',
        specialty: 'Cardiology'
      },
      {
        name: 'Dr. Michael Chen',
        specialty: 'Dermatology'
      },
      {
        name: 'Dr. Lisa Wong',
        specialty: 'Pediatrics'
      },
      {
        name: 'Dr. Robert Davis',
        specialty: 'Orthopedics'
      },
      {
        name: 'Dr. Emily Taylor',
        specialty: 'Neurology'
      }
    ]);
    
    console.log(`${doctors.length} doctors created...`);
    
    // Create appointments
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointments = await Appointment.create([
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        startAt: new Date(tomorrow.setHours(9, 0, 0, 0)),
        endAt: new Date(tomorrow.setHours(9, 30, 0, 0)),
        notes: 'Regular heart checkup',
        status: 'scheduled'
      },
      {
        patientId: patients[1]._id,
        doctorId: doctors[1]._id,
        startAt: new Date(tomorrow.setHours(10, 0, 0, 0)),
        endAt: new Date(tomorrow.setHours(10, 45, 0, 0)),
        notes: 'Skin rash consultation',
        status: 'scheduled'
      },
      {
        patientId: patients[2]._id,
        doctorId: doctors[2]._id,
        startAt: new Date(tomorrow.setHours(14, 0, 0, 0)),
        endAt: new Date(tomorrow.setHours(14, 30, 0, 0)),
        notes: 'Child vaccination appointment',
        status: 'scheduled'
      },
      {
        patientId: patients[3]._id,
        doctorId: doctors[3]._id,
        startAt: new Date(tomorrow.setHours(11, 0, 0, 0)),
        endAt: new Date(tomorrow.setHours(11, 30, 0, 0)),
        notes: 'Knee pain evaluation',
        status: 'scheduled'
      },
      {
        patientId: patients[4]._id,
        doctorId: doctors[4]._id,
        startAt: new Date(tomorrow.setHours(15, 0, 0, 0)),
        endAt: new Date(tomorrow.setHours(16, 0, 0, 0)),
        notes: 'Migraine follow-up',
        status: 'scheduled'
      }
    ]);
    
    console.log(`${appointments.length} appointments created...`);
    console.log('✅ Seed data completed successfully!');
    
    // Display summary
    console.log('\n📊 Seed Data Summary:');
    console.log(`Patients: ${patients.length}`);
    console.log(`Doctors: ${doctors.length}`);
    console.log(`Appointments: ${appointments.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  connectDB().then(() => {
    seedData();
  });
}

module.exports = seedData;