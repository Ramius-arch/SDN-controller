# Quality of Service Handler Module (qos_handler.py)

from traffic_management import TrafficManager
import logging

class QosHandler:
    def __init__(self):
        self.tm = TrafficManager()
        self.log = logging.getLogger(__name__)
        self.qos_rules = {}  # Dictionary to store QoS rules per switch

    def add_qos_rule(self, switch_id, rule):
        """
        Adds a new QoS rule for a specified switch.
        
        Args:
            switch_id: The identifier for the switch.
            rule: Dictionary containing QoS parameters (e.g., priority level,
                   bandwidth allocation, traffic type).
        Returns:
            True if the rule was added successfully; False otherwise.
        """
        # Validate the rule before adding
        if not self._validate_rule(rule):
            self.log.error("Invalid QoS rule provided")
            return False

        if switch_id not in self.qos_rules:
            self.qos_rules[switch_id] = []

        self.qos_rules[switch_id].append(rule)
        self.log.info(f"Added QoS rule to switch {switch_id}")
        return True

    def modify_qos_rule(self, switch_id, old_rule, new_rule):
        """
        Modifies an existing QoS rule for a specified switch.
        
        Args:
            switch_id: The identifier for the switch.
            old_rule: The rule to be replaced.
            new_rule: The new rule parameters.
        Returns:
            True if the rule was modified successfully; False otherwise.
        """
        if switch_id not in self.qos_rules:
            self.log.error(f"No QoS rules found for switch {switch_id}")
            return False

        index = None
        for i, rule in enumerate(self.qos_rules[switch_id]):
            if rule == old_rule:
                index = i
                break

        if index is not None:
            # Validate the new rule before modifying
            if self._validate_rule(new_rule):
                self.qos_rules[switch_id][index] = new_rule
                self.log.info(f"Modified QoS rule in switch {switch_id}")
                return True
            else:
                self.log.error("Invalid QoS rule provided")
                return False

        self.log.error(f"Old QoS rule not found for switch {switch_id}")
        return False

    def remove_qos_rule(self, switch_id, rule):
        """
        Removes a QoS rule from a specified switch.
        
        Args:
            switch_id: The identifier for the switch.
            rule: The rule to be removed.
        Returns:
            True if the rule was removed successfully; False otherwise.
        """
        if switch_id not in self.qos_rules:
            self.log.error(f"No QoS rules found for switch {switch_id}")
            return False

        try:
            self.qos_rules[switch_id].remove(rule)
            self.log.info(f"Removed QoS rule from switch {switch_id}")
            return True
        except ValueError:
            self.log.error(f"QoS rule not found for switch {switch_id}")
            return False

    def handle_packet(self, packet_info):
        """
        Processes a packet based on the applicable QoS rules.
        
        Args:
            packet_info: Dictionary containing details about the packet,
                         including source, destination, type, etc.
        Returns:
            The switch port where the packet should be sent next after applying QoS.
        """
        if 'source_switch' not in packet_info:
            self.log.error("Missing source switch information")
            return None

        switch_id = packet_info['source_switch']
        rules = self.qos_rules.get(switch_id, [])

        # Apply QoS policies to determine the appropriate handling
        for rule in rules:
            if self._matches_rule(packet_info, rule):
                return self._apply_qos(packet_info, rule)

        # If no matching rule, default to normal traffic handling
        return self.tm.process_packet(packet_info)

    def _validate_rule(self, rule):
        """
        Validates a QoS rule to ensure it contains the necessary fields.
        
        Args:
            rule: The QoS rule to validate.
        Returns:
            True if the rule is valid; False otherwise.
        """
        required_fields = ['priority', 'bandwidth']
        for field in required_fields:
            if field not in rule:
                return False
        return True

    def _matches_rule(self, packet_info, rule):
        """
        Checks if a packet matches a specific QoS rule based on criteria such as
        traffic type, source/destination IPs, or other parameters.
        
        Args:
            packet_info: Dictionary containing details about the packet.
            rule: The QoS rule to check against.
        Returns:
            True if the packet matches the rule; False otherwise.
        """
        # Simplified matching logic for demonstration purposes
        traffic_type = packet_info.get('type')
        src_ip = packet_info.get('source_ip')
        dest_ip = packet_info.get('destination_ip')

        match_criteria = rule.get('match', {})
        if (traffic_type == match_criteria.get('type') and
            src_ip == match_criteria.get('src_ip') and
            dest_ip == match_criteria.get('dest_ip')):
            return True

        return False

    def _apply_qos(self, packet_info, rule):
        """
        Applies QoS policies to a packet based on the specified rule.
        
        Args:
            packet_info: Dictionary containing details about the packet.
            rule: The QoS rule to apply.
        Returns:
            The switch port where the packet should be sent next after applying QoS.
        """
        # Example QoS handling logic
        priority = rule['priority']
        bandwidth = rule.get('bandwidth', 'default')

        if priority == 'high':
            return self.tm.process_packet(packet_info)
        elif priority == 'medium' and bandwidth >= 50:
            return self.tm.process_packet(packet_info)
        else:
            # Lower priority; may drop or delay the packet
            self.log.info(f"Low priority packet: {packet_info}")
            return None

    def _get_bandwidth_usage(self, switch_id):
        """
        Retrieves current bandwidth usage for a switch to determine if QoS rules are being met.
        
        Args:
            switch_id: The identifier for the switch.
        Returns:
            Dictionary with current bandwidth usage per port.
        """
        # Placeholder method; in practice, this would query switch statistics
        return {port: 0 for port in self.tm.switch_manager.get_ports(switch_id)}

    def _update_bandwidth_usage(self, switch_id, port, usage):
        """
        Updates the bandwidth usage for a specific port on a switch.
        
        Args:
            switch_id: The identifier for the switch.
            port: The port number.
            usage: The updated bandwidth usage percentage.
        """
        if switch_id not in self.qos_rules:
            return

        # Update bandwidth usage statistics
        self.log.info(f"Updated bandwidth usage for {switch_id}:{port} to {usage}%")

# Example usage
if __name__ == "__main__":
    qos_handler = QosHandler()
    
    # Adding a QoS rule
    rule1 = {
        'priority': 'high',
        'bandwidth': 80,
        'match': {
            'type': 'ip',
            'src_ip': '192.168.1.10',
            'dest_ip': '172.16.0.1'
        }
    }
    
    success = qos_handler.add_qos_rule('Switch1', rule1)
    if success:
        print("QoS rule added successfully")
        
    # Simulating packet handling
    packet_info = {
        'source_switch': 'Switch1',
        'type': 'ip',
        'source_ip': '192.168.1.10',
        'destination_ip': '172.16.0.1'
    }
    
    result = qos_handler.handle_packet(packet_info)
    if result:
        print(f"Packet sent to port {result}")
    else:
        print("Packet dropped due to QoS constraints")
