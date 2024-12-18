import React from "react";

const ProjectDropdown = ({ project, onEdit, onDelete }) => {
  return (
    <div className="absolute right-0 bg-white border border-gray-300 shadow-md mt-1 rounded">
      <button
        className="p-2 hover:bg-gray-200 w-full text-left"
        onClick={() => onDelete(project.id)}
      >
        Delete
      </button>
      <button
        className="p-2 hover:bg-gray-200 w-full text-left"
        onClick={() => onEdit(project)}
      >
        Edit
      </button>
    </div>
  );
};

export default ProjectDropdown;
