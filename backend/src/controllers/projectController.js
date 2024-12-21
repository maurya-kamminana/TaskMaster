const { Project, Role, User, Task, Notification } = require("../models");
const { publishNotificationToKafka } = require("../utils/kafka");

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

// function to check if the user has a role 'Manager' in the project
const checkUserIsManager = async (user_id, project_id) => {
  const userRole = await Role.findOne({
    where: {
      user_id,
      project_id,
      role: "Manager",
    },
  });
  return userRole;
};

// get all projects associated with the current user
exports.getUserProjects = async (req, res) => {
  try {
    const user_id = req.user.id;
    const projects = await Project.findAll({
      include: {
        model: Role, // Include the Role model inner joined with the Project model
        where: { user_id },
        attributes: [], // Exclude Role attributes from the result
      },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// create a new project and assign the current user as the manager
exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  const user_id = req.user.id;

  try {
    const project = await Project.create({
      name,
      description,
      manager_id: user_id,
    });

    await Role.create({
      user_id,
      project_id: project.id,
      role: "Manager",
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const project_id = req.params.id;

    // Check if the user has a role in the project
    const userRole = await checkUserRole(user_id, project_id);

    if (!userRole)
      return res
        .status(403)
        .json({ error: "Access denied. You are not part of this project." });

    const project = await Project.findByPk(project_id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// update and delete project details can only be done by the user who created the project
exports.updateProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const user_id = req.user.id;

    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Check if the user is the one who created the project
    if (project.manager_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Access denied. You are not the project creator" });
    }

    // Update only the fields that are provided in the request body
    await project.update({
      name: name || project.name, // If 'name' is not provided, use the current value
      description: description || project.description, // If 'description' is not provided, use the current value
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const user_id = req.user.id;

    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Check if the user is the one who created the project
    if (project.manager_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Access denied. You are not the project creator" });
    }

    const rowsDeleted = await Project.destroy({
      where: { id: req.params.id },
    });

    if (!rowsDeleted)
      return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add and remove users from a project can only be done by the user who has the 'Manager' role in the project
exports.addUserToProject = async (req, res) => {
  const { user_email, role } = req.body;
  const manager_id = req.user.id;
  const project_id = req.params.id;

  try {
    if (!user_email || !role) {
      console.error("Failed adding user to project. Email and role are required");
      return res.status(400).json({ error: "User email and role are required" });
    }

    // Validate role
    const validRoles = ["Manager", "Contributor", "Viewer"];
    if (!validRoles.includes(role)) {
      console.error("Failed adding user to project. Invalid role:", role);
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if the user is the manager of the project
    const userIsManager = await checkUserIsManager(manager_id, project_id);
    if (!userIsManager) {
      return res
        .status(403)
        .json({ error: "Access denied. You are not the project Manager" });
    }

    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const user = await User.findOne({ where: { email: user_email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user already has a role in the project
    const existingRole = await Role.findOne({
      where: {
        user_id: user.id,
        project_id,
      },
    });

    if (existingRole) {
      return res
        .status(400)
        .json({ error: "User already has a role in this project" });
    }

    await Role.create({
      project_id,
      user_id: user.id,
      role,
    });

    // store the notification in the database
    await Notification.create({
      user_id: user.id,
      type: "project_user_added",
      message: `You have been added to project ${project_id}`,
    });

    // Publish a notification to Kafka
    await publishNotificationToKafka("project.user.added", {
      projectId: project_id,
      userId: user.id,
    });

    res.status(201).json({ message: "User added to project" });
  } catch (error) {
    console.error("Error adding user to project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.removeUserFromProject = async (req, res) => {
  const user_id = req.body.userId;
  const manager_id = req.user.id;
  const project_id = req.params.id;
  try {
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if the user sending the request is the manager of the project
    const userIsManager = await checkUserIsManager(manager_id, project_id);
    if (!userIsManager)
      return res
        .status(403)
        .json({ error: "Access denied. You are not the project Manager" });

    // no one should not be able to remove the user who created the project
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.manager_id === user_id) {
      console.warn("Project creator cannot be removed from the project");
      return res
        .status(400)
        .json({ error: "Project creator cannot be removed from the project" });
    }

    const rowsDeleted = await Role.destroy({
      where: {
        project_id,
        user_id,
      },
    });
    
    // store the notification in the database
    await Notification.create({
      user_id,
      type: "project_user_removed",
      message: `You have been removed from project ${project_id}`,
    });

    // Publish a notification to Kafka
    await publishNotificationToKafka("project.user.removed", {
      projectId: project_id,
      userId: user_id,
    });
    
    if (!rowsDeleted){
      console.error("User not found in project");
      return res.status(404).json({ error: "User not found in project" });
    }
    res.json({ message: "User removed from project" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// lists all the users associated with a project
exports.getProjectUsers = async (req, res) => {
  const req_user_id = req.user.id;
  const project_id = req.params.id;
  try {
    // Check if the user is part of the project
    const userRole = await checkUserRole(req_user_id, project_id);
    if (!userRole)
      return res
        .status(403)
        .json({ error: "Access denied. You are not part of this project" });

    const roles = await Role.findAll({
      where: { project_id },
      include: {
        model: User,
        attributes: ["id", "username", "email"], // Include only necessary user attributes
      },
      attributes: ["role"], // Include only necessary role attributes
    });

    const result = roles.map(role => {
      return {
        role: role.role,
        id: role.User.id,
        username: role.User.username,
        email: role.User.email
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching project users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addTaskToProject = async (req, res) => {
  const { title, description, status, priority, assignee_id } = req.body;
  const req_user_id = req.user.id;
  const project_id = req.params.id;

  try {
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Check if the user is part of the project
    const userRole = await checkUserRole(req_user_id, project_id);
    if (!userRole) {
      return res
        .status(403)
        .json({ error: "Access denied. You are not part of this project" });
    }

    // Validate the user's role
    const allowedRoles = ["Manager", "Contributor"];
    if (!allowedRoles.includes(userRole.role)) {
      return res.status(403).json({
        error:
          "Access denied. Only Managers and Contributors can add tasks to this project",
      });
    }

    // Check if the project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Validate status and priority
    const validStatuses = ["To Do", "In Progress", "Done"];
    const validPriorities = ["Low", "Medium", "High"];

    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({
          error: `Invalid status. Allowed values are: ${validStatuses.join(
            ", "
          )}`,
        });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res
        .status(400)
        .json({
          error: `Invalid priority. Allowed values are: ${validPriorities.join(
            ", "
          )}`,
        });
    }

    // Check if the assignee is part of the project (if provided)
    if (assignee_id) {
      const assigneeRole = await checkUserRole(assignee_id, project_id);
      if (!assigneeRole) {
        return res
          .status(400)
          .json({
            error: "The specified assignee is not part of this project",
          });
      }
    }

    // Create the task
    const task = await Task.create({
      project_id,
      title,
      description,
      status: status || "To Do", // Default value
      priority: priority || "Medium", // Default value
      assignee_id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProjectTasks = async (req, res) => {
  const req_user_id = req.user.id;
  const project_id = req.params.id;

  // Extract pagination parameters from query
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default to 10 tasks per page
  const offset = (page - 1) * limit;

  try {
    // Check if the user is part of the project
    const userRole = await checkUserRole(req_user_id, project_id);
    if (!userRole)
      return res
        .status(403)
        .json({ error: "Access denied. You are not part of this project" });

    // Fetch tasks associated with the project, with only the required fields and pagination
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: { project_id },
      attributes: [
        "id",
        "title",
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
      limit,
      offset,
      order: [["created_at", "ASC"]],
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    // Send paginated response
    res.json({
      tasks,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
