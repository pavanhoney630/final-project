// server.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Run locally only
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Local server running on ${PORT}`));
    }
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

// 👉 Export app for Vercel
module.exports = app;
