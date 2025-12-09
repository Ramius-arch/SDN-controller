# Copilot Instructions for SDN-controller

## Project Overview
This codebase implements an SDN (Software Defined Networking) controller for telecom networks using the OpenFlow protocol. It is designed to manage network switches, apply flow rules, and enforce QoS (Quality of Service) policies. The architecture is modular, with clear separation between packet handling, flow rule management, QoS, and traffic management.

## Key Components
- **src/controller.py**: Main entry point for the SDN controller. Handles switch connections, installs flow rules, and manages packet forwarding.
- **src/modules/flow_rules.py**: Manages flow rule creation, modification, and removal for switches. Flow rules are dictionaries with `match` and `actions` fields.
- **src/modules/qos_handler.py**: Handles QoS rules per switch, including priority and bandwidth allocation. Integrates with `TrafficManager` for packet routing.
- **src/modules/traffic_management.py**: Determines packet routing and port selection based on network topology and flow rules. Handles ARP and IP packets.
- **src/utils/openflow_utils.py**: Utility functions for creating and sending OpenFlow flow entries, parsing packets, and extracting headers.
- **src/utils/packet_handler.py**: Parses raw packet data, determines actions based on network policies, and creates flow entries for switches.
- **src/config/network_config.yaml**: Defines network topology, switch configurations, VLANs, and QoS priorities.

## Developer Workflows
- **Install dependencies**: `pip install -r requirements.txt`
- **Run controller**: Execute `src/controller.py` (requires Ryu framework)
- **Testing**: Run integration and unit tests in `src/tests/` (e.g., `python -m unittest src/tests/test_controller.py`)
- **Logging**: Uses Loguru and standard logging for diagnostics. Log files are stored in `src/logs/controller.log`.

## Project-Specific Patterns
- **Flow rules**: Always use dictionaries with `match` and `actions` keys. Example:
  ```python
  rule = {
    'match': {'source_ip': '192.168.1.10', 'tcp_source_port': 8080},
    'actions': {'output': 1}
  }
  ```
- **QoS rules**: Require `priority` and `bandwidth` fields. Matching logic uses `match` sub-dictionaries for traffic type and IPs.
- **Packet handling**: Use `PacketHandler` and `OpenFlowUtils` for parsing and flow entry creation. Actions are determined by port, protocol, and network policy.
- **Network config**: All topology and switch details are in `network_config.yaml`. Update this file to change network structure or QoS priorities.

## Integration Points
- **Ryu framework**: Central for OpenFlow protocol handling and switch management.
- **Scapy/dpkt**: Used for advanced packet parsing and manipulation.
- **External switches**: Communicate via OpenFlow messages constructed in `openflow_utils.py`.

## Conventions
- Place new modules in `src/modules/` and utilities in `src/utils/`.
- Use YAML for network configuration and CSV for device lists.
- Log all major actions and errors for traceability.
- Follow the structure and examples in existing modules for new features.

## Example Workflow
1. Add a new switch in `network_config.yaml`.
2. Implement custom flow rules in `flow_rules.py`.
3. Update QoS policies in `qos_handler.py`.
4. Test changes using scripts in `tests/`.

---
For questions or unclear patterns, review the referenced files or ask for clarification. Please suggest improvements if any section is incomplete or ambiguous.
