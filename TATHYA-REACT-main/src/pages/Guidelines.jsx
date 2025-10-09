// src/pages/Guidelines.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation

const Guidelines = () => {
  const navigate = useNavigate(); // Hook for navigation

  // --- Function to handle back button click ---
  const handleBackToHelp = () => {
    // Navigate directly to the User Dashboard's Help & Support section
    navigate('/user-dashboard?section=help-section');
    // Alternative if your UserDashboard component reads activeMenu from state/location:
    // navigate('/user-dashboard', { state: { activeMenu: 'help-section' } });
  };

  // --- Scroll to Top on Mount ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={handleBackToHelp} // Use the handler function
            className="back-to-help-btn inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 bg-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Help & Support
          </button>
        </motion.div>

        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            Community Guidelines
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Creating a safe, respectful, and supportive environment for everyone.
          </motion.p>
        </motion.header>

        {/* Introduction Section */}
        <motion.section
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <i className="fas fa-handshake text-blue-500 mr-3"></i> Welcome to TATHYA!
          </h2>
          <p className="text-gray-700 mb-4">
            Thank you for joining the TATHYA community. Our platform thrives on mutual respect, empathy, and the shared goal of supporting students facing challenges.
            These guidelines are designed to ensure a positive experience for all members.
          </p>
          <p className="text-gray-700">
            By participating, you agree to uphold these standards. Together, we can build a haven where every voice is heard and valued.
          </p>
        </motion.section>

        {/* Main Guidelines Sections - Populated from Documentation */}
        <div className="space-y-10">
          {/* Respect & Empathy */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-heart text-red-500 mr-3"></i> Respect & Empathy
            </h2>
            <ul className="space-y-3">
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Listen Actively:</strong> Give others your full attention when they share. Seek to understand before seeking to be understood.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Be Kind:</strong> Offer compassion and encouragement. Avoid sarcasm, dismissiveness, or harsh criticism.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>No Judgment:</strong> Everyone's experience is unique. Refrain from making assumptions or passing judgment on others' situations or choices.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Inclusive Language:</strong> Use language that is welcoming and inclusive. Discriminatory remarks based on identity, background, or beliefs are strictly prohibited.</span>
              </motion.li>
            </ul>
          </motion.section>

          {/* Constructive Communication */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-comments text-green-500 mr-3"></i> Constructive Communication
            </h2>
            <ul className="space-y-3">
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Stay On Topic:</strong> Keep discussions relevant to the post or thread. Off-topic conversations can be distracting.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Ask Questions:</strong> If something is unclear, politely ask for clarification rather than making assumptions.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Disagree Respectfully:</strong> It's okay to have differing opinions. Focus on ideas, not people. Avoid personal attacks, insults, or inflammatory language.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Avoid Spam:</strong> Do not post repetitive content, advertisements, or irrelevant links.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Proofread:</strong> Take a moment to review your posts for clarity and grammar before submitting.</span>
              </motion.li>
            </ul>
          </motion.section>

          {/* Privacy & Safety */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-user-shield text-purple-500 mr-3"></i> Privacy & Safety
            </h2>
            <ul className="space-y-3">
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Respect Anonymity:</strong> Do not attempt to uncover or reveal the identity of anonymous users. Respect their choice to remain private.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Protect Personal Info:</strong> Never share personal information about yourself or others (names, addresses, phone numbers, emails, social media handles, etc.) publicly.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>No Harassment:</strong> Harassment, threats, bullying, or stalking of any kind, whether directed at individuals or groups, is absolutely forbidden.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.9 }}
              >
                <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Reporting Issues:</strong> If you witness a violation of these guidelines or feel unsafe, please use the "Report" function or contact our moderators directly.</span>
              </motion.li>
            </ul>
          </motion.section>

          {/* Prohibited Content */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-ban text-red-600 mr-3"></i> Prohibited Content
            </h2>
            <p className="text-gray-700 mb-4">Content that violates these rules will be removed and may result in account suspension or banning.</p>
            <ul className="space-y-3">
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.1 }}
              >
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Hate Speech & Discrimination:</strong> Content that promotes hatred or violence against individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 }}
              >
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Graphic Violence:</strong> Depictions of graphic violence, gore, or animal cruelty.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.3 }}
              >
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Illegal Activities:</strong> Promotion or glorification of illegal activities.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.4 }}
              >
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Explicit Content:</strong> Nudity, pornography, or sexually suggestive material involving minors.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 }}
              >
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Impersonation:</strong> Pretending to be someone else, including TATHYA staff, moderators, or other users.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.6 }}
              >
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Malicious Software:</strong> Sharing viruses, malware, or links designed to harm devices or steal data.</span>
              </motion.li>
            </ul>
          </motion.section>

          {/* Reporting Violations */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.7, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-flag text-orange-500 mr-3"></i> Reporting Violations
            </h2>
            <p className="text-gray-700 mb-4">
              If you encounter content or behavior that violates these guidelines:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 pl-4">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.8 }}
              >
                Use the "Report" button available on posts, comments, or user profiles.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.9 }}
              >
                Provide a brief explanation of why you are reporting the content.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.0 }}
              >
                Our moderation team will review the report promptly and take appropriate action.
              </motion.li>
            </ol>
            <motion.p
              className="mt-4 text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.1 }}
            >
              <strong>Your reports help keep TATHYA a safe space for everyone.</strong>
            </motion.p>
          </motion.section>

          {/* Consequences of Violations */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-gavel text-gray-700 mr-3"></i> Consequences of Violations
            </h2>
            <p className="text-gray-700 mb-4">
              Violations of these guidelines may result in actions ranging from warnings to permanent account bans, depending on the severity and frequency of the offense.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.3 }}
              >
                <strong>First Offense:</strong> Content removal and a warning.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.4 }}
              >
                <strong>Repeat Offenses:</strong> Temporary suspension.
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.5 }}
              >
                <strong>Severe Violations:</strong> Immediate and permanent ban.
              </motion.li>
            </ul>
            <motion.p
              className="mt-4 text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.6 }}
            >
              Decisions regarding enforcement are made at the sole discretion of the TATHYA moderation team.
            </motion.p>
          </motion.section>

          {/* Positive Participation */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.7, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-seedling text-teal-500 mr-3"></i> Positive Participation
            </h2>
            <p className="text-gray-700 mb-4">
              We encourage you to contribute positively to the community:
            </p>
            <ul className="space-y-3">
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.8 }}
              >
                <i className="fas fa-star text-yellow-400 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Share Wisely:</strong> Post thoughtful content that contributes to meaningful discussions.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.9 }}
              >
                <i className="fas fa-star text-yellow-400 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Support Others:</strong> Offer helpful advice, resources, or simply a kind word to those in need.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.0 }}
              >
                <i className="fas fa-star text-yellow-400 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Engage Respectfully:</strong> Participate in discussions with openness and respect for diverse viewpoints.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.1 }}
              >
                <i className="fas fa-star text-yellow-400 mt-1 mr-3"></i>
                <span className="text-gray-700"><strong>Report Issues:</strong> Help maintain a safe environment by reporting violations.</span>
              </motion.li>
            </ul>
          </motion.section>

          {/* Additional Content from Documentation */}
          <motion.section
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.2, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-info-circle text-blue-500 mr-3"></i> Additional Information
            </h2>
            <ul className="space-y-3 text-gray-700">
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.3 }}
              >
                <i className="fas fa-shield-alt text-green-500 mt-1 mr-3"></i>
                <span><strong>Anonymity:</strong> TATHYA prioritizes your anonymity. We implement robust measures to protect your identity, especially when reporting issues or posting anonymously. Your privacy is paramount.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.4 }}
              >
                <i className="fas fa-user-check text-purple-500 mt-1 mr-3"></i>
                <span><strong>Verified Profiles:</strong> While anonymity is key, verifying your profile (e.g., with Aadhar) unlocks enhanced features and builds trust within the community. Verification is optional and secure.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.5 }}
              >
                <i className="fas fa-users text-teal-500 mt-1 mr-3"></i>
                <span><strong>Community Forums:</strong> Engage in topic-specific forums to connect with peers, share experiences, and seek advice in a structured environment.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.6 }}
              >
                <i className="fas fa-user-shield text-orange-500 mt-1 mr-3"></i>
                <span><strong>Moderator Role:</strong> Our trained moderators oversee the community, ensure adherence to these guidelines, and provide support. They are here to help facilitate constructive dialogue.</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.7 }}
              >
                <i className="fas fa-file-contract text-red-500 mt-1 mr-3"></i>
                <span><strong>Data Protection:</strong> We adhere to strict data protection protocols. Your personal information is never sold or shared without your consent, except as required by law.</span>
              </motion.li>
            </ul>
          </motion.section>
        </div>

        {/* Closing Statement */}
        <motion.footer
          className="text-center mt-12 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.8, duration: 1 }}
        >
          <p className="text-lg font-semibold text-gray-800">
            Thank you for being a part of TATHYA. Let's build a supportive community together.
          </p>
          <p className="text-gray-600 mt-2">
            TATHYA GUIDELINES & SUPPORTIVE TEAM
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Guidelines;