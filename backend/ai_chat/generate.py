import os
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

def get_client() -> OpenAI:
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

def get_prompt(course_name: str, question: str, reviews: list[str]) -> str:
    file_path = os.path.join(os.path.dirname(__file__), "prompt.txt")

    with open(file_path, "r") as file:
        prompt = file.read()
    prompt = prompt.replace("{course_name}", course_name)
    prompt = prompt.replace("{question}", question)
    formatted_reviews = "\n".join(f"- {review}" for review in reviews)
    prompt = prompt.replace("{reviews}", formatted_reviews)
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
    
def generate_answer(question: str, reviews: list[str], course_name: str) -> str:
    client = get_client()
    prompt = get_prompt(course_name, question, reviews)
    return generate_model_response(client, prompt)
