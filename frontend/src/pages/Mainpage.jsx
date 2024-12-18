import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectUsers from '../components/ProjectUsers';
import ProjectTasks from '../components/ProjectTasks';
import { mainAxios } from '../context/AuthContext';

const MainPage = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    if (selectedProjectId) {
      const fetchProjectDetails = async () => {
        try {
          const response = await mainAxios.get(`/projects/${selectedProjectId}`);
          setProjectDetails(response.data);
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      };
      fetchProjectDetails();
    }
  }, [selectedProjectId]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar onProjectSelect={setSelectedProjectId} />
        <div className="flex-1 p-4">
          {projectDetails ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">{projectDetails.name}</h1>
              <ProjectUsers projectId={selectedProjectId} />
              <ProjectTasks projectId={selectedProjectId} />
            </div>
          ) : (
            <p>Select a project to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
