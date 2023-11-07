const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../Models/Staff");
const crypto = require("crypto");
const staffService = require("../Services/staffService");
function generateRandomKey(length) {
  return crypto.randomBytes(length).toString("hex");
}
const secretKey = generateRandomKey(32);
//Register Function
exports.Register = async (req, res) => {
  try {
    const { fullName, email, password} = req.body;
    // Check if the Staff already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Email already exists." });
    }
    //crypte the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create Admin Object
    const staff = new Staff({
      fullName,
      email,
      password: hashedPassword,
      status: "notApprouved",
    });
    //save object
    await staff.save();
    // return a succes message
    res.status(201).json({ message: "staff registered successfully." });
  } catch (error) {
    // return an error message
    res
      .status(500)
      .json({ message: "An error occurred while registering this staff." });
  }
};
//Login Function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    // Generate JWT with a specific signature
    const token = jwt.sign(
      { staffId: staff._id },
      process.env.JWT_SECRET || secretKey
    );
    // return a generated Token
    res.json({ token });
  } catch (error) {
    // return a error message if An error occurred while logging
    res
      .status(500)
      .json({ message: "An error occurred while logging in." + error });
  }
};
// List of Staffs who have sent us a membership
exports.staffsNotApprouved = async (req, res) => {
  try {
    const result = await staffService.staffsNotApprouved();
    if (result) res.status(201).json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while getting  Staff not approuved" });
  }
};
exports.approuvingStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const existingstaff = await Staff.findById(id);
    if (!existingstaff)
      res.status(400).json({ message: "Staff not exists" });
    else await staffService.approuvingStaff(id);
    res.status(201).json({ message: "Staff approuved with success" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while getting  Staff not approuved" });
  }
};
