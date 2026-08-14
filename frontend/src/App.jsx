import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://hybrid-recommendation-tx3l.onrender.com";

const mbtiInfo = {
  ENFJ: {
    name: "Protagonist",
    description:
      "Warm, supportive and people-oriented. Often enjoy motivating and helping others.",
    traits: ["Empathetic", "Encouraging", "Collaborative", "Organized"],
  },

  INFP: {
    name: "Mediator",
    description:
      "Thoughtful, creative and guided by personal values and meaningful goals.",
    traits: ["Creative", "Thoughtful", "Idealistic", "Open-minded"],
  },

  ESTJ: {
    name: "Executive",
    description:
      "Practical, organized and focused on achieving goals efficiently.",
    traits: ["Organized", "Practical", "Reliable", "Goal-oriented"],
  },

  ISFP: {
    name: "Adventurer",
    description:
      "Flexible, creative and curious, often preferring hands-on experiences.",
    traits: ["Creative", "Flexible", "Observant", "Adaptable"],
  },

  INTJ: {
    name: "Architect",
    description:
      "Independent, strategic and analytical, with a strong focus on long-term goals.",
    traits: ["Strategic", "Independent", "Analytical", "Focused"],
  },

  ENTJ: {
    name: "Commander",
    description:
      "Confident, decisive and naturally inclined toward leadership and organization.",
    traits: ["Confident", "Strategic", "Decisive", "Leadership"],
  },

  INFJ: {
    name: "Advocate",
    description:
      "Insightful, thoughtful and idealistic, often motivated by meaningful goals.",
    traits: ["Insightful", "Empathetic", "Idealistic", "Purposeful"],
  },

  ENFP: {
    name: "Campaigner",
    description:
      "Enthusiastic, creative and curious, with a strong interest in people and possibilities.",
    traits: ["Enthusiastic", "Creative", "Curious", "Friendly"],
  },

  ISTJ: {
    name: "Logistician",
    description:
      "Responsible, dependable and practical, with a preference for structure.",
    traits: ["Reliable", "Practical", "Responsible", "Organized"],
  },

  ESFJ: {
    name: "Consul",
    description:
      "Caring, social and cooperative, often focused on helping and supporting others.",
    traits: ["Caring", "Social", "Helpful", "Cooperative"],
  },

  ISTP: {
    name: "Virtuoso",
    description:
      "Practical, observant and adaptable, often enjoying solving real-world problems.",
    traits: ["Practical", "Adaptable", "Observant", "Problem-solving"],
  },

  ESTP: {
    name: "Entrepreneur",
    description:
      "Energetic, action-oriented and adaptable, often comfortable taking initiative.",
    traits: ["Energetic", "Bold", "Adaptable", "Action-oriented"],
  },

  ISFJ: {
    name: "Defender",
    description:
      "Loyal, responsible and considerate, often dependable in teams and relationships.",
    traits: ["Loyal", "Responsible", "Supportive", "Dependable"],
  },

  ESFP: {
    name: "Entertainer",
    description:
      "Friendly, spontaneous and energetic, often bringing enthusiasm to social situations.",
    traits: ["Friendly", "Spontaneous", "Energetic", "Optimistic"],
  },

  INTP: {
    name: "Logician",
    description:
      "Analytical, curious and independent, often interested in understanding complex ideas.",
    traits: ["Analytical", "Curious", "Independent", "Logical"],
  },

  ENTP: {
    name: "Debater",
    description:
      "Curious, innovative and energetic, often enjoying new ideas and challenging problems.",
    traits: ["Innovative", "Curious", "Energetic", "Inventive"],
  },
};

function App() {
  const [userId, setUserId] = useState("U0001");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Generate all 500 user IDs
  const users = Array.from({ length: 500 }, (_, index) => {
    return `U${String(index + 1).padStart(4, "0")}`;
  });

  const getRecommendations = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/recommendations/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned status ${response.status}`
        );
      }

      const data = await response.json();

      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Recommendation error:", error);

      setMessage(
        `Unable to load recommendations for ${userId}. Please try again.`
      );

      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecommendations();
  }, []);

  const sendFeedback = async (recommendedUserId, feedback) => {
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          recommended_user_id: recommendedUserId,
          feedback: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Feedback request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Updated weights:", data.updated_weights);

      setMessage(
        `${feedback} recorded for ${recommendedUserId}. Your personalized weights have been updated.`
      );

      // Refresh recommendations after feedback
      try {
        const refreshedResponse = await fetch(
          `${API_URL}/recommendations/${userId}`
        );

        if (refreshedResponse.ok) {
          const refreshedData = await refreshedResponse.json();

          setRecommendations(
            refreshedData.recommendations || []
          );
        }
      } catch (refreshError) {
        console.error(
          "Could not refresh recommendations:",
          refreshError
        );
      }
    } catch (error) {
      console.error("Feedback error:", error);

      setMessage(
        `Unable to record ${feedback} feedback. Please try again.`
      );
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <div className="logo">
            🤝 Intelligent Match
          </div>

          <p>
            AI-powered user compatibility &
            personalized recommendations
          </p>
        </div>
      </header>

      <main>

        {/* HERO */}
        <section className="hero">

          <div>
            <span className="badge">
              AI COMPATIBILITY ENGINE
            </span>

            <h1>
              Find people you're
              <span> compatible with.</span>
            </h1>

            <p className="hero-text">
              Our intelligent recommendation system combines
              professional profile similarity, personality
              compatibility, demographic similarity and user
              feedback to discover meaningful matches.
            </p>
          </div>

          {/* USER SELECTOR */}
          <div className="user-box">

            <label>
              Select your profile
            </label>

            <select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setMessage("");
              }}
            >

              {users.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}

            </select>

            <button
              onClick={getRecommendations}
              disabled={loading}
            >
              {loading
                ? "Finding matches..."
                : "Find My Matches →"}
            </button>

          </div>
        </section>

        {/* MESSAGE */}
        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* RECOMMENDATIONS */}
        <section className="section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                PERSONALIZED RESULTS
              </span>

              <h2>
                Your Top Matches
              </h2>
            </div>

            <span className="match-count">
              {recommendations.length} matches
            </span>

          </div>

          <div className="recommendation-grid">

            {recommendations.map((user) => {

              const info =
                mbtiInfo[user.mbti] || {
                  name: "Personality Type",
                  description:
                    "A unique personality profile.",
                  traits: [],
                };

              return (
                <article
                  className="recommendation-card"
                  key={user.user_id}
                >

                  {/* CARD TOP */}
                  <div className="card-top">

                    <span className="rank">
                      #{user.rank}
                    </span>

                    <span className="compatibility">
                      {user.compatibility}%
                    </span>

                  </div>

                  {/* AVATAR */}
                  <div className="avatar">
                    {user.name?.charAt(0)}
                  </div>

                  <h3>
                    {user.name}
                  </h3>

                  <p className="occupation">
                    💼 {user.occupation}
                  </p>

                  {/* MBTI */}
                  <div className="mbti-tag">
                    🧠 {user.mbti} · {info.name}
                  </div>

                  <p className="description">
                    {info.description}
                  </p>

                  {/* TRAITS */}
                  <div className="traits">

                    {info.traits.map((trait) => (
                      <span key={trait}>
                        {trait}
                      </span>
                    ))}

                  </div>

                  {/* WHY MATCH */}
                  <div className="why-match">

                    <h4>
                      💡 Why this match?
                    </h4>

                    <p>
                      This compatibility score combines
                      profile similarity, MBTI personality
                      compatibility and demographic similarity.
                      Your feedback can also influence future
                      recommendations.
                    </p>

                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="card-actions">

                    <button
                      className="accept"
                      onClick={() =>
                        sendFeedback(
                          user.user_id,
                          "Accept"
                        )
                      }
                    >
                      👍 Accept
                    </button>

                    <button
                      className="reject"
                      onClick={() =>
                        sendFeedback(
                          user.user_id,
                          "Reject"
                        )
                      }
                    >
                      👎 Reject
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

          {/* NO RESULTS */}
          {!loading &&
            recommendations.length === 0 && (
              <div className="empty-state">
                No recommendations available.
                Select a profile and click
                <strong> Find My Matches</strong>.
              </div>
            )}

        </section>

        {/* MBTI GUIDE */}
        <section className="info-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                PERSONALITY GUIDE
              </span>

              <h2>
                Understand the MBTI types
              </h2>
            </div>

          </div>

          <p className="info-intro">
            MBTI describes personality preferences using
            four dimensions. Understanding a person's type
            helps explain their communication style,
            preferences and potential strengths.
          </p>

          <div className="mbti-grid">

            {Object.entries(mbtiInfo).map(
              ([type, info]) => (

                <div
                  className="mbti-card"
                  key={type}
                >

                  <strong>
                    {type}
                  </strong>

                  <h3>
                    {info.name}
                  </h3>

                  <p>
                    {info.description}
                  </p>

                  <div className="traits">

                    {info.traits.map((trait) => (
                      <span key={trait}>
                        {trait}
                      </span>
                    ))}

                  </div>

                </div>

              )
            )}

          </div>

        </section>

        {/* MBTI DIMENSIONS */}
        <section className="dimensions-section">

          <span className="section-label">
            MBTI EXPLAINED
          </span>

          <h2>
            What do the four letters mean?
          </h2>

          <div className="dimensions-grid">

            <div className="dimension-card">
              <strong>E / I</strong>

              <h3>
                Extraversion / Introversion
              </h3>

              <p>
                How a person tends to direct their energy
                and interact with the world.
              </p>
            </div>

            <div className="dimension-card">
              <strong>N / S</strong>

              <h3>
                Intuition / Sensing
              </h3>

              <p>
                How a person tends to process information
                and understand their surroundings.
              </p>
            </div>

            <div className="dimension-card">
              <strong>F / T</strong>

              <h3>
                Feeling / Thinking
              </h3>

              <p>
                How a person tends to approach decisions
                and evaluate situations.
              </p>
            </div>

            <div className="dimension-card">
              <strong>J / P</strong>

              <h3>
                Judging / Perceiving
              </h3>

              <p>
                How a person tends to approach structure,
                planning and flexibility.
              </p>
            </div>

          </div>

        </section>

        {/* HOW IT WORKS */}
        <section className="how-section">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            How our recommendation engine works
          </h2>

          <div className="process">

            <div>
              <span>01</span>

              <h3>
                Profile Similarity
              </h3>

              <p>
                TF-IDF compares professional profiles,
                skills, interests and goals.
              </p>
            </div>

            <div>
              <span>02</span>

              <h3>
                Personality
              </h3>

              <p>
                MBTI compatibility helps identify
                compatible personality preferences.
              </p>
            </div>

            <div>
              <span>03</span>

              <h3>
                Demographics
              </h3>

              <p>
                Demographic similarity contributes
                to the overall compatibility score.
              </p>
            </div>

            <div>
              <span>04</span>

              <h3>
                Feedback Learning
              </h3>

              <p>
                Accept and Reject feedback updates
                personalized recommendation weights.
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer>
        Intelligent User Compatibility &
        Recommendation System · AI / ML Project
      </footer>

    </div>
  );
}

export default App;