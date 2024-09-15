from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
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
        quarter = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, f"//div[@title='{term}']"))
        )
        quarter.click()
    except:
        print("q2 did not work")
        sys.exit()
    
    actions.send_keys(Keys.ENTER).perform()

    try:
        with open("quarters.txt", 'w') as file:
            file.write(driver.page_source)
            print("quarter text")
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    time.sleep(5)   

    
    prev = ""
    students = set() 
    for class_nbr in classes:
        #select the class nbr dropdown, for each class, get all students enrolled
        subject, nbr, section = class_nbr.split("-")
        print("prev: ", prev, "subject: ", subject, "sect: ", section)
        if subject != prev:
            print("entered")
            try:
                subj = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//label[@title='Subject']/following::input[@type='text']"))
                ) 
                subj.click()
            except:
                print("class_nbr drop down did not work")   
                sys.exit()   
            time.sleep(5)
            try:
                press_subject = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, f"//div[@title='{subject}']"))
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



        try:
            catalog_nbr = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[text()='Catalog Nbr']/following::td[@class='OOLT']/select"))
            )
            catalog_nbr.click()
        except:
            print("catalog nbr label not available")
            sys.exit()

        try:
            catalog_nbr = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, f"//option[contains(text(), '{nbr}')]"))
            )
            catalog_nbr.click()
        except:
            print("catalog nbr not available")
            sys.exit()

        try:
            sect = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[text()='Section']/following::td[@class='OOLT']/select"))
            )
            sect.click()
        except:
            print("catalog nbr label not available")
            sys.exit()

        try:
            sect = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, f"//option[contains(text(), '{section}')]"))
            )
            sect.click()
        except:
            print("Sect not available")
            sys.exit()

    
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        td_elements = soup.find_all('td')
        emails = [td.find('a').text for td in td_elements if td.find('a') and '@calpoly.edu' in td.find('a').text]
        print(emails)
        for email in emails:
            students.add(email)
        

        prev = subject
        print("success")


    print(students)
    

"""
        try:
            department = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[@title='Department' and contains(span/text(), 'Department')]"))
            ) 
            department.click()
        except:
            print("department drop down did not work")   
            sys.exit()    
        time.sleep(10)

        try:
            with open("subjects.txt", 'w') as file:
                file.write(driver.page_source)
                print("subjects")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None


        try:
            course_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[@title='Catalog Nbr']/following::input[@type='text']"))
            ) 
            course_dropdown.click()
            print("course dropdown found")
        except Exception as e:
            print("Course dropdown option not found, please look for line 'course_dropdown = ' in FetchStudents.py")   
            print(f"An error occurred: {e}")
            sys.exit()    

        time.sleep(10)
        try:
            with open("courses.txt", 'w') as file:
                file.write(driver.page_source)
                print("courses")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
        
        try:
            nbr = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//span[text()='{number}' and @class='promptMenuOptionText']"))
            ) 
            nbr.click()
            print("course number found")
        except Exception as e:
            try:
                nbr = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//input[@value='{number}']"))
                ) 
                nbr.click()
                print("course number found")
            except:
                print(f"Course number {number} not found, please look for line 'nbr = ' in FetchStudents.py")   
                print(f"An error occurred: {e}")
                sys.exit()    

        try:
            section_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//label[@title='Section']/following::input[@type='text']"))
            ) 
            section_dropdown.click()
            print("section dropdown found")
        except Exception as e:
            print("Section dropdown not found, please look for line 'section_dropdown = ' in FetchStudents.py")   
            print(f"An error occurred: {e}")
            sys.exit()    

        time.sleep(10)
        try:
            with open("sections.txt", 'w') as file:
                file.write(driver.page_source)
                print("sections")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
        
        try:
            sect = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//span[text()='{section}' and @class='promptMenuOptionText']"))
            ) 
            sect.click()
            print("section clicked")
        except Exception as e:
            try:
                sect = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//span[contains(text(), '{section}')]"))
                ) 
                sect.click()
                print("course number found")
            except:
                print("Section not found, please look for line 'sect = ' in FetchStudents.py")   
                print(f"An error occurred: {e}")
                sys.exit()  

        try: 
            apply = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//input[@value='Apply']"))
            ) 
            apply.click()
            print("apply worked")
        except:
            print("apply did not work")
        time.sleep(20)

        try: 
            opts = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//select[@aria-label='Select a View:']"))
            ) 
            opts.click()
            print("opts worked")
        except:
            print("apply did not work")

        time.sleep(5)
        try:
            with open("opts.txt", 'w') as file:
                file.write(driver.page_source)
                print("opts")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
    
        try: 
            student_list = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//option[contains(text(), 'Student Listing')]"))
            ) 
            student_list.click()
            print("student_list worked")
        except Exception as e:
            print("Student list option not found, please look for line 'sect = ' in FetchStudents.py and compare paths")   
            print(f"An error occurred: {e}")
            sys.exit()

        time.sleep(15)
        try:
            with open(f"students{class_nbr}.txt", 'w') as file:
                file.write(driver.page_source)
                print("students")
        except Exception as e:
            print(f"An error occurred: {e}")
            sys.exit()

        
   
    
    return set(students)
     """
    

if __name__ == "__main__":
    fetch_students(sys.argv[4], sys.argv[5:], sys.argv[1], sys.argv[2], sys.argv[3])