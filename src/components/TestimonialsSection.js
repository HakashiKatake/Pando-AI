'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Marquee } from '@/components/magicui/marquee';
import { motion } from 'framer-motion';
import { Star, Quote, Heart, Brain, Smile } from 'lucide-react';
import WaveDivider from './WaveDivider';

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Psychology Student",
    university: "UC Berkeley",
    content: "PandoAI has been a game-changer for managing my anxiety during finals. The breathing exercises and mood tracking helped me stay centered when everything felt overwhelming.",
    rating: 5,
    mood: "happy",
    avatar: "/asset/happy.png",
    tags: ["Anxiety Relief", "Study Support"]
  },
  {
    id: 2,
    name: "Marcus T.",
    role: "Engineering Student",
    university: "MIT",
    content: "I was skeptical about AI therapy, but the conversations feel so natural and understanding. It's like having a friend who's always there to listen.",
    rating: 5,
    mood: "excellent",
    avatar: "/asset/excellet.png",
    tags: ["AI Chat", "Emotional Support"]
  },
  {
    id: 3,
    name: "Emily R.",
    role: "Pre-Med Student",
    university: "Stanford",
    content: "The habit tracking feature helped me build a sustainable self-care routine. I've never been more consistent with meditation and journaling.",
    rating: 5,
    mood: "happy",
    avatar: "/asset/happy.png",
    tags: ["Habit Building", "Self-Care"]
  },
  {
    id: 4,
    name: "James L.",
    role: "Business Student",
    university: "Wharton",
    content: "Having anonymous access was crucial for me. I could be honest about my struggles without worrying about judgment or academic consequences.",
    rating: 5,
    mood: "neutral",
    avatar: "/asset/neutral.png",
    tags: ["Privacy", "Safe Space"]
  },
  {
    id: 5,
    name: "Zoe K.",
    role: "Art Student",
    university: "RISD",
    content: "The mood music player is incredible! It always knows exactly what I need to hear based on how I'm feeling. It's become part of my daily routine.",
    rating: 5,
    mood: "excellent",
    avatar: "/asset/excellet.png",
    tags: ["Music Therapy", "Mood Support"]
  },
  {
    id: 6,
    name: "David P.",
    role: "Computer Science",
    university: "Carnegie Mellon",
    content: "The emergency resources feature saved me during a really dark period. Knowing help was just a click away gave me the confidence to reach out.",
    rating: 5,
    mood: "happy",
    avatar: "/asset/happy.png",
    tags: ["Crisis Support", "Emergency Help"]
  },
  {
    id: 7,
    name: "Lily C.",
    role: "Literature Student",
    university: "Yale",
    content: "I love how the AI remembers our conversations and builds on them. It feels like a continuous journey of growth and self-discovery.",
    rating: 5,
    mood: "excellent",
    avatar: "/asset/excellet.png",
    tags: ["Continuity", "Growth"]
  },
  {
    id: 8,
    name: "Alex M.",
    role: "Biology Student",
    university: "UCLA",
    content: "The guided breathing exercises helped me through panic attacks. Having something immediate and accessible made all the difference.",
    rating: 5,
    mood: "happy",
    avatar: "/asset/happy.png",
    tags: ["Panic Relief", "Breathing"]
  },
  {
    id: 9,
    name: "Maya S.",
    role: "Social Work Student",
    university: "Columbia",
    content: "As someone studying to help others, I appreciate how PandoAI models healthy coping strategies. It's teaching me as much as it's helping me.",
    rating: 5,
    mood: "excellent",
    avatar: "/asset/excellet.png",
    tags: ["Learning", "Professional Development"]
  },
  {
    id: 10,
    name: "Ryan B.",
    role: "Physics Student",
    university: "Caltech",
    content: "The insights dashboard helps me understand my mental health patterns. It's like having data-driven self-awareness.",
    rating: 5,
    mood: "happy",
    avatar: "/asset/happy.png",
    tags: ["Analytics", "Self-Awareness"]
  }
];

// Split testimonials into two rows for different marquee speeds
const firstRow = testimonials.slice(0, 5);
const secondRow = testimonials.slice(5, 10);

const TestimonialCard = ({ testimonial }) => {
  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'excellent':
        return <Heart className="w-4 h-4 text-blue-500" />;
      case 'happy':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'neutral':
        return <Brain className="w-4 h-4 text-yellow-500" />;
      default:
        return <Smile className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <Card className="w-[350px] mx-2 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/95 backdrop-blur-sm border border-purple-100">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-50 flex items-center justify-center">
              <img 
                src={testimonial.avatar} 
                alt={testimonial.name}
                className="w-10 h-10 object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
              <p className="text-sm text-gray-600">{testimonial.role}</p>
              <p className="text-xs text-purple-600 font-medium">{testimonial.university}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getMoodIcon(testimonial.mood)}
          </div>
        </div>

        {/* Quote */}
        <div className="mb-4">
          <Quote className="w-6 h-6 text-purple-300 mb-2" />
          <p className="text-gray-700 leading-relaxed text-sm italic">
            "{testimonial.content}"
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {testimonial.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="relative overflow-hidden">
      {/* Top Wave Divider */}
      <div className="relative z-10">
        <WaveDivider color="#D3C3F3" />
      </div>
      
      {/* Main Content */}
      <div className="py-20" style={{ backgroundColor: '#D3C3F3' }}>
        <div className="relative z-10">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16 px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#6E55A0' }}>
              What Students Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who've found their path to better mental wellness with PandoAI
            </p>
            
            {/* Stats */}
            <div className="flex justify-center items-center gap-8 mt-8 flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#6E55A0' }}>10,000+</div>
                <div className="text-sm text-gray-600">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#6E55A0' }}>4.9★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#6E55A0' }}>50+</div>
                <div className="text-sm text-gray-600">Universities</div>
              </div>
            </div>
          </motion.div>

          {/* Testimonials Marquee */}
          <div className="space-y-8">
            {/* First Row - Left to Right */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Marquee 
                pauseOnHover 
                className="[--duration:60s]"
                repeat={2}
              >
                {firstRow.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </Marquee>
            </motion.div>

            {/* Second Row - Right to Left */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Marquee 
                pauseOnHover 
                reverse 
                className="[--duration:70s]"
                repeat={2}
              >
                {secondRow.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </Marquee>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-16 px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-600 mb-6">
              Ready to start your wellness journey?
            </p>
            <motion.button
              className="px-8 py-4 text-lg font-semibold text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey Today →
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="relative z-10">
        <WaveDivider flip color="#D3C3F3" />
      </div>
    </section>
  );
};

export default TestimonialsSection;
