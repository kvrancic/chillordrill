from supabase import Client


def get_map_code_to_id(supabase: Client) -> dict:
    response = (
        supabase.table("courses")
        .select("code", "id")
        .execute()
    )

    return {course["code"]: course["id"] for course in response.data}


def get_all_courses(supabase: Client):
    response = (
        supabase.table("courses")
        .select("*")
        .execute()
    )

    if len(response.data) == 0:
        return None

    return response.data


def get_course_by_code(supabase: Client, course_code):
    response = (
        supabase.table("courses")
        .select("*")
        .eq("code", course_code)
        .execute()
    )

    if len(response.data) == 0:
        return None

    return response.data[0]


def get_all_posts(supabase: Client):
    response = (
        supabase.table("posts")
        .select("*, ai_questions!left(question_text)")
        .execute()
    )

    if len(response.data) == 0:
        return None

    return response.data


def get_posts_by_course_id(supabase: Client, course_id):
    response = (
        supabase.table("posts")
        .select("*, ai_questions!left(question_text)")
        .eq("course_id", course_id)
        .execute()
    )

    if len(response.data) == 0:
        return None

    return response.data


def get_all_summaries(supabase):
    response = (
        supabase.table("summaries")
        .select("*")
        .execute()
    )

    if len(response.data) == 0:
        return None

    return response.data


def get_summaries_by_course_id(supabase: Client, course_id):
    response = (
        supabase.table("summaries")
        .select("*")
        .eq("course_id", course_id)
        .execute()
    )

    if len(response.data) == 0:
        return None

    return response.data


def save_interaction(supabase: Client, user_id, course_id, question, answer):
    response = (
        supabase.table("chatbot_interactions")
        .insert(
            {
                "user_id": user_id,
                "course_id": course_id,
                "question": question,
                "answer": answer
            }
        )
        .execute()
    )