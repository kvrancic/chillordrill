import os
import re

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
import time
import pandas as pd
from tqdm import tqdm
from trio import sleep

# Initialize WebDriver
service = Service('C:\\tools\\chromedriver.exe')  # Adjust path if needed
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--window-size=1920,1080")
driver = webdriver.Chrome(service=service, options=chrome_options)

courses = pd.DataFrame(columns=["code", "name", "ects", "link", "professor", "description"])
course_codes = set()

MAIN_SCRAPPING = True
if MAIN_SCRAPPING:
    level = "doctoral_school"
    driver.get(f"https://edu.epfl.ch/studyplan/en/{level}/")

    sections = driver.find_element(By.ID, "main").find_elements(By.TAG_NAME, "a")
    section_links = []

    for section in sections:
        section_links.append(section.get_attribute("href"))


# section_links = ["https://edu.epfl.ch/studyplan/en/propedeutics/architecture/"]
# Iterate over all the sections and collect all the courses
course_links = []
for link in tqdm(section_links, desc="Extracting course links"):
    driver.get(link)

    lines = driver.find_elements(By.CLASS_NAME, "line")
    for line in lines:
        try:
            href = (
                line.find_element(By.CLASS_NAME, "cours-name")
                    .find_element(By.TAG_NAME, "a")
                    .get_attribute("href")
            )

            course_links.append(href)
        except:
            # print(f"WARNING: No link for course:\n{line.find_element(By.CLASS_NAME, 'cours-name').text}\n\n")
            continue


# Iterate over all the courses and collect the information
for link in tqdm(course_links, desc="Extracting course information"):
    driver.get(link)

    new_course = {}

    try:
        new_course["name"] = driver.find_element(By.CLASS_NAME, "page-header").find_element(By.TAG_NAME, "h1").text

        course_details = driver.find_element(By.CLASS_NAME, "course-details")
        paragraphs = course_details.find_elements(By.TAG_NAME, "p")
        new_course["code"] = paragraphs[0].text.split("/")[0].strip()

        if new_course["code"] in course_codes:
            continue

        new_course["ects"] = re.findall(r'\d+', paragraphs[0].text.split("/")[1])[0]

        professors = paragraphs[1].find_elements(By.TAG_NAME, "a")
        new_course["professor"] = ""
        for i, professor in enumerate(professors):
            if i == len(professors) - 1:
                new_course["professor"] += professor.text.strip()
            else:
                new_course["professor"] += professor.text + ", "

        new_course["link"] = link

        new_course["description"] = course_details.find_element(By.CLASS_NAME, "mt-5").find_element(By.TAG_NAME, "p").text
    except:
        # print(f"WARNING: Could not extract course information from link:\n{link}\n\n")
        continue

    courses.loc[len(courses)] = new_course

suffix = level
courses.to_csv(f"data/courses_{suffix}.csv", index=False)

driver.quit()
