from playwright.sync_api import sync_playwright

def verify_focus_styles():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating to page...")
            page.goto("http://localhost:9002/test-palette-form", timeout=60000)

            # Wait for the form to load
            print("Waiting for form...")
            page.wait_for_selector("text=Teacher Profile", timeout=30000)

            # Find the first input (Name) and focus it
            print("Focusing name input...")
            name_input = page.get_by_label("Your Name")
            name_input.focus()

            # Press Tab to move to Subjects group
            # "Mathematics" should be the first one.
            print("Pressing Tab...")
            page.keyboard.press("Tab")

            # Wait a bit for styles to apply
            page.wait_for_timeout(500)

            # Take a screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification_screenshot.png")
            print("Done.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_focus_styles()
