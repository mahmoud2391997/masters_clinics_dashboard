const BranchSelector = ({ selectedBranches, onChange }: { selectedBranches: string[], onChange: (branches: string[]) => void }) => {
  const branchOptions = [
    { value: "فرع العوالي" , label: "فرع العوالي" },
    { value: "فرع الخالدية" , label: "فرع الخالدية" },
    { value: "فرع الشاطئ" , label: "فرع الشاطئ" },
    { value:"فرع البساتين", label: "فرع البساتين" },
    { value:  "ابحر الشمالية", label: "ابحر الشمالية" },
    { value: "فرع الطائف", label: "فرع الطائف" },
  ];

  const toggleBranch = (branch: string) => {
    const newBranches = selectedBranches.includes(branch)
      ? selectedBranches.filter(b => b !== branch)
      : [...selectedBranches, branch];
    onChange(newBranches);
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الفروع</label>
      <div className="flex flex-wrap gap-2">
        {branchOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleBranch(option.value)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedBranches.includes(option.value)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
export default BranchSelector