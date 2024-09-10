from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

from PortalLogin import login
import sys
import time
def present(driver, by, value):
    try:
        WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((by, value))
        )
        return True
    except:
        return False

def fetch_students(term, classes, username, password, method):
    #Makes sure that the portal has loaded before going to class Search
    chrome_options = Options()

    if method == "true":
        chrome_options.add_argument("--headless")

    #Let user pick preferred website
    driver = webdriver.Chrome(options=chrome_options)
    print(f"going to driver, {term}, {classes}")
    driver.get("https://analytics.calpoly.edu/ui/analytics/saw.dll?dashboard&PortalPath=%2Fshared%2FEnrollment%20Management%2F_portal%2FEnrollment%20and%20Schedule%20Planning")
    
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
 
    #Asks the user to approve by DUO
    duo = WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Yes, this is my device')]"))
    )
    duo.click()

    time.sleep(15)

    try:
        with open("other.txt", 'w') as file:
            file.write(driver.page_source)
            print("schedule planning")
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Schedule Planning Prompt')]"))
    )
    try:
        with open("schedulePlanning.txt", 'w') as file:
            file.write(driver.page_source)
            print("schedule planning")
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
    
    class_listing = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//td[@title='Class Listing']/div"))
    )
    class_listing.click()
     
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//*[text()='Class Listing Prompt']"))
    )

    try:
        with open("student.txt", 'w') as file:
            file.write(driver.page_source)
            print("student")
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


    
    actions = ActionChains(driver)
    #Make sure Term drop down matches the term the user is generating for
    
    try:
        quarter_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//label[@title='Term']/following::input[1]"))
        )
        quarter_dropdown.click()
    except:
        print("quarter drop down did not work")
        sys.exit()
    
    time.sleep(5)

    try:
        with open("quarters.txt", 'w') as file:
            file.write(driver.page_source)
            print("quarter text")
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
        
    
    try:
        quarter = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//input[@title='{term}']"))
            )
        quarter.click()
    except:
        print("q2 did not work")
        sys.exit()
    
    actions.send_keys(Keys.ENTER).perform()
                

    students = []
    for class_nbr in classes:
        #select the class nbr dropdown, for each class, get all students enrolled

        try:
            college_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[@title='College']/following::input[@type='text']"))
            ) 
            college_dropdown.click()
            print("subject dropdown found")
        except:
            print("subject drop down did not work")   
            sys.exit()    

        try:
            all_college = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//span[text()='All College' and @class='promptMenuOptionText']"))
            ) 
            all_college.click()
            print("all college works")
        except:
            print("all college not available")   
            sys.exit()  
   

        try:
            class_nbr_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[@title='Class Nbr']/following::input[1]"))   
            ) 
            class_nbr_input.click()
            actions.send_keys(class_nbr).send_keys(Keys.ENTER).perform()
            print("subject dropdown found")
        except:
            print("subject drop down did not work")   
            sys.exit() 
        
        apply = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//input[@value='Apply']"))
        ) 
        apply.click()
        time.sleep(30)       
        break

    
    return set(students)
    

if __name__ == "__main__":
    fetch_students(sys.argv[4], sys.argv[5:], sys.argv[1], sys.argv[2], sys.argv[3])