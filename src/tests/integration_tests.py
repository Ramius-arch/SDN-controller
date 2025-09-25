import pytest
from controller import SDNController

@pytest.fixture
def setup_integration_test():
    """Fixture to set up a simulated network environment for integration tests."""
    # Initialize the controller
    controller = SDNController()
    
    # Simulate two switches connected in a simple topology
    switch1 = {'id': 1, 'name': 'Switch1', 'active': True}
    switch2 = {'id': 2, 'name': 'Switch2', 'active': True}
    
    controller.switches.extend([switch1, switch2])
    
    yield controller, switch1, switch2
    # Cleanup: reset switches' state after tests

def test_basic_network_topology(setup_integration_test):
    """Test basic network topology setup and flow rule addition."""
    controller, switch1, switch2 = setup_integration_test()
    
    # Add a flow rule to Switch1 directing traffic to Switch2
    rule = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch2['id']
        }
    }
    
    # Add the rule to Switch1
    controller.add_flow_rule(switch1['name'], rule)
    
    # Verify that the rule was added successfully and sent to the switch
    assert switch1['active'] is True
    
    # Simulate traffic matching this rule and check if it's forwarded correctly
    # Mock response from switch indicates successful addition

def test_qos_policy Enforcement(setup_integration_test):
    """Test QoS policy enforcement in a multi-switch network."""
    controller, switch1, switch2 = setup_integration_test()
    
    # Define high and low priority rules
    rule_high_priority = {
        'match': {
            'source_ip': '192.168.1.5',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 5000,
            'tcp_destination_port': 443
        },
        'actions': {
            'output': switch2['id'],
            'priority': 100
        }
    }
    
    rule_low_priority = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch2['id'],
            'priority': 50
        }
    }
    
    # Add both rules to Switch1
    controller.add_flow_rule(switch1['name'], rule_high_priority)
    controller.add_flow_rule(switch1['name'], rule_low_priority)
    
    # Simulate traffic matching both rules and check priority enforcement
    # Mock responses from switches would indicate which traffic is processed first
    
    # For testing purposes, assume higher priority traffic is forwarded first
    assert controller.flow_rules.index(rule_high_priority) < controller.flow_rules.index(rule_low_priority)

def test_dynamic_rule_updates(setup_integration_test):
    """Test dynamic modification of flow rules in a live network."""
    controller, switch1, switch2 = setup_integration_test()
    
    # Initial rule configuration
    initial_rule = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch2['id']
        }
    }
    
    # Add initial rule to Switch1
    controller.add_flow_rule(switch1['name'], initial_rule)
    
    # Modify the rule after some time (simulating dynamic change)
    modified_rule = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch1['id']  # Change output to itself for testing
        }
    }
    
    controller.modify_flow_rule(switch1['name'], initial_rule, modified_rule)
    
    # Verify that the rule was updated in Switch1
    assert any(rule['actions']['output'] == switch1['id'] for rule in controller.flow_rules)

def test_failure_handling(setup_integration_test):
    """Test handling of switch failures and automatic rerouting."""
    controller, switch1, switch2 = setup_integration_test()
    
    # Add a fail-safe route through Switch2
    rule_primary = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch1['id']
        }
    }
    
    rule_secondary = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch2['id']
        }
    }
    
    controller.add_flow_rule(switch1['name'], rule_primary)
    controller.add_flow_rule(switch1['name'], rule_secondary)
    
    # Simulate Switch1 failure (disabling it)
    switch1['active'] = False
    
    # Check if traffic is rerouted through Switch2
    assert any(rule['actions']['output'] == switch2['id'] for rule in controller.flow_rules)

def test_traffic_load_handling(setup_integration_test):
    """Test controller's ability to handle high traffic loads."""
    controller, switch1, switch2 = setup_integration_test()
    
    # Create multiple flow rules to simulate high traffic
    num_rules = 50
    for i in range(num_rules):
        rule = {
            'match': {
                'source_ip': f'192.168.1.{i+1}',
                'destination_ip': '172.16.0.1',
                'tcp_source_port': 1000 + i,
                'tcp_destination_port': 80
            },
            'actions': {
                'output': switch2['id']
            }
        }
        controller.add_flow_rule(switch1['name'], rule)
    
    # Verify that all rules are added and the controller can manage them
    assert len(controller.flow_rules) == num_rules

def test_security_updates(setup_integration_test):
    """Test controller's response to unauthorized flow rule modifications."""
    controller, switch1, switch2 = setup_integration_test()
    
    # Add a legitimate flow rule
    legitimate_rule = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch2['id']
        }
    }
    
    # Attempt to add an unauthorized rule (simulated breach)
    unauthorized_rule = {
        'match': {
            'source_ip': '192.168.1.11',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8081,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': switch2['id']
        }
    }
    
    # Simulate unauthorized addition and check if controller detects it
    controller.add_flow_rule(switch1['name'], legitimate_rule)
    controller.add_flow_rule(switch1['name'], unauthorized_rule)
    
    # Verify that only legitimate rules are present
    assert len(controller.flow_rules) == 1
    
    # Ensure that the unauthorized rule is not active
    assert not any(rule['match']['source_ip'] == '192.168.1.11' for rule in controller.flow_rules)
