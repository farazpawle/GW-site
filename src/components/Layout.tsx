import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function Layout({ children, currentPage = "" }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded"></div>
            <span className="text-xl font-bold text-gray-800">GW</span>
            <span className="text-sm text-gray-600">PREMIUM AUTO PARTS</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`${currentPage === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className={`${currentPage === 'about' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`${currentPage === 'contact' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Contact Us
            </Link>
            <Link 
              href="/blog" 
              className={`${currentPage === 'blog' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Blog
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <p className="mb-2">Corporate Office: 26 6A Street - Al Quoz</p>
              <p className="mb-2">Al Quoz Industrial Area 3 Dubai</p>
              <p className="mb-2">Phone: +971 4 224 38 51</p>
              <p className="mb-2">Email: sales@garritwulf.com</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-blue-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-blue-400">Contact Us</Link></li>
                <li><Link href="/career" className="hover:text-blue-400">Career</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400">Terms & Services</Link></li>
                <li><Link href="/blog" className="hover:text-blue-400">Blogs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400">Facebook</a>
                <a href="#" className="hover:text-blue-400">Twitter</a>
                <a href="#" className="hover:text-blue-400">Instagram</a>
                <a href="#" className="hover:text-blue-400">YouTube</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; 2025 All Rights Reserved by Garrit & Wulf - Website Managed by FRZ</p>
          </div>
        </div>
      </footer>
    </div>
  );
}