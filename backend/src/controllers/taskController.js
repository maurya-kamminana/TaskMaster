const { Project, Task, Role, User } = require("../models");
const redisClient = require("../../redisClient");

// function to check if the user has a role in the project
const checkUserRole = async (user_id, project_id) => {
  const userRole = await Role.findOne({
    where: {
      user_id,
      project_id,
    },
  });
  return userRole;
};

// Invalidate the cache for a project when a task is created, updated or deleted
async function invalidateProjectCache(project_id) {
  // Delete all keys related to this project
  const cacheKeyPattern = `project:${project_id}:*`;
  const keys = await redisClient.keys(cacheKeyPattern); // Get all matching keys
  if (keys.length > 0) {
    await redisClient.del(keys); // Delete all matching keys
    console.log(`Cache invalidated for project: ${project_id}`);
  }
}

// Get task by id
exports.getTaskById = async (req, res) => {
  const req_user_id = req.user.id;
  try {
    // Fetch task along with the assignee details (User)
    const task = await Task.findByPk(req.params.id, {
      attributes: [
        "id",
        "title",
        "project_id", 
        "description",
        "status",
        "priority",
        "assignee_id",
        "created_at",
      ],
      include: [
        {
          model: User, // Include the assignee details
          as: "assignee", // Assuming Task model has an alias for the User model as 'assignee'
          attributes: ["id", "username", "email"], // Include only specific user fields
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const project_id = task.project_id;

    // Check if the user has a role in the project
    const userRole = await checkUserRole(req_user_id, project_id);
    if (!userRole) {
      return res
        .status(403)
        .json({ error: "You don't have access to this task" });
    }

    // Send task details along with the assignee data
    res.json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update task by id
exports.updateTask = async (req, res) => {
  const { title, description, status, priority, assignee_id } = req.body;
  const req_user_id = req.user.id;
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project_id = task.project_id;

    // Check if the user has a role in the project
    const userRole = await checkUserRole(req_user_id, project_id);
    if (!userRole) {
      return res.status(403).json({ error: "Access denied. You don't have access to this task, You are not part of the project" });
    }

    // Only allow Managers or Contributors to update the task
    if (userRole.role !== "Manager" && userRole.role !== "Contributor") {
      return res.status(403).json({error: "Access denied. Only Managers or Contributors can update the task"});
    }

    // Validate the status and priority if provided
    const validStatuses = ["To Do", "In Progress", "Done"];
    const validPriorities = ["Low", "Medium", "High"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }

    // validate assignee_id by checking if the user is a member of the project using the function checkUserRole
    if (assignee_id) {
      const assigneeRole = await checkUserRole(assignee_id, project_id);
      if (!assigneeRole)
        return res.status(400).json({ error: "Invalid assignee" });
    }

    const updatedTask = await task.update({
      title: title || task.title,
      description: description || task.description,
      status: status || task.status,
      priority: priority || task.priority,
      assignee_id: assignee_id ,
    });

    // Invalidate the cache for the project
    invalidateProjectCache(project_id);

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error); 
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete task by id
exports.deleteTask = async (req, res) => {
  const req_user_id = req.user.id;
  try {
    // Fetch the task by ID
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project_id = task.project_id;

    // Check if the user has a role in the project
    const userRole = await checkUserRole(req_user_id, project_id);
    if (!userRole) {
      return res.status(403).json({error: "Access denied. You don't have access to delete this task",});
    }

    // Only allow Managers or Contributors to delete the task
    const allowedRoles = ["Manager", "Contributor"];
    if (!allowedRoles.includes(userRole.role)) {
      return res.status(403).json({error: "Access denied. only Managers or Contributors can delete the task",});
    }

    // Delete the task
    const rowsDeleted = await Task.destroy({
      where: { id: req.params.id },
    });

    if (!rowsDeleted) return res.status(404).json({ error: "Task not found" });

    // Invalidate the cache for the project
    invalidateProjectCache(project_id);

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting task:", error); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};
