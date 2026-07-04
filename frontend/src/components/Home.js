import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// Initial nodes in 3D space
const initialNodes = [
  { id: 'c1', label: 'Core-Switch-1', x: 0, y: 80, z: 0, type: 'core' },
  { id: 'e1', label: 'Edge-Switch-1', x: -110, y: 0, z: -50, type: 'edge' },
  { id: 'e2', label: 'Edge-Switch-2', x: 110, y: 0, z: 50, type: 'edge' },
  { id: 'h1', label: 'Web Server', x: -170, y: -90, z: -90, type: 'host' },
  { id: 'h2', label: 'Database', x: -60, y: -90, z: -60, type: 'host' },
  { id: 'h3', label: 'Client App', x: 60, y: -90, z: 60, type: 'host' },
  { id: 'h4', label: 'User Portal', x: 170, y: -90, z: 90, type: 'host' }
];

const initialLinks = [
  { id: 'c1-e1', source: 'c1', target: 'e1' },
  { id: 'c1-e2', source: 'c1', target: 'e2' },
  { id: 'e1-h1', source: 'e1', target: 'h1' },
  { id: 'e1-h2', source: 'e1', target: 'h2' },
  { id: 'e2-h3', source: 'e2', target: 'h3' },
  { id: 'e2-h4', source: 'e2', target: 'h4' }
];

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // 3D rotation angles
  const [rotX, setRotX] = useState(-0.3); // initial tilt
  const [rotY, setRotY] = useState(0.4);  // initial angle
  const [targetRotX, setTargetRotX] = useState(-0.3);
  const [targetRotY, setTargetRotY] = useState(0.4);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Sandbox rules injection state
  const [srcNode, setSrcNode] = useState('e1');
  const [destNode, setDestNode] = useState('h1');
  const [ruleAction, setRuleAction] = useState('DENY');
  const [activeRules, setActiveRules] = useState([]);
  
  // Dynamic stats
  const [telemetry, setTelemetry] = useState({
    activeLinks: 6,
    packetRate: 1480,
    latency: 28,
    utilization: 64
  });

  // Pulse ring animation
  const [pings, setPings] = useState([]);

  // Packet animation tick (0 to 1)
  const [packetTick, setPacketTick] = useState(0);

  // Mouse tilt tracking & Lerp loops
  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      if (isDragging) return; // let drag override mouse move tilt
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;

      setTargetRotY(mx * 1.2);
      setTargetRotX(-my * 0.8);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    // Lerp rotation coordinates
    const updateRotation = () => {
      setRotX((prev) => prev + (targetRotX - prev) * 0.08);
      setRotY((prev) => prev + (targetRotY - prev) * 0.08);
      animationFrameId = requestAnimationFrame(updateRotation);
    };
    updateRotation();

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetRotX, targetRotY, isDragging]);

  // Packet animation frame tick
  useEffect(() => {
    let packetFrameId;
    const animatePackets = () => {
      setPacketTick((prev) => (prev + 0.012) % 1);
      packetFrameId = requestAnimationFrame(animatePackets);
    };
    animatePackets();
    return () => cancelAnimationFrame(packetFrameId);
  }, []);

  // Drag interaction
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMoveDrag = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    setTargetRotY((prev) => prev + dx * 0.007);
    setTargetRotX((prev) => prev - dy * 0.007);

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Node clicks trigger visual waves (pings)
  const handleNodeClick = (node, e) => {
    e.stopPropagation();
    const newPing = { id: Date.now(), x: node.projX, y: node.projY };
    setPings((prev) => [...prev, newPing]);
    setTimeout(() => {
      setPings((prev) => prev.filter((p) => p.id !== newPing.id));
    }, 1200);
  };

  // Sandbox actions
  const handleInjectRule = (e) => {
    e.preventDefault();
    const linkId = `${srcNode}-${destNode}`;
    const reverseLinkId = `${destNode}-${srcNode}`;

    // Toggle active rule
    const ruleExists = activeRules.some(
      (r) => r.id === linkId || r.id === reverseLinkId
    );

    if (ruleExists) {
      // Remove rule (Restore Link)
      setActiveRules((prev) =>
        prev.filter((r) => r.id !== linkId && r.id !== reverseLinkId)
      );
    } else {
      // Add rule (Deny / Redirect Link)
      const newRule = { id: linkId, source: srcNode, target: destNode, action: ruleAction };
      setActiveRules((prev) => [...prev, newRule]);
    }
  };

  // Dynamically scale telemetry based on block rules
  useEffect(() => {
    const deniedCount = activeRules.filter(r => r.action === 'DENY').length;
    setTelemetry({
      activeLinks: Math.max(1, 6 - deniedCount),
      packetRate: Math.max(200, 1480 - deniedCount * 380 + Math.floor(Math.random() * 80)),
      latency: Math.min(180, 28 + deniedCount * 25 + Math.floor(Math.random() * 4)),
      utilization: Math.max(10, 64 - deniedCount * 12)
    });
  }, [activeRules]);

  // Project 3D nodes into 2D canvas coordinates
  const projectedNodes = initialNodes.map((node) => {
    // 3D rotation matrices
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    // Y rotation
    let x1 = node.x * cosY - node.z * sinY;
    let z1 = node.x * sinY + node.z * cosY;

    // X rotation
    let y2 = node.y * cosX - z1 * sinX;
    let z2 = node.y * sinX + z1 * cosX;

    // Projection mapping
    const scale = 260 / (260 + z2); // perspective coefficient
    const projX = x1 * scale + 240; // translate offset to center of canvas (480 wide)
    const projY = -y2 * scale + 200; // translate offset to center of canvas (400 high)

    return { ...node, projX, projY, size: 8 * scale };
  });

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <div className="hero-badge">Control Plane Core v2.4</div>
          <h1>
            Decouple Network Control.<span> Rule The Flow.</span>
          </h1>
          <p>
            Centralize your routing configuration, deploy quality policies, and monitor latency thresholds with a next-generation Software-Defined controller dashboard.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/login')}>Explore Console</button>
            <button onClick={() => navigate('/register')} className="btn-secondary">
              Register Node
            </button>
          </div>
        </div>

        {/* 3D SVG Network Canvas */}
        <div
          className="hero-canvas-container"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMoveDrag}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg className="svg-canvas" viewBox="0 0 480 400">
            {/* Draw Links */}
            {initialLinks.map((link) => {
              const srcNode = projectedNodes.find((n) => n.id === link.source);
              const destNode = projectedNodes.find((n) => n.id === link.target);
              if (!srcNode || !destNode) return null;

              // Check if link is blocked by rule
              const rule = activeRules.find(
                (r) =>
                  (r.source === link.source && r.target === link.target) ||
                  (r.source === link.target && r.target === link.source)
              );

              let lineColor = 'var(--border)';
              let lineDash = 'none';

              if (rule) {
                lineColor = rule.action === 'DENY' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)';
                lineDash = rule.action === 'DENY' ? '5,5' : 'none';
              } else {
                lineColor = 'rgba(99, 102, 241, 0.25)';
              }

              return (
                <g key={link.id}>
                  <line
                    x1={srcNode.projX}
                    y1={srcNode.projY}
                    x2={destNode.projX}
                    y2={destNode.projY}
                    stroke={lineColor}
                    strokeWidth={2}
                    strokeDasharray={lineDash}
                  />

                  {/* Packet Simulation along Links */}
                  {(!rule || rule.action !== 'DENY') && (
                    <circle
                      cx={srcNode.projX + (destNode.projX - srcNode.projX) * packetTick}
                      cy={srcNode.projY + (destNode.projY - srcNode.projY) * packetTick}
                      r={3}
                      fill={rule?.action === 'REDIRECT' ? 'var(--warning)' : 'var(--success)'}
                      filter="drop-shadow(0 0 4px var(--accent))"
                    />
                  )}
                </g>
              );
            })}

            {/* Ripple wave rings on node click */}
            {pings.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={24}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2}
                opacity={0.8}
                style={{
                  transformOrigin: `${p.x}px ${p.y}px`,
                  animation: 'pulseRing 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />
            ))}

            {/* Draw Nodes */}
            {projectedNodes.map((node) => {
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
                  onClick={(e) => handleNodeClick(node, e)}
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={node.size + 4}
                    fill={fill}
                    stroke={border}
                    strokeWidth={1.5}
                  />
                  <text
                    y={node.size + 14}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="9px"
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

          {/* Flow Injector Sandbox Overlay */}
          <div className="sandbox-overlay" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sandbox-title">
              <h4>Playable flow rule injector</h4>
              <div className={`sandbox-status ${activeRules.some(r => r.action === 'DENY') ? 'alert' : ''}`}>
                <span className="dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                {activeRules.length > 0 ? `${activeRules.length} Active Injection(s)` : 'System Nominal'}
              </div>
            </div>
            <form onSubmit={handleInjectRule} className="sandbox-controls">
              <select value={srcNode} onChange={(e) => setSrcNode(e.target.value)}>
                <option value="e1">Edge-Switch-1</option>
                <option value="e2">Edge-Switch-2</option>
              </select>
              <select value={destNode} onChange={(e) => setDestNode(e.target.value)}>
                <option value="h1">Web Server (h1)</option>
                <option value="h2">Database (h2)</option>
                <option value="h3">Client App (h3)</option>
                <option value="h4">User Portal (h4)</option>
              </select>
              <button type="submit" style={{ background: activeRules.some(r => r.id === `${srcNode}-${destNode}` || r.id === `${destNode}-${srcNode}`) ? 'var(--danger)' : 'var(--accent)' }}>
                {activeRules.some(r => r.id === `${srcNode}-${destNode}` || r.id === `${destNode}-${srcNode}`) ? 'Revoke Rule' : 'Inject DENY'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Bento Grid Feature lists */}
      <section className="bento-features">
        <h2>System Core Architecture</h2>
        <div className="bento-grid">
          {/* Card 1: Telemetry (double width) */}
          <div className="bento-card double-width">
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3>Real-time Network Telemetry</h3>
            <p>
              Simulate link metrics, parse packet rates, and monitor traffic thresholds instantly on key switch configurations.
            </p>
            <div className="telemetry-metrics">
              <div className="telemetry-item">
                <span className="telemetry-label">Avg Packet Rate</span>
                <span className="telemetry-value">{telemetry.packetRate} p/s</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">Avg Latency</span>
                <span className="telemetry-value">{telemetry.latency} ms</span>
              </div>
            </div>
          </div>

          {/* Card 2: Flow Rules */}
          <div className="bento-card">
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>Flow Rules</h3>
            <p>
              Instantly restrict, allow, or detour flow patterns using source-to-destination definitions.
            </p>
          </div>

          {/* Card 3: QoS */}
          <div className="bento-card">
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>QoS Priorities</h3>
            <p>
              Allocate static bandwidth pools and assign priority tags directly to edge links.
            </p>
          </div>

          {/* Card 4: Routing (double width) */}
          <div className="bento-card double-width">
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 20H4V4" />
                <path d="m4 16 6-6 4 4 6-6" />
              </svg>
            </div>
            <h3>Traffic Detouring</h3>
            <p>
              Reroute operational pipelines through customizable routing lists, preventing switch bottlenecks.
            </p>
          </div>
        </div>
      </section>

      {/* PulseRing Keyframe injected directly */}
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
};

export default Home;