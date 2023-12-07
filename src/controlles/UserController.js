const createUserToken = require("../helpers/create-user-token");
const { create } = require("../models/Coin");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const getToken = require("../helpers/get-token");
const jwt = require("jsonwebtoken");
const getUserByToken = require("../helpers/get-user-by-token");
const { accAddress } = require("../config");
module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, confirmPassword } = req.body;
    if (!email) {
      res.status(422).json({ message: "email requirid" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "password requirid" });
      return;
    }
    if (!confirmPassword) {
      res.status(422).json({ message: "confirm password requirid" });
      return;
    }
    if (!name) {
      res.status(422).json({ message: "name requirid" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(422).json({ message: "confirm password invalid" });
      return;
    }
    const userExists = await User.findOne({ Email: email });
    if (userExists) {
      res.status(422).json({ message: "e-mail is Exists" });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwortHash = await bcrypt.hash(password, salt);
    const user = new User({
      Name: name,
      Email: email,
      Password: passwortHash,
    });
    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
      res.status(200).json({ message: "creatd", newUser });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: "email requirid" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "password requirid" });
      return;
    }

    const user = await User.findOne({ Email: email });
    if (!user) {
      res.status(422).json({ message: "password invalid or user not Exists" });
      return;
    }

    const checkPassword = await bcrypt.compare(password, user.Password);
    if (!checkPassword) {
      res.status(422).json({ message: "password invalid or user not Exists" });
      return;
    }

    await createUserToken(user, req, res);
  }
  static async checkUser(req, res) {
    let currentUser;
    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");
      currentUser = await User.findById(decoded.id);
      currentUser.Password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send({
      name: currentUser.Name,
      userId: currentUser._id,
      email: currentUser.Email,
      wallet: accAddress,
    });
  }
  static async displayUser(req, res) {
    const user = getUserByToken(req);
    if (!user) {
      res.status(422).json({ message: "user not exists" });
      return;
    } else {
      res.status(200).json(user);
    }
  }
  static async getUserById(req, res) {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(422).json({ message: "user not exists" });
      return;
    }
  }
  static async editUser(req, res) {
    const id = getUserByToken(req);
    const user = await User.findById(id);
    const { name, email, password, confirmPassword } = req.body;
    if (!email) {
      res.status(422).json({ message: "email requirid" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "password requirid" });
      return;
    }
    if (!confirmPassword) {
      res.status(422).json({ message: "confirm password requirid" });
      return;
    }
    if (!name) {
      res.status(422).json({ message: "name requirid" });
      return;
    }
    user.Name = name;
    if (password !== confirmPassword) {
      res.status(422).json({ message: "confirm password invalid" });
      return;
    } else if (password === confirmPassword && password != null) {
      const salt = await bcrypt.genSalt(12);
      const passwortHash = await bcrypt.hash(password, salt);
      user.Password = passwortHash;
    }
    if (!user) {
      res.status(422).json({ message: "user not exists" });
    }
    const userExists = await User.findOne({ Email: email });
    if (user.Email !== email && userExists) {
      res.status(422).json({ message: "user exists" });
    }
    user.Email = email;
    try {
      const updateUser = await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({ message: "salve success." });
    } catch (err) {
      res.status(500).json({ message: err });
    }
    return;
  }
};
