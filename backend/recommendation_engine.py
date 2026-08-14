import pandas as pd
import re
import numpy as np

from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# -----------------------------
# 1. LOAD DATASET
# -----------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "user_profiles.csv"

df = pd.read_csv(DATA_FILE)

print("Dataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", len(df.columns))


# -----------------------------
# 2. CREATE PROFILE TEXT
# -----------------------------

df["profile_text"] = (
    df["skills"] + " " +
    df["professional_goal"] + " " +
    df["about_me"] + " " +
    df["interests"]
)


# -----------------------------
# 3. CLEAN TEXT
# -----------------------------

def clean_text(text):
    text = text.lower()

    text = re.sub(r"[^a-zA-Z\s]", "", text)

    text = re.sub(r"\s+", " ", text).strip()

    return text


df["clean_profile_text"] = df["profile_text"].apply(clean_text)


# -----------------------------
# 4. TF-IDF
# -----------------------------

tfidf = TfidfVectorizer(stop_words="english")

tfidf_matrix = tfidf.fit_transform(
    df["clean_profile_text"]
)

print("TF-IDF matrix shape:", tfidf_matrix.shape)


# -----------------------------
# 5. COSINE SIMILARITY
# -----------------------------

similarity_matrix = cosine_similarity(tfidf_matrix)

print("Similarity matrix shape:", similarity_matrix.shape)


# -----------------------------
# 6. BASIC RECOMMENDATION
# -----------------------------

def recommend_users(user_index, top_n=5):

    similarity_scores = similarity_matrix[user_index]

    sorted_indices = np.argsort(
        similarity_scores
    )[::-1]

    # Remove the selected user
    sorted_indices = sorted_indices[
        sorted_indices != user_index
    ]

    top_indices = sorted_indices[:top_n]

    return top_indices, similarity_scores


# -----------------------------
# TEST
# -----------------------------

top_indices, scores = recommend_users(0, top_n=5)

print("\nTop 5 TF-IDF Recommendations:")

for rank, index in enumerate(top_indices, start=1):

    print(
        rank,
        df.loc[index, "user_id"],
        "→",
        round(scores[index], 3)
    )
    # -----------------------------
# 7. MBTI COMPATIBILITY
# -----------------------------

def mbti_compatibility(mbti1, mbti2):

    if mbti1 == mbti2:
        return 1.0

    compatible_pairs = {
        ("INTJ", "ENFP"), ("ENFP", "INTJ"),
        ("INFJ", "ENFP"), ("ENFP", "INFJ"),
        ("INTP", "ENTJ"), ("ENTJ", "INTP"),
        ("ISFP", "ENFJ"), ("ENFJ", "ISFP"),
        ("ISTP", "ESTJ"), ("ESTJ", "ISTP"),
        ("ISFJ", "ESFP"), ("ESFP", "ISFJ"),
        ("ISTJ", "ESFP"), ("ESFP", "ISTJ"),
        ("INFP", "ENFJ"), ("ENFJ", "INFP")
    }

    if (mbti1, mbti2) in compatible_pairs:
        return 1.0

    return 0.5


# Create MBTI compatibility matrix

mbti_matrix = np.zeros((len(df), len(df)))

for i in range(len(df)):
    for j in range(len(df)):

        if i != j:
            mbti_matrix[i][j] = mbti_compatibility(
                df.loc[i, "mbti"],
                df.loc[j, "mbti"]
            )

print("MBTI matrix created:", mbti_matrix.shape)

# -----------------------------
# 8. DEMOGRAPHIC SIMILARITY
# -----------------------------

def age_similarity(age1, age2):

    difference = abs(age1 - age2)

    return max(0, 1 - difference / 20)


def demographic_similarity(user1, user2):

    age_score = age_similarity(
        df.loc[user1, "age"],
        df.loc[user2, "age"]
    )

    gender_score = int(
        df.loc[user1, "gender"] == df.loc[user2, "gender"]
    )

    education_score = int(
        df.loc[user1, "education"] == df.loc[user2, "education"]
    )

    experience_difference = abs(
        df.loc[user1, "experience_years"] -
        df.loc[user2, "experience_years"]
    )

    experience_score = max(
        0,
        1 - experience_difference / 10
    )

    return (
        0.25 * age_score +
        0.25 * gender_score +
        0.25 * education_score +
        0.25 * experience_score
    )

print(
    "U0001 MBTI:",
    df.loc[0, "mbti"]
)

print(
    "U0002 MBTI:",
    df.loc[1, "mbti"]
)

print(
    "MBTI Compatibility:",
    mbti_compatibility(
        df.loc[0, "mbti"],
        df.loc[1, "mbti"]
    )
)



print(
    "U0001 → U0002:",
    round(
        demographic_similarity(0, 1),
        3
    )
)

# -----------------------------
# 9. HYBRID SCORE
# -----------------------------

def hybrid_score(user1, user2):

    tfidf_score = similarity_matrix[user1][user2]

    mbti_score = mbti_matrix[user1][user2]

    demographic_score = demographic_similarity(
        user1,
        user2
    )

    score = (
        0.5 * tfidf_score +
        0.3 * mbti_score +
        0.2 * demographic_score
    )

    return score


score = hybrid_score(0, 1)

print(
    "U0001 → U0002 Hybrid Score:",
    round(score, 3)
)

print(
    "Compatibility:",
    round(score * 100, 2),
    "%"
)

# -----------------------------
# 10. PERSONALIZED USER WEIGHTS
# -----------------------------

user_weights = {}

for user_index in range(len(df)):
    user_weights[user_index] = {
        "tfidf": 0.50,
        "mbti": 0.30,
        "demographic": 0.20
    }

print("\nPersonalized weights created!")
print("U0001:", user_weights[0])

# -----------------------------
# 11. UPDATE USER WEIGHTS
# -----------------------------

def update_user_weights(user_index, feedback):

    change = 0.02 if feedback == "Accept" else -0.02

    user_weights[user_index]["tfidf"] += change
    user_weights[user_index]["mbti"] -= change
    user_weights[user_index]["demographic"] -= change

    # Prevent negative weights
    for key in user_weights[user_index]:

        user_weights[user_index][key] = max(
            0,
            user_weights[user_index][key]
        )

    # Normalize weights so total = 1
    total = sum(
        user_weights[user_index].values()
    )

    for key in user_weights[user_index]:

        user_weights[user_index][key] /= total

    print(
        "Updated weights for",
        df.loc[user_index, "user_id"]
    )

    print(user_weights[user_index])

    # -----------------------------
# 12. TEST ADAPTIVE WEIGHTS
# -----------------------------

print(user_weights[0])


print("\nAfter Accept:")
print(user_weights[0])

# -----------------------------
# 13. PERSONALIZED HYBRID SCORE
# -----------------------------

def personalized_hybrid_score(user_index, recommended_index):

    text_score = similarity_matrix[
        user_index
    ][recommended_index]

    mbti_score = mbti_matrix[
        user_index
    ][recommended_index]

    demographic_score = demographic_similarity(
        user_index,
        recommended_index
    )

    user_w = user_weights[user_index]

    final_score = (
        user_w["tfidf"] * text_score +
        user_w["mbti"] * mbti_score +
        user_w["demographic"] * demographic_score
    )

    return final_score

print("\nPersonalized Hybrid Score:")

score = personalized_hybrid_score(0, 1)

print(
    "U0001 → U0002:",
    round(score, 3)
)

print(
    "Compatibility:",
    round(score * 100, 2),
    "%"
)

# -----------------------------
# 14. TOP 5 PERSONALIZED RECOMMENDATIONS
# -----------------------------

def recommend_personalized(user_index, top_n=5):

    scores = []

    for recommended_index in range(len(df)):

        # Don't recommend the same user
        if recommended_index == user_index:
            continue

        score = personalized_hybrid_score(
            user_index,
            recommended_index
        )

        scores.append(
            (recommended_index, score)
        )

    # Sort from highest score to lowest
    scores.sort(
        key=lambda x: x[1],
        reverse=True
    )

    return scores[:top_n]

print("\nTOP 5 PERSONALIZED RECOMMENDATIONS")

recommendations = recommend_personalized(0, 5)

for rank, (index, score) in enumerate(
    recommendations,
    start=1
):

    print(
        f"{rank}. "
        f"{df.loc[index, 'user_id']} → "
        f"{score * 100:.2f}%"
    )

    # -----------------------------
# 15. FEEDBACK SYSTEM
# -----------------------------

feedback_data = []

def record_feedback(user_index, recommended_index, feedback):

    feedback_data.append({
        "user_index": user_index,
        "recommended_index": recommended_index,
        "feedback": feedback
    })

    # Update personalized weights
    update_user_weights(
        user_index,
        feedback
    )

    print(
        f"Feedback recorded: {feedback}"
    )

    print(
        f"{df.loc[user_index, 'user_id']} → "
        f"{df.loc[recommended_index, 'user_id']}"
    )