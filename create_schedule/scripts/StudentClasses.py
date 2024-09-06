from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By




#input should be in format "Fall/Spring/Winter Quarter/Semester Year" ex. Fall Quarter 2024
def get_individual_classes(driver, quarter):
    html = driver.page_source
    try: 
        with open('test1.txt', 'w') as file:
            file.write(str(html))
    except Exception as e:
        print(f"An error occurred: {e}")

    soup = BeautifulSoup(html, 'html.parser')

    quarter_element = soup.find('h3', text=quarter)

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
        return None



def get_student_classes(driver, students):
    #Makes sure that the portal has loaded before going to class Search
    #has a list of student emails
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'My Portal')]"))
    )

    for student in students:
        driver.get('https://dashboards.calpoly.edu/dw/polydata/student_poly_profile.search')


    return 

