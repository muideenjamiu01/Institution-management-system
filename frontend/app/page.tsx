'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  ArrowRight,
  Users,
  FileText,
  BookOpen,
  TrendingUp,
  Shield,
  Settings,
  CheckCircle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Smooth scroll helper
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Counter hook for animated numbers
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startCount = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(startCount + (end - startCount) * easeOut);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return { count, ref };
};

// Counter component
const Counter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const { count, ref } = useCounter(end, duration);
  
  return (
    <div ref={ref} className="text-3xl font-bold text-gray-900">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzM3NDBmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold"
                >
                  🎓 Transforming African Education
                </motion.div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Modern Institution
                  <span className="block text-blue-600">Management System</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Streamline admissions, student management, and academic operations
                  with our comprehensive platform built for African institutions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/applicant/register">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#portals">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Portals
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <Counter end={10000} suffix="+" />
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div>
                  <Counter end={50} suffix="+" />
                  <div className="text-sm text-gray-600">Programs</div>
                </div>
                <div>
                  <Counter end={99} suffix="%" />
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="African students studying"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Quality Education</div>
                    <div className="text-lg font-bold text-gray-900">
                      Accredited Programs
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Why Choose Our Platform?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your institution effectively
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Users,
                title: 'Student Management',
                description:
                  'Comprehensive student records, attendance tracking, and performance monitoring.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: FileText,
                title: 'Application Processing',
                description:
                  'Streamlined admission process from application to enrollment.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: BookOpen,
                title: 'Course Management',
                description:
                  'Organize courses, schedules, and academic resources efficiently.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: TrendingUp,
                title: 'Analytics & Reports',
                description:
                  'Data-driven insights for better decision making and planning.',
                color: 'bg-orange-100 text-orange-600',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description:
                  'Bank-grade security with regular backups and data protection.',
                color: 'bg-red-100 text-red-600',
              },
              {
                icon: Settings,
                title: 'Easy Integration',
                description:
                  'Seamlessly integrate with existing systems and workflows.',
                color: 'bg-indigo-100 text-indigo-600',
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="portals" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Access Your Portal
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600">
              Choose your portal to get started
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Applicant Portal */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full overflow-hidden group hover:shadow-2xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&q=80"
                    alt="Applicant Portal"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">
                      Applicant Portal
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-600">
                    Start your academic journey. Apply for admission and track your
                    application status.
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Submit Applications',
                      'Upload Documents',
                      'Track Application Status',
                      'Payment Processing',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-4">
                    <Link href="/applicant/login" className="flex-1" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/applicant/register" className="flex-1" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">Register</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Student Portal */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full overflow-hidden group hover:shadow-2xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
                    alt="Student Portal"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">Student Portal</h3>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-600">
                    Access your academic resources, courses, and results all in one
                    place.
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Course Registration',
                      'View Results & Grades',
                      'Academic Calendar',
                      'Payment & Invoices',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/student/login" className="block pt-4" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Access Portal</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Admin Portal */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full overflow-hidden group hover:shadow-2xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80"
                    alt="Admin Portal"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">Admin Portal</h3>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-600">
                    Manage all institutional operations, users, and system
                    configurations.
                  </p>
                  <ul className="space-y-2">
                    {[
                      'User Management',
                      'Admission Control',
                      'Reports & Analytics',
                      'System Configuration',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className="block pt-4" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="secondary">
                      Staff Login
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                About Us
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Empowering Education Across Africa
              </h2>
              <p className="text-lg text-gray-600">
                Our Institutional Management System is designed specifically for African
                educational institutions, combining modern technology with local needs
                and requirements.
              </p>
              <p className="text-gray-600">
                We understand the unique challenges faced by institutions across the
                continent and have built a platform that addresses them head-on. From
                admission processing to student management, from course registration to
                results publication - we've got you covered.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Built for Africa</h4>
                    <p className="text-gray-600 text-sm">
                      Designed with African institutions in mind
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Easy to Use</h4>
                    <p className="text-gray-600 text-sm">
                      Intuitive interface requiring minimal training
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-gray-600 text-sm">
                      Round-the-clock assistance for all users
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80"
                  alt="Students learning"
                  className="rounded-lg shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80"
                  alt="Education"
                  className="rounded-lg shadow-lg mt-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80"
                  alt="Graduation"
                  className="rounded-lg shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80"
                  alt="Campus"
                  className="rounded-lg shadow-lg mt-8"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of students and institutions using our platform to
              achieve academic excellence.
            </p>
            <Link href="/applicant/register" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
