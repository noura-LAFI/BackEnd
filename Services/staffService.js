const Staffs = require("../Models/Staff");

exports.staffsNotApprouved = async () => {
  return await Staffs.find({ status: "notApprouved" });
};
exports.approuvingStaff = async (id) => {
  return await Staffs.findByIdAndUpdate(id, { status: "approuved" });
};
