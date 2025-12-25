import Link from 'next/link'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:block fixed h-full z-10">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Admin Portal
                    </h2>
                </div>
                <nav className="p-4 space-y-1">
                    <Link href="/admin" className="block px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
                        Data Murid
                    </Link>
                    <Link href="/admin/verification" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                        Verifikasi
                    </Link>
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <Link href="/" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                            Logout
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-20 shadow-sm">
                    <div className="md:hidden mr-4">
                        {/* Mobile menu trigger placeholder */}
                        Menu
                    </div>
                    <h1 className="text-lg font-semibold text-gray-800">
                        Dashboard
                    </h1>
                    <div className="ml-auto">
                        <span className="text-sm text-gray-500">Admin User</span>
                    </div>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
