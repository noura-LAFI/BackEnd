const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
function generateRandomKey(length) {
  return crypto.randomBytes(length).toString("hex");
}
const secretKey = generateRandomKey(32);
//Register Function
exports.Register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    // Check if this admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists." });
    }
    //crypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create Admin Object
    const admin = new Admin({
      fullName,
      email,
      password: hashedPassword,
    });
    //save object
    await admin.save();
    // return a successfully message
    res.status(201).json({ message: "Admin registered successfully." });
  } catch (error) {
    // return an error message
    res
      .status(500)
      .json({ message: "An error occurred while registering this Admin." });
  }
};

//Login Function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if this admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    // Generate JWT with a specific signature
    const token = jwt.sign(
      { adminId: admin._id },
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
//forgot password function
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("existingEmail", email);
  const existingEmail = await Admin.findOne({ email });
  if (!existingEmail) res.send("email not exist ");
  const newSecret = secretKey + existingEmail.password;
  const token = jwt.sign(
    { email: existingEmail.email, id: existingEmail._id },
    process.env.JWT_SECRET || newSecret,
    { expiresIn: "5m" }
  );
  const Link = `http://localhost:3000/api/admin/reset-password/${existingEmail._id}/${token}`;
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "lafinoura6@gmail.com",
      pass: "gjzgmvdawoxpdiug",
    },
  });
  const mailOptions = {
    from: "lafinoura@gmail.com",
    to: existingEmail.email,
    subject: "Forgot password",
    text: Link,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send("Erreur while sending this e-mail : " + error);
    } else {
      res.send("Sending E-mail with success : " + info.response);
    }
  });
};

exports.resetpassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;
    const oldAdmin = await Admin.findById(id);
    if (!oldAdmin) res.send("email not exist ");
    const newSecret = secretKey + oldAdmin.password;
    const verify = jwt.verify(token, newSecret);
    if (verify) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await Admin.findByIdAndUpdate(id, { password: hashedPassword });
      res.send("password updated");
    }
  } catch (err) {
    res.json({ message: err });
  }
};
