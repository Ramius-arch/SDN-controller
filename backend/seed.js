const sequelize = require('./config/database');
const { Switch, Port, FlowRule, QosPolicy, TrafficRule, User } = require('./models');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const switches = [];
  for (let i = 1; i <= 6; i++) {
    const switchInstance = await Switch.create({
      datapath_id: `00:00:00:00:00:0${i}`,
      name: `Switch ${i}`,
      ipAddress: `192.168.1.${i}`,
    });
    switches.push(switchInstance);

    for (let j = 1; j <= 4; j++) {
      await Port.create({
        switch_id: switchInstance.id,
        port_number: j,
        name: `Port ${j}`,
        state: 'up',
      });
    }

    await FlowRule.create({
      name: `Flow Rule ${i}`,
      switch_id: switchInstance.id,
      priority: 100,
      match: { sourceIP: `10.0.0.${i}` },
      actions: [{ type: 'output', port: 1 }],
    });

    await QosPolicy.create({
      name: `QoS Policy ${i}`,
      priority_level: i,
      bandwidthAllocation: 10 * i,
    });

    await TrafficRule.create({
      name: `Traffic Rule ${i}`,
      sourcePort: `Switch ${i} Port 1`,
      destinationPort: `Switch ${i} Port 2`,
      forwardingPath: [`Switch ${i}`],
      path_type: 'shortest',
    });
  }

  console.log('Database seeded successfully!');

  // Create a default admin user
  await User.findOrCreate({
    where: { username: 'admin' },
    defaults: {
      email: 'admin@example.com',
      password: 'password', // The User model's hook will hash this
      role: 'admin',
    },
  });
  console.log('Admin user created!');

  await sequelize.close();
};

seedDatabase();
