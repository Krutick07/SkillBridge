import { useEffect, useState } from "react";
import Layout from "./Layout";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { Search, Filter, BookOpen, Youtube, Hash, FileText, GraduationCap, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@radix-ui/react-label";

interface Course {
  _id: string;
  title: string;
  description: string;
  topics: string[];
  level: string;
  link: string;
}

export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<String | null>(null);
  const [link, setLink] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/courses');
      const data = await res.json();
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error('Failed to load courses', error);
      toast.error('Failed to load courses');
    }
    setLoading(false);
  };

  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    fetchCourses();
  }, []);

  useEffect(() => {
    let result = [...courses];

    if (searchTerm) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedLevel) {
      result = result.filter(course => course.level === selectedLevel);
    }

    if (selectedTopic) {
      result = result.filter(course => 
        course.topics.some(topic => topic.toLowerCase() === selectedTopic.toLowerCase())
      );
    }

    setFilteredCourses(result);
  }, [searchTerm, selectedLevel, selectedTopic, courses]);

  const handleCreate = async () => {
    if (!title || !description || !topics || !level) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, topics: topics.split(',').map(t => t.trim()), level, link })
      });
      if (res.ok) {
        toast.success('Course Created!');
        setTitle('');
        setDescription('');
        setTopics('');
        setLevel('');
        setLink('');
        fetchCourses();
      } else {
        toast.error('Creation failed!');
      }
    } catch (error) {
      console.error('Failed to create course', error);
      toast.error('Failed to create course');
    }
  };

  const askDeleteConfirmation = (id: string) => {
    setCourseToDelete(id);
    setConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/courses/${courseToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Course Deleted!');
        fetchCourses();
      } else {
        toast.error('Deletion failed!');
      }
    } catch (error) {
      console.log('Failed to delete course', error);
      toast.error('Failed to delete course');
    } finally {
      setConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setTopics('');
    setLevel('');
    setLink('');
  };

  const getAllTopics = () => {
    const topicsSet = new Set<string>();
    courses.forEach(course => {
      course.topics.forEach(topic => topicsSet.add(topic.toLowerCase()));
    });
    return Array.from(topicsSet);
  };

  const inputClass = "w-full text-black p-3 pl-10 mb-4 border border-gray-200 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all duration-200";
  const labelClass = "text-sm font-medium text-gray-700 mb-1 block";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-orange-800 pointer-events-none";


  return (
    <Layout>
      <div className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-amber-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-8 text-center"
          >
            Course Library
          </motion.h1>

          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none bg-orange-100 text-black backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {/* <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-orange-100 text-gray-700 rounded-xl hover:bg-orange-200 transition-colors border border-orange-100"
              >
                <Filter size={20} />
                Filters
              </button> */}
              {role === 'admin' && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  {showAddForm ? <X size={20} /> : <Plus size={20} />}
                  {showAddForm ? 'Close' : 'Add Course'}
                </button>
              )}
            </div>
          </div>

          {/* <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
              >
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="p-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none bg-orange-100 text-black backdrop-blur-sm"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="p-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none bg-orange-100 text-black backdrop-blur-sm"
                >
                  <option value="">All Topics</option>
                  {getAllTopics().map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence> */}

          <AnimatePresence>
            {role === 'admin' && showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-10 bg-white/30 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Course</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="relative col-span-1">
                    <Label className={labelClass}>Course Title</Label>
                    <BookOpen className={iconClass} size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter course title" 
                      className={inputClass} 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Level */}
                  <div className="relative col-span-1">
                    <Label className={labelClass}>Level</Label>
                    <GraduationCap className={iconClass} size={18} />
                    <select 
                      className={inputClass}
                      value={level} 
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Description (span 2 columns) */}
                  <div className="relative md:col-span-2">
                    <Label className={labelClass}>Description</Label>
                    <FileText className={iconClass} size={18} />
                    <textarea 
                      placeholder="Enter course description" 
                      className={`${inputClass} pl-10 min-h-[100px]`}
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Topics */}
                  <div className="relative col-span-1">
                    <Label className={labelClass}>Topics</Label>
                    <Hash className={iconClass} size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter topics (comma-separated)" 
                      className={inputClass}
                      value={topics} 
                      onChange={(e) => setTopics(e.target.value)}
                    />
                  </div>

                  {/* YouTube Link */}
                  <div className="relative col-span-1">
                    <Label className={labelClass}>YouTube Link</Label>
                    <Youtube className={iconClass} size={18} />
                    <input 
                      type="text" 
                      placeholder="Enter YouTube link" 
                      className={inputClass}
                      value={link} 
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </div>

                  {/* Buttons aligned right */}
                  <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition duration-300"
                    >
                      Create Course
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic, i) => (
                        <span 
                          key={i} 
                          className="bg-orange-100/80 text-orange-600 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-100/80 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                    {course.link && (
                      <a
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600 transition-colors font-medium flex items-center gap-1"
                      >
                        <Youtube size={16} />
                        Watch Tutorial
                      </a>
                    )}
                  </div>
                  {role === 'admin' && (
                    <button
                      onClick={() => askDeleteConfirmation(course._id)}
                      className="mt-4 w-full bg-red-100 hover:bg-red-200 text-red-600 py-2 px-4 rounded-xl font-medium transition duration-300 flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Delete Course
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 font-medium"
            >
              No courses found matching your criteria.
            </motion.p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Are you sure you want to delete this course?
              </h2>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}