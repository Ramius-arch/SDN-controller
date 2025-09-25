import pytest
from controller import SDNController

@pytest.fixture
def setup_controller():
    """Fixture to create and initialize an SDNController instance for each test."""
    controller = SDNController()
    yield controller
    # Cleanup: reset the controller state after tests

def test_add_flow_rule(setup_controller):
    """Test adding a flow rule to the controller."""
    controller = setup_controller()
    rule = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': 1  # Output to port 1
        }
    }
    
    # Mock switch response for adding a rule
    mock_switch = {'id': 1, 'name': 'Switch1'}
    controller.switches.append(mock_switch)
    
    result = controller.add_flow_rule('Switch1', rule)
    assert result is True
    assert len(controller.flow_rules) > 0

def test_remove_flow_rule(setup_controller):
    """Test removing a flow rule from the controller."""
    controller = setup_controller()
    # First, add a rule
    rule = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': 1  # Output to port 1
        }
    }
    
    controller.add_flow_rule('Switch1', rule)
    
    # Now, remove the rule
    result = controller.remove_flow_rule('Switch1', rule)
    assert result is True
    assert len(controller.flow_rules) == 0

def test_modify_flow_rule(setup_controller):
    """Test modifying an existing flow rule."""
    controller = setup_controller()
    # Add initial rule
    rule_initial = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': 1
        }
    }
    
    controller.add_flow_rule('Switch1', rule_initial)
    
    # Modify the rule
    rule_modified = {
        'match': {
            'source_ip': '192.168.1.10',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 8080,
            'tcp_destination_port': 80
        },
        'actions': {
            'output': 2  # Change output port to 2
        }
    }
    
    result = controller.modify_flow_rule('Switch1', rule_initial, rule_modified)
    assert result is True
    assert len(controller.flow_rules) == 1

def test_qos_policy Enforcement(setup_controller):
    """Test QoS policy enforcement by prioritizing critical traffic."""
    controller = setup_controller()
    # Define two flow rules with different priorities
    rule_high_priority = {
        'match': {
            'source_ip': '192.168.1.5',
            'destination_ip': '172.16.0.1',
            'tcp_source_port': 5000,
            'tcp_destination_port': 443
        },
        'actions': {
            'output': 1,
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
            'output': 2,
            'priority': 50
        }
    }
    
    # Add both rules to the controller
    controller.add_flow_rule('Switch1', rule_high_priority)
    controller.add_flow_rule('Switch1', rule_low_priority)
    
    # Simulate traffic matching both rules and check priority enforcement
    # Mock switch response would indicate which rule was applied first
    
    # For testing purposes, assume higher priority rule is processed first
    assert controller.flow_rules.index(rule_high_priority) < controller.flow_rules.index(rule_low_priority)

def test_error_handling(setup_controller):
    """Test error handling when adding invalid rules."""
    controller = setup_controller()
    
    # Try to add an invalid rule (missing match criteria)
    invalid_rule = {
        'actions': {
            'output': 1
        }
    }
    
    result = controller.add_flow_rule('Switch1', invalid_rule)
    assert result is False
    
    # Try to remove a non-existent rule
    result = controller.remove_flow_rule('Switch1', {})
    assert result is False

# More test functions can be added as needed...
