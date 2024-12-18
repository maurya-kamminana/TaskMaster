import React, { useState, useEffect } from "react";
import { mainAxios } from "../context/AuthContext";
import TaskModal from "./TaskModal"; // Import the TaskModal component

const ProjectTasks = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [selectedTask, setSelectedTask] = useState(null); // Task for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async (page = 1) => {
    try {
      const response = await mainAxios.get(
        `/projects/${projectId}/tasks?page=${page}&limit=${pagination.itemsPerPage}`
      );
      if (response.data.tasks) {
        setTasks(response.data.tasks);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks(pagination.currentPage);
  }, [projectId, pagination.currentPage]);

  const handleAddTask = async () => {
    if (!newTask) return;
    try {
      const response = await mainAxios.post(`/projects/${projectId}/add-task`, {
        title: newTask,
      });
      setTasks([...tasks, response.data]);
      setNewTask("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unexpected error occurred.";
      alert(`Error adding task: ${errorMessage}`);
      console.error("Error adding task:", err.response?.data);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await mainAxios.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unexpected error occurred.";
      alert(`Error deleting task: ${errorMessage}`);
      console.error("Error deleting task:", err.response?.data);
    }
  };

  const handleTaskClick = async (taskId) => {
    try {
      const response = await mainAxios.get(`/tasks/${taskId}`);
      setSelectedTask(response.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching task details:", err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Project Tasks</h2>
      {/* Task Table */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Priority</th>
            <th className="border p-2 text-left">Assignee</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-100">
                {/* Title - Clickable */}
                <td
                  className="border p-2 text-blue-500 cursor-pointer underline"
                  onClick={() => handleTaskClick(task.id)}
                >
                  {task.title}
                </td>
                <td className="border p-2">
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded">
                    {task.status}
                  </span>
                </td>
                <td className="border p-2">{task.priority}</td>
                <td className="border p-2">
                  {task.assignee ? task.assignee.username : "Unassigned"}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No tasks available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Add Task Input */}
      <div className="flex items-center mt-4">
        <input
          type="text"
          placeholder="New task title"
          className="border p-2 flex-1"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={handleAddTask}
          className="bg-green-500 text-white px-4 py-2 ml-2 rounded"
        >
          Add Task
        </button>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={handleCloseModal}
          fetchTasks={fetchTasks} // Pass fetchTasks to TaskModal
        />
      )}
    </div>
  );
};

export default ProjectTasks;
