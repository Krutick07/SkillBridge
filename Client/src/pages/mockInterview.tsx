'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import Layout from './Layout';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ArrowLeft, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QAPair {
  question: string;
  userAnswer: string;
}

interface Feedback {
  question: string;
  userAnswer: string;
  feedback: string;
  score: number;
}

export default function MockInterviewPage() {
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, []);

  if (!isClient) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/mock-interview/start', { role });
      const list = res.data.questions.split('\n').filter((q: string) => q.trim() !== '');
      setQuestions(list);
      setAnswers(Array(list.length).fill(''));
      setFeedbacks([]);
      setCurrentStep(0);
    } catch (error) {
      console.log('Failed to generate questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    const updated = [...answers];
    updated[currentStep] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = localStorage.getItem('userId');
      const qaPairs: QAPair[] = questions.map((question, i) => ({
        question,
        userAnswer: answers[i],
      }));

      const res = await axiosInstance.post('/mock-interview/submit', {
        user,
        role,
        qaPairs,
      });

      setFeedbacks(res.data.result);
    } catch (error) {
      console.log('Submission failed.', error);
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setRole('');
    setQuestions([]);
    setAnswers([]);
    setFeedbacks([]);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-200 p-6">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">🎤 AI Mock Interview</h1>

        {!questions.length ? (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-4">
            <input
              type="text"
              placeholder="Enter job role (e.g., Frontend Developer)"
              className="w-full p-3 border border-orange-300 rounded-xl text-black"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !role}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Generating Questions...' : 'Start Interview'}
            </button>
          </div>
        ) : (
          <div className="relative max-w-2xl mx-auto space-y-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                variants={variants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                layout
                className="bg-white p-6 rounded-2xl shadow-lg space-y-6 w-full"
              >
                <div>
                  <p className="text-lg font-semibold text-orange-500 mb-2">
                    Question {currentStep + 1} of {questions.length}
                  </p>
                  <p className="text-black whitespace-pre-wrap">{questions[currentStep]}</p>
                </div>

                <textarea
                  rows={5}
                  value={answers[currentStep]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full border border-orange-300 p-3 rounded-xl text-black placeholder-orange-400"
                  placeholder="Type your answer here"
                />

                {feedbacks.length > 0 && feedbacks[currentStep] && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-sm text-black">
                    <p>
                      <strong>Score:</strong> {feedbacks[currentStep].score}/10
                    </p>
                    <p>
                      <strong>Feedback:</strong> {feedbacks[currentStep].feedback}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center gap-4 pt-2">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>

                  {currentStep < questions.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : feedbacks.length === 0 ? (
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Submit All Answers
                    </button>
                  ) : (
                    <button
                      onClick={restart}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
                    >
                      <RefreshCcw className="w-4 h-4" /> Restart Interview
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
