import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import DataTable from "./table";
import axios from "axios";
import BranchSelector from "./brancheSelector";
const API_URL = 'http://localhost:3000/landingPage';
export const createLandingPage = async (data) => {
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
});
// Conditional validation schema
const createValidationSchema = (showSections) => {
    return baseSchema.concat(yup.object().shape({
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
                    .of(yup.object().shape({
                    name: yup.string().required("اسم الخدمة مطلوب"),
                    description: yup.string().required("وصف الخدمة مطلوب"),
                    branches: yup.array().of(yup.string()).min(1, "يجب اختيار فرع واحد على الأقل"),
                }))
                    .min(1, "يجب إضافة خدمة واحدة على الأقل")
                : yup.array().notRequired(),
            offers: showSections.offers
                ? yup
                    .array()
                    .of(yup.object().shape({
                    offer: yup.string().required("اسم العرض مطلوب"),
                    price: yup.string().required("سعر العرض مطلوب"),
                    description: yup.string().notRequired(),
                    image: yup.mixed().required("صورة العرض مطلوبة"),
                    branches: yup.array().of(yup.string()).min(1, "يجب اختيار فرع واحد على الأقل"),
                }))
                    .min(1, "يجب إضافة عرض واحد على الأقل")
                : yup.array().notRequired(),
            doctors: showSections.doctors
                ? yup
                    .array()
                    .of(yup.object().shape({
                    name: yup.string().required("اسم الطبيب مطلوب"),
                    specialization: yup.string().required("تخصص الطبيب مطلوب"),
                    image: yup.mixed().required("صورة الطبيب مطلوبة"),
                    branches: yup.array().of(yup.string()).min(1, "يجب اختيار فرع واحد على الأقل"),
                }))
                    .min(1, "يجب إضافة طبيب واحد على الأقل")
                : yup.array().notRequired(),
        })
    }));
};
const LandingPageForm = () => {
    const [showSections, setShowSections] = useState({
        landingScreen: false,
        services: false,
        offers: false,
        doctors: false,
    });
    // Initialize showSections based on default values
    const [landingPages, setLandingPages] = useState([]);
    const [, setLoading] = useState(true);
    const [existingDoctors, setExistingDoctors] = useState([]);
    const [existingServices, setExistingServices] = useState([]);
    const [existingOffers, setExistingOffers] = useState([]);
    const [selectedExistingDoctors, setSelectedExistingDoctors] = useState([]);
    const [selectedExistingServices, setSelectedExistingServices] = useState([]);
    const [selectedExistingOffers, setSelectedExistingOffers] = useState([]);
    useEffect(() => {
        const getLandingPages = async () => {
            try {
                const response = await axios.get(API_URL, { headers: { 'Content-Type': 'application/json',
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`
                    } });
                const sorted = [...response.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setLandingPages(sorted);
            }
            catch (error) {
                console.error('Error fetching landing pages:', error);
            }
            finally {
                setLoading(false);
            }
        };
        getLandingPages();
    }, []);
    const { register, handleSubmit, formState: { errors }, setValue, trigger, reset, } = useForm({
        resolver: yupResolver(createValidationSchema(showSections)),
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
    });
    const [services, setServices] = useState([]);
    const [offers, setOffers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    // State for landing image
    const [landingImage, setLandingImage] = useState(null);
    const [landingImagePreview, setLandingImagePreview] = useState("");
    const [landingImageSource, setLandingImageSource] = useState(null);
    useEffect(() => {
        const fetchExistingData = async () => {
            try {
                // Fetch existing doctors
                const doctorsRes = await axios.get('http://localhost:3000/doctors', {
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                });
                setExistingDoctors(doctorsRes.data);
                // Fetch existing services
                const servicesRes = await axios.get('http://localhost:3000/services', {
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                });
                setExistingServices(servicesRes.data);
                // Fetch existing offers
                const offersRes = await axios.get('http://localhost:3000/offers', {
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                });
                setExistingOffers(offersRes.data);
            }
            catch (error) {
                console.error('Error fetching existing data:', error);
            }
        };
        fetchExistingData();
    }, []);
    // Add these handler functions
    const handleExistingDoctorSelect = (doctorId) => {
        const doctor = existingDoctors.find(d => d.id === doctorId);
        if (!doctor)
            return;
        const newDoctor = {
            name: doctor.name,
            specialization: doctor.specialty,
            image: doctor.image || '',
            branches: doctor.branches.map(String) || []
        };
        setDoctors([...doctors, newDoctor]);
        setValue("content.doctors", [...doctors, newDoctor]);
        setSelectedExistingDoctors([...selectedExistingDoctors, doctorId]);
    };
    const handleExistingServiceSelect = (serviceId) => {
        const service = existingServices.find(s => s.id === serviceId);
        if (!service)
            return;
        const newService = {
            name: service.name,
            description: service.description,
            branches: service.branches || [],
        };
        setServices([...services, newService]);
        setValue("content.services", [...services, newService]);
        setSelectedExistingServices([...selectedExistingServices, serviceId]);
    };
    const handleExistingOfferSelect = (offerId) => {
        const offer = existingOffers.find(o => o.id === offerId);
        if (!offer)
            return;
        const newOffer = {
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
    const handleLandingImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setLandingImage(file);
            setLandingImagePreview(URL.createObjectURL(file));
            setLandingImageSource("file");
            setValue("content.landingScreen.image", file);
            // Clear URL input
            const urlInput = document.getElementById('landing-image-url');
            if (urlInput)
                urlInput.value = '';
        }
    };
    // Handler for URL input
    const handleLandingImageUrlChange = (e) => {
        const url = e.target.value.trim();
        if (url) {
            setLandingImage(url);
            setLandingImagePreview(url);
            setLandingImageSource("url");
            setValue("content.landingScreen.image", url);
            // Clear file input
            const fileInput = document.getElementById('landing-image-file');
            if (fileInput)
                fileInput.value = '';
        }
    };
    // Handler to remove image
    const removeLandingImage = () => {
        setLandingImage(null);
        setLandingImagePreview("");
        setLandingImageSource(null);
        setValue("content.landingScreen.image", "");
        // Clear both inputs
        const fileInput = document.getElementById('landing-image-file');
        const urlInput = document.getElementById('landing-image-url');
        if (fileInput)
            fileInput.value = '';
        if (urlInput)
            urlInput.value = '';
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newService, setNewService] = useState({
        name: "",
        description: "",
        branches: []
    });
    const [newOffer, setNewOffer] = useState({
        offer: "",
        price: "",
        description: "",
        image: "",
        branches: []
    });
    const [newDoctor, setNewDoctor] = useState({
        name: "",
        specialization: "",
        image: "",
        branches: []
    });
    const platforms = [
        "facebook",
        "instagram",
        "x",
        "tiktok",
        "google",
        "snapchat",
    ];
    // Toggle section visibility and trigger validation
    const toggleSection = async (section) => {
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
    const [offersPreviews, setOffersPreviews] = useState([]);
    const [doctorsPreviews, setDoctorsPreviews] = useState([]);
    // Helper function to get image URL or preview
    const getImagePreview = (image) => {
        if (!image)
            return '';
        if (typeof image === 'string')
            return image;
        if (image instanceof File)
            return URL.createObjectURL(image);
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
    };
    // Update the offer image handlers
    const handleOfferImageChange = (index, value) => {
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
    const removeOffer = (index) => {
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
    const handleOfferImage = (index, value) => {
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
    };
    const addService = () => {
        if (newService.name && newService.description) {
            const updatedServices = [...services, {
                    ...newService,
                    branches: newService.branches || []
                }];
            setServices(updatedServices);
            setValue("content.services", updatedServices);
            setNewService({
                name: "",
                description: "",
                branches: []
            });
            trigger("content.services");
        }
    };
    const removeService = (index) => {
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
        setValue("content.services", updatedServices);
        trigger("content.services"); // Trigger validation after removing
    };
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
    const onSubmit = async (data) => {
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
            }
            else if (typeof landingImage === 'string') {
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
        }
        catch (error) {
            console.error("Error:", error);
            setIsSubmitting(false);
        }
    };
    const removeDoctor = (index) => {
        const updatedDoctors = doctors.filter((_, i) => i !== index);
        setDoctors(updatedDoctors);
        setValue("content.doctors", updatedDoctors);
        trigger("content.doctors"); // Trigger validation after removing
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-6 text-right", children: "\u0646\u0645\u0648\u0630\u062C \u0625\u0636\u0627\u0641\u0629 \u0635\u0641\u062D\u0629 \u0647\u0628\u0648\u0637" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right", children: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0623\u0633\u0627\u0633\u064A\u0629" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0645\u0646\u0634\u0626" }), _jsx("input", { ...register("creator"), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" }), errors.creator && _jsx("p", { className: "text-red-500 text-xs mt-1 text-right", children: errors.creator.message })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0635\u0641\u062D\u0629" }), _jsx("input", { ...register("title"), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" }), errors.title && _jsx("p", { className: "text-red-500 text-xs mt-1 text-right", children: errors.title.message })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0645\u0646\u0635\u0627\u062A" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 mt-2", children: platforms.map((platform) => (_jsxs("label", { className: "flex items-center justify-end gap-2 text-right", style: { display: "flex" }, children: [_jsx("span", { className: "text-sm text-gray-600 ", children: platform }), _jsx("input", { type: "checkbox", ...register(`platforms.${platform}`), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" })] }, platform))) })] })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right", children: "\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0623\u0642\u0633\u0627\u0645" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mt-3", children: "\u0634\u0627\u0634\u0629 \u0627\u0644\u0647\u0628\u0648\u0637" }), _jsx("input", { type: "checkbox", checked: showSections.landingScreen, onChange: () => toggleSection("landingScreen"), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" })] }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700  mt-3", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A" }), _jsx("input", { type: "checkbox", checked: showSections.services, onChange: () => toggleSection("services"), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" })] }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700  mt-3", children: "\u0627\u0644\u0639\u0631\u0648\u0636" }), _jsx("input", { type: "checkbox", checked: showSections.offers, onChange: () => toggleSection("offers"), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" })] }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700  mt-3", children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" }), _jsx("input", { type: "checkbox", checked: showSections.doctors, onChange: () => toggleSection("doctors"), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" })] })] })] }), showSections.landingScreen && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right", children: "\u0634\u0627\u0634\u0629 \u0627\u0644\u0647\u0628\u0648\u0637" }), _jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx("input", { ...register("content.landingScreen.title"), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" }), errors.content?.landingScreen?.title && (_jsx("p", { className: "text-red-500 text-xs mt-1 text-right", children: errors.content.landingScreen.title.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639\u064A" }), _jsx("input", { ...register("content.landingScreen.subtitle"), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" }), errors.content?.landingScreen?.subtitle && (_jsx("p", { className: "text-red-500 text-xs mt-1 text-right", children: errors.content.landingScreen.subtitle.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0648\u0635\u0641" }), _jsx("textarea", { ...register("content.landingScreen.description"), rows: 3, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" }), errors.content?.landingScreen?.description && (_jsx("p", { className: "text-red-500 text-xs mt-1 text-right", children: errors.content.landingScreen.description.message }))] }), _jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u062E\u0644\u0641\u064A\u0629" }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("input", { id: "landing-image-file", type: "file", accept: "image/*", onChange: handleLandingImageChange, className: "flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }), landingImageSource === "file" && (_jsx("button", { type: "button", onClick: removeLandingImage, className: "px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600", children: "\u0625\u0632\u0627\u0644\u0629" }))] }), _jsxs("div", { className: "relative my-4", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center", children: _jsx("span", { className: "px-2 bg-white text-sm text-gray-500", children: "\u0623\u0648" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { id: "landing-image-url", type: "url", placeholder: "\u0623\u062F\u062E\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", onChange: handleLandingImageUrlChange, className: "flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" }), landingImageSource === "url" && (_jsx("button", { type: "button", onClick: removeLandingImage, className: "px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600", children: "\u0625\u0632\u0627\u0644\u0629" }))] }), landingImagePreview && (_jsxs("div", { className: "mt-4 relative", children: [_jsx("img", { src: landingImagePreview, alt: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0635\u0648\u0631\u0629 \u0627\u0644\u062E\u0644\u0641\u064A\u0629", className: "w-32 h-32 object-cover rounded-md border" }), _jsx("button", { type: "button", onClick: removeLandingImage, className: "absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600", title: "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u0631\u0629", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })), errors.content?.landingScreen?.image && (_jsx("p", { className: "text-red-500 text-xs mt-1 text-right", children: errors.content.landingScreen.image.message }))] })] }), _jsx("button", { type: "button", onClick: () => toggleSection("landingScreen"), className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: showSections.landingScreen ? "إخفاء شاشة الهبوط" : "إظهار شاشة الهبوط" })] })), showSections.services && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 text-right", children: "\u0627\u062E\u062A\u0631 \u0645\u0646 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0648\u062C\u0648\u062F\u0629" }), _jsxs("select", { onChange: (e) => {
                                            if (e.target.value) {
                                                handleExistingServiceSelect(e.target.value);
                                                e.target.value = ""; // Reset the select
                                            }
                                        }, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right", children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u062E\u062F\u0645\u0629..." }), existingServices
                                                .filter(service => !selectedExistingServices.includes(service.id))
                                                .map(service => (_jsx("option", { value: service.id, children: service.name }, service.id)))] })] }), services.map((service, index) => (_jsxs("div", { className: "bg-white p-3 rounded shadow border border-gray-200 mb-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "font-medium text-gray-700", children: service.name }), _jsx("button", { type: "button", onClick: () => removeService(index), className: "text-red-500 hover:text-red-700", children: "\u062D\u0630\u0641" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1 text-right", children: service.description }), _jsx("div", { className: "mt-2", children: _jsx(BranchSelector, { selectedBranches: service.branches, onChange: (branches) => {
                                                const updatedServices = [...services];
                                                updatedServices[index].branches = branches;
                                                setServices(updatedServices);
                                                setValue("content.services", updatedServices);
                                            } }) })] }, index))), _jsxs("div", { className: "bg-white p-4 rounded shadow border border-gray-200 mt-4", children: [_jsx("h3", { className: "font-medium text-gray-700 mb-2 text-right", children: "\u0625\u0636\u0627\u0641\u0629 \u062E\u062F\u0645\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0633\u0645 \u0627\u0644\u062E\u062F\u0645\u0629" }), _jsx("input", { value: newService.name, onChange: (e) => setNewService({ ...newService, name: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0648\u0635\u0641 \u0627\u0644\u062E\u062F\u0645\u0629" }), _jsx("input", { value: newService.description, onChange: (e) => setNewService({ ...newService, description: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" })] })] }), _jsx("div", { className: "mt-3", children: _jsx(BranchSelector, { selectedBranches: newService.branches, onChange: (branches) => setNewService({ ...newService, branches }) }) }), _jsx("div", { className: "flex justify-end mt-3", children: _jsx("button", { type: "button", onClick: addService, disabled: !newService.name || !newService.description, className: `px-4 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${!newService.name || !newService.description ? 'opacity-50 cursor-not-allowed' : ''}`, children: "\u0625\u0636\u0627\u0641\u0629 \u062E\u062F\u0645\u0629" }) })] }), _jsx("button", { type: "button", onClick: () => toggleSection("services"), className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: showSections.services ? "إخفاء الخدمات" : "إظهار الخدمات" })] })), showSections.offers && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right", children: "\u0627\u0644\u0639\u0631\u0648\u0636" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 text-right", children: "\u0627\u062E\u062A\u0631 \u0645\u0646 \u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u0645\u0648\u062C\u0648\u062F\u0629" }), _jsxs("select", { onChange: (e) => handleExistingOfferSelect(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right", value: "", children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u0639\u0631\u0636..." }), existingOffers
                                                .filter(offer => !selectedExistingOffers.includes(offer.id))
                                                .map(offer => (_jsxs("option", { value: offer.id, children: [offer.title, " - ", offer.priceAfter] }, offer.id)))] })] }), errors.content?.offers && (_jsx("p", { className: "text-red-500 text-sm mb-2 text-right", children: errors.content.offers.message })), _jsxs("div", { className: "space-y-4", children: [offers.map((offer, index) => (_jsxs("div", { className: "bg-white p-3 rounded shadow border border-gray-200", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "font-medium text-gray-700", children: offer.offer }), _jsx("button", { type: "button", onClick: () => removeOffer(index), className: "text-red-500 hover:text-red-700", children: "\u062D\u0630\u0641" })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["\u0627\u0644\u0633\u0639\u0631: ", offer.price] }), offer.description && (_jsxs("p", { className: "text-sm text-gray-600 mt-1 text-right", children: ["\u0627\u0644\u0648\u0635\u0641: ", offer.description] })), _jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0635\u0648\u0631\u0629" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        handleOfferImageChange(index, file);
                                                                    }
                                                                }, className: "flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs" }), _jsx("input", { type: "url", value: typeof offer.image === 'string' ? offer.image : '', onChange: (e) => handleLandingImageUrlChange(e), placeholder: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", className: "flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs text-right" })] }), _jsx("div", { className: "mt-1", children: _jsx("img", { src: offersPreviews[index] || 'https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA=', alt: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636", className: "w-16 h-16 object-cover rounded-md border" }) })] })] }, index))), _jsxs("div", { className: "bg-white p-4 rounded shadow border border-gray-200", children: [_jsx("h3", { className: "font-medium text-gray-700 mb-2 text-right", children: "\u0625\u0636\u0627\u0641\u0629 \u0639\u0631\u0636 \u062C\u062F\u064A\u062F" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0639\u0631\u0636" }), _jsx("input", { value: newOffer.offer, onChange: (e) => setNewOffer({ ...newOffer, offer: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0633\u0639\u0631" }), _jsx("input", { value: newOffer.price, onChange: (e) => setNewOffer({ ...newOffer, price: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u0648\u0635\u0641 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" }), _jsx("input", { value: newOffer.description || "", onChange: (e) => setNewOffer({ ...newOffer, description: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" })] }), _jsx("div", { className: "md:col-span-2", children: _jsx(BranchSelector, { selectedBranches: newOffer.branches || [], onChange: (branches) => setNewOffer({ ...newOffer, branches }) }) }), _jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636" }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file)
                                                                                setNewOffer({ ...newOffer, image: file });
                                                                        }, className: "flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs" }), typeof newOffer.image === 'object' && newOffer.image && (_jsx("button", { type: "button", onClick: () => setNewOffer({ ...newOffer, image: "" }), className: "px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600", children: "\u0625\u0632\u0627\u0644\u0629" }))] }), _jsxs("div", { className: "relative my-2", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center", children: _jsx("span", { className: "px-2 bg-white text-xs text-gray-500", children: "\u0623\u0648" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "url", value: typeof newOffer.image === 'string' ? newOffer.image : '', onChange: (e) => setNewOffer({ ...newOffer, image: e.target.value }), placeholder: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", className: "flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs text-right" }), typeof newOffer.image === 'string' && newOffer.image && (_jsx("button", { type: "button", onClick: () => setNewOffer({ ...newOffer, image: "" }), className: "px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600", children: "\u0625\u0632\u0627\u0644\u0629" }))] }), (newOffer.image instanceof File || typeof newOffer.image === 'string') && newOffer.image && (_jsxs("div", { className: "mt-2 relative", children: [_jsx("img", { src: getImagePreview(newOffer.image), alt: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636", className: "w-16 h-16 object-cover rounded-md border" }), _jsx("button", { type: "button", onClick: () => setNewOffer({ ...newOffer, image: "" }), className: "absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600", title: "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u0631\u0629", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-3 w-3", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }))] })] }), _jsx("div", { className: "flex justify-end mt-3", children: _jsx("button", { type: "button", onClick: addOffer, className: "px-4 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500", children: "\u0625\u0636\u0627\u0641\u0629 \u0639\u0631\u0636" }) })] })] }), _jsx("button", { type: "button", onClick: () => toggleSection("offers"), className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: showSections.offers ? "إخفاء العروض" : "إظهار العروض" })] })), showSections.doctors && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h2", { className: "text-xl font-bold text-gray-700 mb-4 border-b pb-2 text-right", children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 text-right", children: "\u0627\u062E\u062A\u0631 \u0645\u0646 \u0627\u0644\u0623\u0637\u0628\u0627\u0621 \u0627\u0644\u0645\u0648\u062C\u0648\u062F\u064A\u0646" }), _jsxs("select", { onChange: (e) => handleExistingDoctorSelect(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right", value: "", children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u0637\u0628\u064A\u0628..." }), existingDoctors
                                                .filter(doctor => !selectedExistingDoctors.includes(doctor.id))
                                                .map(doctor => (_jsxs("option", { value: doctor.id, children: [doctor.name, " - ", doctor.specialty] }, doctor.id)))] })] }), errors.content?.doctors && (_jsx("p", { className: "text-red-500 text-sm mb-2 text-right", children: errors.content.doctors.message })), _jsxs("div", { className: "space-y-4", children: [doctors.map((doctor, index) => (_jsxs("div", { className: "bg-white p-3 rounded shadow border border-gray-200", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "font-medium text-gray-700", children: doctor.name }), _jsx("button", { type: "button", onClick: () => removeDoctor(index), className: "text-red-500 hover:text-red-700", children: "\u062D\u0630\u0641" })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["\u0627\u0644\u062A\u062E\u0635\u0635: ", doctor.specialization] }), doctor.image && (_jsx("div", { className: "mt-2", children: typeof doctor.image === "string" ? (_jsx("img", { src: doctor.image || "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA=", alt: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628", className: "w-16 h-16 object-cover rounded-full" })) : (_jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0635\u0648\u0631\u0629" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            handleOfferImageChange(index, file);
                                                                        }
                                                                    }, className: "flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs" }), _jsx("input", { type: "url", value: typeof doctor.image === 'string' ? doctor.image : '', onChange: (e) => handleOfferImage(index, e.target.value), placeholder: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", className: "flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs text-right" })] }), _jsx("div", { className: "mt-1", children: _jsx("img", { src: doctorsPreviews[index] || 'https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA=', alt: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636", className: "w-16 h-16 object-cover rounded-md border" }) })] })) }))] }, index))), _jsxs("div", { className: "bg-white p-4 rounded shadow border border-gray-200", children: [_jsx("h3", { className: "font-medium text-gray-700 mb-2 text-right", children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628 \u062C\u062F\u064A\u062F" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0633\u0645 \u0627\u0644\u0637\u0628\u064A\u0628" }), _jsx("input", { value: newDoctor.name, onChange: (e) => setNewDoctor({ ...newDoctor, name: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0627\u0644\u062A\u062E\u0635\u0635" }), _jsx("input", { value: newDoctor.specialization, onChange: (e) => setNewDoctor({ ...newDoctor, specialization: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" })] }), _jsx("div", { className: "md:col-span-2", children: _jsx(BranchSelector, { selectedBranches: newDoctor.branches || [], onChange: (branches) => setNewDoctor({ ...newDoctor, branches }) }) }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1 text-right", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628" }), _jsxs("div", { className: "space-y-2", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) {
                                                                                        setNewDoctor({ ...newDoctor, image: file });
                                                                                    }
                                                                                }, className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("input", { type: "url", value: typeof newDoctor.image === 'string' ? newDoctor.image : '', onChange: (e) => setNewDoctor({ ...newDoctor, image: e.target.value }), placeholder: "\u0623\u0648 \u0623\u062F\u062E\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" }), (newDoctor.image instanceof File || typeof newDoctor.image === 'string') && (_jsx("div", { className: "mt-2", children: _jsx("img", { src: getImagePreview(newDoctor.image) || "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=170667a&w=0&k=20&c=IyNlM1yfvw2UAitPPF7hIBBsr4IZjZJUDS1C5YgmiwA=", alt: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636", className: "w-16 h-16 object-cover rounded-md border" }) }))] })] }), _jsx("div", { className: "flex justify-end mt-3", children: _jsx("button", { type: "button", onClick: addDoctor, className: "px-4 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500", children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628" }) })] })] })] })] }), _jsx("button", { type: "button", onClick: () => toggleSection("doctors"), className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: showSections.doctors ? "إخفاء الأطباء" : "إظهار الأطباء" })] })), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: isSubmitting, className: `px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`, children: isSubmitting ? 'جاري الحفظ...' : 'حفظ الصفحة' }) })] }), _jsx(DataTable, { data: landingPages })] }));
};
export default LandingPageForm;
