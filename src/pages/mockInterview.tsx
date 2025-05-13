import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import Layout from './Layout';
import { useRouter } from 'next/navigation';

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
  const [question, setQuestion] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  useEffect(() =>{
    setIsClient(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  },[]);

  if (!isClient) return null; // or a loader


  const handleGenrate = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/mock-interview/start', { role });
      const list = res.data.questions.split('\n').filter((q: string) => q.trim() !== '');
      setQuestion(list);
      setAnswers(Array(list.length).fill(''));
      setFeedbacks([]);
    } catch (error) {
      console.log('Failed to generate questions:', error);
    }
    setLoading(false);
  };

  const handleChangeAnswer = (index: number, value: string) => {
    const newAnswer = [...answers];
    newAnswer[index] = value;
    setAnswers(newAnswer);
  };

  const startSpeechToText = (index: number) => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      handleChangeAnswer(index, text);
    };

    recognition.onerror = () => {
      alert('Speech recognition failed.');
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = localStorage.getItem('userId');
      const qaPairs: QAPair[] = question.map((question, i) => ({
        question,
        userAnswer: answers[i]
      }));

      const res = await axiosInstance.post('/mock-interview/submit', {
        user,
        role,
        qaPairs
      });

      setFeedbacks(res.data.result);
    } catch (error) {
      console.log('Submission failed.', error);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-200 p-8">
        <h1 className="text-4xl font-extrabold text-orange-500 mb-6 text-center">
          AI-Powered Mock Interview
        </h1>

        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-4">
          <input
            type="text"
            placeholder="Enter job role (e.g., Frontend Developer)"
            className="w-full p-3 border border-orange-300 rounded-xl placeholder-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none text-black bg-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <button
            onClick={handleGenrate}
            disabled={loading || !role}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 px-6 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>

        <div className="mt-6 max-w-3xl mx-auto space-y-6">
          {question.map((q, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-xl space-y-3">
              <p className="font-semibold text-orange-500">{q}</p>
              <textarea
                className="w-full text-black border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none placeholder-orange-500"
                rows={3}
                value={answers[index]}
                onChange={(e) => handleChangeAnswer(index, e.target.value)}
                placeholder="Type your answer " 
                  // or use the mic 🎤
              />
              {/* <button
                onClick={() => startSpeechToText(index)}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition duration-300"
              >
                Speak Answer
              </button> */}

              {feedbacks?.[index] && (
                <div className="mt-4 bg-orange-100 p-4 rounded-xl text-sm text-black space-y-1">
                  <p><strong>Score:</strong> {feedbacks[index].score}/10</p>
                  <p><strong>Feedback:</strong> {feedbacks[index].feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {question.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Answers'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
