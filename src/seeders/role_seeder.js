const mongoose = require('mongoose');
const Role = require('../../src/models/Role');

const roles = [
  { role_id: 1, role_name: 'Admin' },
  { role_id: 2, role_name: 'Bay Manager'},
  { role_id: 3, role_name: 'Project Manager'},
  { role_id: 4, role_name: 'Worker' },
  { role_id: 5, role_name: 'CEO' },
];


const seedRoles = async () => {
  try {

      await mongoose.connect('mongodb://localhost:27017');

      // Clear existing roles
      await Role.deleteMany({});
      console.log('Existing roles cleared.');

    // Insert new roles
    await Role.insertMany(roles);
    console.log('Roles seeded successfully.');

  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedRoles();
