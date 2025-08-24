// server.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
   if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Local server running on 5000"));
}

  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });
