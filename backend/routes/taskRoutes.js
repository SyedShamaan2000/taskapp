const express = require("express");
const Task = require("./../models/Task");
const router = express.Router();
const User = require("./../models/User");

// Get all tasks
router.post("/fetch", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const query = {
      userId: userId,
    };

    const tasks = await Task.find(query);

    return res.status(200).json({
      success: true,
      tasks: tasks,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description, userId, completed } = req.body;

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
