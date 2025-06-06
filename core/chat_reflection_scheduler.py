# chat_reflection_scheduler.py – Runs reflect_and_generate() every 15 minutes

import time
from chat_reflector import reflect_and_generate

INTERVAL_MINUTES = 15

print("📡 Reflection Scheduler started. Running every 15 minutes...")

while True:
    try:
        reflect_and_generate()
    except Exception as e:
        print("❌ Reflection failed:", e)
    time.sleep(INTERVAL_MINUTES * 60)
