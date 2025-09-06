import json
import os

cfg = {
    "host": "127.0.0.1",
    "port": 2333,
    "password": "youshallnotpass"
}

os.makedirs("lavalink", exist_ok=True)
with open("lavalink/nodes.json", "w") as f:
    json.dump([cfg], f, indent=2)

print("[lavalink_config] wrote lavalink/nodes.json")
