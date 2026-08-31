"""
WASender Engine - Native Chromium Browser Automation for Outbound MKT Campaigns
Uses Playwright with persistent Chrome user data profile and stealth settings.
"""

import os
import sys
import json
import time
import asyncio
import sqlite3
import argparse
import urllib.parse
from playwright.async_api import async_playwright
from playwright_stealth import Stealth

CONFIG_PATH = r"c:\SaaSIA\ai_core\config\wasender_config.json"
PROFILE_DIR = r"c:\SaaSIA\ai_core\config\wasender_chrome_profile"
DB_PATH = r"c:\SaaSIA\ai_core\config\brain_sessions.db"

def load_wasender_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"headless": False, "instance_name": "mkt_colab", "status": "idle", "delay_min": 120, "delay_max": 240}

def save_wasender_config(cfg):
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)

class WASenderEngine:
    def __init__(self, headless=None):
        self.cfg = load_wasender_config()
        if headless is not None:
            self.cfg["headless"] = headless
        self.headless = self.cfg.get("headless", False)
        self.browser_context = None
        self.page = None
        self.playwright = None

    async def initialize(self):
        print(f"[WASENDER] Initializing WASender Engine (headless={self.headless})...")
        
        # Cleanup orphaned Playwright processes to prevent profile locks
        try:
            import psutil
            for p in psutil.process_iter(['pid', 'exe']):
                if p.info['pid'] != os.getpid() and 'ms-playwright' in str(p.info['exe'] or '').lower():
                    try: p.kill()
                    except Exception: pass
        except Exception: pass

        self.playwright = await async_playwright().start()
        
        args = [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-infobars",
            "--window-size=1280,800"
        ]
        
        lock = os.path.join(PROFILE_DIR, "SingletonLock")
        if os.path.exists(lock):
            try: os.remove(lock)
            except Exception: pass

        try:
            self.browser_context = await self.playwright.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=self.headless,
                viewport={"width": 1280, "height": 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                args=args
            )
            self.page = await self.browser_context.new_page()
            await Stealth().apply_stealth_async(self.page)
            print("[WASENDER] Opening web.whatsapp.com...")
            await self.page.goto("https://web.whatsapp.com", wait_until="networkidle", timeout=60000)
        except Exception as e:
            if "ProcessSingleton" in str(e) or "already in use" in str(e) or "Lock file" in str(e):
                print("[WASENDER] Chrome profile locked. Attaching to active browser via CDP (http://127.0.0.1:9222)...")
                try:
                    browser = await self.playwright.chromium.connect_over_cdp("http://127.0.0.1:9222")
                    self.browser_context = browser.contexts[0]
                    pages = self.browser_context.pages
                    self.page = pages[0] if pages else await self.browser_context.new_page()
                    if "whatsapp.com" not in self.page.url:
                        await self.page.goto("https://web.whatsapp.com", wait_until="domcontentloaded")
                    print("[WASENDER] Connected to active browser via CDP!")
                except Exception as cdp_err:
                    print(f"[WASENDER] CDP connect error: {cdp_err}")
                    raise e
            else:
                raise e
        
        self.cfg["status"] = "running"
        save_wasender_config(self.cfg)
        print("[WASENDER] Engine successfully loaded web.whatsapp.com!")

    async def update_qr_capture(self):
        if not self.page:
            return None
        try:
            canvas = await self.page.query_selector('canvas')
            if canvas:
                img_bytes = await canvas.screenshot(type="png")
                import base64
                b64_str = "data:image/png;base64," + base64.b64encode(img_bytes).decode("utf-8")
                self.cfg["qr_base64"] = b64_str
                self.cfg["status"] = "qr_ready"
                save_wasender_config(self.cfg)
                return b64_str
        except Exception as e:
            print(f"[WASENDER] Error capturing QR canvas: {e}")
        return None

    async def is_logged_in(self):
        if not self.page:
            return False
        for attempt in range(10):
            try:
                for selector in ['#pane-side', 'div[contenteditable="true"]', 'div[role="textbox"]', 'span[data-icon="chat"]', 'header']:
                    el = await self.page.query_selector(selector)
                    if el:
                        return True
                await asyncio.sleep(2)
            except Exception:
                await asyncio.sleep(1)
        return False

    async def send_message(self, phone: str, text: str):
        if not self.page:
            return {"success": False, "error": "Browser not initialized"}
        
        clean_phone = "".join(filter(str.isdigit, str(phone)))
        if clean_phone.startswith("0"):
            clean_phone = clean_phone[1:]
        if not clean_phone.startswith("54") and len(clean_phone) == 10:
            clean_phone = "549" + clean_phone
        elif clean_phone.startswith("54") and not clean_phone.startswith("549") and len(clean_phone) == 12:
            clean_phone = "549" + clean_phone[2:]
            
        print(f"[WASENDER] Sending message to {clean_phone} via Full DOM UI Search (No URL navigation)...")
        try:
            # 1. Click New Chat button
            new_chat_btn = None
            for sel in ['span[data-icon="new-chat-outline"]', 'span[data-icon="chat"]', 'button[aria-label="Nuevo chat"]', 'button[aria-label="New chat"]']:
                try:
                    new_chat_btn = await self.page.wait_for_selector(sel, timeout=3000)
                    if new_chat_btn:
                        await new_chat_btn.click()
                        break
                except Exception:
                    pass
            
            await asyncio.sleep(1.5)

            # 2. Find Search Box
            search_input = None
            for sel in ['div[contenteditable="true"][data-tab="3"]', 'div[contenteditable="true"]', 'input[type="text"]']:
                try:
                    search_input = await self.page.wait_for_selector(sel, timeout=3000)
                    if search_input:
                        break
                except Exception:
                    pass

            if not search_input:
                # Fallback: click general search
                try:
                    search_btn = await self.page.query_selector('div[contenteditable="true"]')
                    if search_btn:
                        search_input = search_btn
                except Exception:
                    pass

            if search_input:
                await search_input.focus()
                await search_input.fill("")
                # Type phone number with human delay
                await search_input.type(clean_phone, delay=120)
                await asyncio.sleep(2.5)

                # Press Enter to open chat
                await self.page.keyboard.press("Enter")
                await asyncio.sleep(2.5)

                # 3. Focus Message Box and Type Message
                msg_box = None
                for sel in ['div[contenteditable="true"][data-tab="10"]', 'div[contenteditable="true"][aria-label="Escribe un mensaje aquí"]', 'div[contenteditable="true"][aria-label="Type a message"]', 'footer div[contenteditable="true"]']:
                    try:
                        msg_box = await self.page.wait_for_selector(sel, timeout=4000)
                        if msg_box:
                            break
                    except Exception:
                        pass

                if not msg_box:
                    msg_box = await self.page.query_selector('footer div[contenteditable="true"]')

                if msg_box:
                    await msg_box.focus()
                    await msg_box.type(text, delay=25)
                    await asyncio.sleep(1.5)

                    # Click Send or Press Enter
                    send_btn = None
                    for sel in ['button[aria-label="Enviar"]', 'button[aria-label="Send"]', 'span[data-icon="send"]']:
                        try:
                            send_btn = await self.page.query_selector(sel)
                            if send_btn:
                                await send_btn.click()
                                break
                        except Exception:
                            pass

                    if not send_btn:
                        await self.page.keyboard.press("Enter")

                    await asyncio.sleep(3)
                    print(f"[WASENDER] Sent successfully via DOM Search UI to {clean_phone}!")
                    return {"success": True, "phone": clean_phone}

            # Ultimate fallback if DOM search fails
            print(f"[WASENDER] DOM Search fallback: Navigating via target URL...")
            encoded_text = urllib.parse.quote(text)
            target_url = f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_text}"
            await self.page.goto(target_url, wait_until="domcontentloaded", timeout=45000)
            await asyncio.sleep(4)
            await self.page.keyboard.press("Enter")
            await asyncio.sleep(3)
            return {"success": True, "phone": clean_phone}

        except Exception as e:
            print(f"[WASENDER] Error sending to {clean_phone}: {e}")
            return {"success": False, "error": str(e), "phone": clean_phone}

    async def close(self):
        print("[WASENDER] Closing browser context...")
        if self.browser_context:
            await self.browser_context.close()
        if self.playwright:
            await self.playwright.stop()
        self.cfg["status"] = "stopped"
        save_wasender_config(self.cfg)

async def main():
    parser = argparse.ArgumentParser(description="WASender Engine Worker")
    parser.add_argument("--headless", action="store_true", help="Run browser in headless mode")
    parser.add_argument("--visible", action="store_true", help="Run browser in visible debug mode")
    parser.add_argument("--status", action="store_true", help="Check engine status")
    parser.add_argument("--send", help="Send test message to phone")
    parser.add_argument("--text", default="Hola! Mensaje de prueba desde WASender Engine.", help="Message text")
    args = parser.parse_args()

    if args.status:
        cfg = load_wasender_config()
        print(json.dumps(cfg, indent=2))
        return

    headless = True if args.headless else (False if args.visible else None)
    engine = WASenderEngine(headless=headless)
    
    try:
        await engine.initialize()
        
        if args.send:
            res = await engine.send_message(args.send, args.text)
            print("Send Result:", json.dumps(res, indent=2))
        else:
            print("[WASENDER] Engine active. Monitoring QR and login status...")
            while True:
                is_logged = await engine.is_logged_in()
                if is_logged:
                    if engine.cfg.get("status") != "connected":
                        print("[WASENDER] Connected! Login detected on web.whatsapp.com")
                        engine.cfg["status"] = "connected"
                        engine.cfg["qr_base64"] = None
                        save_wasender_config(engine.cfg)
                else:
                    await engine.update_qr_capture()
                await asyncio.sleep(3)
    except KeyboardInterrupt:
        print("\n[WASENDER] Interrupted by user.")
    finally:
        await engine.close()

if __name__ == "__main__":
    asyncio.run(main())
