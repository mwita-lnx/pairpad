import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-['Circular',Helvetica,Arial,sans-serif]">
      <div className="max-w-[580px] mx-auto bg-white">
        {/* Header with Logo */}
        <div className="text-center pt-12 pb-4">
          <Link href="/">
            <h1 className="text-[#ff5a5f] text-2xl font-bold">PairPad</h1>
          </Link>
        </div>

        {/* Main Content */}
        <div className="px-4">
          {/* Headline */}
          <div className="pb-6 max-w-[485px]">
            <h2 className="text-[32px] font-bold text-[#484848] leading-[1.3] mb-2">
              Find your perfect roommate
            </h2>
            <p className="text-lg font-light text-[#484848] leading-[1.4]">
              Join thousands who have found their ideal living companion through our science-based compatibility matching system.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pb-8">
            <Link href="/register">
              <button className="bg-[#ff5a5f] text-white px-6 py-3 rounded-full text-lg font-normal hover:bg-[#e54146] transition-colors">
                Get Started Today
              </button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="text-center pb-6">
            <img
              src="https://a1.muscache.com/airbnb/rookery/dls/referrals/promo_header-2cb66fbfca7e137adbd1bf971e84f4f9.png"
              alt="Find your roommate"
              className="w-full max-w-[532px] mx-auto"
            />
          </div>

          {/* Features Section */}
          <div className="pb-6">
            <h2 className="text-[24px] font-bold text-[#484848] leading-[1.17] mb-4">
              Why thousands choose PairPad
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#ff5a5f] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🧠</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#484848] mb-1">Personality Assessment</h3>
                  <p className="text-[#484848] font-light leading-[1.4]">
                    Complete our comprehensive Big Five personality assessment to understand your compatibility factors
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#ff5a5f] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#484848] mb-1">Smart Matching</h3>
                  <p className="text-[#484848] font-light leading-[1.4]">
                    Our algorithm analyzes personality traits, lifestyle preferences, and communication styles for optimal matches
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#ff5a5f] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🏠</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#484848] mb-1">Co-Living Tools</h3>
                  <p className="text-[#484848] font-light leading-[1.4]">
                    Manage shared tasks, expenses, and household coordination with your matched roommates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="pb-8">
            <div className="text-center">
              <Link href="/login">
                <button className="bg-transparent border-2 border-[#ff5a5f] text-[#ff5a5f] px-6 py-3 rounded-full text-lg font-normal hover:bg-[#ff5a5f] hover:text-white transition-colors">
                  Already have an account?
                </button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#cacaca] pt-8 pb-8">
            <div className="pb-8"></div>
            <p className="text-center text-[#9ca299] text-sm font-light mb-2">
              Sent with ♥ from PairPad
            </p>
            <p className="text-center text-[#9ca299] text-sm font-light mb-2">
              PairPad Inc., San Francisco, CA
            </p>
            <p className="text-center text-[#9ca299] text-sm font-light">
              <Link href="/help" className="text-[#9ca299] underline hover:text-[#ff5a5f]">
                Help Center
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
