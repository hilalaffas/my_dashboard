import { CtaSection } from '@/components/landing/ctaSection'
import { FaqSection } from '@/components/landing/faqSection'
import { FeaturesSection } from '@/components/landing/featuresSection'
import { HeroSection } from '@/components/landing/heroSection'
import { LandingFooter } from '@/components/landing/landingFooter'
import { LandingHeader } from '@/components/landing/landingHeader'
import { ProblemSection } from '@/components/landing/problemSection'
import { ScrollEffects } from '@/components/landing/scrollEffects'
import { SecuritySection } from '@/components/landing/securitySection'
import { StepsSection } from '@/components/landing/stepsSection'
export function LandingPage() {
  return (
    <div className="lp" data-lp-root>
      {/* Tanpa JavaScript, semua konten tetap terlihat */}
      <noscript>
        <style>
          {
            '[data-reveal]{opacity:1!important;filter:none!important;transform:none!important}.lp-bar{transform:none!important}'
          }
        </style>
      </noscript>
      <div className="lp-progress" aria-hidden="true" />
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <StepsSection />
        <div className="lp-blend" aria-hidden="true" />
        <SecuritySection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
      <ScrollEffects />
    </div>
  )
}
