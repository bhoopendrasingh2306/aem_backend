// const io = require('socket.io')({cors: {origin: "*"}});
// function getTopic(event) {
//   return `doc_${event._id}`;
// }

// // const PORT = process.env.PORT || 4000;

// const socket = () => {
//   io.on("connection", (client) => {
//     console.log("socket client connected------", client.id);

//     client.on("text", (data) => {
//       console.log("event data text", data);
//       io.emit(getTopic(data), data);
//     });
//     client.on("disconnect", (info) => {
//       console.log("Disconnected", info);
//     });
//   });

//   // socket server PORT
  
//   io.listen(3500, () => {
//     console.log("Sockets running on: 3500");
//   });
// };



// module.exports = { socket };
