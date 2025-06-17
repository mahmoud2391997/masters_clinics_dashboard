import React, { useEffect, useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import CardStats from '../../components/card';
import { getRegions,createRegion } from '../../api/regions&branches';

export interface Region {
  id: number;
  branchCount?: number;
  name: string;
}

const RegionsPage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRegionName, setNewRegionName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const regionsRes = await getRegions();
        setRegions(regionsRes);
      } catch (err: any) {
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName.trim()) return;
    setAdding(true);
    try {
      const newRegion = await createRegion({ name: newRegionName.trim() });
      setRegions((prev) => [...prev, newRegion]);
      setNewRegionName('');
      setShowAddModal(false);
    } catch {
      // handle error
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">المناطق</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
          <PlusCircle size={20} />
          <span>إضافة منطقة</span>
        </button>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">إضافة منطقة جديدة</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewRegionName('');
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleAddRegion} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">اسم المنطقة</label>
                <input
                  type="text"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  placeholder="مثال: القاهرة"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRegionName('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={adding}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                  disabled={adding}
                >
                  {adding ? 'جاري الإضافة...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center text-gray-500">جاري تحميل البيانات...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : regions.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          لا توجد مناطق مضافة حتى الآن.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {regions.map((region) => (
            <CardStats
              key={region.id}
              regionName={region.name}
              branchCount={region.branchCount || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RegionsPage;
