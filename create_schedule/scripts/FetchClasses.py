from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from PortalLogin import login
import time
from datetime import datetime
from bs4 import BeautifulSoup
import json
import sys

def convert_time(time_str):
    if not time_str or len(time_str) < 5:
        return "N/A"
    
    time_str = time_str[:6]
    hour = int(time_str[:2])
    minutes = time_str[3:5]
    if hour >= 12:
        period = "pm"
        if hour > 12:
            hour -= 12
    else:
        period = "am"
        if hour == 0:
            hour = 12
        
        # Format the hour and minutes into a 12-hour clock format
    return f"{hour}:{minutes} {period}"
    


def extract_text_by_header(soup, header_name):
    div = soup.find('div', {'header': header_name})
    if div:
        p = div.find('p')
        if p:
            spans = p.find_all('span')
            return spans[0].get_text(strip=True)
    return None

def fetch_classes(driver, session, type, year):
        """
        This part of the program goes to Class Search, and will load all classes and their information.
        That way there will be a dictionary with the class number, section, and their times for quick lookup
        """
        
        #Makes sure that the portal has loaded before going to class Search
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'My Portal')]"))
        ) 
        
        driver.get("https://cmsweb.pscs.calpoly.edu/psp/CSLOPRD/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_Main?")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Class Search')]")))
        
        try: 
            with open("TestFile1.txt", 'w') as file:
                file.write(driver.page_source)
            print("written")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
        

        #Enters the main_iframe, which has the html which is needed for selenium reference
        iframe_url = driver.find_element(By.ID, 'main_iframe').get_attribute('src')
        driver.get(iframe_url)


        #Picks dropdown box for quarter
        quarter_dropdown = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//label[contains(text(), 'Term')]/following-sibling::div[1]"))
        )
        quarter_dropdown.click()

        try: 
            with open("TestFile1.txt", 'w') as file:
                file.write(driver.page_source)
            print("written")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

        quarter_string = session + " " + type + " " + year
        try:
            options_popup = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//*[contains(text(), '{quarter_string}')]"))
            )
            options_popup.click()
        except:
            print("Option not available")
            sys.exit()
        
        
        #Search
        search = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[button//*[contains(text(), 'Search')]]"))
        )
        search.click()
        time.sleep(4)
        url = driver.current_url
        index = url.find('term=')
        toIndex = url.find('&', index + 5)
        term = url[index + 5: toIndex]
        
        course_dict = {}
        page = 1
        while True:
            driver.get(f"https://cmsweb.pscs.calpoly.edu/psc/CSLOPRD/EMPLOYEE/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_ClassSearch?institution=SLCMP&term={term}&date_from=&date_thru=&subject=&subject_like=&catalog_nbr=&start_time_equals=&end_time_equals=&start_time_ge=&end_time_le=&days=&campus=&location=&x_acad_career=&acad_group=&rqmnt_designtn=&instruction_mode=&keyword=&class_nbr=&acad_org=&enrl_stat=&crse_attr=&crse_attr_value=&instructor_name=&instr_first_name=&session_code=&units=&trigger_search=&page={page}")
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            json_data = soup.find('pre').get_text()
            data = json.loads(json_data)
            if len(data) == 0:
                break
            
            for item in data:
                course_key = f"{item.get('subject', 'N/A')}-{item.get('catalog_nbr', 'N/A')}-{item.get('class_section', 'N/A')}"
                meeting_info = item['meetings'][0] if item['meetings'] else {}
                course_dict[course_key] = {
                                            'course_name' : item.get("descr", 'N/A'),
                                            'course_number': item.get('class_nbr', 'N/A'),
                                            'course_day': meeting_info.get('days', 'N/A'),
                                            'course_start': convert_time(meeting_info.get('start_time', 'N/A')),
                                            'course_end': convert_time(meeting_info.get('end_time', 'N/A')),
                                            'course_instructor': [instructor.get('name', 'N/A') for instructor in item.get('instructors', [])]}
                
            page += 1
        
        try: 
            with open(f"{session}{type}{year}ClassList.txt", 'w') as file:
                json.dump(course_dict, file)
            print("Classes fetched successfully!")
            return course_dict
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
    
     
if __name__ == "__main__":
    if len(sys.argv) != 7:
        print("Incorrect arguments")
    else:
        driver = login(sys.argv[1], sys.argv[2], sys.argv[6])
        fetch_classes(driver, sys.argv[3], sys.argv[4], sys.argv[5])