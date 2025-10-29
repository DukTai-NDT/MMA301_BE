const express = require("express");
const connectDB = require("./config/db.js");
const app = express();

app.use(express.json());
connectDB();
app.get("/", async (req, res) => {
  try {
    res.send({ message: "Minh Dep Trai nhat the gioi" });
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.use("/api/auth", require("./src/routes/auth"));

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
