require("dotenv").config();
const express = require("express");

const assetsRouter = require("./routes/assets");
const documentsRouter = require("./routes/documents");
const hooksRouter = require("./routes/hooks");

const app = express();
app.use(express.json());

app.use("/assets", assetsRouter);
app.use("/documents", documentsRouter);
app.use("/hooks", hooksRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
