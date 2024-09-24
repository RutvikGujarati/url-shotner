const con = require("../connection/connect")
//create a schema for mongoose

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// create a model using the schema

const User = mongoose.model("User", userSchema);

module.exports = User;

// create a new user

exports.createUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  try {
    await user.save();
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create user");
  }
};

// login a user

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return user;
};

// update user password

exports.updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

// delete user

exports.deleteUser = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new Error("User not found");
  }

  return deletedUser;
};

// get user by username

exports.getUserByUsername = async (username) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// get user by email

exports.getUserByEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// verify user email

exports.verifyUserEmail = async (userId, token) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { emailVerified: true, emailVerificationToken: null },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// forgot password

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  await User.findByIdAndUpdate(
    user._id,
    { forgotPasswordToken: token },
    { new: true }
  );

  return { token };
};

// reset password

exports.resetPassword = async (token, newPassword) => {
  const { userId } = jwt.verify(token, process.env.JWT_SECRET);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword, forgotPasswordToken: null },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

// get user by token

exports.getUserByToken = async (token) => {
  const { userId } = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
