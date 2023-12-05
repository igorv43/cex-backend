module.exports = function (socket) {
  //You can declare all of your socket listeners in this file, but it's not required

  socket.on("login", function () {
    console.log("logged in");
  });
};
