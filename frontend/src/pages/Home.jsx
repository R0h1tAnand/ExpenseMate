import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  UsersIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
  PlayIcon,
  StarIcon,
  Bars3Icon,
  XMarkIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

// Revolving Animation Component
const RevolvingElements = () => {
  const elements = [
    // Orbit 1 (innermost) - 3 icons instead of 4
    { icon: CurrencyDollarIcon, color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', delay: 0, orbit: 1 },
    { icon: CheckCircleIcon, color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', delay: 2.5, orbit: 1 },
    { icon: CreditCardIcon, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', delay: 5, orbit: 1 },
    
    // Orbit 2 - 3 icons instead of 4
    { icon: DocumentTextIcon, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', delay: 1, orbit: 2 },
    { icon: BanknotesIcon, color: 'text-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', delay: 3.5, orbit: 2 },
    { icon: ReceiptPercentIcon, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', delay: 6, orbit: 2 },
    
    // Orbit 3 - 3 icons instead of 4
    { icon: UsersIcon, color: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', delay: 0.5, orbit: 3 },
    { icon: ChartBarIcon, color: 'text-cyan-500', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', delay: 3, orbit: 3 },
    { icon: DocumentCheckIcon, color: 'text-teal-500', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', delay: 5.5, orbit: 3 },
    
    // Orbit 4 - 2 icons instead of 4
    { icon: StarIcon, color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', delay: 1.5, orbit: 4 },
    { icon: CogIcon, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', delay: 5, orbit: 4 },
    
    // Orbit 5 (outermost) - 2 icons instead of 4
    { icon: CheckCircleIcon, color: 'text-green-400', bgColor: 'bg-green-50', borderColor: 'border-green-200', delay: 2, orbit: 5 },
    { icon: CreditCardIcon, color: 'text-purple-400', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', delay: 6, orbit: 5 },
  ];

  const getOrbitRadius = (orbit) => {
    switch(orbit) {
      case 1: return 140;
      case 2: return 180;
      case 3: return 220;
      case 4: return 260;
      case 5: return 300;
      default: return 180;
    }
  };

  const getOrbitSpeed = (orbit) => {
    switch(orbit) {
      case 1: return '15s';
      case 2: return '20s';
      case 3: return '25s';
      case 4: return '30s';
      case 5: return '35s';
      default: return '20s';
    }
  };

  return (
    <div className="relative w-[700px] h-[700px] mx-auto">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] bg-gradient-to-r from-blue-100/30 via-cyan-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
      
      {/* Central Element */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl pulse-glow border-4 border-white">
        <ChartBarIcon className="h-16 w-16 text-white drop-shadow-lg" />
      </div>
      
      {/* Revolving Elements */}
      {elements.map((element, index) => {
        const IconComponent = element.icon;
        const orbitRadius = getOrbitRadius(element.orbit);
        const orbitSpeed = getOrbitSpeed(element.orbit);
        const isReverse = element.orbit % 2 === 0;
        
        return (
          <div
            key={index}
            className="absolute top-1/2 left-1/2 w-16 h-16"
            style={{
              transform: 'translate(-50%, -50%)',
              animation: `revolve ${orbitSpeed} linear infinite ${isReverse ? 'reverse' : ''}`,
              animationDelay: `${element.delay * 0.8}s`,
            }}
          >
            <div
              className={`w-16 h-16 ${element.bgColor} rounded-full shadow-2xl flex items-center justify-center ${element.color} border-2 ${element.borderColor} hover:scale-125 transition-all duration-300 backdrop-blur-sm`}
              style={{
                transform: `translateX(${orbitRadius}px)`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 0 20px rgba(37, 99, 235, 0.2)',
              }}
            >
              <IconComponent className="h-8 w-8 drop-shadow-sm" />
            </div>
          </div>
        );
      })}
      
      {/* Enhanced Orbit Rings - 5 Orbits */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border-2 border-blue-300 rounded-full opacity-60"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-cyan-300 rounded-full opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] border-2 border-emerald-300 rounded-full opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] border-2 border-purple-300 rounded-full opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] border-2 border-amber-300 rounded-full opacity-20"></div>
      
      {/* Additional Inner Rings */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-blue-200 rounded-full opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] border border-cyan-200 rounded-full opacity-25"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] border border-emerald-200 rounded-full opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border border-purple-200 rounded-full opacity-15"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-200 rounded-full opacity-10"></div>
      
      {/* Enhanced Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg" style={{transform: 'translate(190px, -10px)', animation: 'float 4s ease-in-out infinite'}}></div>
        <div className="absolute w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-lg" style={{transform: 'translate(-200px, 15px)', animation: 'float 5s ease-in-out infinite reverse'}}></div>
        <div className="absolute w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-lg" style={{transform: 'translate(10px, -210px)', animation: 'float 6s ease-in-out infinite'}}></div>
        <div className="absolute w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full shadow-lg" style={{transform: 'translate(-15px, 205px)', animation: 'float 4.5s ease-in-out infinite reverse'}}></div>
      </div>
    </div>
  );
};

// Floating Elements Animation
const FloatingElements = () => {
  const floatingItems = [
    { icon: CurrencyDollarIcon, top: '10%', left: '15%', delay: 0, duration: 6 },
    { icon: DocumentTextIcon, top: '20%', right: '10%', delay: 1, duration: 8 },
    { icon: CheckCircleIcon, top: '60%', left: '5%', delay: 2, duration: 7 },
    { icon: BanknotesIcon, bottom: '20%', right: '15%', delay: 3, duration: 9 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className="absolute opacity-10"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
              animation: `float ${item.duration}s ease-in-out infinite`,
              animationDelay: `${item.delay}s`,
            }}
          >
            <IconComponent className="h-16 w-16 text-blue-600" />
          </div>
        );
      })}
    </div>
  );
};

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Add custom CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes revolve {
        0% {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        100% {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-20px) rotate(5deg);
        }
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 30px rgba(37, 99, 235, 0.4), 0 0 60px rgba(6, 182, 212, 0.2);
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          box-shadow: 0 0 50px rgba(37, 99, 235, 0.7), 0 0 100px rgba(6, 182, 212, 0.4);
          transform: translate(-50%, -50%) scale(1.05);
        }
      }
      
      @keyframes gradient-shift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
      
      .pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      
      .gradient-shift {
        background-size: 200% 200%;
        animation: gradient-shift 4s ease infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const features = [
    {
      icon: <DocumentTextIcon className="h-10 w-10" />,
      title: "OCR Receipt Scanning",
      description: "Automatically extract data from receipts using advanced OCR technology. No more manual data entry."
    },
    {
      icon: <CogIcon className="h-10 w-10" />,
      title: "Multi-Level Approvals",
      description: "Set up complex approval workflows with multiple stakeholders and conditional routing."
    },
    {
      icon: <CheckCircleIcon className="h-10 w-10" />,
      title: "Conditional Rules",
      description: "Auto-approve expenses based on amount thresholds, categories, or employee roles."
    },
    {
      icon: <ChartBarIcon className="h-10 w-10" />,
      title: "Real-Time Dashboard",
      description: "Get instant visibility into expense trends, pending approvals, and budget utilization."
    }
  ];

  const workflowSteps = [
    { title: "Employee", description: "Submits expense", status: "completed" },
    { title: "Manager", description: "Reviews & approves", status: "current" },
    { title: "Finance", description: "Validates & processes", status: "pending" },
    { title: "Director", description: "Final approval", status: "pending" }
  ];

  const companies = [
    "TechCorp", "InnovateLtd", "GlobalSoft", "NextGen", "DataFlow", "CloudPro"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Finance Director, TechCorp",
      content: "ExpenseMate reduced our expense processing time by 75%. Game changer!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "CFO, InnovateLtd", 
      content: "The automated workflows saved us countless hours every month.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % workflowSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
                <span className="ml-2 text-xl font-bold text-slate-900">ExpenseMate</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">Home</a>
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">Pricing</a>
              <a href="#resources" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">Resources</a>
              <a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors duration-200">Contact</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
                <a href="#home" className="block px-3 py-2 text-slate-600 hover:text-blue-600">Home</a>
                <a href="#features" className="block px-3 py-2 text-slate-600 hover:text-blue-600">Features</a>
                <a href="#pricing" className="block px-3 py-2 text-slate-600 hover:text-blue-600">Pricing</a>
                <a href="#resources" className="block px-3 py-2 text-slate-600 hover:text-blue-600">Resources</a>
                <a href="#contact" className="block px-3 py-2 text-slate-600 hover:text-blue-600">Contact</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Link to="/login" className="text-center px-3 py-2 text-slate-600 hover:text-slate-900">Login</Link>
                  <Link to="/signup" className="text-center bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg">Sign Up</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 gradient-shift">
        <div className="absolute inset-0 bg-white/5"></div>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
                Simplify Expense Management for{' '}
                <span className="text-emerald-300 drop-shadow-lg">Modern Teams</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed drop-shadow-sm">
                Automate reimbursements, manage approvals, and gain expense visibility — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm hover:border-white/50">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Hero Illustration with Enhanced Revolving Animation */}
            <div className="relative flex items-center justify-center">
              <RevolvingElements />
              
              {/* Enhanced Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 right-10 w-24 h-24 bg-emerald-400/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-36 h-36 bg-blue-400/30 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 right-5 w-20 h-20 bg-cyan-400/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/4 left-1/4 w-28 h-28 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
              </div>
              
              {/* Enhanced Floating particles */}
              <FloatingElements />
            </div>
          </div>
        </div>

        {/* Enhanced Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 -mr-40 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage expenses efficiently, from submission to reimbursement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-slate-200 relative overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Subtle background animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="text-blue-600 mb-6 group-hover:text-emerald-500 transition-all duration-300 transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700">{feature.description}</p>
                </div>
                
                {/* Hover effect corner accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Visualization */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Streamlined Approval Workflow
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Watch how expenses flow through your organization with intelligent routing and automated approvals.
            </p>
          </div>

          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center relative">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-semibold text-white transition-all duration-500 ${
                    index <= currentStep 
                      ? 'bg-emerald-500 shadow-lg' 
                      : index === currentStep + 1 
                        ? 'bg-blue-500 shadow-lg animate-pulse' 
                        : 'bg-slate-300'
                  }`}>
                    {index <= currentStep ? (
                      <CheckCircleIcon className="h-8 w-8" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                  </div>
                  
                  {/* Connecting line */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-slate-300 transform -translate-y-1/2">
                      <div 
                        className={`h-full bg-emerald-500 transition-all duration-500 ${
                          index < currentStep ? 'w-full' : 'w-0'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-slate-600 font-medium">Trusted by 500+ companies worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 opacity-70">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="text-slate-400 font-semibold text-lg bg-slate-100 px-4 py-2 rounded-lg">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-slate-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no long-term contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-slate-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-slate-900 mb-6">$0<span className="text-lg text-slate-600">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-600">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                  Up to 50 expenses/month
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                  Basic approval workflows
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                  Email support
                </li>
              </ul>
              <Link to="/signup" className="block w-full text-center py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors duration-200">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-blue-600 to-blue-700 p-8 rounded-2xl text-white transform scale-105 shadow-xl">
              <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-6">$29<span className="text-lg text-blue-200">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-300 mr-3" />
                  Unlimited expenses
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-300 mr-3" />
                  Advanced workflows
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-300 mr-3" />
                  OCR receipt scanning
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-300 mr-3" />
                  Priority support
                </li>
              </ul>
              <Link to="/signup" className="block w-full text-center py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors duration-200">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-slate-900 mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-600">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                  Custom integrations
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                  Dedicated support
                </li>
                <li className="flex items-center text-slate-600">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                  On-premise deployment
                </li>
              </ul>
              <button className="block w-full text-center py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors duration-200">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/20"></div>
        
        {/* Animated floating icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 opacity-20" style={{ animation: 'float 8s ease-in-out infinite' }}>
            <CurrencyDollarIcon className="h-12 w-12 text-emerald-300" />
          </div>
          <div className="absolute top-32 right-32 opacity-20" style={{ animation: 'float 10s ease-in-out infinite', animationDelay: '2s' }}>
            <DocumentTextIcon className="h-16 w-16 text-white" />
          </div>
          <div className="absolute bottom-32 left-32 opacity-20" style={{ animation: 'float 12s ease-in-out infinite', animationDelay: '4s' }}>
            <CheckCircleIcon className="h-14 w-14 text-emerald-300" />
          </div>
          <div className="absolute bottom-20 right-20 opacity-20" style={{ animation: 'float 9s ease-in-out infinite', animationDelay: '1s' }}>
            <ChartBarIcon className="h-10 w-10 text-white" />
          </div>
          <div className="absolute top-1/2 left-10 opacity-15" style={{ animation: 'float 11s ease-in-out infinite', animationDelay: '3s' }}>
            <BanknotesIcon className="h-12 w-12 text-cyan-300" />
          </div>
          <div className="absolute top-1/3 right-10 opacity-15" style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '5s' }}>
            <CreditCardIcon className="h-12 w-12 text-emerald-200" />
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to streamline your company's expenses?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies who trust ExpenseMate to manage their expense workflows.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 pulse-glow"
          >
            Start Free Trial
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
        
        {/* Enhanced decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-300/20 rounded-full -translate-x-32 -translate-y-32" style={{ animation: 'float 15s ease-in-out infinite' }}></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-300/20 rounded-full translate-x-32 translate-y-32" style={{ animation: 'float 18s ease-in-out infinite', animationDelay: '8s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full" style={{ animation: 'revolve 25s linear infinite' }}></div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company */}
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
                <span className="ml-2 text-xl font-bold">ExpenseMate</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Streamlining expense management for modern organizations worldwide.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Press</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">API Reference</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Status</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors duration-200">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                &copy; 2025 ExpenseMate. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;