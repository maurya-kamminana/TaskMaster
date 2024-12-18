import React, { useState, useEffect } from "react";
import { mainAxios } from "../context/AuthContext";

const TaskModal = ({ task, projectId, onClose, fetchTasks }) => {
  const [editableTask, setEditableTask] = useState({
    title: task?.title || "",
    status: task?.status || "",
    priority: task?.priority || "",
    assignee: task?.assignee_id || "",
  });
  const [users, setUsers] = useState([]); // To store the users in the project
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch users in the current project
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await mainAxios.get(`/projects/${task.project_id}/users`);
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        alert("Failed to load users.");
      }
    };

    fetchUsers();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateTask = async () => {
    setIsUpdating(true);
    try {
      const updatedAssignee = editableTask.assignee === "" ? null : editableTask.assignee;

      const updatedData = {
        title: editableTask.title,
        status: editableTask.status,
        priority: editableTask.priority,
        assignee_id: updatedAssignee,
      };

      await mainAxios.put(`/tasks/${task.id}`, updatedData);
      alert("Task updated successfully!");
      fetchTasks(); // Fetch tasks after updating
      onClose(); // Close modal after updating
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-11/12 h-5/6 p-6 relative overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
        >
          Close
        </button>

        {/* Modal Header */}
        <h2 className="text-2xl font-bold mb-4">Edit Task</h2>

        {/* Task Editable Form */}
        <form className="space-y-4">
          <div>
            <label className="block font-medium">Title:</label>
            <input
              type="text"
              name="title"
              value={editableTask.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Status:</label>
            <select
              name="status"
              value={editableTask.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Priority:</label>
            <select
              name="priority"
              value={editableTask.priority}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Assignee:</label>
            <select
              name="assignee"
              value={editableTask.assignee}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Assignee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {/* Update Button */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleUpdateTask}
              disabled={isUpdating}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isUpdating ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
