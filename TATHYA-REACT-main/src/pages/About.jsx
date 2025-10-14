// src/pages/About.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion for animations
import Navbar from '../components/layout/Navbar';

const About = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [postLikes, setPostLikes] = useState({
    post1: 24,
    post2: 45,
    post3: 38,
  });
  const [likedPosts, setLikedPosts] = useState({
    post1: false,
    post2: false,
    post3: false,
  });

  const swiperRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false); // State for initial load animation

  // --- Simulate User Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('tathya-is-authenticated') === 'true';
  });

  // --- Handle Logout ---
  const handleLogout = () => {
    localStorage.removeItem('tathya-is-authenticated');
    localStorage.removeItem('user-profile-data'); // Optional: Clear user data on logout
    setIsLoggedIn(false);
    // Redirect to login page
    navigate('/login');
  };

  // --- Scroll to Top Function ---
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Initial Page Load Effect ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // --- Scroll Event Listener Effect ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Scroll-triggered Animations using Intersection Observer - Optimized for minimal latency ---
  useEffect(() => {
    if (!isPageLoaded) return; // Don't run if page isn't loaded yet

    // Options for Intersection Observer to trigger early and smoothly
    const observerOptions = {
      root: null, // Use the viewport as root
      rootMargin: '0px 0px -100px 0px', // Trigger 100px before element fully enters view (adjust as needed)
      threshold: 0.05, // Trigger when 5% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add animated classes immediately when intersecting
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          entry.target.classList.add('opacity-100', 'translate-y-0', 'transition-all', 'duration-500', 'ease-out');
          // Optional: Unobserve after animation triggers once to prevent re-triggering if scrolled back
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Select elements that should animate on scroll
    const elementsToAnimate = document.querySelectorAll(
      '[data-aos="fade-up"], [data-aos="fade-right"], [data-aos="fade-left"], .feature-card, .post-card, .info-box, .about-content, .section-heading'
    );

    elementsToAnimate.forEach((el) => {
      // Initially hide elements for scroll animation
      el.classList.remove('opacity-100', 'translate-y-0');
      el.classList.add('opacity-0', 'translate-y-10');
      // Do NOT add transition classes here, only when observed
      observer.observe(el);
    });

    return () => {
      elementsToAnimate.forEach((el) => observer.unobserve(el));
    };
  }, [isPageLoaded]); // Run effect after page is loaded

  // --- Stats counter animation on scroll into view ---
  useEffect(() => {
    if (!isPageLoaded) return; // Don't run if page isn't loaded yet

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.animated !== 'true') {
            const statElement = entry.target.querySelector('.stat-number');
            if (statElement) {
              const target = parseInt(statElement.textContent.replace(/,/g, ''));
              let count = 0;
              const time = 2000;
              const step = target / (time / 30);
              const timer = setInterval(() => {
                count += step;
                if (count >= target) {
                  statElement.textContent = target.toLocaleString();
                  clearInterval(timer);
                  entry.target.dataset.animated = 'true';
                  statElement.classList.add('animate-scale-up'); // Trigger scale-up animation
                } else {
                  statElement.textContent = Math.floor(count).toLocaleString();
                }
              }, 30);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const aboutSection = aboutSectionRef.current;
    if (aboutSection) {
      observer.observe(aboutSection);
    }

    return () => {
      if (aboutSection) {
        observer.unobserve(aboutSection);
      }
    };
  }, [isPageLoaded]); // Run effect after page is loaded

  // --- Hero Slider State and Functions ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // --- Handle Post Like ---
  const handleLike = (postId) => {
    setPostLikes((prev) => ({
      ...prev,
      [postId]: likedPosts[postId] ? prev[postId] - 1 : prev[postId] + 1,
    }));
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // --- Slide data ---
  const slides = [
    {
      id: 1,
      bgImage: 'https://plus.unsplash.com/premium_photo-1713296254777-0a89f05dcb60?q=80&w=1330&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Welcome to TATHYA',
      description: 'Your safe space to share challenges anonymously, get community support, and access tools for personal and career growth',
      button1: { text: 'Report Issue Safely', href: '/user-dashboard' },
      button2: { text: 'Learn How It Works', href: '/Guidelines' },
    },
    {
      id: 2,
      bgImage: 'https://plus.unsplash.com/premium_photo-1682089337964-415c6ea8b886?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Anonymous Support Community',
      description: 'Connect with peers facing similar challenges - get advice, share experiences, and support each other',
      button1: { text: 'Join Community', href: '/add-to-community' },
      button2: { text: 'Community Guidelines', href: '/Guidelines' },
    },
    {
      id: 3,
      bgImage: 'https://plus.unsplash.com/premium_photo-1682787495049-9685e97d8e5f?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Verified Profile Benefits',
      description: 'Verify your profile with Aadhar for enhanced security and access to premium career tools and support',
      button1: { text: 'Manage Profile', href: '/user-dashboard' },
      button2: { text: 'contact us', href: '/contact' },
    },
  ];

  // --- Info boxes data ---
  const infoBoxes = [
    {
      id: 1,
      icon: 'fa-user-shield',
      title: 'Anonymous Posting',
      description: 'Share your concerns or issues without revealing your identity to anyone',
      
      linkText: 'Post Anonymously',
    },
    {
      id: 2,
      icon: 'fa-users',
      title: 'Community Support',
      description: 'Get advice and support from peers who understand your challenges',
     
      linkText: 'Join Community',
    },
    {
      id: 3,
      icon: 'fa-id-card',
      title: 'Document Verification',
      description: 'Verify your profile securely with Aadhar for enhanced trust and features',
    
      linkText: 'Verify Profile',
    },
    {
      id: 4,
      icon: 'fa-comment-dots',
      title: 'Moderator Support',
      description: 'Connect directly with moderators for personalized guidance and solutions',
     
      linkText: 'Talk to Moderator',
    },
  ];

  // --- Feature cards data - Main Support Features (first 3) ---
  const mainFeatureCards = [
    {
      id: 1,
      image: 'https://www.nvar.com/images/default-source/default-album/266b0f15c78366c709642ff00005f0421.png?sfvrsn=e1869d0d_0',
      title: 'Anonymous Issue Reporting',
      description: 'Our advanced privacy system enables students to report harassment, unfair treatment, or excessive academic pressure without revealing their identity.',
      features: [
        'Submit reports with complete anonymity',
        'Upload evidence with metadata removal',
        'Track case progress privately',
        'Receive encrypted feedback',
        'Option for authority escalation',
        '24/7 emergency support access',
        'Secure document storage',
      ],
    
    },
    {
      id: 2,
      image: 'https://media.istockphoto.com/id/2159341791/photo/multicultural-business-professionals-celebrating-success.webp?a=1&b=1&s=612x612&w=0&k=20&c=iJt1_Yq21j012C3yjUXM3kRxQok3_c0cKZvPlcTunIg=',
      title: 'Community Support Network',
      description: 'Connect with fellow students who understand your challenges through our moderated community platform.',
      features: [
        'Join moderated discussion forums',
        'Share experiences anonymously',
        'Access peer support groups',
        'Get verified member advice',
        'Participate in topic channels',
        'Connect with mentors',
        'Real-time chat support',
      ],
     
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1592085550638-e6bc180a731e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Profile Builder',
      description: 'Access comprehensive career development resources and tools to build your professional future.',
      features: [
        'AI-powered resume builder',
        'Skills assessment tools',
        'Interview preparation guides',
        'Career pathway planning',
        'Industry certification tracks',
        'Internship opportunities',
        'Professional networking',
      ],
     
    },
  ];

  // --- Additional Support Services (Suggestions) - (next 3) ---
  const additionalFeatureCards = [
    {
      id: 4,
      image: 'https://images.pexels.com/photos/7821674/pexels-photo-7821674.jpeg',
      title: 'Profile Management',
      description: 'Our secure verification system allows you to create a trusted student profile while maintaining complete anonymity when sharing sensitive concerns. Verified profiles enhance your credibility while still protecting your privacy.',
      features: [
        'Secure one-time verification process using Aadhar',
        'Encrypted storage of verification data',
        'Control what information is visible to others',
        'Toggle between anonymous and verified modes',
        'Verified badge on comments while maintaining post anonymity',
        'verify how you are via aadhar',
      ],
     
    },
    {
      id: 5,
      image: 'https://plus.unsplash.com/premium_photo-1667516587165-3f481275a7e0?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Expert Moderator Support',
      description: 'Connect directly with our trained moderators for personalized guidance on academic, personal, and career challenges. Our team includes counselors, academic advisors, and subject specialists to provide comprehensive support.',
      features: [
        'One-on-one confidential chat sessions with specialists',
        'Scheduled appointments with subject matter experts',
        'Quick response for urgent issues and crisis support',
        'Follow-up support and progress tracking',
        'Resource recommendations tailored to your situation',
      ],
     
    },
    {
      id: 6,
      image: 'https://images.pexels.com/photos/30965500/pexels-photo-30965500.jpeg',
      title: 'Secure Case Tracking',
      description: 'Monitor the progress of your reported issues through our secure case tracking system. Each report receives a unique identifier that allows you to follow updates without compromising your identity.',
      features: [
        'Real-time status updates on your reported cases',
        'Secure communication channel with case handlers',
        'Documentation storage for case-related materials',
        'Anonymous feedback options on resolution process',
        'Historical case archive for your reference',
        'track your progress to make your future better',
      ],
     
    },
  ];

  // --- Community post data ---
  const communityPosts = [
    {
      id: 1,
      image: 'https://plus.unsplash.com/premium_photo-1670002454477-d8916d2aa568?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      badge: 'Academic Pressure',
      title: 'Dealing with Overwhelming Exam Pressure',
      author: 'Anonymous Student',
      date: '2 days ago',
      excerpt: "I'm feeling extremely stressed about upcoming exams. My professors have unrealistic expectations and I'm struggling to cope...",
      link: '/posts/academic-pressure',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/6256107/pexels-photo-6256107.jpeg',
      badge: 'Harassment',
      title: 'Facing Continuous Harassment in Classroom',
      author: 'Protected Identity',
      date: '1 week ago',
      excerpt: "A group of students in my class have been targeting me for months. I've tried talking to teachers but nothing has changed...",
     
      
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg',
      badge: 'Mental Health',
      title: 'Seeking Support for Anxiety and Depression',
      author: 'Anonymous Student',
      date: '3 days ago',
      excerpt: "I've been struggling with anxiety and depression. My academic performance is suffering but I'm afraid to tell my parents...",
  
    },
  ];

  // --- Moderator data ---
  const moderators = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/9991917/pexels-photo-9991917.jpeg',
      name: 'Priya Sharma',
      title: 'Student Counselor & Academic Advisor',
      description: 'Specialized in helping students overcome academic challenges, exam pressure, and career planning. Available for one-on-one confidential sessions.',
      connectLink: '/moderator-connect?id=priya',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/15930856/pexels-photo-15930856.jpeg',
      name: 'Rajan Verma',
      title: 'Harassment Support Specialist',
      description: 'Experienced in handling sensitive cases of harassment and bullying. Provides guidance on reporting processes and emotional support.',
      connectLink: '/moderator-connect?id=rajan',
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/7693741/pexels-photo-7693741.jpeg',
      name: 'Dr. Meera Patel',
      title: 'Mental Health Coach',
      description: 'Certified in student mental health support, specializing in anxiety, depression, and stress management techniques for academic success.',
      connectLink: '/moderator-connect?id=meera',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'Vikram Singh',
      title: 'Career Development Specialist',
      description: 'Expert in guiding students through career options, resume building, and skill development for competitive professional environments.',
      connectLink: '/moderator-connect?id=vikram',
    },
  ];

  return (
    <div className={`min-h-screen bg-white font-sans font-[Open_Sans] transition-colors duration-500 ${isPageLoaded ? 'bg-white' : 'bg-black'}`}>



      {/* Hero Slider Section */}
      <section className="hero-slider relative h-[700px] overflow-hidden">
        <div className="swiper w-full h-full">
          <div className="swiper-wrapper h-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`swiper-slide h-full flex items-center justify-center relative ${
                  index === currentSlide ? '' : 'hidden'
                }`}
                style={{ backgroundImage: `url(${slide.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
                {/* Slide Content */}
                <div className={`slide-content relative text-white max-w-4xl px-6 text-center z-10 transition-all duration-500 ease-in-out ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                  <h1 className="text-5xl md:text-6xl font-bold mb-8 text-white text-shadow text-[Montserrat]">{slide.title}</h1>
                  <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-[Open_Sans]">{slide.description}</p>
                  <div className="hero-buttons flex justify-center gap-6">
                    <Link to={slide.button1.href} className="btn btn-primary px-8 py-4 text-lg font-semibold bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                      {slide.button1.text}
                    </Link>
                    <Link to={slide.button2.href} className="btn btn-secondary px-8 py-4 text-lg font-semibold bg-green-500 text-white border border-green-500 rounded-md hover:bg-green-600 hover:border-green-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                      {slide.button2.text}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Slider pagination */}
          <div className="swiper-pagination absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
          {/* Slider navigation buttons */}
          <div
            className="swiper-button-prev absolute top-1/2 left-4 transform -translate-y-1/2 w-12 h-12 bg-black/30 rounded-full text-white flex items-center justify-center cursor-pointer transition-colors duration-300 hover:bg-blue-600 z-10"
            onClick={prevSlide}
          >
            <i className="fas fa-chevron-left text-xl"></i>
          </div>
          <div
            className="swiper-button-next absolute top-1/2 right-4 transform -translate-y-1/2 w-12 h-12 bg-black/30 rounded-full text-white flex items-center justify-center cursor-pointer transition-colors duration-300 hover:bg-blue-600 z-10"
            onClick={nextSlide}
          >
            <i className="fas fa-chevron-right text-xl"></i>
          </div>
        </div>
      </section>

      {/* Quick Info Boxes */}
      <section className="quick-info -mt-24 relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="info-boxes grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {infoBoxes.map((box, index) => (
              <div
                key={box.id}
                className="info-box bg-white rounded-lg p-8 text-center shadow-lg transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden"
                data-aos="fade-up"
                data-aos-delay={`${index * 100}`}
              >
                <div className="info-icon w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                  <i className={`fas ${box.icon} text-blue-600 text-2xl transition-all duration-300`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3 font-[Montserrat]">{box.title}</h3>
                <p className="text-gray-600 mb-6">{box.description}</p>
                <Link to={box.link} className="info-link inline-flex items-center text-blue-600 font-semibold transition-colors duration-300 hover:text-blue-800">
                  {box.linkText} <i className="fas fa-arrow-right ml-2 transition-transform duration-300 hover:translate-x-1"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main>
        {/* About Section */}
        <section className="about-section py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="section-heading text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold relative inline-block mb-4 font-[Montserrat]">About TATHYA</h2>
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Empowering students to overcome challenges and build a better future</p>
            </div>
            <div className="about-content grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" ref={aboutSectionRef} data-aos="fade-up">
              <div className="about-text" data-aos="fade-right">
                <h3 className="text-2xl font-bold text-blue-600 mb-4 font-[Montserrat]">Your Safe Haven</h3>
                <p className="mb-6">
                  TATHYA is a supportive web application designed for students facing challenges such as unfair treatment, harassment, or excessive pressure from educational institutions or teachers. We provide a secure online environment where users can share issues anonymously and receive community advice.
                </p>
                <h3 className="text-2xl font-bold text-blue-600 mb-4 font-[Montserrat]">Our Mission</h3>
                <p className="mb-6">
                  To create a safe, anonymous platform where students can report issues, get support from their community, and access tools for personal and career development - all while prioritizing safety and ease of use.
                </p>
                <div className="about-stats flex gap-8 mb-6">
                  <div className="stat-item text-center">
                   
                   
                  </div>
                  <div className="stat-item text-center">
               
                   
                  </div>
                </div>
                
              </div>
              <div className="about-image relative rounded-lg overflow-hidden shadow-xl" data-aos="fade-left">
                <img
                  src="https://plus.unsplash.com/premium_photo-1723662203269-799701369944?q=80&w=1027&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Indian students supporting each other"
                  className="w-full h-auto object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="image-caption absolute bottom-0 left-0 w-full bg-black/70 text-white p-4 text-sm text-center">
                  Building a supportive community where every student feels safe and heard
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Features Section (Main Features) */}
        <section className="announcements-section py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="section-heading text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold relative inline-block mb-4 font-[Montserrat]">How TATHYA Supports You</h2>
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Comprehensive platform features designed to empower students in challenging situations</p>
            </div>
            <div className="announcement-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
              {mainFeatureCards.map((card, index) => (
                <div
                  key={card.id}
                  className="feature-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
                  data-aos="fade-up"
                  data-aos-delay={`${index * 100}`}
                >
                  <div className="feature-image h-60 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                    />
                  </div>
                  <div className="feature-content p-8 flex-1 flex flex-col">
                    <div className="feature-header mb-6">
                      <h3 className="text-2xl text-blue-600 font-bold mb-3 min-h-[60px] flex items-center font-[Montserrat]">{card.title}</h3>
                      <p className="text-gray-700 text-base line-height-1-6 min-h-[80px] mb-4">{card.description}</p>
                    </div>
                    <ul className="feature-list list-none p-0 m-0 flex-1">
                      {card.features.map((feature, idx) => (
                        <li key={idx} className="relative pl-6 mb-2 text-gray-600 text-sm line-height-1-5">
                          <span className="absolute left-0 top-1 text-green-500">
                            <i className="fas fa-check"></i>
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to={card.link} className="feature-link inline-flex items-center text-blue-600 font-semibold mt-auto transition-colors duration-300 hover:text-blue-800">
                      {card.linkText} <i className="fas fa-arrow-right ml-2 transition-transform duration-300 hover:translate-x-1"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Support Services (Suggestions) - Now under Support Features */}
            <div className="section-heading text-center mb-16 mt-12" data-aos="fade-up">
              <h3 className="text-3xl font-bold relative inline-block mb-4 font-[Montserrat]">Additional Support Services</h3>
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Comprehensive resources for your academic and personal wellbeing</p>
            </div>
            <div className="announcement-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
              {additionalFeatureCards.map((card, index) => (
                <div
                  key={card.id}
                  className="feature-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl flex flex-col h-full"
                  data-aos="fade-up"
                  data-aos-delay={`${(index + 3) * 100}`} // Delay slightly more than main features
                >
                  <div className="feature-image h-60 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
                    />
                  </div>
                  <div className="feature-content p-8 flex-1 flex flex-col">
                    <div className="feature-header mb-6">
                      <h3 className="text-2xl text-blue-600 font-bold mb-3 min-h-[60px] flex items-center font-[Montserrat]">{card.title}</h3>
                      <p className="text-gray-700 text-base line-height-1-6 min-h-[80px] mb-4">{card.description}</p>
                    </div>
                    <ul className="feature-list list-none p-0 m-0 flex-1">
                      {card.features.map((feature, idx) => (
                        <li key={idx} className="relative pl-6 mb-2 text-gray-600 text-sm line-height-1-5">
                          <span className="absolute left-0 top-1 text-green-500">
                            <i className="fas fa-check"></i>
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to={card.link} className="feature-link inline-flex items-center text-blue-600 font-semibold mt-auto transition-colors duration-300 hover:text-blue-800">
                      {card.linkText} <i className="fas fa-arrow-right ml-2 transition-transform duration-300 hover:translate-x-1"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center" data-aos="fade-up">
              <p className="text-xl mb-6">Our platform is constantly evolving with new features based on student feedback and needs</p>
              
              <Link to="/success-stories" className="btn btn-outline px-6 py-3 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                Read Success Stories
              </Link>
            </div>
          </div>
        </section>

        {/* Community Posts Section */}
        <section className="community-section py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="section-heading text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold relative inline-block mb-4 font-[Montserrat]">Student Community Posts</h2>
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Read, comment, and support fellow students with their challenges</p>
            </div>
            <div className="post-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {communityPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="post-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl"
                  data-aos="fade-up"
                  data-aos-delay={`${(index + 1) * 100}`}
                >
                  <div className="post-image h-52 overflow-hidden relative">
                    <img src={post.image} alt={`Student post - ${post.title}`} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                    <div className="post-badge absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs z-10">{post.badge}</div>
                  </div>
                  <div className="post-content p-6">
                    <h3 className="post-title text-xl font-bold mb-3 line-height-1-4 font-[Montserrat]">
                      <Link to={post.link} className="text-gray-800 hover:text-blue-600">{post.title}</Link>
                    </h3>
                    <div className="post-meta flex justify-between text-gray-500 text-xs mb-4">
                      <span><i className="far fa-user mr-1"></i> {post.author}</span>
                      <span><i className="far fa-clock mr-1"></i> {post.date}</span>
                    </div>
                    <p className="post-excerpt text-gray-600 mb-4 text-sm line-height-1-6">{post.excerpt}</p>
                    <div className="post-actions flex justify-between border-t border-gray-200 pt-4">
                      <button
                        className={`post-btn flex items-center text-gray-500 text-sm transition-colors duration-300 ${
                          likedPosts[`post${post.id}`] ? 'text-red-500' : 'hover:text-blue-600'
                        }`}
                        onClick={() => handleLike(`post${post.id}`)}
                      >
                        <i className={`mr-1 text-base ${likedPosts[`post${post.id}`] ? 'fas fa-heart' : 'far fa-heart'}`}></i> {postLikes[`post${post.id}`]} Likes
                      </button>
                      <Link to="#" className="post-btn flex items-center text-gray-500 text-sm transition-colors duration-300 hover:text-blue-600">
                        <i className="far fa-comment mr-1 text-base"></i> 18 Comments
                      </Link>
                      <Link to="#" className="post-btn flex items-center text-gray-500 text-sm transition-colors duration-300 hover:text-blue-600">
                        <i className="far fa-share-square mr-1 text-base"></i> Share
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8" data-aos="fade-up">
              <Link to="/create-post" className="btn btn-primary px-6 py-3 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg mr-4">
                Share Your Story
              </Link>
              <Link to="/community-feed" className="btn btn-outline px-6 py-3 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                View All Posts
              </Link>
            </div>
          </div>
        </section>

        {/* Profile Verification Section */}
        <section className="profile-section py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="section-heading text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold relative inline-block mb-4 font-[Montserrat]">Secure Profile Management</h2>
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Verify your identity securely to access enhanced features</p>
            </div>
            <div className="profile-content grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="profile-text" data-aos="fade-right">
                <h3 className="text-2xl font-bold text-blue-600 mb-4 font-[Montserrat]">Verified Student Profiles</h3>
                <p className="mb-6">Our secure verification system helps you create a trusted academic profile while maintaining complete privacy.</p>
                <div className="verification-steps mt-6">
                  <div className="step-item flex mb-6">
                    <div className="step-number w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mr-4">1</div>
                    <div className="step-content flex-1">
                      <h4 className="text-lg font-semibold mb-1 font-[Montserrat]">Create Your Profile</h4>
                      <p>Set up your basic academic profile and preferences</p>
                    </div>
                  </div>
                  <div className="step-item flex mb-6">
                    <div className="step-number w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mr-4">2</div>
                    <div className="step-content flex-1">
                      <h4 className="text-lg font-semibold mb-1 font-[Montserrat]">Connect with Authority</h4>
                      <p>Link your institutional credentials securely</p>
                    </div>
                  </div>
                  <div className="step-item flex mb-6">
                    <div className="step-number w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mr-4">3</div>
                    <div className="step-content flex-1">
                      <h4 className="text-lg font-semibold mb-1 font-[Montserrat]">Submit Documents</h4>
                      <p>Upload required documents through encrypted portal</p>
                    </div>
                  </div>
                  <div className="step-item flex mb-6">
                    <div className="step-number w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mr-4">4</div>
                    <div className="step-content flex-1">
                      <h4 className="text-lg font-semibold mb-1 font-[Montserrat]">Verification Complete</h4>
                      <p>Access all premium features with verified status</p>
                    </div>
                  </div>
                </div>
               
              </div>
              <div className="profile-image" data-aos="fade-left">
                <img src="https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg" alt="Profile verification process" className="w-full h-auto rounded-lg shadow-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Moderator Support Section */}
        <section className="moderator-section py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="section-heading text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold relative inline-block mb-4 font-[Montserrat]">Talk to Moderators</h2>
              <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Get personalized support and guidance from our trained moderators</p>
            </div>
            <div className="moderator-cards grid grid-cols-1 lg:grid-cols-2 gap-12">
              {moderators.map((moderator, index) => (
                <div
                  key={moderator.id}
                  className="moderator-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl flex"
                  data-aos="fade-up"
                  data-aos-delay={`${(index + 1) * 100}`}
                >
                  <div className="moderator-image w-1/3 relative overflow-hidden">
                    <img src={moderator.image} alt={`Moderator - ${moderator.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="moderator-info w-2/3 p-6">
                    <h3 className="moderator-name text-2xl text-blue-600 mb-1 font-[Montserrat]">{moderator.name}</h3>
                    <p className="moderator-title text-gray-600 text-sm italic mb-4">{moderator.title}</p>
                    <p className="moderator-description text-gray-700 text-base mb-4">{moderator.description}</p>
                    <div className="moderator-contact mt-4">
                      <Link href =  'moderator' className="inline-flex items-center text-blue-600 font-semibold">
                        <i className="fas fa-comment mr-2"></i> Start Confidential Chat
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8" data-aos="fade-up">
              <Link to="/moderator" className="btn btn-secondary px-6 py-3 bg-green-500 text-white border border-green-500 rounded-md hover:bg-green-600 hover:border-green-600 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                Connect with a Moderator
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 pt-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-gray-700">
            <div className="footer-column footer-logo-section">
              <div className="footer-logo text-3xl font-bold text-white mb-4 font-[Montserrat]">TATHYA</div>
              <p className="footer-tagline mb-6 line-height-1-8">
                A supportive platform for students facing challenges, providing anonymous reporting, community advice, and tools for personal and career development.
              </p>
              <div className="footer-contact mb-6">
                <p className="flex items-center mb-2"><i className="fas fa-map-marker-alt w-5 mr-3 text-green-400"></i> Anonymous Support Center, Safe Campus Initiative</p>
                <p className="flex items-center mb-2"><i className="fas fa-phone w-5 mr-3 text-green-400"></i> (555) 123-4567</p>
                <p className="flex items-center mb-2"><i className="fas fa-envelope w-5 mr-3 text-green-400"></i> support@tathya.edu</p>
              </div>
              <div className="footer-social flex gap-4 mt-6">
                <a href="#" className="social-icon w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center text-gray-300 transition-colors duration-300 hover:bg-green-500 hover:text-white hover:transform hover:-translate-y-1" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="social-icon w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center text-gray-300 transition-colors duration-300 hover:bg-green-500 hover:text-white hover:transform hover:-translate-y-1" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-icon w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center text-gray-300 transition-colors duration-300 hover:bg-green-500 hover:text-white hover:transform hover:-translate-y-1" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-icon w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center text-gray-300 transition-colors duration-300 hover:bg-green-500 hover:text-white hover:transform hover:-translate-y-1" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="text-xl text-white mb-6 relative pb-2 font-bold font-[Montserrat]">Support Services</h3>
              <div className="footer-links">
                <ul className="list-none p-0 m-0">
                  <li className="mb-2"><Link to="/report-issue" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Anonymous Reporting</Link></li>
                  <li className="mb-2"><Link to="/case-tracking" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Case Tracking</Link></li>
                  <li className="mb-2"><Link to="/community-advice" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Community Support</Link></li>
                  <li className="mb-2"><Link to="/crisis-resources" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Crisis Resources</Link></li>
                  <li className="mb-2"><Link to="/privacy-safety" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Privacy & Safety</Link></li>
                </ul>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="text-xl text-white mb-6 relative pb-2 font-bold font-[Montserrat]">Career Tools</h3>
              <div className="footer-links">
                <ul className="list-none p-0 m-0">
                  <li className="mb-2"><Link to="/profile-manager" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Profile Manager</Link></li>
                  <li className="mb-2"><Link to="/resume-builder" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Resume Builder</Link></li>
                  <li className="mb-2"><Link to="/career-guidance" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Career Guidance</Link></li>
                  <li className="mb-2"><Link to="/study-resources" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Study Resources</Link></li>
                  <li className="mb-2"><Link to="/aadhar-verification" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Aadhar Verification</Link></li>
                </ul>
              </div>
            </div>
            <div className="footer-column">
              <h3 className="text-xl text-white mb-6 relative pb-2 font-bold font-[Montserrat]">Community</h3>
              <div className="footer-links">
                <ul className="list-none p-0 m-0">
                  <li className="mb-2"><Link to="/community-guidelines" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Community Guidelines</Link></li>
                  <li className="mb-2"><Link to="/user-roles" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">User Roles</Link></li>
                  <li className="mb-2"><Link to="/moderator-support" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Moderator Support</Link></li>
                  <li className="mb-2"><Link to="/success-stories" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">Success Stories</Link></li>
                  <li className="mb-2"><Link to="/faq" className="text-gray-300 transition-colors duration-300 hover:text-white hover:transform hover:translate-x-1">FAQ</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom flex flex-col md:flex-row justify-between items-center py-6">
            <div className="copyright text-gray-500 text-sm">
              &copy; 2025 TATHYA. All rights reserved. Supporting students safely and anonymously.
            </div>
            <div className="footer-bottom-links flex gap-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-500 text-sm transition-colors duration-300 hover:text-white">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-gray-500 text-sm transition-colors duration-300 hover:text-white">Terms of Service</Link>
              <Link to="/data-protection" className="text-gray-500 text-sm transition-colors duration-300 hover:text-white">Data Protection</Link>
              <Link to="/contact" className="text-gray-500 text-sm transition-colors duration-300 hover:text-white">Contact Support</Link>
            </div>
          </div>
        </div>
        {showScrollTop && (
          <div
            className="scroll-to-top fixed bottom-5 right-5 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-99 shadow-md transition-all duration-300 hover:bg-blue-700 hover:transform hover:-translate-y-1 hover:shadow-lg"
            onClick={scrollToTop}
          >
            <i className="fas fa-arrow-up"></i>
          </div>
        )}
      </footer>
    </div>
  );
};

export default About;