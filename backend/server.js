const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const client = require("prom-client");

//CORS setup
const allowedOrigins = [
  "https://tracklify-sfor-bs7d1acra-tracklify.vercel.app",
  "http://localhost:3000",
  "https://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

// DB connect
connectDB();
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics();

// routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/project"));
app.use("/api", require("./routes/time"));
app.use("/api", require("./routes/invoice"));
app.use("/api", require("./routes/payment"));
app.use("/api", require("./routes/client"));
app.use("/api", require("./routes/notification"));

app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});
// default route (for testing)
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});