'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { GraduationCap, Waves, Clock, Heart, Star, Shield } from 'lucide-react'

const stats = [
  { value: '5+',        label: 'Years Teaching'        },
  { value: '6mo–12yr', label: 'Age Range'              },
  { value: '100+',      label: 'Students Taught'        },
  { value: 'Private',   label: 'Pool in Côte Saint-Luc' },
]

const highlights = [
  {
    icon: Shield,
    title: 'Certified Lifeguard',
    description: 'Trained and certified lifeguard with years of experience keeping swimmers safe in public and private settings.',
  },
  {
    icon: GraduationCap,
    title: 'Software Engineering @ McGill',
    description: 'Currently studying Software Engineering at McGill University — bringing structure, patience, and a love of problem-solving to every lesson.',
  },
  {
    icon: Waves,
    title: 'Former Public Swim Instructor',
    description: 'Taught public group lessons before transitioning to private instruction to give every child undivided attention and faster progress.',
  },
  {
    icon: Heart,
    title: 'Passionate About Early Development',
    description: "From 6-month-old water babies to 12-year-olds refining their stroke — every stage of a child's swimming journey is close to my heart.",
  },
  {
    icon: Clock,
    title: '5 Years of Swimming Lessons',
    description: "Half a decade of teaching — from public group sessions to private one-on-one lessons — means tried-and-tested techniques tailored to each child's pace.",
  },
  {
    icon: Star,
    title: 'Results You Can See',
    description: 'Students consistently progress from fearful beginners to confident swimmers — many returning season after season.',
  },
]

export default function AboutPage() {
  const [imgError, setImgError] = useState(false)

  return (
    <main className="bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Photo */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-none">
              <div className="relative">
                {/* Background glow */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-sky-200 via-sky-100 to-white opacity-70 blur-sm" />
                {/* Portrait frame — 3:4 ratio */}
                <div className="relative w-64 sm:w-72 lg:w-80" style={{ aspectRatio: '3/4' }}>
                  <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-sky-200/60">
                    {imgError ? (
                      <div className="absolute inset-0 bg-sky-50 flex flex-col items-center justify-center gap-3">
                        <Waves className="w-12 h-12 text-sky-300" />
                        <p className="text-sm text-sky-400">Photo coming soon</p>
                      </div>
                    ) : (
                      <Image
                        src="/shirel.jpg"
                        alt="Shirel – swim instructor"
                        fill
                        className="object-cover object-center"
                        style={{ objectPosition: 'center 15%' }}
                        sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                        priority
                        onError={() => setImgError(true)}
                      />
                    )}
                  </div>
                </div>
                {/* Badge */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg border border-sky-100 px-4 py-3">
                  <p className="text-[10px] tracking-widest uppercase text-slate-400">Teaching since</p>
                  <p className="text-sm font-bold text-slate-900 leading-none mt-0.5">2020</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="order-2 lg:order-none">
              <p className="section-label">Meet your instructor</p>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Hi, I&apos;m{' '}
                <span className="text-sky-700 italic">Shirel</span> 👋
              </h1>
              <div className="space-y-4 text-slate-600 text-base leading-relaxed">
                <p>
                  I&apos;m a 20-year-old Software Engineering student at{' '}
                  <span className="font-semibold text-slate-800">McGill University</span>, and
                  swimming has been a huge part of my life for as long as I can remember.
                </p>
                <p>
                  I started out as a{' '}
                  <span className="font-semibold text-slate-800">certified lifeguard and public swim instructor</span>,
                  teaching group lessons — but I quickly realized that children thrive so much more
                  with personalized, one-on-one attention.
                </p>
                <p>
                  Over the past{' '}
                  <span className="font-semibold text-slate-800">5 years</span>, I&apos;ve worked with kids
                  ranging from{' '}
                  <span className="font-semibold text-slate-800">6 months to 12 years old</span> —
                  from fearful first-timers to stroke-refinement for competitive swimmers.
                </p>
                <p>
                  Lessons take place at my private pool in{' '}
                  <span className="font-semibold text-slate-800">Côte Saint-Luc</span>, in a calm,
                  safe, and encouraging environment.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/book" className="btn-primary">Book a Lesson</Link>
                <Link href="/reviews" className="btn-secondary">Read Reviews</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-sky-700 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sky-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-sky-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-14">
            <p className="section-label">Why choose Shirel</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Experience, Care &amp; Results</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Every lesson reflects a genuine love for teaching and a commitment to every child&apos;s progress.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="card p-6 hover:shadow-md hover:border-sky-200 transition-all duration-200">
                  <div className="w-11 h-11 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-sky-700" />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
          <p className="text-slate-500 mb-8">Spots fill up fast — book your lesson today.</p>
          <Link href="/book" className="btn-primary text-base px-10 py-4">Book a Lesson with Shirel</Link>
        </div>
      </section>

    </main>
  )
}
