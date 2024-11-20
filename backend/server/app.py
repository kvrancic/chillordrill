import json
import os
from typing import Optional
import uvicorn
from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
from database_api import *

import sys
sys.path.append("..")
from ai_chat.generate import generate_answer

# Initialize FastAPI app
app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    load_dotenv(override=True)
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not (SUPABASE_URL and SUPABASE_KEY):
    raise EnvironmentError("Environment variables SUPABASE_URL, SUPABASE_KEY must be set.")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

map_code_to_id = get_map_code_to_id(supabase)


@app.get("/courses")
async def get_courses(course_code: Optional[str] = None):
    """
    Retrieve courses from the database.

    - **course_code**: Optional course code to filter courses by.
    - **returns**: List of courses or a specific course if course_code is provided.
    - **raises**: HTTPException with status code 404 if no courses or the specific course is found.
    """

    if not course_code:
        courses = get_all_courses(supabase)
        if not courses:
            raise HTTPException(status_code=404, detail="No courses found")

        return courses

    course = get_course_by_code(supabase, course_code)
    if not course:
        raise HTTPException(status_code=404, detail=f"Course with the code {course_code} not found")

    return course


@app.get("/posts")
async def get_posts(course_code: Optional[str] = None):
    """
    Retrieve posts from the database.

    - **course_code**: Optional course code to filter posts by.
    - **returns**: List of posts or posts filtered by course_code.
    - **raises**: HTTPException with status code 404 if no posts or the specific posts are found.
    """
    if not course_code:
        posts = get_all_posts(supabase)
        if not posts:
            raise HTTPException(status_code=404, detail="No posts found")

        return posts

    course_id = map_code_to_id.get(course_code)
    if not course_id:
        raise HTTPException(status_code=404, detail=f"No course found with the code {course_code}")

    posts = get_posts_by_course_id(supabase, course_id)
    if not posts:
        raise HTTPException(status_code=404, detail=f"No posts found for the course {course_code}")

    return posts


@app.get("/summaries")
async def get_summaries(course_code: Optional[str] = None):
    """
    Retrieve summaries from the database.

    - **course_code**: Optional course code to filter summaries by.
    - **returns**: List of summaries or summaries filtered by course_code.
    - **raises**: HTTPException with status code 404 if no summaries or the specific summaries are found.
    """
    if not course_code:
        summaries = get_all_summaries(supabase)
        if not summaries:
            raise HTTPException(status_code=404, detail="No summaries found")

        return summaries

    course_id = map_code_to_id.get(course_code)
    if not course_id:
        raise HTTPException(status_code=404, detail=f"No course found with the code {course_code}")

    summaries = get_summaries_by_course_id(supabase, course_id)
    if not summaries:
        raise HTTPException(status_code=404, detail=f"No summaries found for the course {course_code}")

    return summaries


@app.post("/answer")
async def answer(question: str, course_code: str):
    """
    Generate an answer to a question using OpenAI.

    - **question**: Question to generate an answer for.
    - **course_code**: Course code to generate an answer for.
    - **returns**: Answer to the question.
    - **raises**: HTTPException with status code 404 if the course or posts are not found.
    """
    course = get_course_by_code(supabase, course_code)
    if not course:
        raise HTTPException(status_code=404, detail=f"Course with the code {course_code} not found")

    course_id = course["id"]

    posts = get_posts_by_course_id(supabase, course_id)
    reviews = [post["content"] for post in posts]

    answer = generate_answer(question, reviews, course["name"])

    save_interaction(supabase, None, course_id, question, answer)

    return {"answer": answer}


if __name__ == "__main__":
    # Use this for local development
    uvicorn.run(app)