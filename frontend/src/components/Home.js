import React, { useState } from 'react';
import Collapsible from './Collapsible';
import './Home.css';

const applications = [
  {
    title: 'Real-time Network Monitoring',
    description: 'Provides a live overview of network statistics, including active links, packet rate, latency, and bandwidth utilization. The dashboard features a real-time chart to visualize network utilization over time.',
  },
  {
    title: 'Dynamic Flow Rule Management',
    description: 'Allows for the dynamic creation and deletion of flow rules to control the path of network traffic. Users can define rules based on source and destination IP addresses and specify actions like ALLOW, DENY, or REDIRECT.',
  },
  {
    title: 'Quality of Service (QoS) Policy Enforcement',
    description: 'Enables the configuration of QoS policies to prioritize network traffic. Users can create policies based on priority levels and allocate specific bandwidth to ensure critical applications receive the necessary resources.',
  },
  {
    title: 'Traffic Engineering and Routing',
    description: 'Provides tools for traffic engineering, allowing users to define custom forwarding paths for specific types of traffic. This enables optimized routing and efficient use of network resources.',
  },
];

const Home = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>SDN Controller Dashboard</h1>
        <p>This application provides a centralized interface for managing and monitoring a Software-Defined Network (SDN).</p>
      </div>
      <div className="applications-list">
        <h2>Applications</h2>
        {applications.map((app, index) => (
          <Collapsible
            key={index}
            title={app.title}
            isOpen={openSection === index}
            toggle={() => toggleSection(index)}
          >
            <p>{app.description}</p>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default Home;