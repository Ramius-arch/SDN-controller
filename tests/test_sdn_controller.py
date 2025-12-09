import unittest
from src import sdn_controller

class TestSDNController(unittest.TestCase):
    def test_switch_config(self):
        # Test if switch configuration is applied correctly
        controller = sdn_controller.SDNController()
        controller.switch_config(1, 'openflow')
        self.assertTrue(controller.isconfigured)

    def test_packet_handling(self):
        # Verify packet handling logic works as expected
        controller = sdn_controller.SDNController()
        self.assertEqual(controller.handle_packet(None), None)

    def test_link_establishment(self):
        # Check if link establishment with switches is functional
        controller = sdn_controller.SDNController()
        self.assertEqual(controller.link_to_switch(1, 'openflow'), True)

if __name__ == '__main__':
    unittest.main()