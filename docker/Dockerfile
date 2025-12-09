# Create a basic Docker image for the SDN Controller
FROM ubuntu:latest

# Install necessary system dependencies
RUN apt-get update && apt-get install -y python3 python3-pip software-properties-common curl

# Set up environment variables
ENV PYTHONPATH /app

# Copy requirements file
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Expose the SDN Controller port(s)
EXPOSE 80

# Run the application
CMD ["python", "app.py"]# Use an Ubuntu base image
FROM ubuntu:latest

# Install Python if needed
RUN apt-get update && apt-get install -y python3 curl

# Set the working directory
WORKDIR /app

# Copy your SDN controller code
COPY . .

# Expose any necessary ports (e.g., 80 for web, 53 for DNS)
EXPOSE 80 53

# Command to run your controller
CMD ["python3", "your_controller_script.py"]