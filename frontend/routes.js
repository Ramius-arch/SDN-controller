const router = require('express').Router();
const index = require('./index');

router.get('/statistics', async (req, res) => {
    const stats = await index.getStatistics();
    res.json(stats);
});

router.get('/rules', async (req, res) => {
    const rules = await index.getFlowRules();
    res.json(rules);
});

router.delete('/rules/:id', async (req, res) => {
    const result = await index.deleteFlowRule(req.params.id);
    res.json(result);
});

router.get('/qos', async (req, res) => {
    const policies = await index.getQosPolicies();
    res.json(policies);
});

router.delete('/qos/:id', async (req, res) => {
    const result = await index.deleteQosPolicy(req.params.id);
    res.json(result);
});

router.get('/traffic', async (req, res) => {
    const rules = await index.getTrafficRules();
    res.json(rules);
});

router.delete('/traffic/:id', async (req, res) => {
    const result = await index.deleteTrafficRule(req.params.id);
    res.json(result);
});
