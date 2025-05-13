import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Layout from './Layout';
import { useRouter } from 'next/navigation';

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected?.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      setFile(null);
    } else {
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setFeedback('');
    setError('');

    const formData = new FormData();
    formData.append('resume', file); // Must match multer field name

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'http://localhost:5000/api/resume/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setFeedback(res.data.feedback);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const inputClass =
    'w-full p-3 mb-4 border border-orange-300 rounded-xl placeholder-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none text-black bg-white';

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-200 p-8">
        <h1 className="text-4xl font-extrabold text-orange-500 mb-6 text-center">
          Upload Your Resume for AI Feedback
        </h1>

        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className={inputClass}
          />

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 px-6 rounded-xl font-semibold transition duration-300 disabled:opacity-50"
          >
            {uploading ? 'Analyzing...' : 'Upload Resume'}
          </button>
        </div>

        {feedback && (
          <div className="mt-6 max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl text-black whitespace-pre-wrap">
            <h2 className="text-xl font-semibold mb-2 text-orange-500">
              📋 Resume Feedback:
            </h2>
            <p><ReactMarkdown>{feedback}</ReactMarkdown></p>
          </div>
        )}
      </div>
    </Layout>
  );
}
