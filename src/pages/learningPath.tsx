import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown'; 
import Layout from "./Layout";
import { useRouter } from "next/navigation";

export default function LearningPathPage() {
  const [userId, setUserId] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLearningPath("");

    if (!skills) {
      setError("Please provide at least one skill.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:5000/api/learning-path", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
         },
        body: JSON.stringify({
          userId,
          skills: skills.split(",").map((skill) => skill.trim()),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate learning path");
      }

      setLearningPath(data.learningPath);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  const inputClass =
    "w-full p-3 mb-4 border border-orange-300 rounded-xl placeholder-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none text-black";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-200 p-8">
        <h1 className="text-4xl font-extrabold text-orange-500 mb-6 text-center">
          Generate Learning Path
        </h1>

        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
          <input
            type="text"
            placeholder="Skills (comma-separated)"
            className={inputClass}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 px-6 rounded-xl font-semibold transition duration-300"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {error && (
            <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
          )}
        </div>

        {learningPath && (
            <div className="bg-white p-6 rounded-2xl shadow-xl mt-6 prose max-w-none text-black">
              <ReactMarkdown>{learningPath}</ReactMarkdown>
            </div>
        )}
      </div>
    </Layout>
  );
}
