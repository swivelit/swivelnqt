
const Admin = require('./Admin');
const Student = require('./Student');
const Trainer = require('./Trainer');

const TABLES_BY_ROLE = {
  admin: Admin,
  student: Student,
  trainer: Trainer,
};

const Account = {

  async findByEmail(email) {
    const normalized = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalized });
    if (admin) return { ...admin, role: 'admin' };

    const student = await Student.findOne({ email: normalized });
    if (student) return { ...student, role: 'student' };

    const trainer = await Trainer.findOne({ email: normalized });
    if (trainer) return { ...trainer, role: 'trainer' };

    return null;
  },


  async findByIdAndRole(id, role) {
    const Model = TABLES_BY_ROLE[role];
    if (!Model) return null;
    const person = await Model.findById(id);
    if (!person) return null;
    return { ...person, role };
  },


  async findEmailAnywhere(email) {
    return await Account.findByEmail(email);
  },
};

module.exports = Account;
