import Link from 'next/link'

// Icons as SVG components
const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 2C8.25 2 7.25 3 7.25 4.25c0 .41.11.8.3 1.15-.7.27-1.2.94-1.2 1.73 0 .5.2.95.51 1.28C6.34 8.7 6 9.33 6 10.05c0 .53.2 1.01.52 1.38-.32.37-.52.85-.52 1.38 0 1.1.9 2 2 2h.09c.17.53.53.96 1 1.22-.1.24-.15.5-.15.77 0 1.1.9 2 2 2s2-.9 2-2c0-.27-.05-.53-.15-.77.47-.26.83-.69 1-1.22H14c1.1 0 2-.9 2-2 0-.53-.2-1.01-.52-1.38.32-.37.52-.85.52-1.38 0-.72-.34-1.35-.86-1.74.31-.33.51-.78.51-1.28 0-.79-.5-1.46-1.2-1.73.19-.35.3-.74.3-1.15C14.75 3 13.75 2 12.5 2c-.69 0-1.3.31-1.71.79C10.38 2.31 9.94 2 9.5 2z" fill="currentColor"/>
  </svg>
)

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
)

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
)

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-['DynaPuff',Helvetica,Arial,sans-serif]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-[#ff5a5f] text-2xl font-bold">
              PairPad
            </Link>
            <div className="flex gap-4">
              <Link href="/login">
                <button className="text-[#484848] font-medium hover:text-[#ff5a5f] transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-[#ff5a5f] text-white px-6 py-2 rounded-full font-medium hover:bg-[#e54146] transition-all hover:scale-105">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-[#484848] leading-tight">
                  Find your perfect
                  <span className="text-[#ff5a5f] block">roommate</span>
                </h1>
                <p className="text-xl text-[#484848] font-light leading-relaxed max-w-lg">
                  Join thousands who have found their ideal living companion through our science-based compatibility matching system.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <button className="bg-[#ff5a5f] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#e54146] transition-all hover:scale-105 shadow-lg hover:shadow-xl">
                    Get Started Today
                  </button>
                </Link>
                <Link href="/dashboard/personality/assessment">
                  <button className="bg-transparent border-2 border-[#ff5a5f] text-[#ff5a5f] px-8 py-4 rounded-full text-lg font-medium hover:bg-[#ff5a5f] hover:text-white transition-all hover:scale-105">
                    Take Assessment
                  </button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5a5f]">10K+</div>
                  <div className="text-sm text-[#9ca299]">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5a5f]">95%</div>
                  <div className="text-sm text-[#9ca299]">Match Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5a5f]">4.9</div>
                  <div className="text-sm text-[#9ca299]">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a5f]/20 to-[#ff5a5f]/10 rounded-3xl blur-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-full flex items-center justify-center text-white">
                      <BrainIcon />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#484848] text-lg">Personality Assessment</h3>
                      <p className="text-[#9ca299] text-sm">Science-based compatibility</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-[#ff5a5f] to-[#e54146] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#484848] mb-4">
              Why thousands choose PairPad
            </h2>
            <p className="text-xl text-[#9ca299] font-light max-w-2xl mx-auto">
              Our platform combines cutting-edge psychology with modern technology to create perfect living partnerships.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-white">
                <BrainIcon />
              </div>
              <h3 className="text-xl font-bold text-[#484848] mb-4">Personality Assessment</h3>
              <p className="text-[#9ca299] leading-relaxed">
                Complete our comprehensive Big Five personality assessment to understand your compatibility factors and find your perfect match.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-white">
                <TargetIcon />
              </div>
              <h3 className="text-xl font-bold text-[#484848] mb-4">Smart Matching</h3>
              <p className="text-[#9ca299] leading-relaxed">
                Our algorithm analyzes personality traits, lifestyle preferences, and communication styles for scientifically optimal matches.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-white">
                <HomeIcon />
              </div>
              <h3 className="text-xl font-bold text-[#484848] mb-4">Co-Living Tools</h3>
              <p className="text-[#9ca299] leading-relaxed">
                Manage shared tasks, expenses, and household coordination seamlessly with your perfectly matched roommates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#ff5a5f] to-[#e54146]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to find your perfect roommate?
          </h2>
          <p className="text-xl text-red-100 mb-8 font-light">
            Join thousands of happy users who found their ideal living companion through PairPad.
          </p>
          <Link href="/register">
            <button className="bg-white text-[#ff5a5f] px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-all shadow-lg hover:shadow-xl">
              Get Started for Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="text-[#ff5a5f] text-2xl font-bold block mb-4">
                PairPad
              </Link>
              <p className="text-[#9ca299] text-sm leading-relaxed">
                Find your perfect roommate through science-based compatibility matching.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#484848] mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/dashboard/personality/assessment" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Assessment</Link>
                <Link href="/dashboard/matches" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Matching</Link>
                <Link href="/dashboard/coliving" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Co-Living</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[#484848] mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">About</Link>
                <Link href="/help" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Help Center</Link>
                <Link href="/contact" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[#484848] mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Privacy</Link>
                <Link href="/terms" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Terms</Link>
                <Link href="/cookies" className="block text-[#9ca299] hover:text-[#ff5a5f] transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#9ca299] text-sm mb-4 md:mb-0">
              Sent with ♥ from PairPad Inc., San Francisco, CA
            </p>
            <p className="text-[#9ca299] text-sm">
              © 2024 PairPad. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
