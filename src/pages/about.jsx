import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AboutImg from "../assets/images/logo_slogan.png";
import TeamPlaceholder from "../assets/images/team/project_eng_1.jpg";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../assets/styles/global.css";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "auto";
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{

      minHeight: '100vh',
      overflowY: 'auto',
      background: 'var(--color-matte-black, #111)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        .about-topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(33, 33, 33, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .about-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 20px 56px;
          box-sizing: border-box;
        }
        .about-hero-img {
          max-width: 240px;
          width: 55%;
          min-width: 140px;
          border-radius: 24px;
          object-fit: cover;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0);
        }
        .about-team-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 16px;
        }
        .about-team-lead {
          grid-column: 1 / -1;
          margin-bottom: 8px;
        }
        @media (min-width: 480px) {
          .about-team-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (min-width: 640px) {
          .about-hero-img {
            max-width: 300px;
          }
        }
        @media (min-width: 768px) {
          .about-hero-img {
            max-width: 340px;
          }
          .about-container {
            padding: 40px 40px 72px;
          }
        }
        @media (min-width: 1024px) {
          .about-hero-img {
            max-width: 400px;
          }
          .about-container {
            padding: 56px 48px 96px;
          }
        }
        .about-container img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
          pointer-events: none;
        }
      `}</style>

      {/* Header / Top Bar */}
      <div className="about-topbar">
        <ArrowBackIcon
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer', opacity: 0.8 }}
        />
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>About Us</h2>
      </div>

      {/* Main Content */}
      <div className="about-container page-enter-anim">

        {/* Logo / Hero Image */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img
            src={AboutImg}
            alt="About Bentork"
            className="about-hero-img"
          />
        </div>

        {/* Brand Description */}
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: '1.8', textAlign: 'justify' }}>
          <p style={{ marginBottom: '20px' }}>
            Bentork Industries is a leading manufacturer of Lithium-ion and LFP
            battery packs in India with over five years of experience delivering
            safe, high-performance, and long-lasting energy solutions for EVs,
            solar, industrial, and other applications.
          </p>
          <p style={{ marginBottom: '20px' }}>
            Building on this expertise, we are expanding into EV charging
            infrastructure, providing safe, reliable, and user-friendly charging
            experiences with smart technology, real-time monitoring, and seamless
            digital payments.
          </p>
          <p>
            Our commitment: "Connecting to the Modern World" through innovation,
            quality, and accessible energy solutions for businesses and everyday users.
          </p>
        </div>

        {/* Team Section */}
        {false && (
        <div style={{ marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '28px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '24px',
            borderLeft: '4px solid var(--color-primary-container)',
            paddingLeft: '12px'
          }}>
            Meet the Team
          </h3>
          <div className="about-team-grid">
            {[
              { name: "Niraj Sodmise",  title: "CEO & Founder", lead: true },
              { name: "Shubham Shinde", title: "CTO" },
              { name: "Om Lokhande",    title: "Project Engineer" },
              { name: "Jayesh Mahajan", title: "Project Engineer" },
              { name: "Swapnil Jadhav", title: "Project Engineer" },
            ].map((member, index) => {
              const size = member.lead ? 130 : 100;
              return (
                <div
                  key={index}
                  className={member.lead ? 'about-team-lead' : ''}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    position: 'relative',
                    width: `${size + 10}px`,
                    height: `${size + 10}px`,
                    margin: '0 auto 14px',
                  }}>
                    {/* Accent shadow circle */}
                    <div style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-container)',
                      zIndex: 1
                    }} />
                    {/* Photo circle */}
                    <div style={{
                      position: 'relative',
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      zIndex: 2,
                      background: '#333'
                    }}>
                      <img
                        src={TeamPlaceholder}
                        alt={member.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  <h4 style={{
                    margin: '0 0 4px',
                    fontSize: member.lead ? '16px' : '14px',
                    fontWeight: 700,
                    color: '#fff'
                  }}>{member.name}</h4>
                  <p style={{
                    margin: 0,
                    fontSize: member.lead ? '13px' : '12px',
                    color: 'rgba(255,255,255,0.55)'
                  }}>{member.title}</p>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Download / CTA Section */}
        <div style={{
          marginTop: '56px',
          background: 'linear-gradient(135deg, rgba(57,226,155,0.07), rgba(255,255,255,0.02))',
          borderRadius: '24px',
          padding: '32px 24px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', margin: '0 0 12px' }}>
            Experience Smart Charging
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.60)', marginBottom: '24px', lineHeight: '1.6' }}>
            Get the full experience. Download our app for real-time tracking and zero-hassle payments.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              href="https://play.google.com/store/apps/details?id=com.bentork.application"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                style={{ height: '56px', width: 'auto', display: 'block' }}
              />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
