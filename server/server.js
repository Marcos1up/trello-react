require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { authenticate, setUser } = require("./middlewares/auth");

//import de rutas
const userRoute = require("./routes/userRoute");
const boardRoute = require("./routes/boardRoute");
const listRoute = require("./routes/listRoute");
const cardRoute = require("./routes/cardRoute");

//express
const app = express();

app.use(cors());
app.use(express.json());

//auth
app.use(authenticate);
app.use(setUser);

//conexión a MongoDB
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DB_CREDENTIAL)
  .then(() => {
    console.log("✅ ¡Conexión a MongoDB exitosa!");
    app.listen(process.env.PORT, () => {
      console.log(`✅ El servidor está listo! Puerto: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`💥 Error al conectarse a MongoDB: ${error}`);
    console.log(`Detalles: ${error}`);
  });

//config de rutas
app.use("/user", userRoute);
app.use("/board", boardRoute);
app.use("/list", listRoute);
/* 
app.use("/card", cardRoute); 
*/
