'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Calendar, HelpCircle, Pill, Activity, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  activity: string;
  description: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const COMMON_FAQS: FAQ[] = [
  {
    id: '1',
    question: 'What should I do if I notice new patches on my skin?',
    answer: 'New patches should be reported to your healthcare provider immediately. Take clear photos and note the location and date. Do not delay seeking medical attention as early detection is crucial.',
    category: 'Detection'
  },
  {
    id: '2',
    question: 'How should I take care of my skin daily?',
    answer: 'Daily care includes: (1) Gentle cleansing with mild soap, (2) Keeping skin moisturized, (3) Protecting from sun exposure, (4) Checking for any new patches, (5) Applying prescribed medications as directed.',
    category: 'Care'
  },
  {
    id: '3',
    question: 'What should I avoid to prevent complications?',
    answer: 'Avoid: (1) Prolonged sun exposure, (2) Extreme temperature changes, (3) Trauma to affected areas, (4) Tight clothing over affected skin, (5) Sharing personal items like towels or razors.',
    category: 'Prevention'
  },
  {
    id: '4',
    question: 'How important is medication adherence?',
    answer: 'Medication adherence is critical. Missing doses can lead to treatment failure, drug resistance, and complications. Set reminders, keep a medication log, and always take your medications as prescribed.',
    category: 'Medication'
  },
  {
    id: '5',
    question: 'Can I exercise with leprosy?',
    answer: 'Yes, light to moderate exercise is beneficial. However, avoid activities that may cause injury to affected areas. Start with gentle exercises and gradually increase intensity. Always consult with your healthcare provider.',
    category: 'Lifestyle'
  },
  {
    id: '6',
    question: 'How often should I visit my doctor?',
    answer: 'Initially, monthly visits are common during active treatment. As your condition improves, this may be reduced. Always keep scheduled appointments and report any new symptoms immediately.',
    category: 'Medical'
  },
  {
    id: '7',
    question: 'What dietary changes should I make?',
    answer: 'Focus on: (1) Nutritious, balanced diet, (2) Adequate protein for skin healing, (3) Fruits and vegetables rich in vitamins, (4) Adequate hydration, (5) Limit processed foods and sugar.',
    category: 'Nutrition'
  },
  {
    id: '8',
    question: 'How do I manage nerve-related complications?',
    answer: 'Nerve complications require special attention. Protect affected limbs from injury, perform regular sensation checks, use protective eyewear if eyes are affected, and do regular nerve function exercises as instructed.',
    category: 'Complications'
  }
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: '1',
    day: 'Monday',
    time: '08:00 AM',
    activity: 'Morning Medication',
    description: 'Take prescribed MDT (Multi-Drug Therapy) medications with water'
  },
  {
    id: '2',
    day: 'Monday',
    time: '09:00 AM',
    activity: 'Skin Care Routine',
    description: 'Gentle cleansing, moisturizing affected areas'
  },
  {
    id: '3',
    day: 'Monday',
    time: '06:00 PM',
    activity: 'Evening Medication',
    description: 'Take evening dose of medications'
  },
  {
    id: '4',
    day: 'Tuesday',
    time: '08:00 AM',
    activity: 'Morning Medication',
    description: 'Take prescribed MDT medications'
  },
  {
    id: '5',
    day: 'Tuesday',
    time: '03:00 PM',
    activity: 'Nerve Function Check',
    description: 'Check sensation in affected areas, perform mobility exercises'
  },
  {
    id: '6',
    day: 'Wednesday',
    time: '08:00 AM',
    activity: 'Light Exercise',
    description: 'Gentle stretching and light physical activity'
  },
  {
    id: '7',
    day: 'Friday',
    time: '10:00 AM',
    activity: 'Symptom Documentation',
    description: 'Record any new symptoms or changes in existing conditions'
  },
  {
    id: '8',
    day: 'Sunday',
    time: '06:00 PM',
    activity: 'Weekly Review',
    description: 'Review the week, prepare for upcoming week, note any concerns'
  }
];

export default function LeprosyAssistantPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'symptoms' | 'schedule' | 'qa'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Leprosy Care Assistant. I\'m here to help you manage your leprosy treatment journey. You can discuss your symptoms, ask questions about self-care, or get information about your treatment plan. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [symptoms, setSymptoms] = useState({
    skinPatches: false,
    numbness: false,
    weakness: false,
    eyeIssues: false,
    painfulNerves: false,
    other: ''
  });
  const [symptomNotes, setSymptomNotes] = useState('');
  
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [searchFAQ, setSearchFAQ] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('http://localhost:4000/api/chat/leprosy-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: user._id,
          context: 'leprosy_care'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply || 'I understand. Please provide more details so I can better assist you.',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response if API fails
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: generateAssistantResponse(inputMessage),
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAssistantResponse(inputMessage),
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAssistantResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      return 'Medication adherence is crucial for leprosy treatment. Please take your MDT (Multi-Drug Therapy) medications exactly as prescribed. Do not skip doses even if you feel better. If you experience side effects, report them to your healthcare provider immediately.';
    }
    if (lowerMessage.includes('skin') || lowerMessage.includes('patch')) {
      return 'Skin monitoring is important. Check your skin regularly for any new patches or changes. If you notice anything new or unusual, document it with photos and report to your doctor at your next visit.';
    }
    if (lowerMessage.includes('nerve') || lowerMessage.includes('sensation')) {
      return 'Nerve damage is a concern with leprosy. Regularly check the sensation in your hands, feet, and face. Perform gentle exercises as instructed. If you notice any numbness or weakness, contact your healthcare provider.';
    }
    if (lowerMessage.includes('treatment') || lowerMessage.includes('cure')) {
      return 'Leprosy is curable with proper treatment. Most patients become non-infectious after the first dose of MDT. Complete treatment usually takes 6-12 months depending on the type. Regular follow-up is essential even after treatment completion.';
    }
    if (lowerMessage.includes('contagious') || lowerMessage.includes('spread')) {
      return 'Untreated leprosy can be contagious through respiratory droplets with close, prolonged contact. However, once you start treatment, you become non-infectious within a few weeks. People in close contact should be monitored by a healthcare provider.';
    }
    
    return 'Thank you for your question. Based on your concern, I recommend discussing this with your healthcare provider for personalized guidance. In the meantime, ensure you\'re following your medication schedule and keeping your skin care routine consistent.';
  };

  const handleSymptomSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('http://localhost:4000/api/leprosy/symptom-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          symptoms: {
            skinPatches: symptoms.skinPatches,
            numbness: symptoms.numbness,
            weakness: symptoms.weakness,
            eyeIssues: symptoms.eyeIssues,
            painfulNerves: symptoms.painfulNerves,
            other: symptoms.other
          },
          notes: symptomNotes,
          timestamp: new Date()
        })
      });

      if (response.ok) {
        alert('Symptoms logged successfully!');
        setSymptoms({ skinPatches: false, numbness: false, weakness: false, eyeIssues: false, painfulNerves: false, other: '' });
        setSymptomNotes('');
      }
    } catch (error) {
      console.error('Error submitting symptoms:', error);
      alert('Failed to log symptoms. Please try again.');
    }
  };

  const filteredFAQs = COMMON_FAQS.filter(faq =>
    faq.question.toLowerCase().includes(searchFAQ.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchFAQ.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pt-20 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-4xl font-bold">Leprosy Care Assistant</h1>
            <p className="text-red-100 mt-2">Personalized support for your treatment journey</p>
          </div>
          <Heart className="w-12 h-12 text-red-200 opacity-80" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'chat'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'symptoms'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Activity className="w-5 h-5" />
            Symptoms
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'schedule'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'qa'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            Q&A
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-red-50/50 to-white">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-red-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-red-100' : 'text-gray-600'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about your treatment, symptoms, or self-care..."
                    className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Symptoms Tab */}
        {activeTab === 'symptoms' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Log Your Symptoms</h2>
            <p className="text-gray-600 mb-6">Track your symptoms regularly to monitor your condition and share with your healthcare provider.</p>

            <div className="space-y-4 mb-8">
              {[
                { key: 'skinPatches', label: 'New or changing skin patches' },
                { key: 'numbness', label: 'Numbness or loss of sensation' },
                { key: 'weakness', label: 'Weakness in hands or feet' },
                { key: 'eyeIssues', label: 'Eye issues or vision problems' },
                { key: 'painfulNerves', label: 'Painful or thickened nerves' }
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-red-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={symptoms[item.key as keyof typeof symptoms]}
                    onChange={(e) => setSymptoms(prev => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))}
                    className="w-5 h-5 text-red-600 rounded cursor-pointer"
                  />
                  <span className="font-medium text-gray-800">{item.label}</span>
                </label>
              ))}

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Other symptoms or notes</label>
                <textarea
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  placeholder="Describe any other symptoms, severity, or additional observations..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 resize-none"
                  rows={4}
                />
              </div>
            </div>

            <button
              onClick={handleSymptomSubmit}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full font-bold hover:shadow-lg transition-all"
            >
              Log Symptoms
            </button>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Care Schedule</h2>
            <p className="text-gray-600 mb-8">Follow this personalized schedule to manage your treatment and self-care effectively.</p>

            <div className="space-y-4">
              {schedule.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          {item.day}
                        </span>
                        <span className="font-bold text-gray-900">{item.time}</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{item.activity}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <Pill className="w-6 h-6 text-red-600 flex-shrink-0 mt-2" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Set phone reminders for each activity to ensure consistency. Adherence to your schedule is crucial for successful treatment.
              </p>
            </div>
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

            <div className="mb-6">
              <input
                type="text"
                value={searchFAQ}
                onChange={(e) => setSearchFAQ(e.target.value)}
                placeholder="Search questions..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => setSelectedFAQ(selectedFAQ?.id === faq.id ? null : faq)}
                  className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{faq.question}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                        {faq.category}
                      </span>
                    </div>
                    <div className={`text-red-600 transition-transform ${selectedFAQ?.id === faq.id ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>

                  {selectedFAQ?.id === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No questions match your search. Try different keywords.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
