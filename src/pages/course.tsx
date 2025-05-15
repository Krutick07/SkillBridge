import { useEffect, useState } from "react";
import Layout from "./Layout";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

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

  const inputClass = "w-full text-black p-3 mb-4 border border-orange-300 rounded-xl placeholder-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none";

  return (
    <Layout>
      <div className="min-h-screen p-8 bg-gradient-to-br from-orange-100 to-yellow-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-orange-500 mb-8 text-center">Courses</h1>

          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-500 transition-colors"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="p-2 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="p-2 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
              >
                <option value="">All Topics</option>
                {getAllTopics().map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'admin' && (
            <div className="mb-10 bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Add New Course</h2>
              <input type="text" placeholder="Title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)}/>
              <textarea placeholder="Description" className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)}/>
              <input type="text" placeholder="Topics (comma-separated)" className={inputClass} value={topics} onChange={(e) => setTopics(e.target.value)}/>
              <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <input type="text" placeholder="YouTube Link" className={inputClass} value={link} onChange={(e) => setLink(e.target.value)}/>

              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-xl font-semibold transition duration-300"
                >
                  Create
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-xl font-semibold transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course._id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-300">
                  <h3 className="text-xl font-bold text-orange-600 mb-2">{course.title}</h3>
                  <p className="text-gray-700 mb-4">{course.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-600 mb-2">Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((topic, i) => (
                        <span key={i} className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {course.level}
                    </span>
                    {course.link && (
                      <a
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                  {role === 'admin' && (
                    <button
                      onClick={() => askDeleteConfirmation(course._id)}
                      className="mt-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-xl font-medium transition duration-300"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-orange-500 font-semibold">No courses found matching your criteria.</p>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Are you sure you want to delete this course?</h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}