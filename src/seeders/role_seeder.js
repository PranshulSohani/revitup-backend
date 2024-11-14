const mongoose = require('mongoose');
const Role = require('../../src/models/Role');

const roles = [
  { role_id: 1, role_name: 'Admin' },
  { role_id: 2, role_name: 'Bay Manager'},
  { role_id: 3, role_name: 'Project Manager'},
  { role_id: 4, role_name: 'Worker' },
  { role_id: 5, role_name: 'CEO' },
  { role_id: 6, role_name: 'Security Guard'},
  { role_id: 7, role_name: 'Service Manager'},
  { role_id: 8, role_name: 'Inventory Manager'},
  { role_id: 9, role_name: 'HR Manager'},

];


const seedRoles = async () => {
  try {

      await mongoose.connect("mongodb://localhost:27017");

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
