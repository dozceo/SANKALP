from playwright.sync_api import sync_playwright
import time

def verify(page):
    print("Navigating to home...")
    response = page.goto("http://localhost:9002/")
    print(f"Status: {response.status if response else 'None'}")

    # Wait for potential redirect or client side navigation
    page.wait_for_timeout(5000)

    print(f"Current URL: {page.url}")
    print(f"Page title: {page.title()}")

    page.screenshot(path="verification_screenshot.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
