import React, { useEffect } from 'react';
import { SignInButton } from "@clerk/clerk-react";
import './LandingPage.css';

const Icons = {
  Search: () => <span>🔍</span>,
  Track: () => <span>📊</span>,
  Bell: () => <span>🔔</span>,
  Briefcase: () => <span>💼</span>,
  Graduation: () => <span>🎓</span>,
  Brain: () => <span>🧠</span>,
  Target: () => <span>🎯</span>,
};



export default function LandingPage() {

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-element');
        }
      });
    });

    const hiddenElements = document.querySelectorAll('.hidden-element');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="landing-wrapper">
     
      <nav className="landing-nav">
        <div className="nav-container">
          <h2 className="logo">
            Hire<span className="text-gradient">Matrix</span>
          </h2>
          <div className="nav-links">
            <a href="#how-it-works">How it Works</a>
            <a href="#features">Features</a>
            <SignInButton mode="modal">
              <button className="login-btn">Launch Dashboard</button>
            </SignInButton>
          </div>
        </div>
      </nav>


      <p className="section-tag" style={{textAlign:"center" ,marginTop:'1.8rem'}}>Smart Job & Internship Tracker</p>

      <header className="hero-section">
        <div className="hero-grid">
          
         
          <div className="hero-content-left hidden-element">
            <h1 className="hero-title">
              Your Pathway to the Perfect <br />
              <span className="text-gradient">Career Opportunity</span>
            </h1 >
            <p className="hero-subtitle">
              Upload your resume for instant ATS scoring and skill analysis. Find curated jobs, track your applications, and accelerate your career in one centralized hub.
            </p>
            <div className="hero-actions">
              <SignInButton mode="modal">
                <button className="cta-btn">Start Your Journey — Free</button>
              </SignInButton>
            </div>
          </div>

         
          <div className="hero-visual-right hidden-element">
            <div className="central-hub-visual">
              <div className="core-circle">HireMatrix</div>
              <div className="orbit-item job"><Icons.Briefcase /> Jobs</div>
              <div className="orbit-item intern"><Icons.Graduation /> Internships</div>
              <div className="orbit-item track"><Icons.Track /> Track</div>
            </div>
          </div>

        </div>
      </header>

      
      <section id="how-it-works" className="steps-section hidden-element">
        <p className="section-tag">How HireMatrix Works</p>
        <h2 className="section-title">Get Started in 3 Simple Steps</h2>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon-wrapper">
              <div className="step-number">1</div>
              <Icons.Target />
            </div>
            <h3>Upload & Analyze</h3>
            <p>Upload your PDF resume. Our system instantly extracts your skills and calculates your ATS score for your target role.</p>
          </div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <div className="step-number">2</div>
              <Icons.Search />
            </div>
            <h3>Discover Matches</h3>
            <p>Based on your unique skill set, we fetch the most relevant job and internship openings directly for you.</p>
          </div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <div className="step-number">3</div>
              <Icons.Track />
            </div>
            <h3>Apply & Track</h3>
            <p>Save listings and track your application status in your dashboard so you never miss an update.</p>
          </div>
        </div>
      </section>

      
      <section id="features" className="features-section hidden-element">
        <div className="features-container">
          <div className="features-header">
            <h2>Powerful Features Designed for You</h2>
            <p>Everything you need to analyze, find, and track your next big opportunity.</p>
          </div>
          
          <div className="features-grid">
            <div className="f-card">
              <div className="f-icon"><Icons.Brain /></div>
              <h4>Smart Skill Analysis</h4>
              <p>Identify your strengths and missing keywords.</p>
            </div>
            <div className="f-card">
              <div className="f-icon"><Icons.Target /></div>
              <h4>ATS Resume Scoring</h4>
              <p>Know exactly how industry systems view your CV.</p>
            </div>
            <div className="f-card">
              <div className="f-icon"><Icons.Briefcase /></div>
              <h4>Curated Job Board</h4>
              <p>Opportunities matching your exact tech stack.</p>
            </div>
            <div className="f-card">
              <div className="f-icon"><Icons.Track /></div>
              <h4>Centralized Tracker</h4>
              <p>Keep a tab on every single application status.</p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="final-cta hidden-element">
        <div className="cta-box">
          <h2>Ready to Take the Next Step?</h2>
          <p>Join thousands of students and professionals using HireMatrix to land their ideal roles.</p>
          <SignInButton mode="modal">
            <button className="cta-btn white-btn">Create Your Free Account</button>
          </SignInButton>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 HireMatrix. Smart Job & Internship Tracker.</p>
      </footer>
    </div>
  );
}