import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import CardStats from '../../components/card';
import { getRegions, createRegion } from '../../api/regions&branches';
const RegionsPage = () => {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError('حدث خطأ أثناء تحميل البيانات');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleAddRegion = async (e) => {
        e.preventDefault();
        if (!newRegionName.trim())
            return;
        setAdding(true);
        try {
            const newRegion = await createRegion({ name: newRegionName.trim() });
            setRegions((prev) => [...prev, newRegion]);
            setNewRegionName('');
            setShowAddModal(false);
        }
        catch {
            // handle error
        }
        finally {
            setAdding(false);
        }
    };
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "\u0627\u0644\u0645\u0646\u0627\u0637\u0642" }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition", children: [_jsx(PlusCircle, { size: 20 }), _jsx("span", { children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u0637\u0642\u0629" })] })] }), showAddModal && (_jsx("div", { className: "fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800", children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u0637\u0642\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsx("button", { onClick: () => {
                                        setShowAddModal(false);
                                        setNewRegionName('');
                                    }, className: "text-gray-500 hover:text-gray-700 transition", children: _jsx(X, { size: 22 }) })] }), _jsxs("form", { onSubmit: handleAddRegion, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 mb-1", children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u0637\u0642\u0629" }), _jsx("input", { type: "text", value: newRegionName, onChange: (e) => setNewRegionName(e.target.value), placeholder: "\u0645\u062B\u0627\u0644: \u0627\u0644\u0642\u0627\u0647\u0631\u0629", className: "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, autoFocus: true })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                                setShowAddModal(false);
                                                setNewRegionName('');
                                            }, className: "px-4 py-2 text-gray-600 hover:text-gray-800", disabled: adding, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400", disabled: adding, children: adding ? 'جاري الإضافة...' : 'إضافة' })] })] })] }) })), loading ? (_jsx("div", { className: "text-center text-gray-500", children: "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A..." })) : error ? (_jsx("div", { className: "text-center text-red-500", children: error })) : regions.length === 0 ? (_jsx("div", { className: "text-center text-gray-500 py-12", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u0627\u0637\u0642 \u0645\u0636\u0627\u0641\u0629 \u062D\u062A\u0649 \u0627\u0644\u0622\u0646." })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: regions.map((region) => (_jsx(CardStats, { regionName: region.name, branchCount: region.branchCount || 0 }, region.id))) }))] }));
};
export default RegionsPage;
