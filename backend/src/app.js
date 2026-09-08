const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.sendStatus(200));

app.use("/auth", require("./routes/auth.routes"));
app.use("/upload", require("./routes/upload.routes"));
app.use("/reports", require("./routes/report.routes"));

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

module.exports = app;
