from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from PortalLogin import login
import time
import re
from bs4 import BeautifulSoup
import json
import sys

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
        
        """"""
        
        #More filters
        more_filters = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//button[.//span[contains(text(),'More ')]]"))
        )
        more_filters.click()

        #Gets a list of each subject
        subject = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[label[text() = 'Subject']]"))
        )
        subject.click()

        list_items = WebDriverWait(driver, 10).until(
            EC.visibility_of_any_elements_located((By.XPATH, "//ul//li"))
        )
        subject_list = [item.text for item in list_items]
        print(subject_list)
        
        """
        ['Any Subject', 'Aerospace Engineering', 'Agribusiness', 'Agricultural Communication', 'Agricultural Education', 
        'Agriculture', 'Animal Science', 'Anthropology', 'Architectural Engineering', 'Architecture', 
        'Art', 'Astronomy', 'BioResource & Agricultural Eng', 'Biology', 'Biomedical Engineering', 'Botany', ...
        """
        #Will go through each individual subject to get class times because it is quicker than doing Any Subject, 
        #so ignore subject_list[0]
        course_dict = {}
        i = 1
        while i  < len(subject_list):
            print(subject)
            subject = subject_list[i]
            try:      
                try: 
                    with open("TestFile2.txt", 'w') as file:
                        file.write(driver.page_source)
                    print("written2")
                except Exception as e:
                    print(f"An error occurred: {e}")
                    return None
                dropdown = WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.XPATH, "//*[label[text() = 'Subject']]"))
                )
                dropdown.click()

                try: 
                    with open("TestFile3.txt", 'w') as file:
                        file.write(driver.page_source)
                    print("written2")
                except Exception as e:
                    print(f"An error occurred: {e}")
                    return None

                subject_to_press = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, f"//li[text()= \"{subject}\"]"))
                )
                subject_to_press.click()
                print("clicked")

                #Unclick checkbox, so all possible classes will show
                checkbox = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, '//*[@id="app"]/div/div/div/div[1]/form/div/div[29]/label/span[1]'))
                )
                if 'Mui-checked' in checkbox.get_attribute('class'):
                    checkbox.click()

                #Search
                search = WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.XPATH, "//*[button//*[contains(text(), 'Search')]]"))
                )
                search.click()

                old = 0
                while True:
                    new = driver.execute_script("""const element = document.getElementById('app');
                                                    const height = element.scrollHeight;
                                                    element.scrollTop = height;
                                                    return height """)
                    
                    if driver.find_elements(By.XPATH, "//*[contains(text(), 'End of search results')]"):
                        driver.execute_script("""const element = document.getElementById('app');
                                                element.scrollTop = 0""")
                    
                        
                        dividers = WebDriverWait(driver, 10).until(
                            EC.visibility_of_all_elements_located((By.XPATH, "//form/following-sibling::div"))
                        )
 
                        for divider in dividers:
                            soup = BeautifulSoup(divider.get_attribute('outerHTML'), 'html.parser')
                            pattern = re.compile(r'MuiGrid-root MuiGrid-item MuiGrid-grid-xs-\d+')
                            class_types = soup.find_all('div', class_=lambda x: x and pattern.match(x))

                            title = ""
                            for course in class_types:
                                #gets the prefix, i.e. AERO-121
                                if course:
                                    header = course.find('h2', class_="MuiTypography-root MuiTypography-h2")
                                    if header:
                                        span_element = header.find('span')
                                        if span_element:
                                            title = span_element.get_text(strip=True)
                                            course_name = header.text.replace(f' | {title}', '')
                                            title = title.lstrip('| ').strip().replace(' ', '-')
                                            
                                pattern = re.compile(r'MuiGrid-root-\d+ MuiGrid-container-\d+ MuiGrid-wrap-xs-nowrap-\d+ MuiGrid-align-items-xs-center-\d+')
                                matching_divs = course.find_all('div', class_=lambda x: x and pattern.match(x))
                            

                                for container in matching_divs:
                                    course_number = extract_text_by_header(container, 'Section')
                                    if course_number: 
                                        number = re.findall(r'\d+', course_number) 
                                        if number: 
                                            section_number = number[0]
                                            course_number = number[1]
                                            if course_number not in course_dict:   
                                                course_day = extract_text_by_header(container, 'Days')
                                                course_start = extract_text_by_header(container, 'Start')
                                                course_end = extract_text_by_header(container, 'End')
                                                course_instructor = extract_text_by_header(container, 'Instructor')
                                                
                                                course_dict[title+"-"+section_number] = {
                                                                            'course_name' : course_name,
                                                                            'course_number': course_number,
                                                                            'course_day': course_day,
                                                                            'course_start': course_start,
                                                                            'course_end': course_end,
                                                                            'course_instructor':course_instructor}
                                                
                        i += 1
                        break
                    elif old == new:
                        time.sleep(3)
                    
            except Exception as e:
                print(f"An error occurred: {e}")
                print("Please run program again")
                i -= 1
                return None
            
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