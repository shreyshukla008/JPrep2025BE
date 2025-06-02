const Starred = require("../models/starred");
const User = require("../models/user");
const Subject = require("../models/subject")


exports.getStarredSubjects = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user without populating the subject docs
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ starredSubjects: user.starred }); // This will be an array of subject IDs
  } catch (error) {
    console.error("Error fetching starred subjects:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};




exports.createStarredSubject = async (req, res) => {
  console.log('createStarredSubject controller called');
  try {
    const { subjectId, userId } = req.body;
    console.log('Request body:', req.body);

    if (!subjectId || !userId) {
      console.log('Missing subjectId or userId');
      return res.status(400).json({ message: "Subject ID and User ID are required" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      console.log('Subject not found:', subjectId);
      return res.status(404).json({ message: "Subject not found" });
    }
    console.log('Subject found:', subject);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }
    console.log('User found:', user);

    const alreadyStarred = user.starred.includes(subjectId);
    console.log('Already starred check:', alreadyStarred);
    if (alreadyStarred) {
      return res.status(409).json({ message: "Subject already starred" });
    }

    // Push the subjectId directly into user.starred array
    user.starred.push(subjectId);
    await user.save();
    console.log('Subject added to user starred array');

    res.status(201).json({
      message: "Subject starred successfully and added to user!",
      starredSubject: subject,  // return subject info if you want
    });
  } catch (error) {
    console.error('Error in createStarredSubject:', error);
    res.status(500).json({
      message: "Failed to star subject",
      error: error.message,
    });
  }
};


exports.removeStarredSubject = async (req, res) => {
  try {
    const { subjectId, userId } = req.body;

    if (!subjectId || !userId) {
      return res.status(400).json({ message: "Subject ID and User ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isStarred = user.starred.includes(subjectId);
    if (!isStarred) {
      return res.status(404).json({ message: "Subject is not starred by the user" });
    }

    // Remove subjectId from user's starred array
    user.starred = user.starred.filter(id => id.toString() !== subjectId);
    await user.save();

    res.status(200).json({
      message: "Starred subject removed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove starred subject",
      error: error.message,
    });
  }
};





// Delete all starred items for a specific user
// exports.deleteUserStarredItems = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Delete all starred items linked to the user
//     await Starred.deleteMany({ _id: { $in: user.starred } });

//     // Clear the user's starred array
//     user.starred = [];
//     await user.save();

//     res.status(200).json({ message: "All starred items deleted for this user" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Delete all starred items linked to a subject


// Remove a subject from all users' starred arrays when the subject is deleted
exports.deleteStarredBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    // Update all users: pull subjectId from their starred arrays
    const result = await User.updateMany(
      { starred: subjectId },
      { $pull: { starred: subjectId } }
    );

    res.status(200).json({
      message: "Subject removed from all users' starred lists successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove subject from starred lists", error: error.message });
  }
};



