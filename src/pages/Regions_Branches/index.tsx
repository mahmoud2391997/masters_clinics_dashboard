import React, { useEffect, useState } from 'react';
import Form from './form';
import Table from './table';
import { getBranches, getRegions } from '../../api/regions&branches';
import RegionsPage from '../regions';


export interface WorkingHour {
  days: string;
  time: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RegionBranch {
  id: number;
  name: string;
  address: string;
  location_link: string;
  region_id: number;
  coordinates: Coordinates;
  working_hours: WorkingHour[];
}

// const defaultFormFields: FormField[] = [
//   { name: "name", label: "اسم الفرع" },
//   { name: "address", label: "العنوان" },
//   { name: "location_link", label: "رابط الموقع" },
//   { name: "working_hours", label: "ساعات العمل" },
//   { name: "latitude", label: "خط العرض" },
//   { name: "longitude", label: "خط الطول" },
// ];

const RegionsBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
console.log('Branches:', branches);

  return (
    <div>
<RegionsPage />
      <Form 
      regions={regions}
        

      />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Table
      //  formFields={defaultFormFields}
        data={branches}
        regions={regions}
        
        />
    </div>
  );
};

export default RegionsBranchesPage;
