const express = require("express");
var jwt = require("jsonwebtoken");
const cors = require("cors");
// require("./socket/server").socket();
require("./db/config");
const dotenv = require("dotenv");
dotenv.config();

// const io = require('socket.io');

const UsersModel = require("./models/Users");
const DocsModel = require("./models/docs");
const { accessControl } = require("./middleware");
const socketClient = require("./socket/client");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

//to get static files . to connect client folder to server
// app.use(express.static(path.join(__dirname,"../client/build/")));

app.get("/start", (req, res) => {
  res.send("Working");
});

//signup Api

app.post("/signup", (req, res) => {
  UsersModel.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        throw { message: "User Already Exists", status: 400 };
      }
      return UsersModel.create(req.body);
    })
    .then((emp) => {
      res.json(emp);
    })
    .catch((err) => res.status(err.status).send(err));
});

//Login Api

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  UsersModel.findOne({ username: username, password: password })

    .then((emp) => {
      if (!emp) {
        throw { message: "User Does Not Exists", status: 400 };
      }
      emp = emp.toJSON();
      var token = jwt.sign(emp, "shhhhh");
      emp.token = token;
      res.json(emp);
    })
    .catch((err) => res.status(err.status).send(err));
});

//Adding new document

app.post("/doc/add", accessControl, (req, res) => {
  const user = req.user;
  const { name, text } = req.body;

  DocsModel.findOne({ name: name })
    .then(async (data) => {
      if (data) {
        let res = await DocsModel.updateOne({ name: name }, { text: text });
        console.log("res", res);
        const event = {
          _id: data._id,
          text: text,
        };
        socketClient.emitEvent(event);
        return {};
      }
      const doc = {
        name: name,
        ownerId: user._id.toString(),
        user: [],
        text: text,
      };
      return DocsModel.create(doc);
    })
    .then((emp) => {
      res.json(emp);
    })
    .catch((err) => res.status(err.status || 500).send(err));
});

//search existing document

app.get("/doc/details/:name", accessControl, (req, res) => {
  const user = req.user;
  const { name } = req.params;

  DocsModel.findOne({ name: name })
    .then((data) => {
      if (!data) {
        throw { message: "Invalid Doc", status: 400 };
      }
      const doc = data.toJSON();
      const users = doc.users;
      res.json(data);
    })
    .catch((err) => res.status(err.status || 500).send(err));
});

//if none of the above api match then the following api works

// app.get("*",(req,res)=>{
//   res.sendFile(path.join(__dirname,"../client/build/index.html"));
// });

// server status
const PORT = process.env.PORT || 4000;
// const PORT = 4000;
const server = app.listen(PORT, () => {
  console.log(`server is running on: ${PORT}`);
});

// ------------------------------------------------------socket----------------------------

const io = require("socket.io")(server, { cors: { origin: "*" } });
function getTopic(event) {
  return `doc_${event._id}`;
}

io.on("connection", (client) => {
  console.log("socket client connected------", client.id);

  client.on("text", (data) => {
    console.log("event data text", data);
    io.emit(getTopic(data), data);
  });
  client.on("disconnect", (info) => {
    console.log("Disconnected", info);
  });
});
