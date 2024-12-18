// Modal component for creating and editing projects

import React from 'react';

const ProjectModal = ({ isOpen, onClose, onSubmit, projectName, setProjectName, title, actionText }) => {
  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <input
          type="text"
          className="border p-2 mb-4 w-full"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={onClose} // Close the modal
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => onSubmit(projectName)}
            disabled={!projectName} // Disable if input is empty
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ProjectModal;
