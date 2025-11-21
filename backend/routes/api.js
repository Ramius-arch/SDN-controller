const express = require('express');
const router = express.Router();
const { Switch, FlowRule, QosPolicy, TrafficRule, Port, User } = require('../models');
const axios = require('axios');
const passport = require('passport');
const jwt = require('jsonwebtoken');



// Mock Data
const mockStats = {
  activeLinks: 10,
  packetRate: 1200,
  latency: 15,
  bandwidth: 80,
};

const mockRules = [
  { id: 1, sourceIP: '10.0.0.1', destinationIP: '10.0.0.2', action: 'ALLOW' },
  { id: 2, sourceIP: '10.0.0.3', destinationIP: '10.0.0.4', action: 'DENY' },
];

const mockQos = [
  { id: 1, priority: 1, bandwidth: 500 },
  { id: 2, priority: 2, bandwidth: 1000 },
];

const mockTraffic = [
  { id: 1, sourcePort: 'eth0', destinationPort: 'eth1', path: 'A -> B -> C' },
  { id: 2, sourcePort: 'eth2', destinationPort: 'eth3', path: 'D -> E -> F' },
];

// Statistics
router.get('/statistics', async (req, res) => {
  try {
    const activeSwitches = await Switch.count({ where: { connected: true } });
    const totalPorts = await Port.count();
    const activePorts = await Port.count({ where: { state: 'up' } });
    const totalFlowRules = await FlowRule.count();
    const totalQosPolicies = await QosPolicy.count();
    const totalTrafficRules = await TrafficRule.count();

    // Simulate packet rate, latency, and bandwidth utilization
    const packetRate = Math.floor(Math.random() * 2000) + 1000; // packets/sec
    const latency = Math.floor(Math.random() * 50) + 10; // ms
    const bandwidth = Math.floor(Math.random() * 100); // %

    res.json({
      activeSwitches,
      totalPorts,
      activePorts,
      totalFlowRules,
      totalQosPolicies,
      totalTrafficRules,
      packetRate,
      latency,
      bandwidth,
      activeLinks: activePorts, // Assuming active ports are active links
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting statistics', error: error.message });
  }
});

// Rules
router.get('/rules', async (req, res) => {
  const rules = await FlowRule.findAll();
  res.json(rules);
});

router.post('/rules', async (req, res) => {
  const rule = await FlowRule.create(req.body);
  res.json(rule);
});

router.delete('/rules/:id', async (req, res) => {
  const rule = await FlowRule.findByPk(req.params.id);
  if (rule) {
    await rule.destroy();
    res.json({ message: 'Flow rule deleted' });
  } else {
    res.status(404).json({ message: 'Flow rule not found' });
  }
});

// QoS
router.get('/qos', async (req, res) => {
  try {
    const policies = await QosPolicy.findAll();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Error getting QoS policies' });
  }
});

router.post('/qos', async (req, res) => {
  try {
    const policy = await QosPolicy.create(req.body);
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Error creating QoS policy' });
  }
});

router.delete('/qos/:id', async (req, res) => {
  try {
    const policy = await QosPolicy.findByPk(req.params.id);
    if (policy) {
      await policy.destroy();
      res.json({ message: 'QoS policy deleted' });
    } else {
      res.status(404).json({ message: 'QoS policy not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting QoS policy' });
  }
});

// Traffic
router.get('/traffic', async (req, res) => {
  try {
    const rules = await TrafficRule.findAll();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Error getting traffic rules' });
  }
});

router.post('/traffic', async (req, res) => {
  try {
    const rule = await TrafficRule.create(req.body);
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating traffic rule' });
  }
});

router.delete('/traffic/:id', async (req, res) => {
  try {
    const rule = await TrafficRule.findByPk(req.params.id);
    if (rule) {
      await rule.destroy();
      res.json({ message: 'Traffic rule deleted' });
    } else {
      res.status(404).json({ message: 'Traffic rule not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting traffic rule' });
  }
});

// Switches
router.get('/switches', async (req, res) => {
  const switches = await Switch.findAll();
  res.json(switches);
});

router.get('/switches/:id', async (req, res) => {
  const switch_ = await Switch.findByPk(req.params.id);
  res.json(switch_);
});

router.post('/switches', async (req, res) => {
  const switch_ = await Switch.create(req.body);
  res.json(switch_);
});

router.put('/switches/:id', async (req, res) => {
  const switch_ = await Switch.findByPk(req.params.id);
  if (switch_) {
    await switch_.update(req.body);
    res.json(switch_);
  } else {
    res.status(404).json({ message: 'Switch not found' });
  }
});

router.delete('/switches/:id', async (req, res) => {
  const switch_ = await Switch.findByPk(req.params.id);
  if (switch_) {
    await switch_.destroy();
    res.json({ message: 'Switch deleted' });
  } else {
    res.status(404).json({ message: 'Switch not found' });
  }
});

// Ports
router.get('/ports', async (req, res) => {
  try {
    const ports = await Port.findAll();
    res.json(ports);
  } catch (error) {
    res.status(500).json({ message: 'Error getting ports' });
  }
});

router.get('/ports/:id', async (req, res) => {
  try {
    const port = await Port.findByPk(req.params.id);
    if (port) {
      res.json(port);
    } else {
      res.status(404).json({ message: 'Port not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error getting port' });
  }
});

router.post('/ports', async (req, res) => {
  try {
    const port = await Port.create(req.body);
    res.json(port);
  } catch (error) {
    res.status(500).json({ message: 'Error creating port' });
  }
});

router.put('/ports/:id', async (req, res) => {
  try {
    const port = await Port.findByPk(req.params.id);
    if (port) {
      await port.update(req.body);
      res.json(port);
    } else {
      res.status(404).json({ message: 'Port not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating port' });
  }
});

router.delete('/ports/:id', async (req, res) => {
  try {
    const port = await Port.findByPk(req.params.id);
    if (port) {
      await port.destroy();
      res.json({ message: 'Port deleted' });
    } else {
      res.status(404).json({ message: 'Port not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting port' });
  }
});


// Metrics
router.get('/metrics', async (req, res) => {
  try {
    const response = await axios.get('http://sdn-python:8000/metrics', {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error getting metrics from Python service' });
  }
});

module.exports = router;
