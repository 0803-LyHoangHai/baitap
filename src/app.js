const express = require("express");
const userRoutes = require("./routes/user.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("User Import API is running...");
});

app.use("/api/users", userRoutes);

module.exports = app;