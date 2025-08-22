const mongoose = require("mongoose");

const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, 
      required: true, 
      trim: true 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format",
      },

    },
    password: { type: String, 
      required: true,
       minlength: 6 
      },
  },
  { timestamps: true

   }
);

const User = mongoose.model("User", userSchema); // Define the User model

module.exports = User;
