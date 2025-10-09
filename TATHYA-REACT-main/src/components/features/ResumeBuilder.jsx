// src/components/features/ResumeBuilder.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection if needed

const ResumeBuilder = ({ userData }) => {
  const navigate = useNavigate(); // Hook for navigation if needed

  // --- State Management ---
  // Initialize resumeData with userData or default values
  const [resumeData, setResumeData] = useState(() => {
    const savedData = localStorage.getItem('tathya-resume-data');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing saved resume data:", e);
        // Fallback to userData if parsing fails
      }
    }
    // Default initialization from userData or placeholders
    return {
      basics: {
        name: userData?.fullName || `${userData?.firstName} ${userData?.lastName}` || 'John Doe',
        label: userData?.title || 'Programmer',
        image: userData?.avatar || '', // Add avatar if available
        email: userData?.email || 'john@example.com',
        phone: userData?.phone || '(912) 555-4321',
        url: userData?.website || 'https://johndoe.com', // Add website if available
        summary: userData?.summary || 'A summary of John Doe...',
        location: {
          address: userData?.location || '2712 Broadway St',
          postalCode: 'CA 94115',
          city: 'San Francisco',
          countryCode: 'US',
          region: 'California',
        },
        profiles: [
          {
            network: 'Twitter',
            username: userData?.twitter || 'john', // Add Twitter if available
            url: 'https://twitter.com/john',
          },
        ],
      },
      work: [
        {
          name: userData?.work?.[0]?.company || 'Company',
          position: userData?.work?.[0]?.position || 'President',
          url: userData?.work?.[0]?.url || 'https://company.com',
          startDate: userData?.work?.[0]?.startDate || '2013-01-01',
          endDate: userData?.work?.[0]?.endDate || '2014-01-01',
          summary: userData?.work?.[0]?.summary || 'Description...',
          highlights: userData?.work?.[0]?.highlights || [
            'Started the company',
          ],
        },
      ],
      volunteer: [
        {
          organization: userData?.volunteer?.[0]?.organization || 'Organization',
          position: userData?.volunteer?.[0]?.position || 'Volunteer',
          url: userData?.volunteer?.[0]?.url || 'https://organization.com/',
          startDate: userData?.volunteer?.[0]?.startDate || '2012-01-01',
          endDate: userData?.volunteer?.[0]?.endDate || '2013-01-01',
          summary: userData?.volunteer?.[0]?.summary || 'Description...',
          highlights: userData?.volunteer?.[0]?.highlights || [
            'Awarded \'Volunteer of the Month\'',
          ],
        },
      ],
      education: [
        {
          institution: userData?.university || 'University',
          url: userData?.education?.[0]?.url || 'https://institution.com/',
          area: userData?.degree || 'Software Development',
          studyType: userData?.education?.[0]?.studyType || 'Bachelor',
          startDate: userData?.education?.[0]?.startDate || '2011-01-01',
          endDate: userData?.education?.[0]?.endDate || '2013-01-01',
          score: userData?.education?.[0]?.score || '4.0',
          courses: userData?.education?.[0]?.courses || [
            'DB1101 - Basic SQL',
          ],
        },
      ],
      awards: [
        {
          title: userData?.awards?.[0]?.title || 'Award',
          date: userData?.awards?.[0]?.date || '2014-11-01',
          awarder: userData?.awards?.[0]?.awarder || 'Company',
          summary: userData?.awards?.[0]?.summary || 'There is no spoon.',
        },
      ],
      certificates: [
        {
          name: userData?.certificates?.[0]?.name || 'Certificate',
          date: userData?.certificates?.[0]?.date || '2021-11-07',
          url: userData?.certificates?.[0]?.url || 'https://certificate.com/',
          issuer: userData?.certificates?.[0]?.issuer || 'Company',
        },
      ],
      publications: [
        {
          name: userData?.publications?.[0]?.name || 'Publication',
          publisher: userData?.publications?.[0]?.publisher || 'Company',
          releaseDate: userData?.publications?.[0]?.releaseDate || '2014-10-01',
          url: userData?.publications?.[0]?.url || 'https://publication.com/',
          summary: userData?.publications?.[0]?.summary || 'Description...',
        },
      ],
      skills: [
        {
          name: userData?.skillsCategory || 'Web Development', // Adjust based on your userData structure
          level: userData?.skillsLevel || 'Master', // Adjust based on your userData structure
          keywords: userData?.skills ? userData.skills.split(',').map(s => s.trim()) : [
            'HTML',
            'CSS',
            'JavaScript',
          ],
        },
      ],
      languages: [
        {
          language: userData?.language || 'English', // Adjust based on your userData structure
          fluency: userData?.fluency || 'Native speaker', // Adjust based on your userData structure
        },
      ],
      interests: [
        {
          name: userData?.interest || 'Wildlife', // Adjust based on your userData structure
          keywords: userData?.interestKeywords || [ // Adjust based on your userData structure
            'Ferrets',
            'Unicorns',
          ],
        },
      ],
      references: [
        {
          name: userData?.referenceName || 'Jane Doe', // Adjust based on your userData structure
          reference: userData?.referenceDetails || 'Reference...', // Adjust based on your userData structure
        },
      ],
      projects: [
        {
          name: userData?.projectName || 'Project',
          description: userData?.projectDescription || 'Description...',
          highlights: userData?.projectHighlights || [ // Adjust based on your userData structure
            'Award at showcase',
          ],
          keywords: userData?.projectKeywords || [ // Adjust based on your userData structure
            'technologies used',
          ],
          startDate: userData?.projectStartDate || '2019-01-01', // Adjust based on your userData structure
          endDate: userData?.projectEndDate || '2021-01-01', // Adjust based on your userData structure
          url: userData?.projectUrl || 'https://project.com/', // Adjust based on your userData structure
          roles: userData?.projectRoles || [ // Adjust based on your userData structure
            'Team Lead',
          ],
          entity: userData?.projectEntity || 'Entity', // Adjust based on your userData structure
          type: userData?.projectType || 'application', // Adjust based on your userData structure
        },
      ],
    };
  });

  const [templates, setTemplates] = useState({
    modern: {
      name: 'Modern',
      description: 'Clean layout, bright accents.',
      styles: {
        background: '#ffffff',
        pageBackground: '#f8fafc',
        headerBg: '#0ea5e9', // sky-500
        headerText: '#ffffff',
        headingColor: '#0f172a', // slate-900
        textColor: '#0f172a',
        accent: '#2563eb', // blue-600
        fontFamily: 'Helvetica, Arial, sans-serif'
      }
    },
    classic: {
      name: 'Classic',
      description: 'Traditional, serifed look.',
      styles: {
        background: '#ffffff',
        pageBackground: '#ffffff',
        headerBg: '#111827', // slate-900
        headerText: '#ffffff',
        headingColor: '#111827',
        textColor: '#111827',
        accent: '#6b7280', // gray-500
        fontFamily: 'Georgia, Times New Roman, serif'
      }
    },
    creative: {
      name: 'Creative',
      description: 'Warm colors and modern feel.',
      styles: {
        background: '#fff8f1',
        pageBackground: '#fff8f1',
        headerBg: '#fb923c', // orange-400
        headerText: '#7c2d12',
        headingColor: '#7c2d12',
        textColor: '#422006',
        accent: '#db2777', // pink-600
        fontFamily: 'Segoe UI, Tahoma, sans-serif'
      }
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // State for PDF generation loading

  // Ref to the printable preview area
  const printableRef = useRef(null);

  // --- Persist resume data to localStorage whenever it changes ---
  useEffect(() => {
    localStorage.setItem('tathya-resume-data', JSON.stringify(resumeData));
  }, [resumeData]);

  // --- Handle changes in the resume data form (simplified example for basics.name) ---
  const handleInputChange = (section, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // --- Handle changes in nested arrays (like work experience, education) ---
  const handleArrayInputChange = (section, index, field, value) => {
    setResumeData(prev => {
      const updatedSection = [...prev[section]];
      updatedSection[index] = { ...updatedSection[index], [field]: value };
      return { ...prev, [section]: updatedSection };
    });
  };

  // --- Handle adding a new item to an array section ---
  const handleAddItem = (section) => {
    setResumeData(prev => {
      const newItem = {}; // Define default structure for new item based on section
      switch (section) {
        case 'work':
          newItem.name = '';
          newItem.position = '';
          newItem.url = '';
          newItem.startDate = '';
          newItem.endDate = '';
          newItem.summary = '';
          newItem.highlights = [''];
          break;
        case 'education':
          newItem.institution = '';
          newItem.url = '';
          newItem.area = '';
          newItem.studyType = '';
          newItem.startDate = '';
          newItem.endDate = '';
          newItem.score = '';
          newItem.courses = [''];
          break;
        case 'skills':
          newItem.name = '';
          newItem.level = '';
          newItem.keywords = [''];
          break;
        case 'projects':
          newItem.name = '';
          newItem.description = '';
          newItem.highlights = [''];
          newItem.keywords = [''];
          newItem.startDate = '';
          newItem.endDate = '';
          newItem.url = '';
          newItem.roles = [''];
          newItem.entity = '';
          newItem.type = '';
          break;
        // Add cases for other sections if needed (volunteer, awards, etc.)
        default:
          newItem.field = '';
      }
      return {
        ...prev,
        [section]: [...prev[section], newItem]
      };
    });
  };

  // --- Handle removing an item from an array section ---
  const handleRemoveItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // --- Function to generate resume (placeholder) ---
  const generateResume = () => {
    console.log('Generating resume with ', resumeData);
    alert('Resume generation logic would go here!');
  };

  // --- Function to handle Save Changes ---
  const handleSaveChanges = () => {
    // In a real app, you might trigger an API call or re-render preview
    console.log('Saving resume changes:', resumeData);
    alert('Resume changes saved successfully!');
    // The useEffect above already persists changes to localStorage
  };

  // --- Function to load external script (for html2canvas & jsPDF) ---
  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(); // Script already loaded
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });

  // --- Function to handle Download Resume (PDF) ---
  const handleDownloadResume = async () => {
    setIsGeneratingPDF(true);
    const previewNode = printableRef.current;
    if (!previewNode) {
      alert('Preview not available to print. Open the resume preview first.');
      setIsGeneratingPDF(false);
      return;
    }

    try {
      // Load dependencies from CDN if not already present
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      // Access libraries from global scope
      const html2canvas = window.html2canvas;
      const jsPDF = window.jspdf.jsPDF;

      if (!html2canvas || !jsPDF) {
        throw new Error('Required libraries (html2canvas or jsPDF) failed to load.');
      }

      // Clone previewNode and inline template-safe styles to avoid html2canvas parsing issues
      const templateStyles = templates[selectedTemplate]?.styles || {};
      const clone = previewNode.cloneNode(true);
      // Apply page background and font family inline
      clone.style.background = templateStyles.pageBackground || '#ffffff';
      clone.style.fontFamily = templateStyles.fontFamily || 'Arial, sans-serif';
      // Inline heading and text colors for main resume sections
      if (clone.querySelectorAll) {
        const elems = clone.querySelectorAll('.resume-header, .resume-summary, .resume-work, .resume-education, .resume-skills, .resume-projects');
        elems.forEach(el => {
          el.style.color = templateStyles.textColor || '#111827';
        });
        // Inline accent for headings
        const headings = clone.querySelectorAll('.resume-header h4, .resume-summary h5, .resume-work h5, .resume-education h5, .resume-skills h5, .resume-projects h5');
        headings.forEach(h => {
          h.style.color = templateStyles.headingColor || (templateStyles.textColor || '#111827');
        });
      }

      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Important for images
        logging: false, // Reduce console noise
      });

      // Cleanup temporary clone wrapper
      if (wrapper && wrapper.parentNode) document.body.removeChild(wrapper);

      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      // Add the captured canvas image to the PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      // Generate filename
      const fileName = `${(resumeData.basics.name || 'resume').replace(/\s+/g, '_')}-resume.pdf`;

      // Save the PDF
      pdf.save(fileName);

      // Optional: Persist the generated PDF (as base64) to localStorage
      try {
        const pdfBlob = pdf.output('blob');
        const fr = new FileReader();
        fr.onloadend = () => {
          try {
            const dataUrl = fr.result; // base64 data URL
            const savedDocsRaw = localStorage.getItem('user-documents');
            const savedDocs = savedDocsRaw ? JSON.parse(savedDocsRaw) : [];
            const newDoc = {
              id: savedDocs.length > 0 ? Math.max(...savedDocs.map(d => d.id)) + 1 : 1,
              name: fileName,
              type: 'PDF',
              size: `${(pdfBlob.size / (1024 * 1024)).toFixed(2)} MB`,
              uploaded: new Date().toISOString().split('T')[0],
              modified: new Date().toISOString().split('T')[0],
              status: 'Generated',
              file: dataUrl, // Store the base64 data URL
            };
            const updatedDocs = [newDoc, ...savedDocs];
            localStorage.setItem('user-documents', JSON.stringify(updatedDocs));
            alert(`Resume saved to Documents as "${fileName}"`);
          } catch (storageError) {
            console.error('Failed to persist resume to user-documents:', storageError);
            // Still alert user about successful download even if persistence fails
            alert(`PDF downloaded successfully as "${fileName}"!`);
          }
        };
        fr.readAsDataURL(pdfBlob);
      } catch (persistenceError) {
        console.error('Error while preparing PDF for persistence:', persistenceError);
        // Still alert user about successful download even if persistence fails
        alert(`PDF downloaded successfully as "${fileName}"!`);
      }
    } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback: generate a simple text-based PDF using jsPDF to avoid html2canvas CSS parsing issues
        try {
          const fallbackFileName = `${(resumeData.basics.name || 'resume').replace(/\s+/g, '_')}-resume.pdf`;
          await generateTextPdfAndSave(fallbackFileName);
          // eslint-disable-next-line no-alert
          alert(`Resume has been Successfully Downloaded "${fallbackFileName}" instead.`);
        } catch (fallbackErr) {
          console.error('Fallback PDF generation also failed:', fallbackErr);
          alert('Error generating PDF. Please try again.');
        }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

    // --- Fallback PDF generator (text-based) ---
    const generateTextPdfAndSave = async (fileName) => {
      // Ensure jsPDF is loaded
      try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
      } catch (e) {
        console.warn('Failed to load jsPDF from CDN:', e);
        throw e;
      }

      const jsPDFConstructor = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
      if (!jsPDFConstructor) throw new Error('jsPDF not available for fallback PDF generation');

      const doc = new jsPDFConstructor({ unit: 'pt', format: 'a4' });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = margin;

      const addLine = (text, opts = {}) => {
        const fontSize = opts.fontSize || 12;
        doc.setFontSize(fontSize);
        const split = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(split, margin, y);
        y += split.length * (fontSize + 4);
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Header
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      addLine(resumeData.basics.name || '');
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      addLine(`${resumeData.basics.label || ''}`);
      addLine(`${resumeData.basics.email || ''} | ${resumeData.basics.phone || ''} | ${resumeData.basics.url || ''}`);
      y += 6;

      // Summary
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      addLine('Professional Summary');
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      addLine(resumeData.basics.summary || '');
      y += 6;

      // Experience
      if (resumeData.work && resumeData.work.length) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        addLine('Work Experience');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        resumeData.work.forEach((exp) => {
          addLine(`${exp.position || ''} — ${exp.name || ''} (${exp.startDate || ''} - ${exp.endDate || ''})`, { fontSize: 12 });
          if (exp.summary) addLine(exp.summary);
          if (exp.highlights && exp.highlights.length) addLine('Highlights: ' + exp.highlights.join(', '));
          y += 4;
        });
      }

      // Education
      if (resumeData.education && resumeData.education.length) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        addLine('Education');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        resumeData.education.forEach((edu) => {
          addLine(`${edu.area || ''} — ${edu.institution || ''} (${edu.startDate || ''} - ${edu.endDate || ''})`, { fontSize: 12 });
          if (edu.score) addLine(`Score/GPA: ${edu.score}`);
          if (edu.courses && edu.courses.length) addLine('Courses: ' + edu.courses.join(', '));
          y += 4;
        });
      }

      // Skills
      if (resumeData.skills && resumeData.skills.length) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        addLine('Skills');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        resumeData.skills.forEach((sk) => addLine(`${sk.name || ''}: ${(sk.keywords || []).join(', ')}`));
        y += 4;
      }

      // Projects (optional)
      if (resumeData.projects && resumeData.projects.length) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        addLine('Projects');
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        resumeData.projects.forEach((p) => {
          addLine(`${p.name || ''} (${p.startDate || ''} - ${p.endDate || ''})`, { fontSize: 12 });
          if (p.description) addLine(p.description);
          if (p.highlights && p.highlights.length) addLine('Highlights: ' + p.highlights.join(', '));
        });
      }

      // Save PDF
      doc.save(fileName || 'resume.pdf');
    };

  return (
    <div className="resume-builder min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Resume Builder Header */}
          <div className="resume-builder-header bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <motion.h2
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Resume Builder
            </motion.h2>
            <motion.p
              className="text-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Create a professional resume with ease
            </motion.p>
          </div>

          {/* Resume Builder Content */}
          <div className="resume-builder-content p-6">
            {/* Resume Templates Selection */}
            <AnimatePresence>
              {!showResumeBuilder && (
                <motion.div
                  className="resume-templates mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.h3
                    className="text-xl font-semibold text-gray-800 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    Choose a Template
                  </motion.h3>
                  <motion.div
                    className="flex flex-wrap gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {Object.entries(templates).map(([key, template], index) => (
                      <motion.div
                        key={key}
                        className={`template-card border rounded-lg p-4 w-48 text-center cursor-pointer transition-all duration-300 ${
                          selectedTemplate === key
                            ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                            : 'border-gray-200 hover:shadow-md hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTemplate(key)}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.1 * index, duration: 0.3 }}
                      >
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3"></div>
                        <h4 className="font-medium text-gray-800 mb-1">{template.name}</h4>
                        <p className="text-xs text-gray-600">{template.description}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resume Builder / Preview Area */}
            <div className="resume-form-preview grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Resume Form (Edit Side) */}
              <AnimatePresence>
                {showResumeBuilder && (
                  <motion.div
                    className="resume-form bg-gray-50 p-6 rounded-xl shadow-inner"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <motion.h3
                      className="text-xl font-semibold text-gray-800 mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Edit Resume Details
                    </motion.h3>

                    {/* Basic Info */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <h4 className="text-md font-semibold text-gray-700 mb-3">Basic Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={resumeData.basics.name}
                            onChange={(e) => handleInputChange('basics', 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Professional Title</label>
                          <input
                            type="text"
                            value={resumeData.basics.label}
                            onChange={(e) => handleInputChange('basics', 'label', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={resumeData.basics.email}
                          onChange={(e) => handleInputChange('basics', 'email', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={resumeData.basics.phone}
                            onChange={(e) => handleInputChange('basics', 'phone', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Website/Portfolio</label>
                          <input
                            type="url"
                            value={resumeData.basics.url}
                            onChange={(e) => handleInputChange('basics', 'url', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Professional Summary</label>
                        <textarea
                          value={resumeData.basics.summary}
                          onChange={(e) => handleInputChange('basics', 'summary', e.target.value)}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        ></textarea>
                      </div>
                    </motion.div>

                    {/* Work Experience */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-700">Work Experience</h4>
                        <button
                          onClick={() => handleAddItem('work')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Experience
                        </button>
                      </div>
                      {resumeData.work.map((exp, index) => (
                        <motion.div
                          key={index}
                          className="mb-4 p-4 border border-gray-200 rounded-md bg-white"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-gray-700">Experience #{index + 1}</h5>
                            {index > 0 && ( // Allow removing items added by user
                              <button
                                onClick={() => handleRemoveItem('work', index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                <i className="fas fa-trash"></i> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                              <input
                                type="text"
                                value={exp.name}
                                onChange={(e) => handleArrayInputChange('work', index, 'name', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                              <input
                                type="text"
                                value={exp.position}
                                onChange={(e) => handleArrayInputChange('work', index, 'position', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={exp.startDate}
                                onChange={(e) => handleArrayInputChange('work', index, 'startDate', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                              <input
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => handleArrayInputChange('work', index, 'endDate', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Summary</label>
                            <textarea
                              value={exp.summary}
                              onChange={(e) => handleArrayInputChange('work', index, 'summary', e.target.value)}
                              rows="2"
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            ></textarea>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Highlights (comma separated)</label>
                            <input
                              type="text"
                              value={exp.highlights.join(', ')}
                              onChange={(e) => handleArrayInputChange('work', index, 'highlights', e.target.value.split(',').map(h => h.trim()))}
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Education */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-700">Education</h4>
                        <button
                          onClick={() => handleAddItem('education')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Education
                        </button>
                      </div>
                      {resumeData.education.map((edu, index) => (
                        <motion.div
                          key={index}
                          className="mb-4 p-4 border border-gray-200 rounded-md bg-white"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-gray-700">Education #{index + 1}</h5>
                            {index > 0 && ( // Allow removing items added by user
                              <button
                                onClick={() => handleRemoveItem('education', index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                <i className="fas fa-trash"></i> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => handleArrayInputChange('education', index, 'institution', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Area of Study</label>
                              <input
                                type="text"
                                value={edu.area}
                                onChange={(e) => handleArrayInputChange('education', index, 'area', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Study Type</label>
                              <input
                                type="text"
                                value={edu.studyType}
                                onChange={(e) => handleArrayInputChange('education', index, 'studyType', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Score/GPA</label>
                              <input
                                type="text"
                                value={edu.score}
                                onChange={(e) => handleArrayInputChange('education', index, 'score', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={edu.startDate}
                                onChange={(e) => handleArrayInputChange('education', index, 'startDate', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                              <input
                                type="date"
                                value={edu.endDate}
                                onChange={(e) => handleArrayInputChange('education', index, 'endDate', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Courses (comma separated)</label>
                            <input
                              type="text"
                              value={edu.courses.join(', ')}
                              onChange={(e) => handleArrayInputChange('education', index, 'courses', e.target.value.split(',').map(c => c.trim()))}
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Skills */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-700">Skills</h4>
                        <button
                          onClick={() => handleAddItem('skills')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Skill Category
                        </button>
                      </div>
                      {resumeData.skills.map((skill, index) => (
                        <motion.div
                          key={index}
                          className="mb-4 p-4 border border-gray-200 rounded-md bg-white"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-gray-700">Skill Category #{index + 1}</h5>
                            {index > 0 && ( // Allow removing items added by user
                              <button
                                onClick={() => handleRemoveItem('skills', index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                <i className="fas fa-trash"></i> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Category Name</label>
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => handleArrayInputChange('skills', index, 'name', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                              <input
                                type="text"
                                value={skill.level}
                                onChange={(e) => handleArrayInputChange('skills', index, 'level', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Keywords (comma separated)</label>
                            <input
                              type="text"
                              value={skill.keywords.join(', ')}
                              onChange={(e) => handleArrayInputChange('skills', index, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Projects (Optional Section) */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-700">Projects</h4>
                        <button
                          onClick={() => handleAddItem('projects')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Project
                        </button>
                      </div>
                      {resumeData.projects.map((proj, index) => (
                        <motion.div
                          key={index}
                          className="mb-4 p-4 border border-gray-200 rounded-md bg-white"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-gray-700">Project #{index + 1}</h5>
                            {index > 0 && ( // Allow removing items added by user
                              <button
                                onClick={() => handleRemoveItem('projects', index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                <i className="fas fa-trash"></i> Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
                              <input
                                type="text"
                                value={proj.name}
                                onChange={(e) => handleArrayInputChange('projects', index, 'name', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Project URL</label>
                              <input
                                type="url"
                                value={proj.url}
                                onChange={(e) => handleArrayInputChange('projects', index, 'url', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <textarea
                              value={proj.description}
                              onChange={(e) => handleArrayInputChange('projects', index, 'description', e.target.value)}
                              rows="2"
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            ></textarea>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                              <input
                                type="date"
                                value={proj.startDate}
                                onChange={(e) => handleArrayInputChange('projects', index, 'startDate', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                              <input
                                type="date"
                                value={proj.endDate}
                                onChange={(e) => handleArrayInputChange('projects', index, 'endDate', e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-xs"
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Highlights (comma separated)</label>
                            <input
                              type="text"
                              value={proj.highlights.join(', ')}
                              onChange={(e) => handleArrayInputChange('projects', index, 'highlights', e.target.value.split(',').map(h => h.trim()))}
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Keywords (comma separated)</label>
                            <input
                              type="text"
                              value={proj.keywords.join(', ')}
                              onChange={(e) => handleArrayInputChange('projects', index, 'keywords', e.target.value.split(',').map(k => k.trim()))}
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Roles (comma separated)</label>
                            <input
                              type="text"
                              value={proj.roles.join(', ')}
                              onChange={(e) => handleArrayInputChange('projects', index, 'roles', e.target.value.split(',').map(r => r.trim()))}
                              className="w-full p-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      className="flex justify-end space-x-3 mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <button
                        onClick={() => setShowResumeBuilder(false)}
                        className="cancel-resume-btn px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        className="save-resume-btn px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleDownloadResume}
                        disabled={isGeneratingPDF}
                        className={`download-resume-btn px-4 py-2 rounded-md transition-colors duration-300 flex items-center justify-center ${
                          isGeneratingPDF
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isGeneratingPDF ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i> Generating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download mr-2"></i> Download PDF
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resume Preview (View Side) */}
              <motion.div
                className="resume-preview bg-white p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.h3
                  className="text-xl font-semibold text-gray-800 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Resume Preview
                </motion.h3>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[600px] overflow-auto">
                  {/* Placeholder for resume preview */}
                  <p className="text-center text-gray-500 mb-4">Resume preview for template: {templates[selectedTemplate]?.name}</p>
                  <div
                    ref={printableRef}
                    className="printable-resume-preview p-6 rounded shadow-sm"
                    style={{
                      background: templates[selectedTemplate]?.styles?.pageBackground || '#ffffff',
                      fontFamily: templates[selectedTemplate]?.styles?.fontFamily || 'Arial, sans-serif',
                      color: templates[selectedTemplate]?.styles?.textColor || '#111827'
                    }}
                  >
                    <div
                      className="resume-header text-center mb-6"
                      style={{ background: templates[selectedTemplate]?.styles?.headerBg || 'transparent', color: templates[selectedTemplate]?.styles?.headerText || '#fff', padding: '12px', borderRadius: '8px' }}
                    >
                      <h4 className="text-2xl font-bold" style={{ color: templates[selectedTemplate]?.styles?.headerText || '#fff' }}>{resumeData.basics.name}</h4>
                      <p style={{ color: templates[selectedTemplate]?.styles?.headerText || '#fff' }}>{resumeData.basics.label}</p>
                      <p className="text-sm" style={{ color: templates[selectedTemplate]?.styles?.headerText || '#fff' }}>
                        {resumeData.basics.email} | {resumeData.basics.phone} | {resumeData.basics.url}
                      </p>
                    </div>
                    <div className="resume-summary mb-6">
                      <h5 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2">Professional Summary</h5>
                      <p className="text-gray-700 text-sm">{resumeData.basics.summary}</p>
                    </div>
                    <div className="resume-work mb-6">
                      <h5 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2">Work Experience</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        {resumeData.work.map((exp, i) => (
                          <li key={i} className="text-sm">
                            <strong>{exp.position}</strong> at {exp.name} ({exp.startDate} - {exp.endDate})
                            <p className="text-gray-600 text-xs mt-1">{exp.summary}</p>
                            <p className="text-gray-600 text-xs">
                              Highlights: {exp.highlights.join(', ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="resume-education mb-6">
                      <h5 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2">Education</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        {resumeData.education.map((edu, i) => (
                          <li key={i} className="text-sm">
                            <strong>{edu.area}</strong>, {edu.studyType} from {edu.institution} ({edu.startDate} - {edu.endDate})
                            <p className="text-gray-600 text-xs mt-1">Score: {edu.score}</p>
                            <p className="text-gray-600 text-xs">
                              Courses: {edu.courses.join(', ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="resume-skills mb-6">
                      <h5 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2">Skills</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        {resumeData.skills.map((skill, i) => (
                          <li key={i} className="text-sm">
                            <strong>{skill.name}</strong> - {skill.level}
                            <p className="text-gray-600 text-xs">
                              Keywords: {skill.keywords.join(', ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="resume-projects">
                      <h5 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2">Projects</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        {resumeData.projects.map((proj, i) => (
                          <li key={i} className="text-sm">
                            <strong>{proj.name}</strong> ({proj.startDate} - {proj.endDate})
                            <p className="text-gray-600 text-xs mt-1">{proj.description}</p>
                            <p className="text-gray-600 text-xs">
                              URL: <a href={proj.url} target="_blank" rel="noopener noreferrer">{proj.url}</a>
                            </p>
                            <p className="text-gray-600 text-xs">
                              Highlights: {proj.highlights.join(', ')}
                            </p>
                            <p className="text-gray-600 text-xs">
                              Keywords: {proj.keywords.join(', ')}
                            </p>
                            <p className="text-gray-600 text-xs">
                              Roles: {proj.roles.join(', ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <motion.div
                  className="flex justify-end space-x-3 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <button
                    onClick={() => setShowResumeBuilder(!showResumeBuilder)}
                    className="toggle-builder-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                  >
                    {showResumeBuilder ? 'Hide Editor' : 'Customize & Edit'}
                  </button>
                  <button
                    onClick={handleDownloadResume}
                    disabled={isGeneratingPDF}
                    className={`download-preview-btn px-4 py-2 rounded-md transition-colors duration-300 flex items-center justify-center ${
                      isGeneratingPDF
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Generating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-download mr-2"></i> Download PDF
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeBuilder;