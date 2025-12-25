import Link from 'next/link'

export default function AdminDashboard() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Data Murid</h2>
                    <p className="text-sm text-gray-500">Kelola data siswa sekolah</p>
                </div>
                <Link href="/admin/students/new" className="btn btn-primary shadow-lg shadow-blue-500/20">
                    + Tambah Murid
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">No</th>
                                <th className="px-6 py-4 font-bold">Nama</th>
                                <th className="px-6 py-4 font-bold">Rombel</th>
                                <th className="px-6 py-4 font-bold">NIPD</th>
                                <th className="px-6 py-4 font-bold">NISN</th>
                                <th className="px-6 py-4 font-bold">L/P</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Dummy Data for Visualization */}
                            <tr className="bg-white hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">1</td>
                                <td className="px-6 py-4 font-medium text-gray-900">Budi Santoso</td>
                                <td className="px-6 py-4 text-gray-600">X-IPA-1</td>
                                <td className="px-6 py-4 text-gray-600">12345</td>
                                <td className="px-6 py-4 text-gray-600">0081234567</td>
                                <td className="px-6 py-4 text-gray-600">L</td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-100 text-green-700 font-medium px-2.5 py-0.5 rounded-full text-xs border border-green-200"> Verified</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
                                </td>
                            </tr>
                            <tr className="bg-white hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">2</td>
                                <td className="px-6 py-4 font-medium text-gray-900">Siti Aminah</td>
                                <td className="px-6 py-4 text-gray-600">X-IPA-1</td>
                                <td className="px-6 py-4 text-gray-600">12346</td>
                                <td className="px-6 py-4 text-gray-600">0081234568</td>
                                <td className="px-6 py-4 text-gray-600">P</td>
                                <td className="px-6 py-4">
                                    <span className="bg-yellow-100 text-yellow-700 font-medium px-2.5 py-0.5 rounded-full text-xs border border-yellow-200"> Pending</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-500">
                    Menampilkan 2 dari 2 data
                </div>
            </div>
        </div>
    )
}
