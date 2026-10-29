const express = require("express");
const Task = require("./../models/Task");
const router = express.Router();
const User = require("./../models/User");

const {
  requireVerifiedUserAndAuthenticated,
} = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  taskIdSchema,
  taskQuerySchema,
  taskSchema,
  taskUpdateSchema,
} = require("../utils/validators");

// Apply verification check to every task API call
router.use(requireVerifiedUserAndAuthenticated);
// Get all tasks (RESTful: GET /tasks)
router.get("/", validate(taskQuerySchema, "query"), async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit, sort, status, priority, search } = req.validatedQuery;
    const skip = (page - 1) * limit;

    // Build mongoose sort object from comma-separated ±field list.
    const sortOptions = sort.split(",").map((s) => {
      const dir = s.startsWith("-") ? -1 : 1;
      const field = s.replace(/^-/, "");
      return [field, dir];
    });
    const sortObj = Object.fromEntries(sortOptions);

    const filter = { userId };
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedSearch, "i");
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
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Create a new task (status / priority / tags / dueDate aligned with Task model)
router.post("/", validate(taskSchema, "body"), async (req, res) => {
  try {
    // req.body is the Joi-validated value (includes defaults for status/priority/tags).
    const { title, description, status, priority, dueDate, tags } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unable to create task",
      });
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      userId,
    });

    user.tasks.push(newTask);
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Task Added Successfully",
      task: newTask,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete Task
router.delete("/:id", validate(taskIdSchema, "params"), async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

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
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update Task
router.put(
  "/:id",
  validate(taskIdSchema, "params"),
  validate(taskUpdateSchema, "body"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const task = await Task.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        updatedData,
        { new: true, runValidators: true },
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

module.exports = router;
