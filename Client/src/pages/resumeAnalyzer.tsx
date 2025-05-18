'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Layout from './Layout';
import toast from 'react-hot-toast';
import { Loader2, FileText, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, []);

  const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected: File) => {
    if (selected.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      setFile(null);
    } else {
      setFile(selected);
      toast.success('File selected!');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setFeedback('');
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

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
          timeout: 120000,
        }
      );

      setFeedback(res.data.feedback);
      toast.success('Resume analyzed successfully!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Upload failed.';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 px-6 py-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-10"
        >
          Upload Your Resume for AI Feedback
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6"
        >
          <label
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-orange-400 rounded-2xl p-10 text-orange-500 cursor-pointer hover:bg-orange-50 transition"
          >
            <UploadCloud className="w-10 h-10 mb-2" />
            <p className="font-medium">Drag & Drop your PDF here or click to select</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-4 py-3 bg-orange-100 text-orange-700 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </motion.div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 px-6 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? 'Analyzing...' : 'Upload Resume'}
          </button>
        </motion.div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="mt-10 max-w-3xl mx-auto space-y-4"
            >
              <h2 className="text-2xl font-bold text-orange-500 text-center">📋 AI Feedback</h2>
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 space-y-3 text-black prose prose-sm">
                <ReactMarkdown>{feedback}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
