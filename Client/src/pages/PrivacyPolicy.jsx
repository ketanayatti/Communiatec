import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  Users,
  MessageSquare,
  Database,
  Globe,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "What We Collect",
    content: `We collect only the information necessary to provide our chat services:

• **Account Information** - Username, email address, and profile photo
• **Chat Messages** - Messages you send and receive through our platform
• **Usage Data** - How you interact with our chat features and when you're active
• **Device Information** - Basic technical data to ensure compatibility and security`,
    highlight: true,
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "How We Use Your Data",
    content: `Your information helps us deliver a seamless chat experience:

• **Message Delivery** - Ensuring your messages reach the right recipients
• **Account Management** - Maintaining your profile and preferences  
• **Platform Improvement** - Analyzing usage patterns to enhance features
• **Security & Safety** - Protecting against spam, abuse, and unauthorized access
• **Customer Support** - Helping resolve issues and answer questions`,
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Your Privacy Rights",
    content: `You have full control over your data:

• **Access** - View all personal information we have about you
• **Delete** - Remove your account and associated data permanently
• **Export** - Download your chat history and profile data
• **Control** - Manage who can contact you and see your activity
• **Opt-out** - Unsubscribe from notifications and marketing communications`,
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Data Security",
    content: `We protect your information with enterprise-grade security:

• **Encryption** - All messages encrypted in transit and at rest
• **Access Controls** - Strict limits on who can access your data
• **Regular Audits** - Continuous monitoring for security vulnerabilities
• **Secure Infrastructure** - Hosted on certified, compliant cloud platforms`,
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Data Sharing",
    content: `We never sell your personal information. Limited sharing occurs only for:

• **Service Providers** - Trusted partners who help operate our platform
• **Legal Requirements** - When required by law or to protect user safety
• **Business Transfers** - In case of merger or acquisition (with prior notice)`,
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Data Retention",
    content: `We keep your data only as long as necessary:

• **Active Accounts** - Data retained while your account remains active
• **Deleted Accounts** - Most data removed within 30 days of deletion
• **Legal Obligations** - Some data may be retained longer if required by law
• **Anonymized Analytics** - Usage patterns may be kept in anonymized form`,
  },
];

const PrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/60 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                Privacy Policy
              </h1>
              <p className="text-gray-400 text-lg">
                How we protect and handle your data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            <span>Last updated: January 2025</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="mb-12 p-6 bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Your Privacy Matters to Us
          </h2>
          <p className="text-gray-300 leading-relaxed">
            We built our chat platform with privacy at its core. This policy
            explains in plain language how we collect, use, and protect your
            personal information. By using our service, you agree to these
            practices.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-6 md:gap-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`group bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-sm hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 overflow-hidden ${
                section.highlight ? "ring-2 ring-blue-500/50" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-100 mb-4 group-hover:text-blue-400 transition-colors">
                      {section.title}
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      {section.content.split("\n").map((paragraph, pIndex) => {
                        if (paragraph.trim() === "") return null;

                        if (paragraph.trim().startsWith("•")) {
                          const contentStr = paragraph
                            .trim()
                            .substring(1)
                            .trim();
                          return (
                            <div
                              key={pIndex}
                              className="flex items-start gap-3 mb-3 last:mb-0"
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-200 leading-relaxed m-0">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: contentStr.replace(
                                      /\*\*(.*?)\*\*/g,
                                      '<span class="font-semibold text-gray-100">$1</span>'
                                    ),
                                  }}
                                />
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <p
                              key={pIndex}
                              className="text-gray-300 leading-relaxed mb-4 last:mb-0"
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: paragraph.replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<span class="font-semibold text-gray-100">$1</span>'
                                  ),
                                }}
                              />
                            </p>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white">
          <div className="flex items-center gap-4 mb-4">
            <Mail className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Questions About Privacy?</h3>
          </div>
          <p className="mb-4 opacity-90">
            We're here to help. If you have questions about this policy or how
            we handle your data, don't hesitate to reach out.
          </p>
          <a
            href="mailto:privacy@communiatec.com"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Mail className="w-4 h-4" />
            Contact Privacy Team
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            We may update this policy occasionally. We'll notify you of
            significant changes through the app or by email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
