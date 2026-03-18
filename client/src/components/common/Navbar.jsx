import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar({ toggleSidebar, sidebarOpen }) {
  return (
    <header className="bg-white shadow mb-6 md:hidden">
      <div className="px-4 mx-auto max-w-7xl">

        <nav className="flex items-center justify-between h-16">

          {/* Hamburger menu */}
          <button
            onClick={toggleSidebar}
            className="p-2 bg-indigo-600 text-white rounded-lg shadow"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

        </nav>

      </div>
    </header>
  );
}