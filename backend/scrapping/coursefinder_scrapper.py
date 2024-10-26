from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
import time
import pandas as pd

# Initialize WebDriver
service = Service('C:\\tools\\chromedriver.exe')  # Adjust path if needed
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--window-size=1920,1080")
driver = webdriver.Chrome(service=service, options=chrome_options)
driver.get("https://www.coursefinder.ch/")

# Give the page some time to load the content
time.sleep(2)

# Find the outer scroll container (could be the main container)
grid = driver.find_element(By.CLASS_NAME, "ReactVirtualized__Grid__innerScrollContainer")

# Initialize Action Chains for scrolling
actions = ActionChains(driver)

try:
    courses = pd.read_csv("courses.csv")
    course_ids = set(courses["course_code"])
except:
    courses = pd.DataFrame(columns=["course_code", "course_link", "course_name", "overall", "prof_rating", "difficulty",
                                    "workload", "professors", "comments", "tips"])
    course_ids = set()

previous_course_count = 0

step = 100

scroll_container = driver.find_element(By.CLASS_NAME, "ReactVirtualized__Grid__innerScrollContainer")
tolerance = 10
current_tol = 0

def append_courses(count=-1):
    new_courses = scroll_container.find_elements(By.CLASS_NAME, "accordion")

    if count > 0:
        range_ = new_courses[:count]
    else:
        range_ = new_courses

    if len(new_courses) > 0:
        for course in range_:
            course_code = course.find_element(By.TAG_NAME, "a").text

            if course_code in course_ids:
                continue

            new_course = {}

            print(f"Extracting course: {course_code}")

            new_course["course_code"] = course_code
            new_course["course_link"] = course.find_element(By.TAG_NAME, "a").get_attribute("href")
            new_course["course_name"] = course.find_element(By.CLASS_NAME, "col-span-9").text

            ratings = course.find_elements(By.CLASS_NAME, "rounded-lg")
            new_course["overall"] = ratings[0].text
            new_course["prof_rating"] = ratings[1].text
            new_course["difficulty"] = ratings[2].text
            new_course["workload"] = ratings[3].text

            course_label = course.find_element(By.TAG_NAME, "label")
            # driver.execute_script("arguments[0].scrollIntoView(true);", course_label)
            driver.execute_script("arguments[0].click();", course_label)

            accordion_body = course.find_element(By.CLASS_NAME, "accordion-body")

            professors_div = accordion_body.find_elements(By.TAG_NAME, "a")
            new_course["professors"] = [prof.text for prof in professors_div][:-1]

            try:
                course_content = accordion_body.find_element(By.CLASS_NAME, "grid-cols-2").find_elements(By.CLASS_NAME,
                                                                                                         "border")
                course_comments = course_content[0].find_elements(By.TAG_NAME, "div")
                new_course["comments"] = [comment.text for comment in course_comments]

                course_tips = course_content[1].find_elements(By.TAG_NAME, "div")
                new_course["tips"] = [tip.text for tip in course_tips]
            except:
                print("No comments or tips found for course ", course_code)

            course_ids.add(course_code)
            courses.loc[len(courses)] = new_course
            courses.to_csv("courses.csv", index=False)

            driver.execute_script("arguments[0].click();", course_label)
            time.sleep(0.1)

    # Scroll by sending the PAGE_DOWN key to the grid
    actions.move_to_element(grid).scroll_by_amount(0, step).perform()
    time.sleep(0.1)  # Wait for content to load

while True:
    append_courses(5)

    # Check if the number of loaded courses has changed
    new_courses_count = len(courses)
    print(f"Total courses extracted: {new_courses_count}")

    if new_courses_count == previous_course_count:
        if current_tol < tolerance:
            current_tol += 1
        else:
            break
    else:
        current_tol = 0
        previous_course_count = new_courses_count

# Get the last courses
append_courses()

# Close the driver
driver.quit()

print(f"Total courses extracted: {len(courses)}")
