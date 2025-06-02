const User = require("../models/user");
const Starred = require("../models/starred");

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, role } = req.body;

    // Validation check
    if (!name || !role) {
      return res.status(400).json({ message: "Missing required fields: name or role" });
    }

    // Create the user
    const newUser = new User({ name, role });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user (and clean up starred items)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all starred items linked to the user
    await Starred.deleteMany({ _id: { $in: user.starred } });

    // Delete the user itself
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and all linked starred items deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
