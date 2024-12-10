const { Project, Task } = require("../models");

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

// Get task by id
exports.getTaskById = async (req, res) => {
    const req_user_id = req.user.id;
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ error: "Task not found" });

        const project_id = task.project_id;

        // check if the user has a role in the project
        const userRole = await checkUserRole(req_user_id, project_id);
        if (!userRole) return res.status(403).json({ error: "You don't have access to this task" });

        res.json(task);
    } catch (error) {
        console.error('Error fetching task by ID:', error);
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
            return res.status(403).json({ error: "Access denied. You don't have access to this task" });
        }

        // Only allow Managers or Contributors to update the task
        if (userRole.role !== 'Manager' && userRole.role !== 'Contributor') {
            return res.status(403).json({ error: "Access denied. You don't have access to update this task" });
        }

        // Validate the status and priority if provided
        const validStatuses = ['To Do', 'In Progress', 'Done'];
        const validPriorities = ['Low', 'Medium', 'High'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ error: "Invalid priority" });
        }

        // validate assignee_id by checking if the user is a member of the project using the function checkUserRole
        if (assignee_id) {
            const assigneeRole = await checkUserRole(assignee_id, project_id);
            if (!assigneeRole) return res.status(400).json({ error: "Invalid assignee" });
        }

        const updatedTask = await task.update({
            title: title || task.title,
            description: description || task.description,
            status: status || task.status,
            priority: priority || task.priority,
            assignee_id: assignee_id || task.assignee_id
        });
        res.json(updatedTask);
    } catch (error) {
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
            return res.status(403).json({ error: "Access denied. You don't have access to delete this task" });
        }

        // Only allow Managers or Contributors to delete the task
        const allowedRoles = ['Manager', 'Contributor'];
        if (!allowedRoles.includes(userRole.role)) {
            return res.status(403).json({ error: "Access denied. You don't have permission to delete this task" });
        }

        // Delete the task
        const rowsDeleted = await Task.destroy({
            where: { id: req.params.id },
        });

        if (!rowsDeleted) return res.status(404).json({ error: "Task not found" });

        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error("Error deleting task:", error); // Log the error for debugging
        res.status(500).json({ error: "Internal server error" });
    }
};
