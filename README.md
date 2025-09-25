# SDN Packet Handler for Telecom Networks

A packet handler designed for Software Defined Networking (SDN) controllers using the OpenFlow protocol, specifically tailored for telecom networks.

## Features

- Processes packets according to network policies.
- Handles IPv4 and IPv6 traffic with TCP and UDP protocols.
- Dynamically determines actions based on parsed headers.
- Creates OpenFlow flow entries for switches.

## Dependencies

Before running the code, ensure you have the following packages installed:

1. **Ryu**: For OpenFlow protocol handling.
   - `ryu==4.19.2`
   
2. **Scapy**: For advanced packet manipulation and parsing.
   - `scapy>=0.23`

3. **Python Loguru**: For logging purposes.
   - `python-loguru>=0.9.0`

4. **IP Address Handling**:
   - `ipaddress>=1.0.2`

5. **JSON Handling (optional)**:
   - `json-simple==1.3.3`

## Installation

```bash
pip install -r requirements.txt
