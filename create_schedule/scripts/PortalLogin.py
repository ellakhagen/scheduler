from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
import time
import sys

"""
Logs in to the CalPoly portal, precedent for all following actions
TODO: change it so the user can pick which webdriver they use, occassionally
password will be put in teh username section
"""

def present(driver, by, value):
    try:
        WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((by, value))
        )
        return True
    except:
        return False

#method either is "initial login" or a boolean value saying whether or not it 
# is in headless mode
def login(username, password, method):
    chrome_options = Options()

    if method == "true" or method == "initial login":
        chrome_options.add_argument("--headless")

    #Let user pick preferred website
    driver = webdriver.Chrome(options=chrome_options)

    try:
        #Directs script to the portal
        driver.get("https://myportal.calpoly.edu/")
        #Logs in with user credentails
        #TODO: sometimes password is put into username field, moves too fast
        actions = ActionChains(driver)
        username_field = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//input[@id="username"]')))
        actions.move_to_element(username_field).click().send_keys(username).perform()

        time.sleep(0.5)
        
        password_field = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//input[@id="password"]')))
        actions.move_to_element(password_field).click().send_keys(password).perform()

        submit_button = driver.find_element(By.XPATH, '//button[@name="_eventId_proceed"]')
        submit_button.click()
        print("3")
        incorrect = present(driver, By.XPATH, "//*[contains(text(), 'The username or password you entered was incorrect.')]")
        if incorrect:
            print("Incorrect")
            return
        else:
            print("Duo")
            if method == "initial login":
                return

        
        #Asks the user to approve by DUO
        duo = WebDriverWait(driver, 50).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Yes, this is my device')]"))
        )
        duo.click()

        return driver
    
    except Exception as e:
        print("Login failed: ", str(e))
        driver.quit()
        return None


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Incorrect arguments")
    else:
        login(sys.argv[1], sys.argv[2], sys.argv[3])