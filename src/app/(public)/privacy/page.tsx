import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Garrit & Wulf',
  description: 'Privacy Policy for Garrit & Wulf Auto Parts. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: '#6e0000' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Privacy Policy
            </h1>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-2xl border p-8 md:p-12 space-y-8"
              style={{ 
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a'
              }}
            >
              {/* Introduction */}
              <div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  At Garrit & Wulf, we are committed to protecting your privacy and personal data in accordance with the Federal 
                  Decree Law No. 45 of 2021 on the Protection of Personal Data (UAE Personal Data Protection Law - &quot;PDPL&quot;) and other 
                  applicable laws of the United Arab Emirates.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  This Privacy Policy explains how we, as a data controller, collect, process, store, use, disclose, and protect 
                  your personal data when you visit our website, use our services, or interact with us.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  By using our website and services, you acknowledge that you have read and understood this Privacy Policy and 
                  consent to the collection and processing of your personal data as described herein.
                </p>
              </div>

              {/* Legal Basis and Personal Data */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  1. Legal Basis and Personal Data Collection
                </h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  Legal Basis for Processing
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We process your personal data in compliance with the UAE PDPL based on the following legal grounds:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-white">Your Consent:</strong> When you provide explicit consent for specific processing activities</li>
                  <li><strong className="text-white">Contractual Necessity:</strong> To fulfill our contractual obligations with you</li>
                  <li><strong className="text-white">Legal Obligations:</strong> To comply with UAE laws and regulations</li>
                  <li><strong className="text-white">Legitimate Interests:</strong> For our legitimate business interests that do not override your rights</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3 mt-6">
                  Personal Data We Collect
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We collect personal data that you voluntarily provide when you:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Submit contact forms or inquiry requests</li>
                  <li>Request product quotes or information</li>
                  <li>Create an account or register for services</li>
                  <li>Place orders or make purchases</li>
                  <li>Subscribe to our communications</li>
                  <li>Communicate with us via email, phone, or in person</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  This data may include: full name, email address, telephone number, company name, business address, 
                  trade license information, payment details, and any other information you provide.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3 mt-6">
                  Automatically Collected Data
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When you access our website, we may automatically collect technical data including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>IP address and approximate geographic location</li>
                  <li>Browser type, version, and language settings</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited, time spent, and navigation patterns</li>
                  <li>Referring website or source</li>
                  <li>Date and time of access</li>
                </ul>
              </div>

              {/* How We Use Personal Data */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  2. Purpose of Processing Personal Data
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We process your personal data only for specified, explicit, and legitimate purposes in accordance with 
                  UAE PDPL. Your personal data is processed for:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-white">Service Provision:</strong> To provide auto parts products and services you request</li>
                  <li><strong className="text-white">Order Processing:</strong> To process, fulfill, and deliver your orders</li>
                  <li><strong className="text-white">Communication:</strong> To respond to inquiries and provide customer support</li>
                  <li><strong className="text-white">Business Operations:</strong> To maintain business records and manage customer relationships</li>
                  <li><strong className="text-white">Marketing:</strong> To send promotional materials (only with your explicit consent)</li>
                  <li><strong className="text-white">Website Improvement:</strong> To analyze and improve our website functionality</li>
                  <li><strong className="text-white">Legal Compliance:</strong> To comply with UAE laws, regulations, and legal proceedings</li>
                  <li><strong className="text-white">Security:</strong> To protect against fraud, unauthorized access, and illegal activities</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  We will not process your personal data for purposes incompatible with those stated above without obtaining 
                  your prior consent.
                </p>
              </div>

              {/* Data Sharing and Transfer */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  3. Disclosure and Transfer of Personal Data
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We do not sell, rent, or trade your personal data. We may disclose your personal data only in the 
                  following limited circumstances as permitted by UAE PDPL:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-white">Service Providers:</strong> To authorized data processors who perform services on our behalf 
                  (delivery, payment processing, IT services) under strict confidentiality agreements</li>
                  <li><strong className="text-white">Economic Group Holdings (EGH):</strong> With our parent company and affiliated entities for 
                  legitimate business purposes</li>
                  <li><strong className="text-white">Legal Authorities:</strong> To UAE government authorities, courts, or law enforcement when 
                  required by law or court order</li>
                  <li><strong className="text-white">Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales, 
                  with appropriate safeguards</li>
                  <li><strong className="text-white">Consent:</strong> With your explicit prior consent for specific purposes</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-white mb-3 mt-6">
                  Cross-Border Data Transfer
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  If your personal data is transferred outside the UAE, we ensure such transfers comply with UAE PDPL 
                  requirements and implement appropriate safeguards, including standard contractual clauses and ensuring 
                  the recipient country provides adequate data protection.
                </p>
              </div>

              {/* Data Security and Retention */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  4. Data Security and Retention
                </h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  Security Measures
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  In accordance with UAE PDPL, we implement appropriate technical and organizational security measures to 
                  protect your personal data against:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Unauthorized or unlawful access, processing, or disclosure</li>
                  <li>Accidental loss, destruction, or damage</li>
                  <li>Misuse, interference, or modification</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  These measures include encryption, access controls, secure servers, regular security assessments, and 
                  employee training on data protection.
                </p>

                <h3 className="text-xl font-semibold text-white mb-3 mt-6">
                  Data Retention
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was 
                  collected, comply with legal and regulatory requirements, resolve disputes, and enforce our agreements. 
                  Once no longer required, we securely delete or anonymize your personal data in accordance with UAE laws.
                </p>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  5. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your browsing experience. Cookies are small 
                  data files stored on your device. You can control cookie settings through your browser preferences.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Types of cookies we use:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-2">
                  <li><strong className="text-white">Essential Cookies:</strong> Required for website functionality</li>
                  <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong className="text-white">Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </div>

              {/* Your Rights Under UAE PDPL */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  6. Your Rights Under UAE Personal Data Protection Law
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Under the UAE PDPL, you have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong className="text-white">Right to Information:</strong> To be informed about how your personal data is processed</li>
                  <li><strong className="text-white">Right of Access:</strong> To obtain confirmation of whether we process your personal data 
                  and access to such data</li>
                  <li><strong className="text-white">Right to Rectification:</strong> To request correction of inaccurate or incomplete personal data</li>
                  <li><strong className="text-white">Right to Erasure:</strong> To request deletion of your personal data under certain circumstances</li>
                  <li><strong className="text-white">Right to Restriction:</strong> To request restriction of processing in specific situations</li>
                  <li><strong className="text-white">Right to Object:</strong> To object to processing based on legitimate interests or for 
                  direct marketing purposes</li>
                  <li><strong className="text-white">Right to Data Portability:</strong> To receive your personal data in a structured, commonly 
                  used format</li>
                  <li><strong className="text-white">Right to Withdraw Consent:</strong> To withdraw consent at any time for consent-based processing</li>
                  <li><strong className="text-white">Right to Lodge Complaint:</strong> To file a complaint with the UAE Data Office if you 
                  believe your rights have been violated</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-4">
                  To exercise any of these rights, please contact us at <a href="mailto:sales@garritwulf.com" className="hover:text-white transition-colors" style={{ color: '#6e0000' }}>sales@garritwulf.com</a>. 
                  We will respond to your request within the timeframe required by UAE law (typically within 30 days).
                </p>
              </div>

              {/* Third-Party Links */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  7. Third-Party Links
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices 
                  or content of these external sites. We encourage you to review their privacy policies before providing 
                  any personal information.
                </p>
              </div>

              {/* Minors' Data */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  8. Protection of Minors&apos; Personal Data
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  In compliance with UAE PDPL, we do not knowingly collect, process, or solicit personal data from individuals 
                  under the age of 21 years without obtaining prior consent from a parent or legal guardian.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Our services are intended for businesses and adult customers. If you are a parent or legal guardian and 
                  believe a minor has provided personal data without proper consent, please contact us immediately so we can 
                  take appropriate action to remove such information.
                </p>
              </div>

              {/* Data Breach Notification */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  9. Data Breach Notification
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify 
                  the UAE Data Office and affected individuals in accordance with UAE PDPL requirements. We will provide 
                  details of the breach, its likely consequences, and measures taken to address and mitigate the breach.
                </p>
              </div>

              {/* Changes to Privacy Policy */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  10. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, 
                  or operational needs. Any material changes will be communicated to you through appropriate means (email 
                  notification or prominent notice on our website). Your continued use of our services after such modifications 
                  constitutes your acknowledgment and acceptance of the updated Privacy Policy.
                </p>
              </div>

              {/* Contact Information */}
              <div className="pt-6 border-t" style={{ borderColor: '#2a2a2a' }}>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-300">
                  <p><strong className="text-white">Garrit & Wulf</strong></p>
                  <p>26 6A Street - Al Quoz Industrial Area 3</p>
                  <p>Dubai, United Arab Emirates</p>
                  <p>Phone: <a href="tel:+97142243851" className="hover:text-white transition-colors" style={{ color: '#6e0000' }}>+971 4 224 38 51</a></p>
                  <p>Email: <a href="mailto:sales@garritwulf.com" className="hover:text-white transition-colors" style={{ color: '#6e0000' }}>sales@garritwulf.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
