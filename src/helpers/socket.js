module.exports = function (io) {
  io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("disconnect", function () {
      console.log("A user disconnected");
    });

    socket.on("chat message", function (msg) {
      io.emit("chat message", msg);
    });
  });
};
