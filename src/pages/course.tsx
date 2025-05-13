import { useEffect, useState } from "react";
import Layout from "./Layout";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<String | null>(null);
  const [link, setLink] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);


  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/courses');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses', error);
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

  const handleCreate = async () => {
    if (!title || !description || !topics || !level) return alert('Please fill all fields');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description , topics : topics.split(',').map(t => t.trim()), level , link })
      });
      if (res.ok) {
        toast.success('Course Created!');
        setTitle('');
        setDescription('');
        setTopics('');
        setLevel('');
        setLink('');
        fetchCourses();
      }else{
        toast.error('Creation failed!');
      }
    } catch (error) {
      console.error('Failed to create course', error);
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
  

  const inputClass = "w-full text-black p-3 mb-4 border border-orange-300 rounded-xl placeholder-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none";

  return (
    <Layout>
      <div className="min-h-screen p-8 bg-gradient-to-br from-orange-100 to-yellow-200">
        <h1 className="text-4xl font-extrabold text-orange-500 mb-8 text-center">Courses</h1>

        {role === 'admin' && (
          <div className="mb-10 bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Add New Course</h2>
            <input type="text" placeholder="Title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)}/>
            <textarea placeholder="Description" className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)}/>
            <input type="text" placeholder="Topics (comma-Seprated)" className={inputClass}  value={topics} onChange={(e) => setTopics(e.target.value)}/>
            <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="" disabled>-:select Level:-</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <input type="text" placeholder="YouTube Link" className={inputClass} value={link} onChange={(e) => setLink(e.target.value)}/>

            <button
              onClick={handleCreate}
              className="bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-xl font-semibold transition duration-300"
            >
              Create
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 ml-2 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-xl font-semibold transition duration-300"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-orange-600 text-lg font-medium">Loading…</p>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-orange-300" key={course._id}>
                <h3 className="text-xl font-bold text-orange-600">{course.title}</h3>
                <p className="text-gray-700">{course.description}</p>
                <ul className="list-disc ml-5 mb-2 text-sm text-gray-700">
                  {course.topics.map((topic, i) => <li key={i}>{topic}</li>)}
                </ul>
                <p className="text-gray-700">Level: {course.level}</p>
                {course.link && (
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm mt-2 block"
                  >
                    Watch on YouTube
                  </a>
                )} 

                {role === 'admin' && (
                  <button
                    onClick={() => askDeleteConfirmation(course._id)}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-xl font-medium transition duration-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-orange-500 font-semibold">No Courses Found.</p>
          )}
        </div>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
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
