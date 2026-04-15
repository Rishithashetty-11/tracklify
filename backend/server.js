const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// ✅ CORS setup (IMPORTANT)
app.use(cors({
  origin: "https://tracklify-sfor-bs7d1acra-tracklify.vercel.app", // 👉 replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// DB connect
connectDB();

// routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/project"));
app.use("/api", require("./routes/time"));
app.use("/api", require("./routes/invoice"));
app.use("/api", require("./routes/payment"));
app.use("/api", require("./routes/client"));
app.use("/api", require("./routes/notification"));

// ✅ default route (for testing)
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});