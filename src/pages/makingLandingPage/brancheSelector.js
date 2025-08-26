import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const BranchSelector = ({ selectedBranches, onChange }) => {
    const branchOptions = [
        { value: "فرع العوالي", label: "فرع العوالي" },
        { value: "فرع الخالدية", label: "فرع الخالدية" },
        { value: "فرع الشاطئ", label: "فرع الشاطئ" },
        { value: "فرع البساتين", label: "فرع البساتين" },
        { value: "ابحر الشمالية", label: "ابحر الشمالية" },
        { value: "فرع الطائف", label: "فرع الطائف" },
    ];
    const toggleBranch = (branch) => {
        const newBranches = selectedBranches.includes(branch)
            ? selectedBranches.filter(b => b !== branch)
            : [...selectedBranches, branch];
        onChange(newBranches);
    };
    return (_jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx("div", { className: "flex flex-wrap gap-2", children: branchOptions.map((option) => (_jsx("button", { type: "button", onClick: () => toggleBranch(option.value), className: `px-3 py-1 rounded-full text-sm ${selectedBranches.includes(option.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'}`, children: option.label }, option.value))) })] }));
};
export default BranchSelector;
