const mongoose = require('mongoose');
const Department = require('../../src/models/Department');

const departments = [
    { department_name: 'Security' },
    { department_name: 'Sales and Service' },
    { department_name: 'Bay' },
    { department_name: 'HR' },
    { department_name: 'Inventory' },
    { department_name: 'Finance' },
    { department_name: 'General Staff' },
];

const seedDepartments = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017");

    // Clear existing departments
    await Department.deleteMany({});
    console.log('Existing departments cleared.');

    // Insert new departments
    await Department.insertMany(departments);
    console.log('Departments seeded successfully.');

  } catch (error) {
    console.error('Error seeding departments:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedDepartments();
