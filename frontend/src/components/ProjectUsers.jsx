import React, { useState, useEffect } from "react";
import { mainAxios } from "../context/AuthContext";

const ProjectUsers = ({ projectId }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState("");
  const [role, setRole] = useState("Contributor"); // Default role
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await mainAxios.get(`/projects/${projectId}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };
  useEffect(() => {
    if (projectId) fetchUsers();
  }, [projectId]);

  const handleAddUser = async () => {
    if (!newUser || !role) {
      setError("Email and role are required.");
      return;
    }
    try {
      const response = await mainAxios.post(`/projects/${projectId}/add-user`, {
        user_email: newUser,
        role,
      });

      // Assuming the server returns the updated user list or added user object
      fetchUsers(); // Fetch users after adding
      setNewUser("");
      setRole("Contributor"); // Reset the role to default
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unexpected error occurred.";
      alert(`Error adding user: ${errorMessage}`);
      console.error("Error adding user:", err.response?.data);
      setError(
        errorMessage || "Could not add user. Make sure the email is valid and the role is correct."
      );
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      const response = await mainAxios.delete(
        `/projects/${projectId}/remove-user`,
        {
          data: { userId },
        }
      );
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unexpected error occurred.";
      alert(`Error removing user: ${errorMessage}`);
      console.error("Error removing user:", err.response?.data);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Project Users</h2>
      <ul className="mb-4">
        {users.map((user) => (
          <li key={user.id} className="flex justify-between items-center mb-2">
            <div className="flex-1 flex space-between">
              <span className="font-semibold">{user.username}</span>
              <span className="text-gray-600">({user.email})</span>
              <span className="text-gray-600">{user.role}</span>
            </div>
            <button
              onClick={() => handleRemoveUser(user.id)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center mb-4">
        <input
          type="email"
          placeholder="Add user by email"
          className="border p-2 flex-1"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
        />
        <select
          className="border p-2 ml-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Manager">Manager</option>
          <option value="Contributor">Contributor</option>
          <option value="Viewer">Viewer</option>
        </select>
        <button
          onClick={handleAddUser}
          className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ProjectUsers;
