import os
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, BotoCoreError
import requests
from requests_aws4auth import AWS4Auth

class PrometheusConfig:
    def __init__(self, workspace_id, region='us-east-1'):
        self.workspace_id = workspace_id
        self.region = region
        self.prometheus_url = self._get_prometheus_endpoint()

    def _get_prometheus_endpoint(self):
        try:
            aps_client = boto3.client('amp', region_name=self.region)
            response = aps_client.describe_workspace(workspaceId=self.workspace_id)
            return response['workspace']['prometheusEndpoint']
        except (NoCredentialsError, PartialCredentialsError):
            print("AWS credentials not found. Please configure your credentials.")
            return None
        except BotoCoreError as e:
            print(f"An AWS error occurred: {e}")
            return None

def make_prometheus_request(prometheus_url, query, region='us-east-1'):
    try:
        credentials = boto3.Session().get_credentials()
        aws_auth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            region,
            'aps',
            session_token=credentials.token
        )
        
        url = f"{prometheus_url}api/v1/query"
        params = {'query': query}
        
        response = requests.get(url, auth=aws_auth, params=params)
        response.raise_for_status()
        
        return response.json()
        
    except BotoCoreError as e:
        print(f"An AWS error occurred: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"A network error occurred: {e}")
        return None

def test_prometheus_connection(config):
    if not config.prometheus_url:
        print("Prometheus endpoint not configured. Skipping connection test.")
        return

    print(f"Testing connection to Prometheus workspace: {config.workspace_id}")
    
    # Simple query to test the connection
    test_query = 'up'
    
    try:
        response = make_prometheus_request(config.prometheus_url, test_query, config.region)
        
        if response and response.get('status') == 'success':
            print("Successfully connected to Prometheus.")
            # You can optionally print some of the response data
            # print("Response:", response['data'])
        else:
            print("Failed to connect to Prometheus. Response was not successful.")
            if response:
                print("Response status:", response.get('status'))
                print("Error details:", response.get('error'))
                
    except Exception as e:
        print(f"An error occurred during the connection test: {e}")

def get_prometheus_metrics(config, query):
    if not config.prometheus_url:
        print("Prometheus endpoint not configured. Cannot get metrics.")
        return None

    print(f"Getting metrics from Prometheus workspace: {config.workspace_id}")
    
    try:
        response = make_prometheus_request(config.prometheus_url, query, config.region)
        
        if response and response.get('status') == 'success':
            print("Successfully got metrics from Prometheus.")
            return response['data']
        else:
            print("Failed to get metrics from Prometheus. Response was not successful.")
            if response:
                print("Response status:", response.get('status'))
                print("Error details:", response.get('error'))
            return None
                
    except Exception as e:
        print(f"An error occurred during the metrics request: {e}")
        return None

if __name__ == '__main__':
    # Replace with your Amazon Managed Prometheus workspace ID
    PROMETHEUS_WORKSPACE_ID = os.environ.get("PROMETHEUS_WORKSPACE_ID", "ws-xxxx")
    
    # Create a PrometheusConfig instance
    prometheus_config = PrometheusConfig(workspace_id=PROMETHEUS_WORKSPACE_ID)
    
    # Test the connection
    if prometheus_config.prometheus_url:
        test_prometheus_connection(prometheus_config)
    else:
        print("Could not retrieve Prometheus endpoint. Please check your configuration and AWS credentials.")
