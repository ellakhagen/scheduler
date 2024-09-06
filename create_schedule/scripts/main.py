from PortalLogin import login
from FetchClasses import fetch_classes
from StudentClasses import get_student_classes

print("work?")
username = "elhagen@calpoly.edu"
password = "CalPolyPassword!"

driver = login(username, password, "initial login")

#if driver:
    #fetch_classes(driver)
    #get_student_classes(driver)

