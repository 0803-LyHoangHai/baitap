const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const readExcelFile = require("../utils/excelReader");
const generateRandomPassword = require("../utils/randomPassword");
const { sendUserPasswordEmail } = require("../services/email.service");

const importUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    const rows = readExcelFile(req.file.path);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const row of rows) {
      const username = row.username?.toString().trim();
      const email = row.email?.toString().trim().toLowerCase();

      if (!username || !email) {
        results.push({
          username: username || null,
          email: email || null,
          status: "failed",
          reason: "Missing username or email",
        });
        failCount++;
        continue;
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        results.push({
          username,
          email,
          status: "failed",
          reason: "Username or email already exists",
        });
        failCount++;
        continue;
      }

      const plainPassword = generateRandomPassword(16);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "user",
      });

      try {
        await sendUserPasswordEmail({
          username,
          email,
          password: plainPassword,
        });

        results.push({
          username: newUser.username,
          email: newUser.email,
          status: "success",
          message: "User created and email sent successfully",
        });

        successCount++;
      } catch (mailError) {
        results.push({
          username: newUser.username,
          email: newUser.email,
          status: "warning",
          reason: "User created but email could not be sent",
          mailError: mailError.message,
        });

        failCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Import users completed",
      total: rows.length,
      successCount,
      failCount,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  importUsers,
};