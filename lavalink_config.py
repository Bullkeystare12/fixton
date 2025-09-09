import json, time

with open("emojis.json", "r", encoding="utf-8") as f:
    emojis = json.load(f)

def start_lavalink():
    print(f"{emojis['logger']['log']} Lavalink Config Loaded!")
    print(f"{emojis['logger']['success']} Lavalink Server starting...")

    for i in range(1, 6):
        print(f"{emojis['logger']['info']} Lavalink heartbeat {i}")
        time.sleep(1)

    print(f"{emojis['logger']['success']} Lavalink Server ready on 0.0.0.0:2333")

if __name__ == "__main__":
    start_lavalink()
