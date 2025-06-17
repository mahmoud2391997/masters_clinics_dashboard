import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import Form from './form';
import Table from './table';
import { getBranches, getRegions } from '../../api/regions&branches';
import RegionsPage from '../regions';
// const defaultFormFields: FormField[] = [
//   { name: "name", label: "اسم الفرع" },
//   { name: "address", label: "العنوان" },
//   { name: "location_link", label: "رابط الموقع" },
//   { name: "working_hours", label: "ساعات العمل" },
//   { name: "latitude", label: "خط العرض" },
//   { name: "longitude", label: "خط الطول" },
// ];
const RegionsBranchesPage = () => {
    const [branches, setBranches] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [branchesRes, regionsRes] = await Promise.all([
                    getBranches(),
                    getRegions(),
                ]);
                setBranches(branchesRes.data);
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
    console.log('Branches:', branches);
    return (_jsxs("div", { children: [_jsx(RegionsPage, {}), _jsx(Form, { regions: regions }), loading && _jsx("p", { children: "Loading..." }), error && _jsx("p", { style: { color: 'red' }, children: error }), _jsx(Table
            //  formFields={defaultFormFields}
            , { 
                //  formFields={defaultFormFields}
                data: branches, regions: regions })] }));
};
export default RegionsBranchesPage;
