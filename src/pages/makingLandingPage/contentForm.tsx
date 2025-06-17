import {  useState, useEffect } from "react"
import {  useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import DataTable from "./table"
import type { SubmitHandler } from "react-hook-form"
import axios from "axios"
import BranchSelector from "./brancheSelector"
interface LandingPage {
  id: string;
  creator: string;
  title: string;
  createdAt: string;
  platforms: {
    facebook: boolean;
    instagram: boolean;
    x: boolean;
    tiktok: boolean;
    google: boolean;
    snapchat: boolean;
  };}interface Offer {
  offer: string
  price: string
  description?: string
  image: string | File
  branches: string[] // Add branches array
}
interface ExistingDoctor extends Doctor {
  id: string;
  specialty: string;
}

interface ExistingService extends Service {
  id: string;
}

// Update your ExistingOffer interface to match the actual data structure
interface ExistingOffer {
  id: string;
  title?: string; // Make optional
  offer?: string; // Alternative property name
  description: string;
  image: string;
  priceAfter?: string;
  price?: string; // Alternative property name
  discountPercentage: string;
  branches: string[];
  services_ids: string[];
  doctors_ids: string[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

// Update the Offer interface to match your needs
interface Offer {
  offer: string;
  price: string;
  description?: string;
  image: string | File;
  branches: string[];
}
interface Doctor {
  name: string
  specialization: string
  image: string | File
  branches: string[] // Add branches array
}

interface Service {
  name: string
  description: string
  branches: string[] // Add branches array
}

interface Content {
  landingScreen: {
    title: string
    subtitle: string
    description: string
    image: string | File
  }
  services: Service[]
  offers: Offer[]
  doctors: Doctor[]
}

interface LandingPageFormData {
  creator: string
  createdAt: string | null | undefined
  title: string
  platforms: {
    facebook: boolean
    instagram: boolean
    x: boolean
    tiktok: boolean
    google: boolean
    snapchat: boolean
  }
  showSections: {
    landingScreen: boolean
    services: boolean
    offers: boolean
    doctors: boolean
  }
  content: Content
}
const API_URL = 'http://localhost:3000/landingPage';

export const createLandingPage = async (data: any) => {
    const response = await axios.post(API_URL, data);
    
    return response.data;
};
export const getLandingPages = async () => {
    const response = await axios.get(API_URL);
    
    return response.data;
};
// Base validation schema
const baseSchema = yup.object().shape({
  creator: yup.string().required("المنشئ مطلوب"),
  title: yup.string().required("عنوان الصفحة مطلوب"),
  platforms: yup.object().shape({
    facebook: yup.boolean().required().default(false),
    instagram: yup.boolean().required().default(false),
    x: yup.boolean().required().default(false),
    tiktok: yup.boolean().required().default(false),
    google: yup.boolean().required().default(false),
    snapchat: yup.boolean().required().default(false),
  }),
  showSections: yup.
  
  
  
  object().shape({
    landingScreen: yup.boolean().required().default(false),
    services: yup.boolean().required().default(false),
    offers: yup.boolean().required().default(false),
    doctors: yup.boolean().required().default(false),
  }),
})

// Conditional validation schema
const createValidationSchema = (showSections: {
  landingScreen: boolean
  services: boolean
  offers: boolean
  doctors: boolean
}) => {
  return baseSchema.concat(
    yup.object().shape({
      content: yup.object().shape({
        landingScreen: yup.object().shape({
          title: showSections.landingScreen
            ? yup.string().required("عنوان شاشة الهبوط مطلوب")
            : yup.string().notRequired(),
          subtitle: showSections.landingScreen
            ? yup.string().required("العنوان الفرعي لشاشة الهبوط مطلوب")
            : yup.string().notRequired(),
          description: showSections.landingScreen
            ? yup.string().required("وصف شاشة الهبوط مطلوب")
            : yup.string().notRequired(),
          image: showSections.landingScreen
            ? yup.mixed().required("صورة شاشة الهبوط مطلوبة")
            : yup.mixed().notRequired(),
        }),
     services: showSections.services
  ? yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required("اسم الخدمة مطلوب"),
          description: yup.string().required("وصف الخدمة مطلوب"),
          branches: yup.array().of(yup.string()).min(1, "يجب اختيار فرع واحد على الأقل"),
        })
      )
      .min(1, "يجب إضافة خدمة واحدة على الأقل")
  : yup.array().notRequired(),
offers: showSections.offers
  ? yup
      .array()
      .of(
        yup.object().shape({
          offer: yup.string().required("اسم العرض مطلوب"),
          price: yup.string().required("سعر العرض مطلوب"),
          description: yup.string().notRequired(),
          image: yup.mixed().required("صورة العرض مطلوبة"),
          branches: yup.array().of(yup.string()).min(1, "يجب اختيار فرع واحد على الأقل"),
        })
      )
      .min(1, "يجب إضافة عرض واحد على الأقل")
  : yup.array().notRequired(),
doctors: showSections.doctors
  ? yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required("اسم الطبيب مطلوب"),
          specialization: yup.string().required("تخصص الطبيب مطلوب"),
          image: yup.mixed().required("صورة الطبيب مطلوبة"),
          branches: yup.array().of(yup.string()).min(1, "يجب اختيار فرع واحد على الأقل"),
        })
      )
      .min(1, "يجب إضافة طبيب واحد على الأقل")
  : yup.array().notRequired(),
    })
    })
  )
}

const LandingPageForm = () => {
  const [showSections, setShowSections] = useState({
    landingScreen: false,
    services: false,
    offers: false,
    doctors: false,
  })
  // Initialize showSections based on default values
const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [, setLoading] = useState(true);
 const [existingDoctors, setExistingDoctors] = useState<ExistingDoctor[]>([]);
  const [existingServices, setExistingServices] = useState<ExistingService[]>([]);
  const [existingOffers, setExistingOffers] = useState<ExistingOffer[]>([]);
  const [selectedExistingDoctors, setSelectedExistingDoctors] = useState<string[]>([]);
  const [selectedExistingServices, setSelectedExistingServices] = useState<string[]>([]);
  const [selectedExistingOffers, setSelectedExistingOffers] = useState<string[]>([]);

  useEffect(() => {
    const getLandingPages = async () => {
      try {
        const response = await axios.get(API_URL,
          { headers: { 'Content-Type': 'application/json' ,
            Authorization: `Bearer ${sessionStorage.getItem('token')}`

          } }
        );
   const sorted = [...response.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLandingPages(sorted);      
      } catch (error) {
        console.error('Error fetching landing pages:', error);
      } finally {
        setLoading(false);
      }
    };

    getLandingPages();
  }, []);                  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    
    trigger,
    reset,
  } = useForm<LandingPageFormData>({
    resolver: yupResolver(createValidationSchema(showSections)) as any,
    defaultValues: {
      creator: "",
      createdAt: null,
      title: "",
      platforms: {
        facebook: false,
        instagram: false,
        x: false,
        tiktok: false,
        google: false,
        snapchat: false,
      },
      showSections: {
        landingScreen: false,
        services: false,
        offers: false,
        doctors: false,
      },
      content: {
        landingScreen: {
          title: "",
          subtitle: "",
          description: "",
          image: "",
        },
        services: [],
        offers: [],
        doctors: [],
      },
    },
  })

  const [services, setServices] = useState<Service[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
// State for landing image
const [landingImage, setLandingImage] = useState<File | string | null>(null);
const [landingImagePreview, setLandingImagePreview] = useState<string>("");
const [landingImageSource, setLandingImageSource] = useState<"file" | "url" | null>(null);
 useEffect(() => {
    const fetchExistingData = async () => {
      try {
        // Fetch existing doctors
        const doctorsRes = await axios.get('http://localhost:3000/doctors',        {
            headers:{
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });
        setExistingDoctors(doctorsRes.data);

        // Fetch existing services
        const servicesRes = await axios.get('http://localhost:3000/services',
        {
            headers:{
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });
        setExistingServices(servicesRes.data);

        // Fetch existing offers
        const offersRes = await axios.get('http://localhost:3000/offers',
        {
            headers:{
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        });
        setExistingOffers(offersRes.data);
      } catch (error) {
        console.error('Error fetching existing data:', error);
      }
    };

    fetchExistingData();
  }, []);

  // Add these handler functions
  const handleExistingDoctorSelect = (doctorId: string) => {
    const doctor = existingDoctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const newDoctor: Doctor = {
      name: doctor.name,
      specialization: doctor.specialty,
      image: doctor.image || '',
      branches: doctor.branches.map(String) || []
    };

    setDoctors([...doctors, newDoctor]);
    setValue("content.doctors", [...doctors, newDoctor]);
    setSelectedExistingDoctors([...selectedExistingDoctors, doctorId]);
  };

  const handleExistingServiceSelect = (serviceId: string) => {
    const service = existingServices.find(s => s.id === serviceId);
    if (!service) return;

    const newService: Service = {
      name: service.name,
      description: service.description,
      branches: service.branches || [],
    };

    setServices([...services, newService]);
    setValue("content.services", [...services, newService]);
    setSelectedExistingServices([...selectedExistingServices, serviceId]);
  };

const handleExistingOfferSelect = (offerId: string) => {
  const offer = existingOffers.find(o => o.id === offerId);
  if (!offer) return;

  const newOffer: Offer = {
    offer: offer.title || offer.offer || '', // Use either title or offer
    price: offer.priceAfter || offer.price || '', // Use either priceAfter or price
    description: offer.description,
    image: offer.image,
    branches: offer.branches || []
  };
    setOffers([...offers, newOffer]);
    setValue("content.offers", [...offers, newOffer]);
    setSelectedExistingOffers([...selectedExistingOffers, offerId]);
  };
// Handler for file upload
const handleLandingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setLandingImage(file);
    setLandingImagePreview(URL.createObjectURL(file));
    setLandingImageSource("file");
    setValue("content.landingScreen.image", file);
    // Clear URL input
    const urlInput = document.getElementById('landing-image-url') as HTMLInputElement;
    if (urlInput) urlInput.value = '';
  }
};

// Handler for URL input
const handleLandingImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const url = e.target.value.trim();
  if (url) {
    setLandingImage(url);
    setLandingImagePreview(url);
    setLandingImageSource("url");
    setValue("content.landingScreen.image", url);
    // Clear file input
    const fileInput = document.getElementById('landing-image-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
};

// Handler to remove image
const removeLandingImage = () => {
  setLandingImage(null);
  setLandingImagePreview("");
  setLandingImageSource(null);
  setValue("content.landingScreen.image", "");
  // Clear both inputs
  const fileInput = document.getElementById('landing-image-file') as HTMLInputElement;
  const urlInput = document.getElementById('landing-image-url') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';
};
const [isSubmitting, setIsSubmitting] = useState(false);

  const [newService, setNewService] = useState<Omit<Service, "id">>({
    name: "",
    description: "",
    branches:[]
  })

  const [newOffer, setNewOffer] = useState<Omit<Offer, "id">>({
    offer: "",
    price: "",
    description: "",
    image: "",
        branches:[]

  })


  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, "id">>({
    name: "",
    specialization: "",
    image: "",
        branches:[]

  })


  const platforms: Array<keyof LandingPageFormData["platforms"]> = [
    "facebook",
    "instagram",
    "x",
    "tiktok",
    "google",
    "snapchat",
  ]

  // Toggle section visibility and trigger validation
  const toggleSection = async (section: keyof LandingPageFormData["showSections"]) => {
    const newShowSections = {
      ...showSections,
      [section]: !showSections[section],
    };
    setShowSections(newShowSections);
    setValue(`showSections.${section}`, !showSections[section]);

    // If section is being closed, reset its content
    if (showSections[section]) {
      switch (section) {
        case "landingScreen":
          setValue("content.landingScreen", {
            title: "",
            subtitle: "",
            description: "",
            image: "",
          });
          setLandingImage(null);
          setLandingImagePreview("");
          break;
        case "services":
          setServices([]);
          setValue("content.services", []);
          break;
        case "offers":
          setOffers([]);
          setValue("content.offers", []);
          setOffersPreviews([]);
          break;
        case "doctors":
          setDoctors([]);
          setValue("content.doctors", []);
          setDoctorsPreviews([]);
          break;
        default:
          break;
      }
    }

    // Re-trigger validation when section visibility changes
    await trigger(`content.${section}`);
  };

  // Helper function to handle file uploads (without creating a preview URL)


// Update your state declarations
const [offersPreviews, setOffersPreviews] = useState<string[]>([]);

const [doctorsPreviews, setDoctorsPreviews] = useState<string[]>([]);

// Helper function to get image URL or preview
const getImagePreview = (image: string | File | null): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (image instanceof File) return URL.createObjectURL(image);
  return '';
};

// Updated addOffer function
// Update the addOffer function
const addOffer = async () => {
  if (newOffer.offer && newOffer.price) {
    const offerToAdd = {
      ...newOffer,
      image: newOffer.image || '',
      branches: newOffer.branches || []
    };
    
    const updatedOffers = [...offers, offerToAdd];
    setOffers(updatedOffers);
    setValue("content.offers", updatedOffers);
    
    // Reset form
    setNewOffer({ 
      offer: "", 
      price: "", 
      description: "", 
      image: "",
      branches: [] 
    });
  }
}

// Update the offer image handlers
const handleOfferImageChange = (index: number, value: string | File | null) => {
  const updatedOffers = [...offers];
  updatedOffers[index].image = value || '';
  setOffers(updatedOffers);
  setValue(`content.offers.${index}.image`, value || '');
  
  // Update preview
  const updatedPreviews = [...offersPreviews];
  updatedPreviews[index] = value ? getImagePreview(value) : '';
  setOffersPreviews(updatedPreviews);
};



// Updated removeOffer function
const removeOffer = (index: number) => {
  const updatedOffers = offers.filter((_, i) => i !== index);
  setOffers(updatedOffers);
  setValue("content.offers", updatedOffers);
  
  // Update previews
  const updatedPreviews = [...offersPreviews];
  updatedPreviews.splice(index, 1);
  setOffersPreviews(updatedPreviews);
  
  trigger("content.offers");
};


// Updated offer image handler
const handleOfferImage = (index: number, value: string | File) => {
  const updatedOffers = [...offers];
  updatedOffers[index].image = value;
  setOffers(updatedOffers);
  setValue(`content.offers.${index}.image`, value);
  
  // Update preview
  const updatedPreviews = [...offersPreviews];
  updatedPreviews[index] = getImagePreview(value);
  setOffersPreviews(updatedPreviews);
};
// For offers


// Similar updates for doctors
const addDoctor = async () => {
  if (newDoctor.name && newDoctor.specialization) {
    const doctorToAdd = {
      ...newDoctor,
      image: newDoctor.image || '',
      branches: newDoctor.branches || []
    };
    
    const updatedDoctors = [...doctors, doctorToAdd];
    setDoctors(updatedDoctors);
    setValue("content.doctors", updatedDoctors);
    
    // Reset form
    setNewDoctor({ 
      name: "", 
      specialization: "", 
      image: "",
      branches: [] 
    });
  }
}

const addService = () => {
  if (newService.name && newService.description) {
    const updatedServices = [...services, { 
      ...newService,
      branches: newService.branches || [] 
    }]
    setServices(updatedServices)
    setValue("content.services", updatedServices)
    setNewService({ 
      name: "", 
      description: "",
      branches: [] 
    })
    trigger("content.services")
  }
}

  const removeService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index)
    setServices(updatedServices)
    setValue("content.services", updatedServices)
    trigger("content.services") // Trigger validation after removing
  }
// Updated doctor image handler
// const handleDoctorImage = (index: number, value: string | File) => {
//   const updatedDoctors = [...doctors];
//   updatedDoctors[index].image = value;
//   setDoctors(updatedDoctors);
//   setValue(`content.doctors.${index}.image`, value);
  
//   // Update preview
//   const updatedPreviews = [...doctorsPreviews];
//   updatedPreviews[index] = getImagePreview(value);
//   setDoctorsPreviews(updatedPreviews);
// };

// Updated form submission
const onSubmit: SubmitHandler<LandingPageFormData> = async (data) => {
  setIsSubmitting(true);

  try {
    const formData = new FormData();
    
    // Basic info
    formData.append('creator', data.creator);
    formData.append('title', data.title);
    formData.append('platforms', JSON.stringify(data.platforms));
    formData.append('showSections', JSON.stringify(data.showSections));

    // Handle landing image
    if (landingImage instanceof File) {
      formData.append('landingImage', landingImage);
    } else if (typeof landingImage === 'string') {
      formData.append('landingImageUrl', landingImage);
    }

    // Prepare offers data and handle offer images
   const offersWithImages = data.content.offers.map((offer, index) => {
    if (offer.image instanceof File) {
      formData.append(`offerImages`, offer.image);
      return {
        ...offer,
        image: `offer_${index}.jpg`,
        branches: offer.branches || []
      };
    }
    return {
      ...offer,
      branches: offer.branches || []
    };
  });

  // Prepare doctors data with branches
  const doctorsWithImages = data.content.doctors.map((doctor, index) => {
    if (doctor.image instanceof File) {
      formData.append(`doctorImages`, doctor.image);
      return {
        ...doctor,
        image: `doctor_${index}.jpg`,
        branches: doctor.branches || []
      };
    }
    return {
      ...doctor,
      branches: doctor.branches || []
    };
  });

  // Prepare services with branches
  const servicesWithBranches = data.content.services?.map(service => ({
    ...service,
    branches: service.branches || []
  })) || [];

  // Prepare the content object
  const content = {
    ...data.content,
    landingScreen: {
      ...data.content.landingScreen,
      image: landingImage instanceof File ? 'landing.jpg' : landingImage || ''
    },
    offers: offersWithImages,
    doctors: doctorsWithImages,
    services: servicesWithBranches
  };

    formData.append('content', JSON.stringify(content));

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
    
    console.log("Success:", response.data);
    setIsSubmitting(false);

    // Reset form
    reset();
    setServices([]);
    setOffers([]);
    setDoctors([]);
    setLandingImage(null);
    setLandingImagePreview("");
    setOffersPreviews([]);
    setDoctorsPreviews([]);
    
  } catch (error) {
    console.error("Error:", error);
    setIsSubmitting(false);
  }
};
  const removeDoctor = (index: number) => {
    const updatedDoctors = doctors.filter((_, i) => i !== index)
    setDoctors(updatedDoctors)
    setValue("content.doctors", updatedDoctors)
    trigger("content.doctors") // Trigger validation after removing
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-right">نموذج إضافة صفحة هبوط</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info - Always shown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right">معلومات أساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">المنشئ</label>
              <input
                {...register("creator")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
              {errors.creator && <p className="text-red-500 text-xs mt-1 text-right">{errors.creator.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">عنوان الصفحة</label>
              <input
                {...register("title")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1 text-right">{errors.title.message}</p>}
            </div>
                     <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 text-right">المنصات</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {platforms.map((platform) => (
                  <label key={platform} className="flex items-center justify-end gap-2 text-right" style={{display:"flex"}}>
                    <span className="text-sm text-gray-600 ">{platform}</span>
                    <input
                      type="checkbox"
                      {...register(`platforms.${platform}`)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      

       

   
         <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right">إظهار الأقسام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-medium text-gray-700 mt-3">شاشة الهبوط</label>
              <input
                type="checkbox"
                checked={showSections.landingScreen}
                onChange={() => toggleSection("landingScreen")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-medium text-gray-700  mt-3">الخدمات</label>
              <input
                type="checkbox"
                checked={showSections.services}
                onChange={() => toggleSection("services")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div> 
             <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-medium text-gray-700  mt-3">العروض</label>
              <input
                type="checkbox"
                checked={showSections.offers}
                onChange={() => toggleSection("offers")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-medium text-gray-700  mt-3">الأطباء</label>
              <input
                type="checkbox"
                checked={showSections.doctors}
                onChange={() => toggleSection("doctors")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div> 
        </div> 

        {/* Landing Screen - Conditionally shown */}
       {showSections.landingScreen && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right">شاشة الهبوط</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">العنوان</label>
                <input
                  {...register("content.landingScreen.title")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
                {errors.content?.landingScreen?.title && (
                  <p className="text-red-500 text-xs mt-1 text-right">{errors.content.landingScreen.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">العنوان الفرعي</label>
                <input
                  {...register("content.landingScreen.subtitle")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
                {errors.content?.landingScreen?.subtitle && (
                  <p className="text-red-500 text-xs mt-1 text-right">{errors.content.landingScreen.subtitle.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الوصف</label>
                <textarea
                  {...register("content.landingScreen.description")}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
                {errors.content?.landingScreen?.description && (
                  <p className="text-red-500 text-xs mt-1 text-right">
                    {errors.content.landingScreen.description.message}
                  </p>
                )}
              </div>
     <div className="mt-2">
  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">صورة الخلفية</label>
  
  {/* File upload input */}
  <div className="flex items-center gap-2 mb-2">
    <input
      id="landing-image-file"
      type="file"
      accept="image/*"
      onChange={handleLandingImageChange}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {landingImageSource === "file" && (
      <button
        type="button"
        onClick={removeLandingImage}
        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        إزالة
      </button>
    )}
  </div>
  
  {/* OR separator */}
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center">
      <span className="px-2 bg-white text-sm text-gray-500">أو</span>
    </div>
  </div>
  
  {/* URL input */}
  <div className="flex items-center gap-2">
    <input
      id="landing-image-url"
      type="url"
      placeholder="أدخل رابط الصورة"
      onChange={handleLandingImageUrlChange}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
    />
    {landingImageSource === "url" && (
      <button
        type="button"
        onClick={removeLandingImage}
        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        إزالة
      </button>
    )}
  </div>
  
  {/* Image preview */}
  {landingImagePreview && (
    <div className="mt-4 relative">
      <img
        src={landingImagePreview}
        alt="معاينة صورة الخلفية"
        className="w-32 h-32 object-cover rounded-md border"
      />
      <button
        type="button"
        onClick={removeLandingImage}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        title="إزالة الصورة"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )}
  
  {errors.content?.landingScreen?.image && (
    <p className="text-red-500 text-xs mt-1 text-right">{errors.content.landingScreen.image.message}</p>
  )}
</div>
            </div>
            <button
              type="button"
              onClick={() => toggleSection("landingScreen")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"  
            >
              {showSections.landingScreen ? "إخفاء شاشة الهبوط" : "إظهار شاشة الهبوط"}  
            </button>
          </div>
        )} 
        {/* Services - Conditionally shown */}
{showSections.services && (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right">الخدمات</h2>
    
    {/* Existing services selection */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2 text-right">اختر من الخدمات الموجودة</label>
      <select
        onChange={(e) => {
          if (e.target.value) {
            handleExistingServiceSelect(e.target.value);
            e.target.value = ""; // Reset the select
          }
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
      >
        <option value="">اختر خدمة...</option>
        {existingServices
          .filter(service => !selectedExistingServices.includes(service.id))
          .map(service => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
      </select>
    </div>

    {/* Services list */}
    {services.map((service, index) => (
      <div key={index} className="bg-white p-3 rounded shadow border border-gray-200 mb-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-700">{service.name}</h3>
          <button
            type="button"
            onClick={() => removeService(index)}
            className="text-red-500 hover:text-red-700"
          >
            حذف
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1 text-right">{service.description}</p>
        
        {/* Branches for this service */}
        <div className="mt-2">
          <BranchSelector
            selectedBranches={service.branches}
            onChange={(branches : string[]) => {
              const updatedServices = [...services];
              updatedServices[index].branches = branches;
              setServices(updatedServices);
              setValue("content.services", updatedServices);
            }}
          />
        </div>
      </div>
    ))}

    {/* Add new service form */}
    <div className="bg-white p-4 rounded shadow border border-gray-200 mt-4">
      <h3 className="font-medium text-gray-700 mb-2 text-right">إضافة خدمة جديدة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">اسم الخدمة</label>
          <input
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">وصف الخدمة</label>
          <input
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          />
        </div>
      </div>
      
      {/* Branches selector */}
      <div className="mt-3">
        <BranchSelector
          selectedBranches={newService.branches}
          onChange={(branches : string[]) => setNewService({...newService, branches})}
        />
      </div>

      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={addService}
          disabled={!newService.name || !newService.description}
          className={`px-4 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            !newService.name || !newService.description ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          إضافة خدمة
        </button>
      </div>
    </div>

    <button
      type="button"
      onClick={() => toggleSection("services")}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"    
    >
      {showSections.services ? "إخفاء الخدمات" : "إظهار الخدمات"}
    </button>
  </div>
)}

        {/* Offers - Conditionally shown */}
    {showSections.offers && (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right">العروض</h2>
      
      {/* Add existing offers selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">اختر من العروض الموجودة</label>
        <select
          onChange={(e) => handleExistingOfferSelect(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          value=""
        >
          <option value="">اختر عرض...</option>
          {existingOffers
            .filter(offer => !selectedExistingOffers.includes(offer.id))
            .map(offer => (
              <option key={offer.id} value={offer.id}>
                {offer.title} - {offer.priceAfter}
              </option>
            ))}
        </select>
      </div>

            {errors.content?.offers && (
              <p className="text-red-500 text-sm mb-2 text-right">{errors.content.offers.message}</p>
            )}

            <div className="space-y-4">
              {offers.map((offer, index) => (
                <div key={index} className="bg-white p-3 rounded shadow border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">{offer.offer}</h3>
                    <button type="button" onClick={() => removeOffer(index)} className="text-red-500 hover:text-red-700">
                      حذف
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">السعر: {offer.price}</p>
                  {offer.description && (
                    <p className="text-sm text-gray-600 mt-1 text-right">الوصف: {offer.description}</p>
                  )}
                  <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">تغيير الصورة</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleOfferImageChange(index, file);
                }
              }}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
            />
            <input
              type="url"
              value={typeof offer.image === 'string' ? offer.image : ''}
              onChange={(e) => handleLandingImageUrlChange(  e)}
              placeholder="رابط الصورة"
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs text-right"
            />
          </div>
          <div className="mt-1">
            <img
              src={offersPreviews[index] || 'https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA='}
              alt="صورة العرض"
              className="w-16 h-16 object-cover rounded-md border"
            />
          </div>
        </div>
                </div>
              ))}

              <div className="bg-white p-4 rounded shadow border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2 text-right">إضافة عرض جديد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">العرض</label>
                    <input
                      value={newOffer.offer}
                      onChange={(e) => setNewOffer({ ...newOffer, offer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">السعر</label>
                    <input
                      value={newOffer.price}
                      onChange={(e) => setNewOffer({ ...newOffer, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">الوصف (اختياري)</label>
                    <input
                      value={newOffer.description || ""}
                      onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </div>
                  <div className="md:col-span-2">
      <BranchSelector
        selectedBranches={newOffer.branches || []}
        onChange={(branches : string[]) => setNewOffer({...newOffer, branches})}
      />
    </div>
          <div className="mt-2">
    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">صورة العرض</label>
    {/*
      For the new offer, its index will be offers.length (since it's not added yet).
      We'll use this index for preview and handlers.
    */}
    <div className="flex items-center gap-2 mb-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setNewOffer({ ...newOffer, image: file });
        }}
        className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
      />
      {typeof newOffer.image === 'object' && newOffer.image && (
        <button
          type="button"
          onClick={() => setNewOffer({ ...newOffer, image: "" })}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
        >
          إزالة
        </button>
      )}
    </div>
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="px-2 bg-white text-xs text-gray-500">أو</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="url"
        value={typeof newOffer.image === 'string' ? newOffer.image : ''}
        onChange={(e) => setNewOffer({ ...newOffer, image: e.target.value })}
        placeholder="رابط الصورة"
        className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs text-right"
      />
      {typeof newOffer.image === 'string' && newOffer.image && (
        <button
          type="button"
          onClick={() => setNewOffer({ ...newOffer, image: "" })}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
        >
          إزالة
        </button>
      )}
    </div>
    {(newOffer.image instanceof File || typeof newOffer.image === 'string') && newOffer.image && (
      <div className="mt-2 relative">
        <img
          src={getImagePreview(newOffer.image)}
          alt="معاينة صورة العرض"
          className="w-16 h-16 object-cover rounded-md border"
        />
        <button
          type="button"
          onClick={() => setNewOffer({ ...newOffer, image: "" })}
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
          title="إزالة الصورة"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}
  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={addOffer}
                    className="px-4 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    إضافة عرض
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleSection("offers")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showSections.offers ? "إخفاء العروض" : "إظهار العروض"}
            </button>
          </div>
        )} 

        {/* Doctors - Conditionally shown */}
        {showSections.doctors && (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right">الأطباء</h2>
      
      {/* Add existing doctors selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">اختر من الأطباء الموجودين</label>
        <select
          onChange={(e) => handleExistingDoctorSelect(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          value=""
        >
          <option value="">اختر طبيب...</option>
          {existingDoctors
            .filter(doctor => !selectedExistingDoctors.includes(doctor.id))
            .map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialty}
              </option>
            ))}
        </select>
      </div>
            {errors.content?.doctors && (
              <p className="text-red-500 text-sm mb-2 text-right">{errors.content.doctors.message}</p>
            )}

            <div className="space-y-4">
              {doctors.map((doctor, index) => (
                <div key={index} className="bg-white p-3 rounded shadow border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">{doctor.name}</h3>
                    <button type="button" onClick={() => removeDoctor(index)} className="text-red-500 hover:text-red-700">
                      حذف
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">التخصص: {doctor.specialization}</p>
                  {doctor.image && (
                    <div className="mt-2">
                      {typeof doctor.image === "string" ? (
                        <img
                          src={doctor.image || "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA="}
                          alt="صورة الطبيب"
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      ) : (    <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">تغيير الصورة</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleOfferImageChange(index, file);
                }
              }}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
            />
            <input
              type="url"
              value={typeof doctor.image === 'string' ? doctor.image : ''}
              onChange={(e) => handleOfferImage(index, e.target.value)}
              placeholder="رابط الصورة"
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs text-right"
            />
          </div>
          <div className="mt-1">
            <img
              src={doctorsPreviews[index] || 'https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA='}
              alt="صورة العرض"
              className="w-16 h-16 object-cover rounded-md border"
            />
          </div>
        </div>
                              )}
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-white p-4 rounded shadow border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2 text-right">إضافة طبيب جديد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">اسم الطبيب</label>
                    <input
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">التخصص</label>
                    <input
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  </div>
                   <div className="md:col-span-2">
      <BranchSelector
        selectedBranches={newDoctor.branches || []}
        onChange={(branches : string[]) => setNewDoctor({...newDoctor, branches})}
      />
    </div>
              <div className="bg-gray-50 p-4 rounded-lg">
    {/* ... other offer fields ... */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 text-right">صورة الطبيب</label>
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setNewDoctor({ ...newDoctor, image: file });
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          value={typeof newDoctor.image === 'string' ? newDoctor.image : ''}
          onChange={(e) => setNewDoctor({ ...newDoctor, image: e.target.value })}
          placeholder="أو أدخل رابط الصورة"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
        />
        {(newDoctor.image instanceof File || typeof newDoctor.image === 'string') && (
          <div className="mt-2">
            <img
              src={getImagePreview(newDoctor.image) || "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA=" }
              alt="معاينة صورة العرض"
              className="w-16 h-16 object-cover rounded-md border"
            />
          </div>
        )}
      </div>
    
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={addDoctor}
                    className="px-4 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    إضافة طبيب
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        <button 
          type="button"
          onClick={() => toggleSection("doctors")}  
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showSections.doctors ? "إخفاء الأطباء" : "إظهار الأطباء"}
        </button>
          </div>
        )} 
        <div className="flex justify-end">
       <button
  type="submit"
  disabled={isSubmitting}
  className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الصفحة'}
</button>
        </div>
        </form>

        
      <DataTable
        data={landingPages}
        // onView={(row) => console.log('View:', row)}
        // onEdit={(row) => console.log('Edit:', row)}
        // onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  )
}

export default LandingPageForm
