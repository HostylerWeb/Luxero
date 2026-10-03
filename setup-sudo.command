#!/bin/bash
echo "ncs ALL=(ALL) NOPASSWD: /usr/local/bin/docker compose *" | sudo tee /etc/sudoers.d/docker > /dev/null
echo "Done. Passwordless sudo configured for docker compose."
