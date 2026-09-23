const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ownerModel = require("./models/owner-model");

require("dotenv").config();

async function resetOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "OWNER_EMAIL";
    const newPassword = "OWNER_PASS";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const owner = await ownerModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!owner) {
      console.log("Owner account not found.");
    } else {
      console.log("Owner password reset successfully.");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

resetOwner();