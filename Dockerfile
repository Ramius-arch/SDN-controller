# Use OpenWrt base image as the starting point
FROM openwrt/base

# Copy necessary files
COPY ./sdn-controller /usr/bin/sdn-controller

# Set entrypoint and command to run the SDN controller
ENTRYPOINT ["sh", "-c"]
CMD ["/usr/bin/sdn-controller --net=host"]