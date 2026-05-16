// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { UserButton, useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import './Dashboard.css';

// Apna Backend URL yahan set kar (local testing ke liye 5000)
const API_URL = 'http://localhost:5000/api'; 

export default function Dashboard() {
  const { getToken } = useAuth(); // Clerk auth token nikalne ke liye
  const [activeMenu, setActiveMenu] = useState('discover');
  
  // Global Filters State
  const [searchType, setSearchType] = useState('job');
  const [isRemote, setIsRemote] = useState(false);
  const [location, setLocation] = useState('');
  
  // Discover Tab States
  const [manualQuery, setManualQuery] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isScanned, setIsScanned] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ATS Tab States
  const [atsTargetRole, setAtsTargetRole] = useState('');
  const [atsFile, setAtsFile] = useState(null);
  const [atsResult, setAtsResult] = useState(null);

  // Workspace States
  const [savedJobs, setSavedJobs] = useState([]);
  const [trashedJobs, setTrashedJobs] = useState([]);

  // Load Workspace Data on Mount
  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    try {
      const token = await getToken();
      if (!token) return; // If not logged in, ignore
      
      const res = await axios.get(`${API_URL}/workspace`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSavedJobs(res.data.saved);
        setTrashedJobs(res.data.trash);
      }
    } catch (error) {
      console.error("Error fetching workspace", error);
    }
  };

  // --- API CALLS ---

  // 1. Manual Search
  const handleManualSearch = async () => {
    if (!manualQuery) return alert("Please enter some skills!");
    setIsLoading(true);
    setJobs([]); // Clear previous results
    try {
      const res = await axios.post(`${API_URL}/search-jobs`, {
        query: manualQuery,
        location,
        isRemote,
        type: searchType
      });
      setJobs(res.data.data || []);
    } catch (error) {
      alert("Error fetching jobs!");
    }
    setIsLoading(false);
  };

  // 🔥 2. AI Resume Scan + Smart Auto Job Fetch
  const handleScanAndSearch = async () => {
    if (!resumeFile) return alert("Please upload a PDF resume!");
    setIsLoading(true);
    setIsScanned(false); // Reset scanned state
    setJobs([]); // Clear previous jobs
    
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('targetRole', searchType); // Optional context

    try {
      // Step A: Pehle AI se scan karwao (Skills + Suggested Roles nikalne ke liye)
      const aiRes = await axios.post(`${API_URL}/scan-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const extractedData = aiRes.data.data;
      setAiData(extractedData);
      setIsScanned(true); // Show AI results in UI

      // Step B: Ab Suggested Roles ke basis par Jobs dhoondo (Not Skills)
      // Gemini suggestions e.g., ["Frontend Developer", "React Developer"]
      const suggestedFields = extractedData.suggestedRoles || [];
      
      if (suggestedFields.length > 0) {
        // Hum pehle suuggested role ko search query banate hain
        const primarySearchField = suggestedFields[0]; 
        console.log("AI suggested field, searching for:", primarySearchField);

        const jobRes = await axios.post(`${API_URL}/search-jobs`, {
          query: primarySearchField, // 🔥 Ab skills nahi, specific field bhej rahe hain
          location,
          isRemote,
          type: searchType
        });
        setJobs(jobRes.data.data || []);
      } else if (extractedData.skills) {
        // Fallback: Agar roles nahi mile toh purana skills wala method
        const jobRes = await axios.post(`${API_URL}/search-jobs`, {
          query: extractedData.skills,
          location,
          isRemote,
          type: searchType
        });
        setJobs(jobRes.data.data || []);
      }
    } catch (error) {
      alert("Error scanning resume or finding jobs!");
    }
    setIsLoading(false);
  };

  // 3. ATS Scorer Check
  const handleATSCheck = async () => {
    if (!atsFile || !atsTargetRole) return alert("Please provide both Role and Resume!");
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('resume', atsFile);
    formData.append('targetRole', atsTargetRole);

    try {
      const res = await axios.post(`${API_URL}/scan-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAtsResult(res.data.data);
    } catch (error) {
      alert("Error calculating ATS Score");
    }
    setIsLoading(false);
  };

  // --- WORKSPACE ACTIONS ---
  const handleWorkspaceAction = async (action, jobData) => {
    try {
      const token = await getToken();
      const response = await axios.post(`${API_URL}/workspace/${action}`, { 
        jobData, 
        job_id: jobData.job_id 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if(response.data.success) {
        alert(response.data.message); // SUCCESS FEEDBACK ADDED
        fetchWorkspace(); // Refresh the lists after action
      }
    } catch (error) {
      console.error(`Error with action: ${action}`, error);
      alert(`Error: Could not perform action ${action}`);
    }
  };

  return (
    <div className="app-layout">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">HM</div>
          <h2>Hire<span>Matrix</span></h2>
        </div>
        
        <nav className="sidebar-nav">
          <p className="nav-title">MAIN MENU</p>
          <button className={`nav-item ${activeMenu === 'discover' ? 'active' : ''}`} onClick={() => setActiveMenu('discover')}>
            <span className="nav-icon">🔍</span> Search Opportunities
          </button>
          <button className={`nav-item ${activeMenu === 'ats' ? 'active' : ''}`} onClick={() => setActiveMenu('ats')}>
            <span className="nav-icon">🎯</span> ATS Resume Scorer
          </button>
          
          <p className="nav-title mt-top">WORKSPACE</p>
          <button className={`nav-item ${activeMenu === 'saved' ? 'active' : ''}`} onClick={() => setActiveMenu('saved')}>
            <span className="nav-icon">⭐</span> Saved Listings
          </button>
          <button className={`nav-item ${activeMenu === 'trash' ? 'active' : ''}`} onClick={() => setActiveMenu('trash')}>
            <span className="nav-icon">🗑️</span> Trash (Deleted)
          </button>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="app-main">
        
        <header className="app-header">
          <div className="header-greeting">
            <h2>Welcome to your Workspace 🚀</h2>
          </div>
          <div className="header-profile">
            <div className="user-btn-wrapper">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        <div className="app-body">

          {/* ---------------------------------------------------
              TAB 1: DISCOVER JOBS & INTERNSHIPS 
              --------------------------------------------------- */}
          {activeMenu === 'discover' && (
            <div className="tab-section fade-in">
              <div className="section-header">
                <h3 className='h'>Find Your Next Opportunity</h3>
                <p className="p-level" style={{color: '#94a3b8', fontWeight: 400}}>Set your preference once, then search manually or let AI scan your resume.</p>
              </div>

              {/* 1. GLOBAL PREFERENCE FILTER */}
              <div className="global-filter-box">
                <div className="filter-row top-row">
                  <h4>What are you looking for?</h4>
                  <div className="toggle-group">
                    <button 
                      className={`toggle-btn ${searchType === 'job' ? 'active' : ''}`}
                      onClick={() => setSearchType('job')}
                    >
                      💼 Full-Time Jobs
                    </button>
                    <button 
                      className={`toggle-btn ${searchType === 'internship' ? 'active' : ''}`}
                      onClick={() => setSearchType('internship')}
                    >
                      🎓 Internships
                    </button>
                  </div>
                </div>

                {/* Location & Remote Filters (Below Toggle) */}
                <div className="filter-row bottom-row">
                  <div className="location-input-wrapper">
                    <span className="loc-icon">📍</span>
                    <input 
                      type="text" 
                      placeholder="Country or City (e.g. India, Remote, Pune)" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  
                  <label className="remote-toggle">
                    <input 
                      type="checkbox" 
                      checked={isRemote}
                      onChange={(e) => setIsRemote(e.target.checked)}
                    />
                    <span className="slider"></span>
                    <span className="remote-text">Remote Only 🏠</span>
                  </label>
                </div>
              </div>

              {/* 2. SEARCH METHODS GRID */}
              <div className="search-methods-grid">
                
                {/* Method A: Manual Search */}
                <div className="method-card">
                  <div className="method-header">
                    <h4>Manual Search</h4>
                    <span className="badge-basic">Quick</span>
                  </div>
                  <p className="method-desc">Know what you want? Enter your core skills separated by commas.</p>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="custom-input" 
                      placeholder="e.g. React, Node.js, MongoDB" 
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary full-width mt-auto" onClick={handleManualSearch} disabled={isLoading}>
                    {isLoading ? "Searching..." : `Search ${searchType === 'job' ? 'Jobs' : 'Internships'}`}
                  </button>
                </div>

                <div className="or-divider"><span>OR</span></div>

                {/* Method B: AI Resume Scan */}
                <div className="method-card ai-method">
                  <div className="method-header">
                    <h4>Smart Match</h4>
                    <span className="badge-ai">✨ AI Powered</span>
                  </div>
                  <p className="method-desc">Upload your PDF resume. We'll extract your skills and find matches.</p>
                  
                  <div className="drop-zone">
                    <div className="drop-icon">📄</div>
                    <h5>{resumeFile ? resumeFile.name : "Click or Drag PDF here"}</h5>
                    <p>Max file size 5MB</p>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden-input" 
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                  </div>
                  
                  <button className="btn-ai full-width mt-auto" onClick={handleScanAndSearch} disabled={isLoading}>
                    {isLoading ? "Processing AI..." : `Scan & Find ${searchType === 'job' ? 'Jobs' : 'Internships'}`}
                  </button>
                </div>
              </div>

              {/* 3. AI EXTRACTION RESULTS */}
              {isScanned && aiData && (
                <div className="ai-results-box fade-in">
                  <div className="ai-res-header">
                    <h4>🧠 AI Extraction Results</h4>
                    <span className="success-pill">Scan Complete</span>
                  </div>
                  <div className="extracted-content">
                    <div className="e-summary">
                      <h5 className="p-level">Professional Summary</h5>
                      <p>{aiData.summary || "Summary extracted by AI will appear here."}</p>
                    </div>

                    {/* 🔥 New Section: Suggested Fields/Roles */}
                    <div className="e-roles mt-top" style={{marginTop: '15px'}}>
                        <h5 className="p-level">Suggested Job Fields</h5>
                        <div className="skill-tags">
                            {aiData.suggestedRoles && aiData.suggestedRoles.map((role, i) => (
                                <span key={i} style={{borderColor: '#a855f7', color: '#a855f7'}}>🎯 {role}</span>
                            ))}
                        </div>
                    </div>

                    <div className="e-skills mt-top" style={{marginTop: '15px'}}>
                      <h5 className="p-level">Extracted Core Skills</h5>
                      <div className="skill-tags">
                        {aiData.skills ? aiData.skills.split(',').map((skill, i) => (
                          <span key={i}>{skill.trim()}</span>
                        )) : <span>No skills found</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. API JOB RESULTS AREA */}
              <div className="results-area mt-top">
                <h3 className="results-title">Recommended Listings</h3>
                <div className="job-grid">
                  {isLoading && jobs.length === 0 && (
                      <p style={{color: '#64748b'}}>Loading opportunities...</p>
                  )}
                  {!isLoading && jobs.length > 0 ? jobs.map((job, idx) => (
                    <div className="job-card fade-in" key={idx}>
                      <div className="j-header">
                        <h5>{job.job_title}</h5>
                        <div className="card-tags">
                          {job.job_is_remote && <span className="tag-remote">Remote</span>}
                          <span className={searchType === 'internship' ? 'tag-intern' : 'tag-job'}>
                            {searchType === 'internship' ? 'Internship' : 'Full-time'}
                          </span>
                        </div>
                      </div>
                      <p className="j-company">{job.employer_name} • {job.job_city || job.job_country || location || "Remote"}</p>
                      <div className="j-actions">
                        <button className="btn-action save" onClick={() => handleWorkspaceAction('save', job)}>⭐ Save</button>
                        <a href={job.job_apply_link} target="_blank" rel="noreferrer" style={{textDecoration: 'none', flex: 1}}>
                          <button className="btn-action apply" style={{width: '100%'}}>Apply Now</button>
                        </a>
                      </div>
                    </div>
                  )) : !isLoading && isScanned && jobs.length === 0 && (
                    <p style={{color: '#64748b'}}>AI analyzed your resume, but no listings found for the suggested fields. Try adjusting filters or Manual Search.</p>
                  )}
                  {!isLoading && !isScanned && jobs.length === 0 && activeMenu === 'discover' && (
                    <p style={{color: '#64748b'}}>No listings found. Try Manual Search or upload a resume.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------
              TAB 2: ATS SCORER
              --------------------------------------------------- */}
          {activeMenu === 'ats' && (
            <div className="tab-section fade-in">
              <div className="section-header">
                <h3 className='h'>Targeted ATS Scorer</h3>
                <p className="p-level" style={{color: '#94a3b8', fontWeight: 400}}>Check how well your resume matches a specific job description before applying.</p>
              </div>

              <div className="ats-container">
                <div className="ats-input-area">
                  <div className="input-group">
                    <p className='p-level'>Target Job Title</p>
                    <input 
                      type="text" 
                      className="custom-input" 
                      placeholder="e.g. React Developer" 
                      value={atsTargetRole}
                      onChange={(e) => setAtsTargetRole(e.target.value)}
                    />
                  </div>
                  <div className="drop-zone lg">
                    <div className="drop-icon">📑</div>
                    <h5>{atsFile ? atsFile.name : "Upload your Resume"}</h5>
                    <p>PDF format only</p>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden-input" 
                      onChange={(e) => setAtsFile(e.target.files[0])}
                    />
                  </div>
                  <button className="btn-primary full-width" onClick={handleATSCheck} disabled={isLoading}>
                    {isLoading ? "Calculating..." : "Calculate ATS Score"}
                  </button>
                </div>

                <div className="ats-score-area">
                  <div className="score-circle">
                    <h2>{atsResult?.atsScore || 0}<span>%</span></h2>
                    <p>Match Rate</p>
                  </div>
                  {atsResult && (
                    <div className="score-details">
                      <div className="detail-item success">✅ Strength: {atsResult.strength}</div>
                      <div className="detail-item warning">⚠️ Missing: {atsResult.missing}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------
              TAB 3: SAVED LISTINGS
              --------------------------------------------------- */}
          {activeMenu === 'saved' && (
            <div className="tab-section fade-in">
              <div className="section-header">
                <h3 className='h'>Saved Listings</h3>
                <p className="p-level" style={{color: '#94a3b8', fontWeight: 400}}>Opportunities you have bookmarked for later.</p>
              </div>

              <div className="job-grid">
                {savedJobs.length > 0 ? savedJobs.map((job, idx) => (
                  <div className="job-card" key={idx}>
                    <div className="j-header">
                      <h5>{job.job_title}</h5>
                    </div>
                    <p className="j-company">{job.employer_name} • {job.job_city || "Remote"}</p>
                    <div className="j-actions">
                      <button className="btn-action delete" onClick={() => handleWorkspaceAction('trash', job)}>🗑️ Trash</button>
                      <a href={job.job_apply_link} target="_blank" rel="noreferrer" style={{textDecoration: 'none', flex: 1}}>
                        <button className="btn-action apply" style={{width: '100%'}}>Apply</button>
                      </a>
                    </div>
                  </div>
                )) : <p style={{color: '#64748b'}}>No saved jobs yet.</p>}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------
              TAB 4: TRASH
              --------------------------------------------------- */}
          {activeMenu === 'trash' && (
            <div className="tab-section fade-in">
              <div className="section-header">
                <h3 className='h'>Trash</h3>
                <p className="p-level" style={{color: '#94a3b8', fontWeight: 400}}>Deleted listings. Recover them or delete permanently.</p>
              </div>

              <div className="job-grid">
                {trashedJobs.length > 0 ? trashedJobs.map((job, idx) => (
                  <div className="job-card trash-mode" key={idx}>
                    <div className="j-header">
                      <h5 className="strike-through">{job.job_title}</h5>
                    </div>
                    <p className="j-company">{job.employer_name}</p>
                    <div className="j-actions">
                      <button className="btn-action recover" onClick={() => handleWorkspaceAction('recover', job)}>♻️ Recover</button>
                      <button className="btn-action perm-delete" onClick={() => handleWorkspaceAction('delete', job)}>❌ Delete</button>
                    </div>
                  </div>
                )) : <p style={{color: '#64748b'}}>Trash is empty.</p>}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}