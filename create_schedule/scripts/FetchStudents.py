from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import json
from bs4 import BeautifulSoup
import re

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
    
def getIndividualClasses(driver, quarter):
    html = driver.page_source
    try: 
        with open('test1.txt', 'w') as file:
            file.write(str(html))
    except Exception as e:
        print(f"An error occurred: {e}")

    soup = BeautifulSoup(html, 'html.parser')

    quarter_element = soup.find('h3', string=quarter)

    retList = []
    if quarter_element:
        table = quarter_element.find_next('table')
        if table:
            classes = table.find_all('tr', valign='top')
            for row in classes:
                first_column = row.find('td')
                if first_column:
                    retList.append(first_column.text)

        return retList
    else:
        print("invalid quarter/semester format")
        return []

def fetch_students(term, classes, username, password, method):
    #Makes sure that the portal has loaded before going to class Search
    chrome_options = Options()

    if method == "true":
        chrome_options.add_argument("--headless")
    
    chrome_options.add_argument("--incognito")

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

    actions = ActionChains(driver)
    #Make sure Term drop down matches the term the user is generating for
    departments = set()
    for class_nbr in classes:
        subject, nbr, section = class_nbr.split("-")
        departments.add(subject)


    #Make sure Term drop down matches the term the user is generating for
    if len(classes) > 0:
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
            quarter = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//div[@title='{term}']"))
            )
            quarter.click()
        except:
            print("q2 did not work")
            sys.exit()
            
        actions.send_keys(Keys.ENTER).perform()
        time.sleep(5)

        try:
            subj = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[@title='Subject']/following::input[@type='text']"))
            ) 
            subj.click()
            print("subject dropdown clicked")
        except:
            print("class_nbr drop down did not work")   
            sys.exit()   
        
        time.sleep(5)

        for s in departments:
            print(s)
            try:
                press_subject = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, f"//div[@title='{s}']"))
                )
                press_subject.click()
            except:
                print("subject not found")
                sys.exit()
        actions.send_keys(Keys.ENTER).perform()
            
        try: 
            apply = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//input[@value='Apply']"))
            ) 
            apply.click()
            print("apply worked")
        except:
            print("apply did not work")
            sys.exit()

        try: 
            opts = WebDriverWait(driver, 30).until(
                    EC.presence_of_element_located((By.XPATH, "//select[@aria-label='Select a View:']"))
            ) 
            opts.click()
            print("opts worked")
        except:
            print("apply did not work")

        try: 
            student_list = WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located((By.XPATH, "//option[contains(text(), 'Student Listing')]"))
            ) 
            student_list.click()
        except Exception as e:
            print("Student list option not found, please look for line 'sect = ' in FetchStudents.py and compare paths")   
            print(f"An error occurred: {e}")
            sys.exit()

    
    students = set() 

    for class_nbr in classes:
        #select the class nbr dropdown, for each class, get all students enrolled
        subject, nbr, section = class_nbr.split("-")
        try:
            subject_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[text()='Subject']/following::td[@class='OOLT']/select"))
            )
            subject_dropdown.click()
        except:
            print("catalog nbr label not available")
            sys.exit()

        time.sleep(2)

        try:
            subject_select = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, f"//option[contains(text(), '{subject}')]"))
            )
            subject_select.click()
        except:
            print("catalog nbr not available")
            sys.exit()
        
        time.sleep(5)
    
        try:
            catalog_nbr = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[text()='Catalog Nbr']/following::td[@class='OOLT']/select"))
            )
            catalog_nbr.click()
        except:
            print("catalog nbr label not available")
            sys.exit()

        time.sleep(2)   

        try:
            catalog_nbr = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, f"//option[contains(text(), '{nbr}')]"))
            )
            catalog_nbr.click()
        except Exception as e:
            print("catalog error")
            print(f"An error occurred: {e}")
            sys.exit()
        
        time.sleep(2)

        try:
            sect = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[text()='Section']/following::td[@class='OOLT']/select"))
            )
            sect.click()
        except:
            print("catalog nbr label not available")
            sys.exit()
        
        time.sleep(2)
        
        try:
            sect = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, f"//label[text()='Section']/following::td[@class='OOLT']/select/option[contains(text(), '{section}')]"))
            )
            sect.click()
        except Exception as e:
            print("sect not available")
            print(f"An error occurred: {e}")
            sys.exit()

        actions.send_keys(Keys.ENTER).perform()
        time.sleep(10)

    
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        td_elements = soup.find_all('td')
        emails = [
            td.find('a').text
            for td in td_elements
            if td.find('a') and '@calpoly.edu' in td.find('a').text and 'polydata' not in td.find('a').text
        ]

        for email in emails:
            students.add(email)
        
    print(students)
    students.add("elhagen@calpoly.edu")
    student_dict = {}
    
    for student in students:
        try:
            driver.get("https://dashboards.calpoly.edu/dw/polydata/student_poly_profile.search")
            
            email_input = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, "//input[@id='p_username']"))
            )
            actions.move_to_element(email_input).click().send_keys(student[:-12]).perform()

            search = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, "//input[@type='submit']"))
            )
            search.click()

            time.sleep(10)

            try:
                with open("other1.txt", 'w') as file:
                    file.write(driver.page_source)
                    print("schedule planning")
            except Exception as e:
                print(f"An error occurred: {e}")
                return None
            
            
            element = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, "//a[starts-with(@href, 'https://dashboards.calpoly.edu/dw/polydata/student_poly_profile.display?')]"))
            )

            element.click()

            time.sleep(5)

            student_classes = getIndividualClasses(driver, term)

            student_dict[student] = student_classes
        
        except:
            print(f"student {student} error")
            continue
    
    session, type, year = term.split(" ")
    try: 
        with open(f"{session}{type}{year}StudentList.txt", 'w') as file:
            json.dump(student_dict, file)
        print("Classes fetched successfully!")
        return student_dict
    except Exception as e:
        print(f"An error occurred: {e}")
        return None



if __name__ == "__main__":
    fetch_students(sys.argv[4], sys.argv[5:], sys.argv[1], sys.argv[2], sys.argv[3])