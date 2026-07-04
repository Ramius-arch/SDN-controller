import React, { useState, useEffect, useRef } from 'react';
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
  Filler
} from 'chart.js';

import {
  getStatistics,
  getRules,
  createRule,
  deleteRule,
  getQos,
  createQos,
  deleteQos,
  getTraffic,
  createTraffic,
  deleteTraffic,
  getSwitches,
  getPorts
} from '../services/api';
import Collapsible from './Collapsible';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Initial 3D node coordinates for SVG map inside dashboard
const initialMapNodes = [
  { id: 'mock-s1', label: 'Core-Switch-1', x: 0, y: 70, z: 0, type: 'core' },
  { id: 'mock-s2', label: 'Edge-Switch-2', x: -100, y: 0, z: -40, type: 'edge' },
  { id: 'host-1', label: 'Web Server', x: -160, y: -80, z: -80, type: 'host', ip: '192.168.1.1' },
  { id: 'host-2', label: 'Database', x: -60, y: -80, z: -80, type: 'host', ip: '192.168.1.2' },
  { id: 'host-3', label: 'Client App', x: 80, y: -80, z: 40, type: 'host', ip: '192.168.1.3' }
];

const initialMapLinks = [
  { id: 's1-s2', source: 'mock-s1', target: 'mock-s2' },
  { id: 's2-h1', source: 'mock-s2', target: 'host-1' },
  { id: 's2-h2', source: 'mock-s2', target: 'host-2' },
  { id: 's1-h3', source: 'mock-s1', target: 'host-3' }
];

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

  // Form states
  const [newFlowRule, setNewFlowRule] = useState({ sourceIP: '', destinationIP: '', action: 'ALLOW' });
  const [newQosPolicy, setNewQosPolicy] = useState({ name: '', priority_level: 1, bandwidthAllocation: 50 });
  const [newTrafficRule, setNewTrafficRule] = useState({ name: '', sourcePort: '', destinationPort: '', forwardingPath: '' });

  // UI state
  const [rotX, setRotX] = useState(-0.25);
  const [rotY, setRotY] = useState(0.35);
  const [pings, setPings] = useState([]);
  const [packetTick, setPacketTick] = useState(0);

  const [openSections, setOpenSections] = useState({
    flowRules: true,
    qosPolicies: true,
    networkDevices: true,
    trafficRules: true,
  });

  const mockRules = [
    { id: 'mock-fr1', sourceIP: '192.168.1.1', destinationIP: '192.168.1.3', action: 'ALLOW' },
    { id: 'mock-fr2', sourceIP: '192.168.1.2', destinationIP: '192.168.1.3', action: 'DENY' },
  ];

  const mockQos = [
    { id: 'mock-qos1', name: 'High Priority Voice', priority_level: 5, bandwidthAllocation: 100 },
    { id: 'mock-qos2', name: 'Standard Data', priority_level: 2, bandwidthAllocation: 50 },
  ];

  const mockSwitches = [
    { id: 'mock-s1', name: 'Core-Switch-1', datapath_id: '00:00:00:00:00:00:00:01', ipAddress: '10.0.0.1', connected: true },
    { id: 'mock-s2', name: 'Edge-Switch-2', datapath_id: '00:00:00:00:00:00:00:02', ipAddress: '10.0.0.2', connected: true },
  ];

  const mockPorts = [
    { id: 'mock-p1', switch_id: 'mock-s1', port_number: 1, name: 'eth0', state: 'UP' },
    { id: 'mock-p2', switch_id: 'mock-s1', port_number: 2, name: 'eth1', state: 'UP' },
    { id: 'mock-p3', switch_id: 'mock-s2', port_number: 1, name: 'eth0', state: 'UP' },
  ];

  const mockTraffic = [
    { id: 'mock-tr1', name: 'Web Traffic', sourcePort: '80', destinationPort: '443', forwardingPath: ['s1', 's2'] },
  ];

  const [chartData, setChartData] = useState({
    labels: ['10s', '20s', '30s', '40s', '50s'],
    datasets: [
      {
        label: 'Link Utilization (%)',
        data: [65, 59, 80, 81, 56],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
      },
    ],
  });

  const toggleSection = (section) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [section]: !prevOpenSections[section],
    }));
  };

  // Sync API data & set fallbacks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getStatistics();
        setStats(statsData);
      } catch (e) {
        console.warn('Could not load statistics from API. Using dynamic simulated telemetry.');
      }

      try {
        const rulesData = await getRules();
        setRules(rulesData.length > 0 ? rulesData : mockRules);
      } catch (e) {
        setRules(mockRules);
      }

      try {
        const qosData = await getQos();
        setQos(qosData.length > 0 ? qosData : mockQos);
      } catch (e) {
        setQos(mockQos);
      }

      try {
        const trafficData = await getTraffic();
        setTraffic(trafficData.length > 0 ? trafficData : mockTraffic);
      } catch (e) {
        setTraffic(mockTraffic);
      }

      try {
        const switchesData = await getSwitches();
        setSwitches(switchesData.length > 0 ? switchesData : mockSwitches);
      } catch (e) {
        setSwitches(mockSwitches);
      }

      try {
        const portsData = await getPorts();
        setPorts(portsData.length > 0 ? portsData : mockPorts);
      } catch (e) {
        setPorts(mockPorts);
      }
    };

    fetchData(); // Initial load

    // Setup interval for telemetry ticks
    const interval = setInterval(() => {
      // Simulate real-time stats delta
      setStats((prevStats) => {
        const deniedCount = rules.filter(r => r.action === 'DENY').length;
        return {
          activeLinks: Math.max(1, 7 - deniedCount),
          packetRate: Math.max(200, 1500 - deniedCount * 300 + Math.floor(Math.random() * 100) - 50),
          latency: Math.min(200, 30 + deniedCount * 20 + Math.floor(Math.random() * 6) - 3),
          bandwidth: Math.max(5, 75 - deniedCount * 10 + Math.floor(Math.random() * 10) - 5),
        };
      });

      // Update Chart points with gradient styling
      setChartData((prevChartData) => {
        const newLabels = [...prevChartData.labels, `${prevChartData.labels.length * 10 + 10}s`];
        const newData = [...prevChartData.datasets[0].data, Math.floor(Math.random() * 50) + 30];
        if (newLabels.length > 8) {
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
    }, 4000);

    return () => clearInterval(interval);
  }, [rules]);

  // Packet animation loop
  useEffect(() => {
    let animId;
    const tick = () => {
      setPacketTick((prev) => (prev + 0.015) % 1);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // CRUD actions
  const handleAddFlowRule = async (e) => {
    e.preventDefault();
    try {
      await createRule(newFlowRule);
      const updatedRules = await getRules();
      setRules(updatedRules);
      setNewFlowRule({ sourceIP: '', destinationIP: '', action: 'ALLOW' });
    } catch (error) {
      console.warn('API error adding rule. Simulating addition locally.');
      const localRule = {
        id: `local-fr-${Date.now()}`,
        sourceIP: newFlowRule.sourceIP || '192.168.1.1',
        destinationIP: newFlowRule.destinationIP || '192.168.1.3',
        action: newFlowRule.action
      };
      setRules((prev) => [...prev, localRule]);
      setNewFlowRule({ sourceIP: '', destinationIP: '', action: 'ALLOW' });
    }
  };

  const handleDeleteFlowRule = async (id) => {
    try {
      await deleteRule(id);
      const updatedRules = await getRules();
      setRules(updatedRules);
    } catch (error) {
      console.warn('API error deleting rule. Removing locally.');
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleAddQosPolicy = async (e) => {
    e.preventDefault();
    try {
      await createQos(newQosPolicy);
      const updatedQos = await getQos();
      setQos(updatedQos);
      setNewQosPolicy({ name: '', priority_level: 1, bandwidthAllocation: 50 });
    } catch (error) {
      console.warn('API error adding QoS. Simulating locally.');
      const localQos = {
        id: `local-qos-${Date.now()}`,
        name: newQosPolicy.name || 'Custom QoS',
        priority_level: newQosPolicy.priority_level,
        bandwidthAllocation: newQosPolicy.bandwidthAllocation
      };
      setQos((prev) => [...prev, localQos]);
      setNewQosPolicy({ name: '', priority_level: 1, bandwidthAllocation: 50 });
    }
  };

  const handleDeleteQosPolicy = async (id) => {
    try {
      await deleteQos(id);
      const updatedQos = await getQos();
      setQos(updatedQos);
    } catch (error) {
      console.warn('API error deleting QoS. Removing locally.');
      setQos((prev) => prev.filter((q) => q.id !== id));
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
      console.warn('API error adding traffic rule. Simulating locally.');
      const localTraffic = {
        id: `local-tr-${Date.now()}`,
        name: newTrafficRule.name || 'Detour',
        sourcePort: newTrafficRule.sourcePort,
        destinationPort: newTrafficRule.destinationPort,
        forwardingPath: (newTrafficRule.forwardingPath || 's1,s2').split(',')
      };
      setTraffic((prev) => [...prev, localTraffic]);
      setNewTrafficRule({ name: '', sourcePort: '', destinationPort: '', forwardingPath: '' });
    }
  };

  const handleDeleteTrafficRule = async (id) => {
    try {
      await deleteTraffic(id);
      const updatedTraffic = await getTraffic();
      setTraffic(updatedTraffic);
    } catch (error) {
      console.warn('API error deleting traffic rule. Removing locally.');
      setTraffic((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleNodeClick = (node) => {
    const newPing = { id: Date.now(), x: node.projX, y: node.projY };
    setPings((prev) => [...prev, newPing]);
    setTimeout(() => {
      setPings((prev) => prev.filter((p) => p.id !== newPing.id));
    }, 1200);
  };

  // Project 3D nodes for the Dashboard SVG Map
  const projectedMapNodes = initialMapNodes.map((node) => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    let x1 = node.x * cosY - node.z * sinY;
    let z1 = node.x * sinY + node.z * cosY;
    let y2 = node.y * cosX - z1 * sinX;
    let z2 = node.y * sinX + z1 * cosX;

    const scale = 220 / (220 + z2);
    const projX = x1 * scale + 175; // center in 350px wide card
    const projY = -y2 * scale + 150; // center in 260px high svg

    return { ...node, projX, projY, size: 6 * scale };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#09090b',
        titleFont: { family: 'Outfit', size: 13 },
        bodyFont: { family: 'Inter', size: 12 },
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#a1a1aa', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#a1a1aa', font: { family: 'Inter', size: 10 } },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h1>SDN Controller Dashboard</h1>

      {/* Stats Summary Bento sub-grid */}
      <div className="stats-summary-grid">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <span className="label">Active Links</span>
          <span className="value">{stats.activeLinks}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <span className="label">Packet Rate</span>
          <span className="value">{stats.packetRate} p/s</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <span className="label">Latency</span>
          <span className="value">{stats.latency} ms</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <span className="label">Bandwidth</span>
          <span className="value">{stats.bandwidth}%</span>
        </div>
      </div>

      {/* Network Chart Card */}
      <div id="network-utilization-chart" className="dashboard-section chart-card">
        <h2>Network Utilization Chart</h2>
        <div style={{ position: 'relative', height: '100%', width: '100%', minHeight: 280 }}>
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>

      {/* Interactive Topology Widget inside dashboard */}
      <div className="dashboard-section" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2>Live Active Topology</h2>
        <div style={{ background: 'rgba(9,9,11,0.5)', border: '1px solid var(--border)', borderRadius: 10, height: 260, position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 350 260">
            {/* Draw Links */}
            {initialMapLinks.map((link) => {
              const srcNode = projectedMapNodes.find((n) => n.id === link.source);
              const destNode = projectedMapNodes.find((n) => n.id === link.target);
              if (!srcNode || !destNode) return null;

              // Check database rules to block this link in real-time
              const isBlocked = rules.some(
                (r) =>
                  r.action === 'DENY' &&
                  ((r.sourceIP === srcNode.ip && r.destinationIP === destNode.ip) ||
                    (r.sourceIP === destNode.ip && r.destinationIP === srcNode.ip) ||
                    (srcNode.id === 'mock-s2' && destNode.ip === r.sourceIP && r.action === 'DENY') ||
                    (srcNode.id === 'mock-s2' && destNode.ip === r.destinationIP && r.action === 'DENY'))
              );

              let lineColor = isBlocked ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.3)';
              let lineDash = isBlocked ? '4,4' : 'none';

              return (
                <g key={link.id}>
                  <line
                    x1={srcNode.projX}
                    y1={srcNode.projY}
                    x2={destNode.projX}
                    y2={destNode.projY}
                    stroke={lineColor}
                    strokeWidth={1.5}
                    strokeDasharray={lineDash}
                  />

                  {/* Animate packet circles */}
                  {!isBlocked && (
                    <circle
                      cx={srcNode.projX + (destNode.projX - srcNode.projX) * packetTick}
                      cy={srcNode.projY + (destNode.projY - srcNode.projY) * packetTick}
                      r={2.5}
                      fill="var(--success)"
                      filter="drop-shadow(0 0 3px var(--accent))"
                    />
                  )}
                </g>
              );
            })}

            {/* Injected pings */}
            {pings.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={16}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={1.5}
                opacity={0.8}
                style={{
                  transformOrigin: `${p.x}px ${p.y}px`,
                  animation: 'pulseRing 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />
            ))}

            {/* Draw Nodes */}
            {projectedMapNodes.map((node) => {
              let fill = '#18181b';
              let border = 'var(--border)';

              if (node.type === 'core') {
                fill = 'var(--accent)';
                border = '#a5b4fc';
              } else if (node.type === 'edge') {
                fill = '#27272a';
                border = 'rgba(99, 102, 241, 0.5)';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.projX}, ${node.projY})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNodeClick(node)}
                >
                  <circle cx={0} cy={0} r={node.size + 2} fill={fill} stroke={border} strokeWidth={1} />
                  <text
                    y={node.size + 10}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="7.5px"
                    fontFamily="var(--font-heading)"
                    fontWeight="500"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Network Devices lists */}
      <div id="network-devices" className="dashboard-section">
        <Collapsible
          title="Switches & Interfaces"
          isOpen={openSections.networkDevices}
          toggle={() => toggleSection('networkDevices')}
        >
          {switches.length > 0 ? (
            switches.map((s) => (
              <div key={s.id} className="device-card">
                <h3>{s.name}</h3>
                <p>IP: {s.ipAddress} | Connected: <span style={{ color: s.connected ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{s.connected ? 'YES' : 'NO'}</span></p>
                <h4>Interface Map</h4>
                <div className="table-container">
                  {ports.filter((p) => p.switch_id === s.id).length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Port</th>
                          <th>Interface</th>
                          <th>State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ports.filter((p) => p.switch_id === s.id).map((p) => (
                          <tr key={p.id}>
                            <td>{p.port_number}</td>
                            <td>{p.name}</td>
                            <td style={{ color: p.state === 'UP' ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>{p.state}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ padding: 12, fontSize: 12 }}>No active interfaces.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>Loading Switches...</p>
          )}
        </Collapsible>
      </div>

      {/* Flow Rules Management */}
      <div id="flow-rules" className="dashboard-section">
        <h2>Flow Rules Management</h2>
        <form onSubmit={handleAddFlowRule} className="form-container">
          <input
            type="text"
            placeholder="Source IP (e.g. 192.168.1.1)"
            value={newFlowRule.sourceIP}
            onChange={(e) => setNewFlowRule({ ...newFlowRule, sourceIP: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Destination IP (e.g. 192.168.1.3)"
            value={newFlowRule.destinationIP}
            onChange={(e) => setNewFlowRule({ ...newFlowRule, destinationIP: e.target.value })}
            required
          />
          <select
            value={newFlowRule.action}
            onChange={(e) => setNewFlowRule({ ...newFlowRule, action: e.target.value })}
          >
            <option value="ALLOW">ALLOW ACTION</option>
            <option value="DENY">DENY ACTION</option>
            <option value="REDIRECT">REDIRECT ACTION</option>
          </select>
          <button type="submit">Deploy Flow Rule</button>
        </form>
        <Collapsible
          title="Active Flow Rules Table"
          isOpen={openSections.flowRules}
          toggle={() => toggleSection('flowRules')}
        >
          <div className="item-list">
            {rules.length > 0 ? (
              rules.map((rule) => (
                <div key={rule.id} className="item-card">
                  <p><strong>Rule ID:</strong> {rule.id}</p>
                  <p><strong>Source:</strong> {rule.sourceIP}</p>
                  <p><strong>Destination:</strong> {rule.destinationIP}</p>
                  <p>
                    <strong>Action:</strong>{' '}
                    <span
                      style={{
                        color: rule.action === 'ALLOW' ? 'var(--success)' : rule.action === 'DENY' ? 'var(--danger)' : 'var(--warning)',
                        fontWeight: 'bold',
                      }}
                    >
                      {rule.action}
                    </span>
                  </p>
                  <div className="item-actions">
                    <button onClick={() => handleDeleteFlowRule(rule.id)}>Revoke</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No active flow rules.</p>
            )}
          </div>
        </Collapsible>
      </div>

      {/* QoS Policies Management */}
      <div id="qos-policies" className="dashboard-section">
        <h2>QoS Policies Management</h2>
        <form onSubmit={handleAddQosPolicy} className="form-container">
          <input
            type="text"
            placeholder="Policy Name (e.g. VoIP Priority)"
            value={newQosPolicy.name}
            onChange={(e) => setNewQosPolicy({ ...newQosPolicy, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Priority Level (1 - 5)"
            value={newQosPolicy.priority_level}
            onChange={(e) => setNewQosPolicy({ ...newQosPolicy, priority_level: parseInt(e.target.value) || 1 })}
            min="1"
            max="5"
            required
          />
          <input
            type="number"
            placeholder="Bandwidth Allocation (Mbps)"
            value={newQosPolicy.bandwidthAllocation}
            onChange={(e) => setNewQosPolicy({ ...newQosPolicy, bandwidthAllocation: parseInt(e.target.value) || 10 })}
            min="10"
            required
          />
          <button type="submit">Deploy QoS Policy</button>
        </form>
        <Collapsible
          title="Active QoS Table"
          isOpen={openSections.qosPolicies}
          toggle={() => toggleSection('qosPolicies')}
        >
          <div className="item-list">
            {qos.length > 0 ? (
              qos.map((policy) => (
                <div key={policy.id} className="item-card">
                  <p><strong>Policy ID:</strong> {policy.id}</p>
                  <p><strong>Name:</strong> {policy.name}</p>
                  <p><strong>Priority:</strong> Level {policy.priority_level}</p>
                  <p><strong>Bandwidth:</strong> {policy.bandwidthAllocation} Mbps</p>
                  <div className="item-actions">
                    <button onClick={() => handleDeleteQosPolicy(policy.id)}>Revoke</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No active QoS policies.</p>
            )}
          </div>
        </Collapsible>
      </div>

      {/* Traffic Routing rules */}
      <div id="traffic-rules" className="dashboard-section">
        <h2>Traffic Detouring Rules</h2>
        <form onSubmit={handleAddTrafficRule} className="form-container">
          <input
            type="text"
            placeholder="Rule Name (e.g. Db Detour)"
            value={newTrafficRule.name}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Source Port (e.g. 80)"
            value={newTrafficRule.sourcePort}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, sourcePort: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Destination Port (e.g. 3306)"
            value={newTrafficRule.destinationPort}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, destinationPort: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Detour Path (e.g. s1,s2)"
            value={newTrafficRule.forwardingPath}
            onChange={(e) => setNewTrafficRule({ ...newTrafficRule, forwardingPath: e.target.value })}
            required
          />
          <button type="submit">Deploy Detour Rule</button>
        </form>
        <Collapsible
          title="Active Detours Table"
          isOpen={openSections.trafficRules}
          toggle={() => toggleSection('trafficRules')}
        >
          <div className="item-list">
            {traffic.length > 0 ? (
              traffic.map((rule) => (
                <div key={rule.id} className="item-card">
                  <p><strong>Rule ID:</strong> {rule.id}</p>
                  <p><strong>Name:</strong> {rule.name}</p>
                  <p><strong>Ports:</strong> Src {rule.sourcePort} → Dest {rule.destinationPort}</p>
                  <p><strong>Detour Path:</strong> {rule.forwardingPath.join(' → ')}</p>
                  <div className="item-actions">
                    <button onClick={() => handleDeleteTrafficRule(rule.id)}>Revoke</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No active detours.</p>
            )}
          </div>
        </Collapsible>
      </div>

      <style>{`
        @keyframes pulseRing {
          0% {
            transform: scale(0.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
