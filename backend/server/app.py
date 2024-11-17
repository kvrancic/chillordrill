import json
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
import sys

# Initialize FastAPI app
app = FastAPI()

# Load environment variables
SUPABASE_URL = sys.argv[1]
SUPABASE_KEY = sys.argv[2]

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not (SUPABASE_URL and SUPABASE_KEY):
    raise EnvironmentError("Environment variables SUPABASE_URL, SUPABASE_KEY must be set.")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

courses = (
    supabase.table("courses")
    .select("id", "code")
    .execute()
)
map_code_to_id = {course["code"]: course["id"] for course in courses.data}

# Configure OpenAI
# openai.api_key = OPENAI_API_KEY


# Pydantic models for request/response
class CourseQuery(BaseModel):
    course_code: int


@app.get("/courses")
async def get_courses(course_code: Optional[str] = None):
    """Retrieve all courses from the Supabase database.

    :arg course_code: Optional course code to filter courses by.

    :returns: List of courses.
    """
    if not course_code:
        response = (
            supabase.table("courses")
            .select("*")
            .execute()
        )

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="No courses found")

        return response.data

    response = (
        supabase.table("courses")
        .select("*")
        .eq("code", course_code)
        .execute()
    )

    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Course not found")

    return response.data[0]


@app.get("/posts")
async def get_posts(course_code: Optional[str] = None):
    """Retrieve all posts.

    :arg course_code: Optional course code to filter posts by.

    :returns: List of posts.
    """
    if not course_code:
        response = (
            supabase.table("posts")
            .select("*")
            .execute()
        )

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="No posts found")

        return response.data

    course_id = map_code_to_id.get(course_code)

    if not course_id:
        raise HTTPException(status_code=404, detail="Course not found")

    response = (
        supabase.table("posts")
        .select("*")
        .eq("course_id", course_id)
        .execute()
    )

    if len(response.data) == 0:
        raise HTTPException(status_code=404, detail="No posts found")

    return response.data


if __name__ == "__main__":
    import uvicorn
    # Use this for local development
    uvicorn.run(app)