import { LogOut, Menu, Router, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname,useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface LayoutProps{
    children: ReactNode;
}

const navLinks = [
    {name: 'Courses',href: '/course'},
    {name: 'Learning Path',href: '/learningPath'},
    {name: 'Resume Analyzer',href: '/resumeAnalyzer' },
    {name: 'Mock Interview', href: '/mockInterview' },
]

export default function Layout({ children }: LayoutProps){
    const pathName = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [role,setRole] =useState<String | null>(null);
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
        }

        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('name');
            if (storedName) setUserName(storedName);
        }
        
        const storedRole = localStorage.getItem('role');
        setRole(storedRole);
         
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const toggleProfile = () => setProfileOpen(!profileOpen);

    const handleLogout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
      
        
        // Redirect to login
        window.location.href = '/login';
    };
      

    return(
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-100 to-yellow-200">

            <header className="shadow-md py-4 px-4 md:px-8 flex justify-between items-center">
                <div className="text-orange-500 font-bold text-xl">
                    <Link href="/course">SkillBridge</Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-6 text-orange-500 font-medium">
                    {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`hover:underline ${
                        pathName === link.href ? 'text-orange-600 font-bold underline' : ''
                        }`}
                    >
                        {link.name}
                    </Link>
                    ))}
                </nav>

                {/* Right controls: mobile menu + profile */}
                <div className="flex items-center space-x-2">
                    {/* Mobile Menu Toggle (left of profile) */}
                    <button onClick={toggleMenu} className="md:hidden text-orange-500">
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Profile */}
                    <div className="relative">
                        <div className="flex items-center space-x-2 text-white bg-orange-400 px-3 py-2 rounded-full hover:bg-orange-500 transition"
                            onClick={toggleProfile}>
                            <User className="w-5 h-5" />
                        </div>
                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-50 p-3 space-y-2">
                                <div className="flex items-center space-x-2 px-2">
                                    <User className="text-orange-500" />
                                    <span className="text-sm font-medium text-gray-700">{userName}</span>
                                </div>
                                {role==='admin' &&(
                                    <Link href="/userRoles" className="flex items-center w-full text-left px-2 py-2 hover:bg-orange-100 text-sm text-orange-600">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage Role
                                    </Link>
                                )}

                                <button onClick={handleLogout} className="flex items-center w-full text-left px-2 py-2 hover:bg-orange-100 text-sm text-red-500">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>


            {menuOpen && (
                <div className="md:hidden bg-white border-t px-4 py-2 space-y-2 text-orange-500">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block ${
                                pathName === link.href ? 'font-bold text-orange-600' : ''
                            }`}
                            onClick={() => setMenuOpen(false)}
                        >
                        {link.name}
                        </Link>
                    ))}
                </div>
            )} 

            <main className="flex-1">{children}</main>

            <footer className="shadow-inner text-center py-4 text-black text-sm">
                © {new Date().getFullYear()} SkillBridge. All rights reserved.
            </footer>
        </div>
    )
}