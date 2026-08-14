from fastapi import FastAPI
from pydantic import BaseModel

from recommendation_engine import (
    df,
    user_weights,
    recommend_personalized,
    record_feedback
)


app = FastAPI(
    title="Hybrid Recommendation System API",
    description="Backend for the Intelligent User Compatibility System",
    version="1.0.0"
)


class FeedbackRequest(BaseModel):
    user_id: str
    recommended_user_id: str
    feedback: str


@app.get("/")
def home():
    return {
        "message": "Hybrid Recommendation System Backend is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/users")
def get_users():

    users = []

    for _, row in df.iterrows():

        users.append({
            "user_id": row["user_id"],
            "name": row["full_name"]
        })

    return users


@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):

    matches = df.index[
        df["user_id"] == user_id
    ].tolist()

    if not matches:

        return {
            "error": "User not found"
        }

    user_index = matches[0]

    recommendations = recommend_personalized(
        user_index,
        top_n=5
    )

    result = []

    for rank, item in enumerate(
        recommendations,
        start=1
    ):

        recommended_index = item[0]
        score = item[1]

        row = df.loc[recommended_index]

        result.append({

            "rank": rank,

            "user_id": row["user_id"],

            "name": row["full_name"],

            "occupation": row["occupation"],

            "mbti": row["mbti"],

            "compatibility": round(
                score * 100,
                2
            )
        })

    return {

        "selected_user": user_id,

        "recommendations": result
    }


@app.post("/feedback")
def submit_feedback(data: FeedbackRequest):

    user_matches = df.index[
        df["user_id"] == data.user_id
    ].tolist()

    recommended_matches = df.index[
        df["user_id"] == data.recommended_user_id
    ].tolist()

    if not user_matches:

        return {
            "error": "Selected user not found"
        }

    if not recommended_matches:

        return {
            "error": "Recommended user not found"
        }

    user_index = user_matches[0]

    recommended_index = recommended_matches[0]

    record_feedback(
        user_index,
        recommended_index,
        data.feedback
    )

    return {

        "message":
        "Feedback recorded successfully",

        "user_id":
        data.user_id,

        "recommended_user_id":
        data.recommended_user_id,

        "feedback":
        data.feedback,

        "updated_weights":
        user_weights[user_index]
    }