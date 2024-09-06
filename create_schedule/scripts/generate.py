import sys
import json
import random
from datetime import datetime

# Helper function to convert time strings to datetime objects
def parse_time(time_str):
    try:
        return datetime.strptime(time_str, '%I:%M %p')
    except ValueError:
        return None

# Check if two classes conflict
def check_conflict(c1, c2):
    if c1['course_day'] != c2['course_day']:
        return False
    start1, end1 = parse_time(c1['course_start']), parse_time(c1['course_end'])
    start2, end2 = parse_time(c2['course_start']), parse_time(c2['course_end'])
    if not start1 or not start2 or not end1 or not end2:
        return False
    return not (end1 <= start2 or end2 <= start1)

# Get available classes
def filter_available_classes(schedule):
    return {code: info for code, info in schedule.items() if info['course_day'] != "TBA" and info['course_start'] != "-" and info['course_end'] != "-"}

# Function to select 6 non-conflicting classes
def select_classes(classes, num_classes=8):
    if len(classes) < num_classes:
        return None
    
    class_codes = list(classes.keys())
    while True:
        selected = random.sample(class_codes, num_classes)
        selected_classes = [classes[code] for code in selected]
        if all(not check_conflict(c1, c2) for i, c1 in enumerate(selected_classes) for c2 in selected_classes[i+1:]):
            return selected

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_file>")
        sys.exit(1)

    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r') as file:
            schedule = json.load(file)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error decoding JSON from file.")
        sys.exit(1)

    available_classes = filter_available_classes(schedule)
    selected_classes = select_classes(available_classes)
    
    return [code for code in selected_classes]
  

studentDict = {}
if __name__ == "__main__":
    for i in range(0, 200):
        studentDict[f"student{i}@mail.com"] = main()
    
    print(studentDict)