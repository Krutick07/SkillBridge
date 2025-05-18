'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "./Layout";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCcw, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LearningPathPage() {
  const [userId, setUserId] = useState("");
  const [skills, setSkills] = useState("");
  const [learningPath, setLearningPath] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
    const storedId = localStorage.getItem("userId");
    if (storedId) setUserId(storedId);
  }, []);

  const handleGenerate = async () => {
    if (!skills.trim()) {
      toast.error("Please enter at least one skill.");
      return;
    }

    setError("");
    setLearningPath([]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/learning-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          skills: skills.split(",").map((s) => s.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate path");

      const lines: string[] = data.learningPath
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line !== "");

      const mergedSteps: string[] = [];
      for (let i = 0; i < lines.length; i += 2) {
        const title = lines[i] || "";
        const desc = lines[i + 1] || "";
        mergedSteps.push(`**${title}**\n\n${desc}`);
      }

      setLearningPath(mergedSteps);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 mb-4 border border-orange-300 rounded-xl placeholder-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none text-black bg-white/70 backdrop-blur-sm";

  return (
    <Layout>
      <div className="min-h-screen p-8 bg-gradient-to-br from-orange-100 to-yellow-100">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6"
        >
          Your AI-Powered Learning Path
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-6"
        >
          <input
            type="text"
            placeholder="Enter skills (comma-separated)"
            className={inputClass}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <div className="flex gap-4 justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {loading ? "Generating..." : "Generate Path"}
            </button>
            {learningPath.length > 0 && (
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-500 rounded-xl font-medium hover:bg-orange-50 transition"
              >
                <RefreshCcw size={16} />
                Re-generate
              </button>
            )}
          </div>
          {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
        </motion.div>

        <AnimatePresence>
          {skills && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto mb-6"
            >
              <h3 className="text-lg font-medium mb-2 text-orange-700">Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {skills.split(",").map((skill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill.trim()}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {learningPath.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {learningPath.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-md border border-orange-100 hover:shadow-xl transition-all duration-300"
                >
                  <h4 className="text-lg font-semibold text-orange-600 mb-2">
                    Step {index + 1}
                  </h4>
                  <div className="prose prose-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-200">
                    <ReactMarkdown>{step}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
