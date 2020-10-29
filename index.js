const express = require("express");
const app = express();
// const mongoose = require("mongoose");
// const port = process.env.PORT || 8080;

//import routes
const restRoutes = require("./routes/restaurants");

app.use("/", restRoutes);
app.use("/api/restaurants", restRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Listenting to Port ${port}...`)
);
