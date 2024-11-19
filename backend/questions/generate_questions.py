import os
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError
from tqdm import tqdm
from datetime import datetime
import re
import json
import os
from supabase import create_client, Client
import argparse

def get_openai_client() -> OpenAI:
    api_key = None
    if load_dotenv():
        api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None or api_key == "":
        raise ValueError(
            "OpenAI API key not found. Please set the OPENAI_API_KEY environment variable. "
            "For this, create API key here: https://platform.openai.com/api-keys and run "
            "`export OPENAI_API_KEY=<your_api_key>` in your terminal or put it in .env file."
        )
    client = OpenAI(
        api_key=api_key,
    )
    return client

def format_question_generation_prompt(
    course_name: str,
    course_description: str,
    existing_questions: list[str],
    reviews: list[str],
    num_questions: int
) -> str:
    with open("prompt.txt", "r") as file:
        template = file.read()

    formatted_existing_questions = "\n".join(f"- {q}" for q in existing_questions)
    formatted_reviews = "\n".join(f"- {review}" for review in reviews)
    
    prompt = template.replace("{course_name}", course_name)
    prompt = prompt.replace("{course_description}", course_description)
    prompt = prompt.replace("{existing_questions}", formatted_existing_questions)
    prompt = prompt.replace("{reviews}", formatted_reviews)
    prompt = prompt.replace("{num_questions}", str(num_questions))
    
    return prompt


def generate_model_response(client: OpenAI, prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_completion_tokens=2048,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except OpenAIError as e:
        return f"An error occurred while processing the reviews: {str(e)}"
    
def process_questions(text: str) -> list[str]:
    """
    Splits the text into individual questions based on numbered patterns (e.g., "1.", "10.") 
    and cleans up each question by removing unnecessary spaces, line breaks, and truncating 
    everything after the first '?'.
    
    Args:
        text (str): Input string containing numbered questions.
    
    Returns:
        list[str]: Cleaned list of questions.
    """
    # Split the text based on patterns like "1.", "10.", etc.
    questions = re.split(r'\n?\s*\d+\.\s*', text)
    
    # Filter out empty strings that may result from splitting
    questions = [q for q in questions if q.strip()]
    
    # Clean and truncate each question
    cleaned_questions = []
    for question in questions:
        # Remove everything after the first "?" and strip whitespace
        truncated_question = question.split('?')[0].strip() + '?'
        cleaned_questions.append(truncated_question)
    
    return cleaned_questions

def get_supabase_client() -> Client:
    with open("./config.json", "r") as file:
        config = json.load(file)

    URL = config["SUPABASE_URL"]
    KEY = config["SUPABASE_KEY"]
    supabase = create_client(URL, KEY)
    return supabase

def parse_arguments():
    parser = argparse.ArgumentParser(description="Generate new questions for courses.")
    parser.add_argument(
        "--num_questions",
        type=int,
        default=10,
        help="Number of new questions to generate for each course."
    )
    return parser.parse_args()

def process_course(course, posts, ai_questions, openai_client, supabase, num_questions):
        course_name = course['name']
        course_id = course['id']
        course_description = course['description']
        course_reviews = [x['content'] for x in posts if x['course_id'] == course_id]
        course_existing_questions = [x['question_text'] for x in ai_questions if x['course_id'] == course_id]
        prompt = format_question_generation_prompt(course_name, course_description, 
                                                course_existing_questions, course_reviews, num_questions)
        model_generation = generate_model_response(openai_client, prompt)
        generated_questions = process_questions(model_generation)
        for generated_question in generated_questions:
            supabase.table("ai_questions").insert({
                "course_id": course_id, "question_text": generated_question, 
                "created_at": str(datetime.now()), "is_active": True}).execute()

def main():
    args = parse_arguments()
    supabase = get_supabase_client()
    courses = supabase.table('courses').select('*').execute().data
    ai_questions = supabase.table('ai_questions').select('*').execute().data
    posts = supabase.table('posts').select('*').execute().data

    openai_client = get_openai_client()

    for course in tqdm(courses):
        process_course(course, posts, ai_questions, openai_client, supabase, args.num_questions)
        break
            

if __name__ == "__main__":
    main()
