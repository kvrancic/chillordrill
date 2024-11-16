import json
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
import sys

# Initialize FastAPI app
app = FastAPI()

# Load environment variables
# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# if not (SUPABASE_URL and SUPABASE_KEY):
#     config = json.load(open("config.json"))
#     SUPABASE_URL = config["SUPABASE_URL"]
#     SUPABASE_KEY = config["SUPABASE_KEY"]

SUPABASE_URL = sys.argv[1]
SUPABASE_KEY = sys.argv[2]

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not (SUPABASE_URL and SUPABASE_KEY):
    raise EnvironmentError("Environment variables SUPABASE_URL, SUPABASE_KEY must be set.")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configure OpenAI
# openai.api_key = OPENAI_API_KEY


# Pydantic models for request/response
class CourseQuery(BaseModel):
    course_code: int

@app.get("/")
async def root():
    """Root endpoint to verify the API is running."""
    return {"message": "Welcome to the Course Recommendation API!"}


@app.get("/courses")
async def get_courses():
    """Retrieve all courses from the Supabase database."""
    response = (
        supabase.table("courses")
        .select("*")
        .execute()
    )

    return response.data


@app.get("/course-details")
async def get_course_details(course_code: str):
    """Retrieve details for a specific course."""
    response = (
        supabase.table("courses")
        .select("*")
        .eq("code", course_code)
        .execute()
    )

    return response.data[0]


if __name__ == "__main__":
    import uvicorn
    # Use this for local development
    uvicorn.run(app)