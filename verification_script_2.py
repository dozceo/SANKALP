from playwright.sync_api import sync_playwright
import time

def verify(page):
    print("Checking API...")
    response = page.goto("http://localhost:9002/api/student?studentId=test")
    print(f"API Status: {response.status if response else 'None'}")
    content = page.content()
    print(f"API Content: {content[:100]}...") # Show first 100 chars

    print("Checking Home...")
    response = page.goto("http://localhost:9002/")
    print(f"Home Status: {response.status if response else 'None'}")
    page.screenshot(path="verification_screenshot_2.png")

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
