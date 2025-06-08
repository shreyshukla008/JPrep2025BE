const Subject = require("../models/subject");

exports.getQuestionPapersForSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId).populate('questionMaterial');

    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const papersByTerm = {
      Term1: [],
      Term2: [],
      Term3: [],
    };

    subject.questionMaterial.forEach((paper) => {
      
      const status = paper.verified;
      if(!status) return;

      const term = paper.term.toLowerCase();
      if (term === 'term-1') papersByTerm.Term1.push(paper);
      else if (term === 'term-2') papersByTerm.Term2.push(paper);
      else if (term === 'term-3') papersByTerm.Term3.push(paper);
    });

    res.status(200).json(papersByTerm);
  } catch (error) {
    console.error('Error fetching question papers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.createSubject = async (req, res) => {
  try {
    const { name, code, department } = req.body;
    if (!name || !code || !department) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const existingSubject = await Subject.findOne({ name, code });
    if (existingSubject) {
      return res.status(409).json({ message: "Subject already exists!" });
    }

    const subject = new Subject({
      name,
      code,
      department,
      questionMaterial: [],
      solutionMaterial: [],
    });

    await subject.save();

    res.status(201).json({
      message: "Subject created successfully!",
      subject,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subject", error: error.message });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find(); // fetch all subjects
    res.status(200).json({
      message: "Subjects retrieved successfully!",
      subjects,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get subjects", error: error.message });
  }
};

exports.findCourseByName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Course name is required" });
    }

    const regex = new RegExp(name, "i"); // case-insensitive search
    const course = await Subject.findOne({ name: regex });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ data: course });
  } catch (err) {
    console.error("Error in findCourseByName:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.updateCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const updateData = req.body;

    const updatedCourse = await Subject.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ message: "Course updated", data: updatedCourse });
  } catch (err) {
    console.error("Error updating course:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    const deleted = await Subject.findByIdAndDelete(courseId);

    if (!deleted) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ message: "Course deleted" });
  } catch (err) {
    console.error("Error deleting course:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

