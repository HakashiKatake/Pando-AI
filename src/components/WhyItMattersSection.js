"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { WellnessCards } from "@/components/ui/WellnessCards"
import { Heart, Brain, Moon } from "lucide-react"

const whyItMattersPoints = [
  {
    title: "Improve Your Mood",
    description: "Tools and resources to help you feel better.",
    gradient: "bg-gradient-to-br from-[#E6EBFF] via-[#F0F4FF] to-[#F8FAFF]",
    icon: Heart,
  },
  {
    title: "Reduce Stress",
    description: "Effective techniques to calm your mind.",
    gradient: "bg-gradient-to-br from-[#FFE6EB] via-[#FFF0F3] to-[#FFF8F9]",
    icon: Brain,
  },
  {
    title: "Sleep Better",
    description: "Guided meditations and tips for a restful night's sleep.",
    gradient: "bg-gradient-to-br from-[#FFF0E6] via-[#FFF6F0] to-[#FFFAF8]",
    icon: Moon,
  },
]

export default function WhyItMattersSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const pandaVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        type: "spring",
        stiffness: 80,
      },
    },
  }

  return (
    <section ref={ref} className="w-full min-h-screen grid lg:grid-cols-2 overflow-hidden">
      
     

     
      <div
        className="relative flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 bg-[#D3C3F3]"
        style={{
          backgroundImage: 'url("/public/asset/panda-bambo")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#D3C3F3] opacity-90 z-0"></div>
        <motion.div
          className="relative z-10"
          variants={pandaVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="relative">
            {/* Floating animation for panda */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/asset/panda-bambo.png"
                width={500}
                height={500}
                alt="Cute panda illustration eating bamboo"
                className="rounded-lg object-cover shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </motion.div>

            {/* Glowing effect around panda */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-xl -z-10 animate-pulse" />
          </div>
        </motion.div>
      </div>

       <div
        className="relative flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white"
        style={{
          backgroundImage: 'url("/asset/bamboo.jpg")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white opacity-95 z-0"></div>
        <motion.div
          className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
          >
            Why Mental Wellness{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Matters</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-700 max-w-md">
            Discover the profound impact a focus on mental well-being can have on your daily life and overall happiness.
          </motion.p>

          <div className="grid gap-8 mt-8 w-full max-w-2xl">
            {whyItMattersPoints.map((point, index) => {
              const IconComponent = point.icon
              return (
                <motion.div key={index} variants={itemVariants} transition={{ delay: index * 0.15 + 0.3 }}>
                  <WellnessCards gradientClass={point.gradient} className="h-full flex flex-col min-h-[180px]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-8 h-8 text-gray-700" />
                        <CardTitle className="text-gray-900 font-bold text-xl">{point.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow pt-0">
                      <CardDescription className="text-gray-700 text-base leading-relaxed">
                        {point.description}
                      </CardDescription>
                    </CardContent>
                  </WellnessCards>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
