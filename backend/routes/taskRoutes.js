const express = require("express");
const Task = require("./../models/Task");
const router = express.Router();
const User = require("./../models/User");

const {
  requireVerifiedUserAndAuthenticated,
} = require("../middleware/authMiddleware");

// Apply verification check to every task API call
router.use(requireVerifiedUserAndAuthenticated);
// Get all tasks (RESTful: GET /tasks)
router.get("/", async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortParam = req.query.sort || "-createdAt";
    const sortOptions = sortParam.split(",").map((s) => {
      const dir = s.startsWith("-") ? -1 : 1;
      const field = s.replace("-", "");
      return [field, dir];
    });
    const sortObj = Object.fromEntries(sortOptions);

    const filter = { userId: userId };
    if (req.query.completed !== undefined) {
      filter.completed =
        req.query.completed === "true" || req.query.completed === "1";
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const tasks = await Task.find(filter).sort(sortObj).skip(skip).limit(limit);

    const total = await Task.countDocuments(filter);

    return res.status(200).json({
      success: true,
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!title || !description) {
      return res.status(408).json({
        success: false,
        messages: "Please Fill all fields",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    let newTask = await Task.create({
      title: title,
      description: description,
      completed: completed,
      userId: userId,
    });

    user.tasks.push(newTask);
    user.save();
    return res.status(200).json({
      success: true,
      message: "Task Added Successfully",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
});

// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Remove task from user's tasks array
    await User.updateOne({ _id: task.userId }, { $pull: { tasks: id } });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// Update Task
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const task = await Task.findByIdAndUpdate(id, updatedData, { new: true });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // If the task's userId is changed, update the tasks array in both old and new users
    if (updatedData.userId && task.userId !== updatedData.userId) {
      await User.updateOne({ _id: task.userId }, { $pull: { tasks: id } });
      await User.updateOne(
        { _id: updatedData.userId },
        { $push: { tasks: id } },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
