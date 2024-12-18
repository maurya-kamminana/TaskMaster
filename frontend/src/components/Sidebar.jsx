import React, { useEffect, useState } from "react";
import { mainAxios } from "../context/AuthContext";
import ProjectModal from "./ProjectModal";
import ProjectDropdown from "./ProjectDropdown";

const Sidebar = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [editedProjectName, setEditedProjectName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.error("Access token not found!");
        } else {
          const response = await mainAxios.get("/projects");
          setProjects(response.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();

    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleCreateProject = async (projectName) => {
    try {
      const response = await mainAxios.post("/projects", {
        name: projectName,
      });
      setProjects([...projects, response.data]);
      setIsModalOpen(false);
      setNewProjectName("");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await mainAxios.delete(`/projects/${projectId}`);
      setProjects(projects.filter((project) => project.id !== projectId));
      setDropdownOpen(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unexpected error occurred.";
      alert(`Error deleting project : ${errorMessage}`);
      console.error("Error deleting project :", err.response?.data);
    }
  };

  const handleEditProject = async (projectName) => {
    try {
      const response = await mainAxios.patch(`/projects/${currentProject.id}`, {
        name: projectName,
      });
      setProjects(
        projects.map((project) =>
          project.id === currentProject.id ? response.data : project
        )
      );
      setIsEditModalOpen(false);
      setEditedProjectName("");
      setDropdownOpen(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An unexpected error occurred.";
      alert(`Error updating project : ${errorMessage}`);
      console.error("Error updating project :", err.response?.data);
    }
  };

  const handleOptionsClick = (projectId) => {
    setDropdownOpen(dropdownOpen === projectId ? null : projectId);
  };

  return (
    <aside className="w-64 bg-gray-200 p-4">
      <h2 className="text-lg font-bold mb-4">Projects</h2>
      <ul>
        {projects.map((project) => (
          <li
            key={project.id}
            className="p-2 hover:bg-gray-300 cursor-pointer flex justify-between items-center"
          >
            <span onClick={() => onProjectSelect(project.id)}>{project.name}</span>
            <div className="relative dropdown">
              <button className="p-1" onClick={() => handleOptionsClick(project.id)}>
                <span className="text-lg">...</span>
              </button>
              {dropdownOpen === project.id && (
                <ProjectDropdown
                  project={project}
                  onEdit={(project) => {
                    setCurrentProject(project);
                    setEditedProjectName(project.name);
                    setIsEditModalOpen(true);
                    setDropdownOpen(null);
                  }}
                  onDelete={handleDeleteProject}
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setIsModalOpen(true)}
      >
        Create New Project
      </button>

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        projectName={newProjectName}
        setProjectName={setNewProjectName}
        title="Create New Project"
        actionText="Create"
      />

      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditProject}
        projectName={editedProjectName}
        setProjectName={setEditedProjectName}
        title="Edit Project"
        actionText="Save Changes"
      />
    </aside>
  );
};

export default Sidebar;
