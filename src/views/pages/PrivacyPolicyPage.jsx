import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Truck, MapPin, Camera, Trash2, Mail, Phone, Building } from 'lucide-react';

const PrivacyPolicyPage = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-[#F3F8FF] px-4 md:px-12 py-8 font-nunito">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
                        <p className="text-sm text-gray-500 mt-1">Last Updated: 8 September 2026</p>
                    </div>
                    {/* Quick navigation anchor pills */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        <a
                            href="#customer-policy"
                            className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 font-medium"
                        >
                            <Shield className="w-4 h-4 mr-1.5" />
                            Customer Policy
                        </a>
                        <a
                            href="#delivery-partner"
                            className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 font-medium"
                        >
                            <Truck className="w-4 h-4 mr-1.5" />
                            Delivery Partner Policy
                        </a>
                    </div>
                </div>

                {/* SECTION 1: CUSTOMER / GENERAL PRIVACY POLICY */}
                <section id="customer-policy" className="bg-white p-6 md:p-8 rounded-xl shadow-sm text-gray-600 mb-8 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Customer &amp; Ecommerce Platform Privacy Policy</h2>
                    </div>

                    <p className="mb-4 leading-relaxed">
                        Your privacy is important to us. This policy explains how Bukizz collects, uses, and protects your personal information when using our ecommerce platform and customer services.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Information We Collect</h3>
                    <p className="mb-4 leading-relaxed">
                        We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you create an account, browse, or place an order.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">How We Use Your Information</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1.5 leading-relaxed">
                        <li>To process and deliver your orders accurately.</li>
                        <li>To communicate with you regarding your account, updates, and orders.</li>
                        <li>To enhance our services and personalize your shopping experience.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Sharing</h3>
                    <p className="mb-4 leading-relaxed">
                        We do not sell your personal information. We may share data with trusted third-party service providers (e.g., delivery partners, payment gateways, and logistics providers) solely for the purpose of fulfilling your orders.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Security</h3>
                    <p className="leading-relaxed">
                        We employ industry-standard technical and organizational security measures to protect your personal information from unauthorized access, alteration, or disclosure.
                    </p>
                </section>

                {/* SECTION 2: DELIVERY PARTNER & PLATFORM PRIVACY POLICY */}
                <section id="delivery-partner" className="bg-white p-6 md:p-8 rounded-xl shadow-sm text-gray-600 border border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Truck className="w-6 h-6 text-emerald-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Bukizz Delivery Partner Privacy Policy</h2>
                        </div>
                        <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-full uppercase tracking-wider">
                            Delivery &amp; Logistics
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">Last Updated: 8 September 2026</p>

                    <p className="mb-6 leading-relaxed">
                        Bukizz (&quot;Bukizz&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, retain and protect personal data when you use the Bukizz Ecommerce Platform (bukizz.in and related customer applications), Bukizz Delivery, or the Bukizz Vendor Platform (seller.bukizz.in).
                    </p>

                    {/* 1. Information We Collect */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">1</span>
                            Information We Collect
                        </h3>
                        <div className="space-y-3 pl-2 sm:pl-8">
                            <div>
                                <strong className="text-gray-700">Customers / Users:</strong>
                                <p className="mt-0.5 leading-relaxed">
                                    We may collect your name, mobile number, email address, billing and delivery address, school-related information where required for an order, account information, order history, payment/transaction information, customer-support communications and device/technical information.
                                </p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Delivery Partners:</strong>
                                <p className="mt-0.5 leading-relaxed">
                                    We may collect name, mobile number, email address, address, profile photograph, identity/KYC documents, PAN and driving-licence information where required, vehicle details where applicable, bank account number, account holder name, IFSC code, payout information, delivery activity and location information.
                                </p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Vendors / Sellers:</strong>
                                <p className="mt-0.5 leading-relaxed">
                                    We may collect business and contact details, GST/PAN and other tax information, KYC documents, bank account details, account holder name, IFSC code, product/catalogue information, inventory, order and fulfilment information, and communications with Bukizz.
                                </p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Device, Location and Camera Data:</strong>
                                <p className="mt-0.5 leading-relaxed">
                                    Depending on the service and permissions granted, we may collect device and diagnostic information, approximate or precise location, and camera/photos for GPS navigation, delivery assignment and tracking, arrival/pickup verification, distance calculation, barcode/QR scanning, KYC document upload and profile-photo upload.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. How We Use Your Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">2</span>
                            How We Use Your Information
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            We use personal data only as reasonably necessary to provide and operate Bukizz services, including account creation and management, order processing and delivery, vendor and delivery-partner operations, payment and payout processing, bank/KYC verification, customer support, fraud and security controls, service improvement, and communications relating to your account or transactions.
                        </p>
                    </div>

                    {/* 3. How We Share Your Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">3</span>
                            How We Share Your Information
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            We do not sell your personal data. We may share relevant information with vendors, customers and delivery partners when necessary to fulfil an order; with payment, banking, KYC, logistics, hosting, communications, analytics, security and other service providers that support Bukizz; and with government or law-enforcement authorities where required by law or necessary to protect rights, safety or security.
                        </p>
                    </div>

                    {/* 4. Location and Camera Permissions */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">4</span>
                            Location and Camera Permissions
                        </h3>
                        <div className="pl-2 sm:pl-8 space-y-3">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Location Access (ACCESS_FINE_LOCATION &amp; ACCESS_COARSE_LOCATION):</p>
                                        <p className="mt-0.5">
                                            Bukizz may request precise or approximate location access where required for GPS navigation, delivery assignment and live tracking, arrival or pickup verification, and distance calculations.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 mt-3">
                                    <Camera className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Camera Access:</p>
                                        <p className="mt-0.5">
                                            Bukizz may request camera access for barcode/QR code scanning and for capturing or uploading KYC verification documents and profile photographs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="leading-relaxed">
                                These permissions are used only for the relevant features. You can manage or revoke permissions at any time through your device settings; disabling them may affect related functionality.
                            </p>
                        </div>
                    </div>

                    {/* 5. Payment, Bank and KYC Data */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">5</span>
                            Payment, Bank and KYC Data
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            Payment transactions may be processed by third-party payment providers. Bukizz may process bank account number, account name, IFSC and related verification information for vendor and delivery-partner payouts. KYC or identity documents may be collected where required for onboarding, verification, fraud prevention or legal compliance. We do not intentionally store payment authentication credentials such as UPI PINs or CVVs.
                        </p>
                    </div>

                    {/* 6. Data Retention */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">6</span>
                            Data Retention
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            We retain personal data only for as long as necessary to provide the services, maintain business and transaction records, prevent fraud, resolve disputes, ensure security, and comply with applicable legal, tax, accounting or regulatory requirements. When retention is no longer required, data is deleted or anonymised where reasonably practicable.
                        </p>
                    </div>

                    {/* 7. Account and Data Deletion */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">7</span>
                            Account and Data Deletion
                        </h3>
                        <div className="pl-2 sm:pl-8 space-y-2">
                            <p className="leading-relaxed">
                                You may request deletion of your Bukizz account and associated personal data through the account-deletion option provided in the relevant application or through Bukizz’s web-based account deletion facility. We may retain limited information where required or permitted by law, including for tax/accounting records, fraud prevention, security, dispute resolution or legal claims. Identity verification may be required before processing a deletion request.
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-gray-700">Account / Data Deletion Page: </span>
                                    <a
                                        href="https://bukizz.in/profile"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        https://bukizz.in/profile
                                    </a>
                                    <span className="text-gray-500 ml-1">
                                        (or email <a href="mailto:support@bukizz.com" className="text-blue-600 underline">support@bukizz.com</a> with subject &quot;Account Deletion Request&quot;)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 8. Security */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">8</span>
                            Security
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            We use reasonable technical and organisational security measures to protect personal data against unauthorised access, alteration, disclosure, loss or misuse. No electronic system can be guaranteed to be completely secure.
                        </p>
                    </div>

                    {/* 9. Children */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">9</span>
                            Children
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            Bukizz provides school-related products and services. Where a child uses Bukizz under the supervision or involvement of a parent or lawful guardian, the parent or guardian is responsible for the information provided and use of the service. We follow applicable legal requirements relating to children’s personal data.
                        </p>
                    </div>

                    {/* 10. Your Rights and Grievances */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">10</span>
                            Your Rights and Grievances
                        </h3>
                        <div className="pl-2 sm:pl-8 space-y-3">
                            <p className="leading-relaxed">
                                Subject to applicable law, you may request access to information about processing of your personal data, correction of inaccurate data, deletion where applicable, and withdrawal of consent where processing is based on consent. You may also raise a privacy-related grievance with us.
                            </p>
                            <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2 font-medium">
                                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span><strong>Privacy / Grievance Contact:</strong> Grievance Officer, Bukizz</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span><strong>Email:</strong> <a href="mailto:support@bukizz.com" className="text-blue-600 hover:underline">support@bukizz.com</a> / <a href="mailto:bukizzstore@gmail.com" className="text-blue-600 hover:underline">bukizzstore@gmail.com</a></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span><strong>Phone:</strong> Kanpur: +91 7985978838 | Gurgaon: +91 9369467134</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Building className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span><strong>Address:</strong> Mohan Vila Apartment, Geeta Nagar, Kanpur, Uttar Pradesh 208025, India</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 11. Changes to this Privacy Policy */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">11</span>
                            Changes to this Privacy Policy
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            We may update this Privacy Policy from time to time. The updated version will be published on our website and/or applications with a revised “Last Updated” date. Material changes may also be communicated through appropriate channels.
                        </p>
                    </div>

                    {/* 12. Contact Us */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-xs font-bold">12</span>
                            Contact Us
                        </h3>
                        <p className="pl-2 sm:pl-8 leading-relaxed">
                            For questions or concerns regarding this Privacy Policy or our handling of personal data, please contact the Privacy / Grievance Contact listed above or reach out to us at <a href="mailto:support@bukizz.com" className="text-blue-600 underline font-medium">support@bukizz.com</a>.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;

