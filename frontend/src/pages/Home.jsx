import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: DocumentTextIcon,
      title: "Smart Expense Tracking",
      description: "Automatically categorize and track all your business expenses with AI-powered receipt scanning.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: CheckCircleIcon,
      title: "Streamlined Approvals",
      description: "Multi-level approval workflows that ensure compliance and reduce processing time.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: ChartBarIcon,
      title: "Detailed Analytics",
      description: "Real-time insights and comprehensive reports to help you make informed financial decisions.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access control and audit trails.",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime", icon: ArrowTrendingUpIcon },
    { number: "50K+", label: "Users", icon: UserGroupIcon },
    { number: "24/7", label: "Support", icon: ClockIcon },
    { number: "150+", label: "Countries", icon: GlobeAltIcon }
  ];

  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: "Reduce Costs",
      description: "Save up to 60% on expense processing costs through automation"
    },
    {
      icon: ClockIcon,
      title: "Save Time",
      description: "Process expenses 10x faster with automated workflows"
    },
    {
      icon: LightBulbIcon,
      title: "Gain Insights",
      description: "Make data-driven decisions with real-time expense analytics"
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Mobile First",
      description: "Submit and approve expenses on-the-go with our mobile app"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div 
          className={`container mx-auto px-6 relative z-10 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Expense Management
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Simplified
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              Transform your business expenses with our intelligent platform. 
              Automate approvals, gain insights, and save time with every transaction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link
                  to={`/dashboard/${user.role}`}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Start Free Trial
                    <ArrowRightIcon className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Cards Animation */}
        <div className="absolute top-20 left-10 opacity-20">
          <div className="animate-float">
            <CurrencyDollarIcon className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <div className="animate-float-delayed">
            <ChartBarIcon className="w-16 h-16 text-purple-500" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transform transition-all duration-500 delay-${index * 100} ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for modern businesses, our platform combines powerful features with intuitive design
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  currentFeature === index ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transform Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the benefits that thousands of companies already enjoy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that trust our platform for their expense management needs.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start Your Free Trial
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;