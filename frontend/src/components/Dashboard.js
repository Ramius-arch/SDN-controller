import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { getStatistics, getRules, createRule, deleteRule, getQos, createQos, deleteQos, getTraffic, createTraffic, deleteTraffic, getSwitches, getPorts } from '../services/api';
import Collapsible from './Collapsible';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState({
    activeLinks: 7,
    packetRate: 1500,
    latency: 30,
    bandwidth: 75,
  });
  const [rules, setRules] = useState([]);
  const [qos, setQos] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [switches, setSwitches] = useState([]);
  const [ports, setPorts] = useState([]);
  const [newFlowRule, setNewFlowRule] = useState({ sourceIP: '', destinationIP: '', action: '' });
  const [newQosPolicy, setNewQosPolicy] = useState({ name: '', priority_level: 0, bandwidthAllocation: 0 });
  const [newTrafficRule, setNewTrafficRule] = useState({ name: '', sourcePort: '', destinationPort: '', forwardingPath: '' });
  const mockRules = [
    { id: 'mock-fr1', sourceIP: '192.168.1.1', destinationIP: '192.168.1.100', action: 'ALLOW' },
    { id: 'mock-fr2', sourceIP: '192.168.1.2', destinationIP: '192.168.1.101', action: 'DENY' },
    { id: 'mock-fr3', sourceIP: '192.168.1.3', destinationIP: '192.168.1.102', action: 'REDIRECT' },
  ];

  const mockQos = [
    { id: 'mock-qos1', name: 'High Priority Voice', priority_level: 5, bandwidthAllocation: 100 },
    { id: 'mock-qos2', name: 'Standard Data', priority_level: 2, bandwidthAllocation: 50 },
    { id: 'mock-qos3', name: 'Guest Traffic', priority_level: 1, bandwidthAllocation: 20 },
  ];

  const mockSwitches = [
    { id: 'mock-s1', name: 'Core-Switch-1', datapath_id: '00:00:00:00:00:00:00:01', ipAddress: '10.0.0.1', connected: true },
    { id: 'mock-s2', name: 'Edge-Switch-2', datapath_id: '00:00:00:00:00:00:00:02', ipAddress: '10.0.0.2', connected: true },
  ];

  const mockPorts = [
    { id: 'mock-p1', switch_id: 'mock-s1', port_number: 1, name: 'eth0', state: 'UP' },
    { id: 'mock-p2', switch_id: 'mock-s1', port_number: 2, name: 'eth1', state: 'UP' },
    { id: 'mock-p3', switch_id: 'mock-s2', port_number: 1, name: 'eth0', state: 'DOWN' },
  ];

  const mockTraffic = [
    { id: 'mock-tr1', name: 'Web Traffic', sourcePort: '80', destinationPort: '443', forwardingPath: ['s1', 's2'] },
    { id: 'mock-tr2', name: 'Database Sync', sourcePort: '3306', destinationPort: '3306', forwardingPath: ['s2', 's1'] },
  ];
  const [chartData, setChartData] = useState({
    labels: ['10s', '20s', '30s', '40s', '50s'],
    datasets: [
      {
        label: 'Link Utilization (%)',
        data: [65, 59, 80, 81, 56],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  const [openSections, setOpenSections] = useState({
    flowRules: true,
    qosPolicies: true,
    networkDevices: true,
    trafficRules: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [section]: !prevOpenSections[section],
    }));
  };

  useEffect(() => {
    // const fetchData = async () => {
    //   getStatistics().then(data => setStats(data));
    //   getRules().then(data => setRules(data));
    //   getQos().then(data => setQos(data));
    //   getTraffic().then(data => setTraffic(data));
    //   getSwitches().then(data => setSwitches(data));
    //   getPorts().then(data => setPorts(data));
    // };

    // fetchData(); // Initial fetch

    setRules(mockRules);
    setQos(mockQos);
    setSwitches(mockSwitches);
    setPorts(mockPorts);
    setTraffic(mockTraffic);

    const interval = setInterval(() => {
      // Simulate real-time updates for stats
      setStats(prevStats => ({
        ...prevStats,
        activeLinks: Math.floor(Math.random() * 10) + 5,
        packetRate: Math.floor(Math.random() * 2000) + 1000,
        latency: Math.floor(Math.random() * 50) + 10,
        bandwidth: Math.floor(Math.random() * 100),
      }));

      // Simulate real-time updates for chart data
      setChartData(prevChartData => {
        const newLabels = [...prevChartData.labels, `${prevChartData.labels.length * 10 + 10}s`];
        const newData = [...prevChartData.datasets[0].data, Math.floor(Math.random() * 100)];
        if (newLabels.length > 10) { // Keep only the last 10 data points
          newLabels.shift();
          newData.shift();
        }
        return {
          labels: newLabels,
          datasets: [
            {
              ...prevChartData.datasets[0],
              data: newData,
            },
          ],
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  const handleAddFlowRule = async (e) => {
    e.preventDefault();
    try {
      await createRule(newFlowRule);
      const updatedRules = await getRules();
      setRules(updatedRules);
      setNewFlowRule({ sourceIP: '', destinationIP: '', action: '' });
    } catch (error) {
      console.error('Error adding flow rule:', error);
    }
  };

  const handleDeleteFlowRule = async (id) => {
    try {
      await deleteRule(id);
      const updatedRules = await getRules();
      setRules(updatedRules);
    } catch (error) {
      console.error('Error deleting flow rule:', error);
    }
  };

  const handleAddQosPolicy = async (e) => {
    e.preventDefault();
    try {
      await createQos(newQosPolicy);
      const updatedQos = await getQos();
      setQos(updatedQos);
      setNewQosPolicy({ name: '', priority_level: 0, bandwidthAllocation: 0 });
    } catch (error) {
      console.error('Error adding QoS policy:', error);
    }
  };

  const handleDeleteQosPolicy = async (id) => {
    try {
      await deleteQos(id);
      const updatedQos = await getQos();
      setQos(updatedQos);
    } catch (error) {
      console.error('Error deleting QoS policy:', error);
    }
  };

  const handleAddTrafficRule = async (e) => {
    e.preventDefault();
    try {
      await createTraffic({ ...newTrafficRule, forwardingPath: newTrafficRule.forwardingPath.split(',') });
      const updatedTraffic = await getTraffic();
      setTraffic(updatedTraffic);
      setNewTrafficRule({ name: '', sourcePort: '', destinationPort: '', forwardingPath: '' });
    } catch (error) {
      console.error('Error adding traffic rule:', error);
    }
  };

  const handleDeleteTrafficRule = async (id) => {
    try {
      await deleteTraffic(id);
      const updatedTraffic = await getTraffic();
      setTraffic(updatedTraffic);
    } catch (error) {
      console.error('Error deleting traffic rule:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Network Utilization',
      },
    },
  };

  return (
    <div className="dashboard-container">
      <h1>SDN Controller Dashboard</h1>
      
      <div id="network-statistics" className="dashboard-section">
        <h2>Network Statistics</h2>
        {stats ? (
          <ul>
            <li>Active Links: {stats.activeLinks}</li>
            <li>Packet Rate: {stats.packetRate}</li>
            <li>Latency: {stats.latency}</li>
            <li>Bandwidth Utilization: {stats.bandwidth}%</li>
          </ul>
        ) : (
          <p>Loading statistics...</p>
        )}
      </div>

      <div id="network-utilization-chart" className="dashboard-section chart-card">
        <h2>Network Utilization Chart</h2>
        <Line options={chartOptions} data={chartData} />
      </div>

      <div id="network-devices" className="dashboard-section">
        <h2>Network Devices</h2>
        <Collapsible
          title="Network Devices"
          isOpen={openSections.networkDevices}
          toggle={() => toggleSection('networkDevices')}
        >
        {switches.length > 0 ? (
          switches.map(s => (
            <div key={s.id} className="device-card">
              <h3>Switch: {s.name} (ID: {s.datapath_id})</h3>
              <p>IP Address: {s.ipAddress}</p>
              <p>Connected: {s.connected ? 'Yes' : 'No'}</p>
              <h4>Ports:</h4>
              <div className="table-container">
              {ports.filter(p => p.switch_id === s.id).length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Port Number</th>
                      <th>Name</th>
                      <th>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ports.filter(p => p.switch_id === s.id).map(p => (
                      <tr key={p.id}>
                        <td>{p.port_number}</td>
                        <td>{p.name}</td>
                        <td>{p.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No ports found for this switch.</p>
              )}
              </div>
            </div>
          ))
        ) : (
          <p>Loading network devices...</p>
        )}
        </Collapsible>
      </div>

      <div id="flow-rules" className="dashboard-section">
        <h2>Flow Rules</h2>
        <form onSubmit={handleAddFlowRule} className="form-container">
          <input
            type="text"
            placeholder="Source IP"
            value={newFlowRule.sourceIP}
            onChange={(e) => setNewFlowRule({ ...newFlowRule, sourceIP: e.target.value })}
          />
          <input
            type="text"
            placeholder="Destination IP"
            value={newFlowRule.destinationIP}
            onChange={(e) => setNewFlowRule({ ...newFlowRule, destinationIP: e.target.value })}
          />
          <input
            type="text"
            placeholder="Action"
            value={newFlowRule.action}
            onChange={(e) => setNewFlowRule({ ...newFlowRule, action: e.target.value })}
          />
          <button type="submit">Add Flow Rule</button>
        </form>
        <Collapsible
          title="Flow Rules"
          isOpen={openSections.flowRules}
          toggle={() => toggleSection('flowRules')}
        >
        <div className="item-list">
        {rules.length > 0 ? (
          rules.map(rule => (
            <div key={rule.id} className="item-card">
              <p><strong>ID:</strong> {rule.id}</p>
              <p><strong>Source IP:</strong> {rule.sourceIP}</p>
              <p><strong>Destination IP:</strong> {rule.destinationIP}</p>
              <p><strong>Action:</strong> {rule.action}</p>
              <div className="item-actions">
                <button onClick={() => handleDeleteFlowRule(rule.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading flow rules...</p>
        )}
        </div>
        </Collapsible>
      </div>

      <div id="qos-policies" className="dashboard-section">
        <h2>QoS Policies</h2>
        <form onSubmit={handleAddQosPolicy} className="form-container">
          <input
            type="text"
            placeholder="Name"
            value={newQosPolicy.name}
            onChange={(e) => setNewQosPolicy({ ...newQosPolicy, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Priority Level"
            value={newQosPolicy.priority_level}
            onChange={(e) => setNewQosPolicy({ ...newQosPolicy, priority_level: parseInt(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Bandwidth Allocation"
            value={newQosPolicy.bandwidthAllocation}
            onChange={(e) => setNewQosPolicy({ ...newQosPolicy, bandwidthAllocation: parseInt(e.target.value) })}
          />
          <button type="submit">Add QoS Policy</button>
        </form>
        <Collapsible
          title="QoS Policies"
          isOpen={openSections.qosPolicies}
          toggle={() => toggleSection('qosPolicies')}
        >
        <div className="item-list">
        {qos.length > 0 ? (
          qos.map(policy => (
            <div key={policy.id} className="item-card">
              <p><strong>ID:</strong> {policy.id}</p>
              <p><strong>Name:</strong> {policy.name}</p>
              <p><strong>Priority:</strong> {policy.priority_level}</p>
              <p><strong>Bandwidth:</strong> {policy.bandwidthAllocation}</p>
              <div className="item-actions">
                <button onClick={() => handleDeleteQosPolicy(policy.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading QoS policies...</p>
        )}
        </div>
        </Collapsible>
      </div>

      <div id="traffic-rules" className="dashboard-section">
        <h2>Traffic Rules</h2>
        <form onSubmit={handleAddTrafficRule} className="form-container">
          <input
            type="text"
            placeholder="Name"
            value={newTrafficRule.name}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Source Port"
            value={newTrafficRule.sourcePort}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, sourcePort: e.target.value })}
          />
          <input
            type="text"
            placeholder="Destination Port"
            value={newTrafficRule.destinationPort}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, destinationPort: e.target.value })}
          />
          <input
            type="text"
            placeholder="Forwarding Path (comma separated)"
            value={newTrafficRule.forwardingPath}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, forwardingPath: e.target.value.split(',') })}
          />
          <button type="submit">Add Traffic Rule</button>
        </form>
        <Collapsible
          title="Traffic Rules"
          isOpen={openSections.trafficRules}
          toggle={() => toggleSection('trafficRules')}
        >
        <div className="item-list">
        {traffic.length > 0 ? (
          traffic.map(rule => (
            <div key={rule.id} className="item-card">
              <p><strong>ID:</strong> {rule.id}</p>
              <p><strong>Name:</strong> {rule.name}</p>
              <p><strong>Source Port:</strong> {rule.sourcePort}</p>
              <p><strong>Destination Port:</strong> {rule.destinationPort}</p>
              <p><strong>Path:</strong> {rule.forwardingPath.join(' -> ')}</p>
              <div className="item-actions">
                <button onClick={() => handleDeleteTrafficRule(rule.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading traffic rules...</p>
        )}
        </div>
        </Collapsible>
      </div>
    </div>
  );
}

export default Dashboard;
