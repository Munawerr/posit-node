const express = require("express");
const app = express();
// const mongoose = require("mongoose");

//import routes
const restRoutes = require("./routes/restaurants");

app.use("/", restRoutes);


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listenting to Port ${port}...`));
