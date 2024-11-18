import os
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

def get_client() -> OpenAI:
    api_key = None
    if load_dotenv(find_dotenv()):
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

def get_prompt(question: str, reviews: list[tuple[str, str]], course_name: str) -> str:
    file_path = os.path.join(os.path.dirname(__file__), "prompt.txt")

    with open(file_path, "r") as file:
        prompt = file.read()
    prompt = prompt.replace("{course_name}", course_name)
    prompt = prompt.replace("{question}", question)
    formatted_reviews = []
    for review in reviews:
        if review[0] == "":
            formatted_reviews.append(f"- {review[1]}")
        else:
            formatted_reviews.append(f"- Question: \"{review[0]}\" Answer: \"{review[1]}\"")
    formatted_reviews = "\n".join(formatted_reviews)
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
    
def generate_answer(question: str, reviews: list[tuple[str, str]], course_name: str) -> str:
    """
    Generate an answer to a question based on the reviews of a course.
        question: The question to answer.
        reviews: A list of tuples, where each tuple is in the form (ai_question, review_text); 
            the first element is empty of the review was not an answer to the question. 
            Otherwise, if the reviews is the result of a student answering the question provided by AI, the first element is this question.
        course_name: The name of the course.
    """
    client = get_client()
    prompt = get_prompt(question, reviews, course_name)
    return generate_model_response(client, prompt)
