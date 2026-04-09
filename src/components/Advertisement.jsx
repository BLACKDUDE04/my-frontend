import { useEffect, useState } from "react";
import api from "../api";

export default function Advertisement() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch all active hardware promotions from the KVM server
    api.get("/ads")
      .then(res => {
        if (Array.isArray(res.data)) {
          setAds(res.data);
        }
      })
      .catch(err => console.error("Ad service unavailable"));
  }, []);

  // Simple rotation logic to cycle through different hardware items
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 5000); // Rotate every 5 seconds
      return () => clearInterval(interval);
    }
  }, [ads]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <div className="ad-container">
      <a 
        href={currentAd.targetUrl || "#"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ad-link"
      >
        <div className="ad-content">
          <img 
            src={`${api.defaults.baseURL}/${currentAd.imageUrl}`} 
            alt={currentAd.title} 
            className="ad-banner"
          />
          <div className="ad-overlay">
            <span className="ad-tag">PROMOTION</span>
            <p className="ad-title">{currentAd.title}</p>
          </div>
        </div>
      </a>

      <style jsx>{`
        .ad-container {
          margin: 10px 20px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        .ad-container:hover {
          transform: translateY(-2px);
        }
        .ad-content {
          position: relative;
          height: 120px;
          display: flex;
          align-items: center;
          background: #000;
        }
        .ad-banner {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
        }
        .ad-overlay {
          position: absolute;
          left: 20px;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .ad-tag {
          background: #ffc107;
          color: #000;
          padding: 2px 8px;
          font-size: 0.7rem;
          font-weight: bold;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .ad-title {
          margin: 5px 0 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        @media (max-width: 600px) {
          .ad-content { height: 80px; }
          .ad-title { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
}