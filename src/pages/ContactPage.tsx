import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactPageProps {
  navigate: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { submitContact } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    submitContact(name, email, subject, message);
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const faqs = [
    {
      q: 'How do I upload my story or PDF?',
      a: 'Click the "Upload Story" button in the top navigation bar. Fill out your story details, genre, and synopsis, and either upload a PDF document or paste your chapters manually. Once submitted, our team reviews it for publishing.',
    },
    {
      q: 'Is it completely free to read and download on StoryNest?',
      a: 'Yes! All stories published on StoryNest can be read online for free without paywalls or subscription fees. You can also generate high-resolution PDF copies for personal offline reading.',
    },
    {
      q: 'How can I report copyright violations or inappropriate content?',
      a: 'When viewing any story, click the "Report Story" flag button in the bottom or side control bar. Our editorial team inspects every report within 24 hours.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header (Recreated from Screenshot #6) */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Get in Touch
        </div>

        <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100">
          We'd love to <span className="text-amber-400 font-normal italic">hear</span> from you.
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">
          Have a question, feedback, or a story to share? Reach out to us anytime and our team will get back to you.
        </p>
      </div>

      {/* Main Grid: Form on Left, Contact Info on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Form Box (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b111e] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="font-serif-heading text-xl font-bold text-slate-100 mb-1">
            Send Us a Message
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Fill in the details below and we will respond within 24 business hours.
          </p>

          {submitted ? (
            <div className="py-12 text-center space-y-4 bg-slate-900/40 rounded-xl border border-emerald-500/30 p-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-serif-heading text-lg font-bold text-slate-100">
                Message Sent Successfully!
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you for reaching out. We have logged your query and will reply to your email address shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="How can we assist you?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Message
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all duration-200 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6 bg-[#0b111e] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div>
            <h3 className="font-serif-heading text-xl font-bold text-slate-100 mb-1">
              Contact Information
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Connect directly with our support, editorial, or community management desk.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Email Address</h4>
                  <a
                    href="mailto:nithinofficial3093@gmail.com"
                    className="text-xs text-slate-300 hover:text-amber-400 mt-0.5 block transition-colors"
                  >
                    nithinofficial3093@gmail.com
                  </a>
                  <p className="text-[11px] text-slate-500">Official Author & Support Desk</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Phone & WhatsApp</h4>
                  <a
                    href="tel:7093569420"
                    className="text-xs text-slate-300 hover:text-amber-400 mt-0.5 block transition-colors"
                  >
                    7093569420
                  </a>
                  <p className="text-[11px] text-slate-500">Available on Call & WhatsApp</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Location</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Andhra Pradesh, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">Connect on Instagram & Socials</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/nithinreddy3093/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-500/10 border border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/20 text-pink-300 text-xs font-medium transition-all"
                aria-label="Instagram @nithinreddy3093"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>@nithinreddy3093</span>
              </a>
              <a
                href="mailto:nithinofficial3093@gmail.com"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
                aria-label="Email"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="tel:7093569420"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors"
                aria-label="Call"
                title="Call 7093569420"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Help FAQ Section (Recreated from Screenshot #6) */}
      <div className="border-t border-slate-800/80 pt-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="font-serif-heading text-2xl font-bold text-slate-100">
            Looking for quick help?
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#0b111e] border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-slate-200 hover:text-amber-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
