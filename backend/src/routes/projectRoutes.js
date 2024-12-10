const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');

router.get('/', authenticateToken, projectController.getUserProjects);
router.post('/', authenticateToken, projectController.createProject);
router.get('/:id', authenticateToken, projectController.getProjectById);
router.patch('/:id', authenticateToken, projectController.updateProject);
router.delete('/:id', authenticateToken, projectController.deleteProject);
router.post('/:id/add-user', authenticateToken, projectController.addUserToProject);
router.delete('/:id/remove-user', authenticateToken, projectController.removeUserFromProject);
router.get('/:id/users', authenticateToken, projectController.getProjectUsers);
router.post('/:id/add-task', authenticateToken, projectController.addTaskToProject);
router.get('/:id/tasks', authenticateToken, projectController.getProjectTasks);

module.exports = router;