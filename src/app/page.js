'use client';

import { useState, useEffect, useRef } from 'react';
import defaultTenants from '@/data/default_tenants.json';

// Convert "M/D/YYYY" to "YYYY-MM-DD" for HTML5 Date Input
const convertMDYToYMD = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

// Convert "YYYY-MM-DD" from HTML5 Date Input to "M/D/YYYY" for opportunity metadata
const convertYMDToMDY = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10).toString();
    const day = parseInt(parts[2], 10).toString();
    return `${month}/${day}/${year}`;
  }
  return dateStr;
};

export default function Home() {
  // Config & State
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('jove-academic');
  const [activeTenant, setActiveTenant] = useState(null);
  
  // Note input states
  const [notes, setNotes] = useState('');
  const [selectedSampleIdx, setSelectedSampleIdx] = useState('');
  
  // Dynamic Opportunity Metadata State (Screenshot 2 Salesforce fields)
  const [oppMetadata, setOppMetadata] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // API key configuration
  const [apiKey, setApiKey] = useState('');
  
  // App UI states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('Details');
  
  // Speech recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);

  // User manual override states
  const [overrideStage, setOverrideStage] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLogs, setOverrideLogs] = useState([]);

  // Copy questions helper state
  const [copiedQuestionKey, setCopiedQuestionKey] = useState(null);

  const handleCopyQuestion = (text, key) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedQuestionKey(key);
        setTimeout(() => setCopiedQuestionKey(null), 1500);
      }).catch(err => {
        console.error('Failed to copy question: ', err);
      });
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedQuestionKey(key);
        setTimeout(() => setCopiedQuestionKey(null), 1500);
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Drawer configuration form states
  const [drawerTenantName, setDrawerTenantName] = useState('');
  const [drawerFramework, setDrawerFramework] = useState('');
  const [drawerStages, setDrawerStages] = useState([]);

  // Initialize tenants list and settings from localStorage or defaults
  useEffect(() => {
    const savedTenants = localStorage.getItem('stagecraft_tenants');
    const localApiKey = localStorage.getItem('stagecraft_gemini_key') || '';
    setApiKey(localApiKey);

    if (savedTenants) {
      try {
        const parsed = JSON.parse(savedTenants);
        setTenants(parsed);
      } catch (e) {
        setTenants(defaultTenants);
      }
    } else {
      setTenants(defaultTenants);
    }
  }, []);

  // Update active tenant when selection or tenants list changes
  useEffect(() => {
    if (tenants.length > 0) {
      const found = tenants.find(t => t.id === selectedTenantId);
      if (found) {
        setActiveTenant(found);
        // Clear notes and results on tenant switch
        setNotes('');
        setSelectedSampleIdx('');
        setAnalysisResult(null);
        setApiError(null);
        
        // Initialize drawer form values
        setDrawerTenantName(found.name);
        setDrawerFramework(found.activeFramework);
        setDrawerStages(JSON.parse(JSON.stringify(found.stages))); // deep copy
      }
    }
  }, [selectedTenantId, tenants]);

  // Sync opportunity metadata state when active tenant or selected template changes
  useEffect(() => {
    if (activeTenant) {
      const initialMeta = getOpportunityMetadata();
      setOppMetadata(initialMeta);
      // Clean analysis when switching notes templates
      setAnalysisResult(null);
      setApiError(null);
    }
  }, [selectedTenantId, selectedSampleIdx, activeTenant]);

  // Handle template notes loading
  const handleSampleNotesChange = (e) => {
    const idx = e.target.value;
    setSelectedSampleIdx(idx);
    if (idx !== '' && activeTenant && activeTenant.sampleMeetings[idx]) {
      setNotes(activeTenant.sampleMeetings[idx].notes);
    } else {
      setNotes('');
    }
  };

  // Browser speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setNotes(prev => {
              const space = prev && !prev.endsWith(' ') ? ' ' : '';
              return prev + space + finalTranscript;
            });
          }
        };

        rec.onerror = (event) => {
          console.error("Speech Recognition Error:", event.error);
          setSpeechError(`Error: ${event.error}`);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setSpeechError('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        setSpeechError('Could not start microphone.');
      }
    }
  };

  // API Client call
  const analyzeNotes = async () => {
    if (!notes.trim() || !activeTenant) return;
    setIsLoading(true);
    setApiError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          meetingNotes: notes,
          tenant: activeTenant,
          frameworkType: activeTenant.activeFramework,
          crmContext: oppMetadata // pass edited context fields!
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during analysis');
      }

      setAnalysisResult(data);
      
      // Update CRM stage key automatically from AI result
      setOppMetadata(prev => ({
        ...prev,
        stage: data.stage
      }));

      // Pre-select current stage for manual override options
      setOverrideStage(data.stage);
      setOverrideReason('');

    } catch (err) {
      console.error(err);
      setApiError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Manual Stage Override
  const submitOverride = (e) => {
    e.preventDefault();
    if (!analysisResult || !overrideStage) return;

    const previousStage = analysisResult.stage;
    
    // Check if stage actually changed or if reason is provided
    if (previousStage === overrideStage && !overrideReason.trim()) {
      alert("Please select a different stage or enter a rationale.");
      return;
    }

    // Dynamic state update
    setAnalysisResult(prev => ({
      ...prev,
      stage: overrideStage,
      confidence_score: previousStage === overrideStage ? prev.confidence_score : 100,
      confidence_label: previousStage === overrideStage ? prev.confidence_label : 'High',
      reasoning: `Manual override submitted by user: "${overrideReason || 'Admin adjustment'}". Previously classified as: "${previousStage}".`
    }));

    // Update CRM stage key
    setOppMetadata(prev => ({
      ...prev,
      stage: overrideStage
    }));

    // Log the override
    const logItem = {
      timestamp: new Date().toLocaleTimeString(),
      deal: oppMetadata?.opportunityName || 'Deal',
      from: previousStage,
      to: overrideStage,
      reason: overrideReason || 'Manual adjustment'
    };

    setOverrideLogs(prev => [logItem, ...prev]);
    setOverrideReason('');
  };

  // Drawer form input modifications
  const handleStageFieldChange = (index, field, value) => {
    const updated = [...drawerStages];
    updated[index][field] = value;
    setDrawerStages(updated);
  };

  const handleApiKeyChange = (e) => {
    const value = e.target.value;
    setApiKey(value);
    localStorage.setItem('stagecraft_gemini_key', value);
  };

  // Save modified configurations
  const saveTenantSettings = (e) => {
    e.preventDefault();
    if (!activeTenant) return;

    const updatedTenant = {
      ...activeTenant,
      name: drawerTenantName,
      activeFramework: drawerFramework,
      stages: drawerStages
    };

    const updatedTenantsList = tenants.map(t => t.id === selectedTenantId ? updatedTenant : t);
    setTenants(updatedTenantsList);
    localStorage.setItem('stagecraft_tenants', JSON.stringify(updatedTenantsList));
    setIsDrawerOpen(false);
  };

  // Reset localStorage to defaults
  const resetToDefaultConfigs = () => {
    if (confirm("Reset all stage configurations and templates to system defaults?")) {
      localStorage.removeItem('stagecraft_tenants');
      setTenants(defaultTenants);
      setIsDrawerOpen(false);
    }
  };

  // Determine active stage index for rendering progress bar
  const getActiveStageIndex = () => {
    if (!activeTenant) return 0;
    
    // Check AI result first, then falls back to CRM state
    const targetStage = analysisResult ? analysisResult.stage : (oppMetadata ? oppMetadata.stage : '');
    const foundIdx = activeTenant.stages.findIndex(s => s.name === targetStage);
    if (foundIdx !== -1) return foundIdx;
    
    if (selectedTenantId === 'jove-academic' && selectedSampleIdx === '0') return 2;
    if (selectedTenantId === 'jove-academic' && selectedSampleIdx === '1') return 3;
    return 0;
  };

  // Get opportunity metadata dynamically from notes text (Salesforce screenshots alignment)
  const getOpportunityMetadata = () => {
    const text = notes.toLowerCase();
    
    // Check for UAH Academic Upgrade (Screenshot 1 & 3)
    if (text.includes('alabama') || text.includes('huntsville') || text.includes('uah') || (selectedTenantId === 'jove-academic' && selectedSampleIdx === '0')) {
      return {
        opportunityName: "University of Alabama at Huntsville - Upgrade",
        accountName: "University of Alabama at Huntsville",
        institutionId: "569",
        closeDate: "6/15/2026",
        amount: "$46,282.50",
        acv: "$46,282.50",
        owner: "Maria Wolf-Swartz",
        type: "Upgrade",
        origin: "Ongoing conversation with the Library",
        stage: "C - Proposition",
        probability: "20%",
        pushCount: "1",
        priceBook: "Price Book 3",
        quoteDate: "",
        quoteDelivered: "false",
        decisionDate: "",
        description: "Faculty from Physics and Engineering requesting upgrade to Unlimited catalog.",
        activityStats: {
          librarianMeetings: "4",
          trials6m: "25",
          facultyMeetings: "9",
          totalTrials: "79",
          recs6m: "3",
          facultyRecs: "3",
          recsAll: "3",
          recsUsage: "29"
        },
        nextSteps: {
          decisionType: "Institution",
          decisionMaker: "Libs: David Moore and Laura Slavin",
          winRequirements: "Show enough interest to lib to justify upgrade to unlimited. Currently have Bio Sci pkg for 15K. Plus Nursing. Will Waldron is champ in Phys and Eng. Armentrout and Nelson have shown interest in Eng. Need to generate more recs.",
          highlights: [
            { date: "4/23/2026", text: "Met w/ Laura and David from Lib. explained need to upgrade- esp add Phy and Eng. Explained Unl going away and incremental add ons not a good decision financially. Sent Pricing. David meets w/ Provost Monthly." },
            { date: "4/16/2026", text: "Reached out to Laura S to make meeting for week of 4/20 to review the Spr semester usage (to really discuss plan for going forward)." },
            { date: "3/15/2026", text: "Physics faculty Will Waldron and Chemistry faculty Michelle Greene making case to Library to add full scientific catalog." }
          ]
        }
      };
    } 
    
    // Check for Atlanta Woodruff Library Upgrade (Screenshot 2 & 4)
    if (text.includes('atlanta') || text.includes('woodruff') || text.includes('clark') || (selectedTenantId === 'jove-academic' && selectedSampleIdx === '1')) {
      return {
        opportunityName: "Atlanta University Center Robert W. Woodruff Library - Upgrade",
        accountName: "Atlanta University Center Robert W. Woodruff Library",
        institutionId: "412",
        closeDate: "10/7/2027",
        amount: "$52,900.00",
        acv: "$52,900.00",
        owner: "Jordan Pilkington",
        type: "Upgrade",
        origin: "Ongoing conversation with the Library",
        stage: "B - Validation",
        probability: "15%",
        pushCount: "2",
        priceBook: "Price Book 3",
        quoteDate: "3/25/2026",
        quoteDelivered: "true",
        decisionDate: "5/14/2026",
        description: "Upgrade package proposal for JoVE Business and Core: A&P.",
        activityStats: {
          librarianMeetings: "20",
          trials6m: "0",
          facultyMeetings: "0",
          totalTrials: "0",
          recs6m: "0",
          facultyRecs: "0",
          recsAll: "0",
          recsUsage: "0"
        },
        nextSteps: {
          decisionType: "Institution",
          decisionMaker: "Dr. Terrence Martin - Director of the Library; Valdoshia Hunt - Content Strategist Librarian",
          winRequirements: "Secure recommendations from mathematics faculty and chemistry/environment faculty to support the upgrade to unlimited. Secure recommendations and set up a meeting with the primary contact before the semester ends on May 14th.",
          highlights: [
            { date: "03.25.2026", text: "Library asks to meet with me following strong recommendations from Business faculty and A&P faculty. During the meeting, we discussed pricing for JoVE Business and Core: A&P. I proposed an upgrade subscription package at $52,900.00. The Director, Dr. Terrence Martin, wants to move forward but requested the standard agreement be sent to university legal counsel Valdoshia Hunt to review our IP ownership terms." },
            { date: "3.9.2026", text: "Received recommendations from the Director and Program Director of Business School at Clark Atlanta University for JoVE Business. Social Sciences Librarian reached out to Library Director to share recommendations." },
            { date: "1.28.2026", text: "Hosted a Lunch and Learn session to engage faculty and walk them through what is now available and how to use. Faculty from many different disciplines, including Business and Physiology, attended and asked that the library look into JoVE Business and Core: A&P. I secured a recommendation and set up a trial." }
          ]
        }
      };
    }

    // Default template metrics for Healthcare System scheduler (BANT)
    if (selectedTenantId === 'healthcare-sales') {
      return {
        opportunityName: "Valley Health Cardiology - Scheduler",
        accountName: "Valley Health System",
        institutionId: "305",
        closeDate: "12/31/2026",
        amount: "$30,000.00",
        acv: "$30,000.00",
        owner: "Claire Merritt",
        type: "New Business",
        origin: "Inbound Marketing Lead",
        stage: "Lead Qualification",
        probability: "35%",
        pushCount: "0",
        priceBook: "Price Book 1",
        quoteDate: "",
        quoteDelivered: "false",
        decisionDate: "",
        description: "Cardiac department scheduler scheduling integration.",
        activityStats: {
          librarianMeetings: "1",
          trials6m: "2",
          facultyMeetings: "3",
          totalTrials: "5",
          recs6m: "1",
          facultyRecs: "1",
          recsAll: "1",
          recsUsage: "10"
        },
        nextSteps: {
          decisionType: "Department",
          decisionMaker: "Dr. Marcus - Chief of Cardiology",
          winRequirements: "Demonstrate SMS reminder module and clear IT HIPAA compliance security review.",
          highlights: [
            { date: "5/24/2026", text: "Had first call with Dr. Marcus, Chief of Cardiology at Valley Health. Scheduling inefficiencies causing 15% missed appointments. Stated budget up to $30K allocated for administrative software." }
          ]
        }
      };
    }

    // Default template metrics for Legal Retainers (SPIN)
    if (selectedTenantId === 'legal-services') {
      return {
        opportunityName: "Apex Labs - Patent Infringement Retainer",
        accountName: "Apex Labs Inc.",
        institutionId: "128",
        closeDate: "7/15/2026",
        amount: "$15,000.00",
        acv: "$15,000.00",
        owner: "Jordan Pilkington",
        type: "Retainer",
        origin: "Client Referral",
        stage: "Initial Consultation",
        probability: "60%",
        pushCount: "0",
        priceBook: "Legal Services Tier A",
        quoteDate: "5/26/2026",
        quoteDelivered: "false",
        decisionDate: "6/10/2026",
        description: "Litigation retainer for competitor patent infringement.",
        activityStats: {
          librarianMeetings: "2",
          trials6m: "0",
          facultyMeetings: "0",
          totalTrials: "0",
          recs6m: "0",
          facultyRecs: "0",
          recsAll: "0",
          recsUsage: "0"
        },
        nextSteps: {
          decisionType: "Corporate",
          decisionMaker: "Thomas - CEO",
          winRequirements: "Draft FTO (Freedom to Operate) patent opinion, clear legal conflicts, and obtain signed engagement letter.",
          highlights: [
            { date: "5/26/2026", text: "Met with Thomas, CEO of Apex Labs. Patent infringement threat from larger competitor. Thomas stressed lawsuit could derail Series A funding round in 45 days. Budget not an issue due to high business risk." }
          ]
        }
      };
    }
    
    // General Default fallback
    return {
      opportunityName: activeTenant ? `${activeTenant.name} - Opportunity` : "New Opportunity",
      accountName: activeTenant ? activeTenant.name : "New Account",
      institutionId: "100",
      closeDate: "N/A",
      amount: "N/A",
      acv: "N/A",
      owner: "Faisal Usta",
      type: "New Business",
      origin: "Direct",
      stage: activeTenant?.stages[0]?.name || "Discovery",
      probability: "10%",
      pushCount: "0",
      priceBook: "Price Book 1",
      quoteDate: "",
      quoteDelivered: "false",
      decisionDate: "",
      description: "",
      activityStats: {
        librarianMeetings: "0",
        trials6m: "0",
        facultyMeetings: "0",
        totalTrials: "0",
        recs6m: "0",
        facultyRecs: "0",
        recsAll: "0",
        recsUsage: "0"
      },
      nextSteps: {
        decisionType: "Standard",
        decisionMaker: "Unmapped",
        winRequirements: "Unmapped",
        highlights: [
          { date: "Today", text: "No historical log entries found. Select a default meeting notes template to load previous deal activity history." }
        ]
      }
    };
  };

  // Inline Fields Editors
  const startEditing = (key, currentVal) => {
    setEditingField(key);
    setEditValue(currentVal);
  };

  const saveField = (key) => {
    if (oppMetadata) {
      setOppMetadata(prev => ({
        ...prev,
        [key]: editValue
      }));
    }
    setEditingField(null);
  };

  const renderEditableField = (label, key, options = {}) => {
    const {
      isLink = false,
      isSelect = false,
      span2 = false,
      inputType = 'text',
      hasHelp = false,
      helpText = ''
    } = options;

    const isEditing = editingField === key;
    const value = oppMetadata ? oppMetadata[key] : '';

    // If it's a checkbox, render immediately toggleable checked/unchecked input
    if (inputType === 'checkbox') {
      const isChecked = value === 'true' || value === true || value === 'Yes';
      return (
        <div className="field-cell" style={span2 ? { gridColumn: 'span 2' } : {}}>
          <span className="field-label" style={span2 ? { width: '20%' } : { width: '40%' }}>
            {label}
            {hasHelp && (
              <span className="info-icon" title={helpText}>
                ⓘ
              </span>
            )}
          </span>
          <div className="field-value-group" style={{ justifyContent: 'flex-end', width: span2 ? '80%' : '60%' }}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                const newVal = e.target.checked ? 'true' : 'false';
                setOppMetadata(prev => ({
                  ...prev,
                  [key]: newVal
                }));
              }}
              style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="field-cell" style={span2 ? { gridColumn: 'span 2' } : {}}>
        <span className="field-label" style={span2 ? { width: '20%' } : { width: '40%' }}>
          {label}
          {hasHelp && (
            <span className="info-icon" title={helpText}>
              ⓘ
            </span>
          )}
        </span>
        <div className="field-value-group" style={{ justifyContent: 'flex-end', width: span2 ? '80%' : '60%' }}>
          {isEditing ? (
            isSelect ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveField(key)}
                onKeyDown={(e) => e.key === 'Enter' && saveField(key)}
                className="override-select"
                style={{ width: '100%', padding: '0.2rem', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                autoFocus
              >
                {activeTenant?.stages.map((s, idx) => (
                  <option key={idx} value={s.name}>{s.name}</option>
                ))}
              </select>
            ) : inputType === 'date' ? (
              <input
                type="date"
                value={convertMDYToYMD(editValue)}
                onChange={(e) => setEditValue(convertYMDToMDY(e.target.value))}
                onBlur={() => saveField(key)}
                onKeyDown={(e) => e.key === 'Enter' && saveField(key)}
                className="override-input"
                style={{ width: '100%', padding: '0.2rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: 'right' }}
                autoFocus
              />
            ) : inputType === 'textarea' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveField(key)}
                className="override-input"
                style={{ width: '100%', minHeight: '60px', padding: '0.3rem', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: 'left', fontFamily: 'inherit', color: 'var(--text-main)' }}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveField(key)}
                onKeyDown={(e) => e.key === 'Enter' && saveField(key)}
                className="override-input"
                style={{ width: '100%', padding: '0.2rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: span2 ? 'left' : 'right' }}
                autoFocus
              />
            )
          ) : (
            <>
              <span
                className={`field-value ${isLink ? 'link' : ''}`}
                style={{
                  fontWeight: key === 'amount' || key === 'stage' ? 'bold' : 'normal',
                  textAlign: inputType === 'textarea' ? 'left' : 'right',
                  width: inputType === 'textarea' ? '100%' : 'auto',
                  whiteSpace: inputType === 'textarea' ? 'pre-wrap' : 'nowrap',
                  cursor: 'pointer'
                }}
                onClick={() => startEditing(key, value)}
              >
                {inputType === 'textarea' ? (value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Double-click to add description</span>) : value}
              </span>
              <span
                className="field-edit-icon"
                onClick={() => startEditing(key, value)}
              >
                ✏️
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      
      {/* Salesforce Lightning nav bar layout */}
      <nav className="sf-navbar">
        <div className="sf-nav-left">
          <div className="sf-brand">
            jove <span className="sf-brand-tag">Stagecraft AI Assist</span>
          </div>
          <ul className="sf-nav-links">
            <li className="sf-nav-link">Home</li>
            <li className="sf-nav-link active">Opportunities</li>
            <li className="sf-nav-link">Institutions</li>
            <li className="sf-nav-link">Contacts</li>
            <li className="sf-nav-link">Reports</li>
            <li className="sf-nav-link">Dashboards</li>
            <li className="sf-nav-link">Tasks</li>
          </ul>
        </div>
        <div className="sf-nav-right">
          {/* Salesforce search box */}
          <div className="sf-search-container">
            <span style={{ fontSize: '0.85rem' }}>🔍</span>
            <input type="text" className="sf-search-input" placeholder="Search..." />
          </div>
          <button 
            className="btn-sf"
            onClick={() => setIsDrawerOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            ⚙️ Admin Panel
          </button>
        </div>
      </nav>

      {/* Global utility bar mock */}
      <div className="sf-utility-bar">
        <div className="sf-utility-left">
          <span>📞 joVE CRM Lightning</span>
          <span>⚡ Active Workspace: Faisal CRM project</span>
        </div>
        <div>
          <span>Tenant: {activeTenant?.name}</span>
        </div>
      </div>

      <div className="app-container">
        
        {/* Salesforce-style Opportunity Header Panel (Screenshot 3 layout) */}
        <section className="opportunity-header-card">
          <div className="opp-title-row">
            <div className="opp-badge-section">
              <div className="opp-icon">👑</div>
              <div className="opp-label-group">
                <span>Opportunity</span>
                <h2>{oppMetadata?.opportunityName || 'New Opportunity'}</h2>
              </div>
            </div>
            <div className="opp-action-buttons">
              <div className="select-wrapper">
                <select 
                  value={selectedTenantId} 
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  style={{ padding: '0.35rem 2rem 0.35rem 0.65rem', fontSize: '0.8rem', backgroundColor: '#ffffff', border: '1px solid #c9c9c9', borderRadius: '4px' }}
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button className="btn-sf">Edit</button>
              <button className="btn-sf">Generate Quote</button>
              <button className="btn-sf">Generate Invoice</button>
              <button className="btn-sf" style={{ marginRight: '0.5rem' }}>Finance Approved</button>
              
              <button 
                onClick={analyzeNotes}
                className="btn-sf btn-sf-primary"
                disabled={isLoading || !notes.trim()}
              >
                {isLoading ? 'Interpreting...' : 'Mark Stage as Complete ⚡'}
              </button>
            </div>
          </div>

          {/* Details Table (Synced React State) */}
          <div className="opp-metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Account Name</span>
              <span className="metadata-value link">{oppMetadata?.accountName}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">JoVE CRM Institution ID</span>
              <span className="metadata-value">{oppMetadata?.institutionId}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Close Date</span>
              <span className="metadata-value">{oppMetadata?.closeDate}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Amount</span>
              <span className="metadata-value" style={{ fontWeight: 'bold' }}>{oppMetadata?.amount}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Opportunity Owner</span>
              <span className="metadata-value link">{oppMetadata?.owner}</span>
            </div>
          </div>

          {/* Chevron Progress Path (Screenshot 3) */}
          <div className="chevron-path">
            {activeTenant?.stages.map((s, idx) => {
              const activeIdx = getActiveStageIndex();
              const isCompleted = idx < activeIdx;
              const isActive = idx === activeIdx;
              let stepClass = 'future';
              if (isCompleted) stepClass = 'completed';
              if (isActive) stepClass = 'active';

              return (
                <div key={idx} className={`chevron-step ${stepClass}`}>
                  <span className="chevron-step-text">
                    {isCompleted ? '✓ ' : ''}{s.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Guidance for Success Box */}
          <div className="guidance-container">
            <div className="guidance-title">Guidance for success</div>
            <div className="guidance-content">
              {analysisResult ? (
                <span><strong>AI Recommended Next Step:</strong> {analysisResult.recommended_next_action}</span>
              ) : (
                <span>Map representative meeting logs to advance the deal into its correct sales stage. Complete target frameworks.</span>
              )}
            </div>
            <ul className="guidance-list">
              <li className="guidance-list-item">Solidify solution fit (scientific research / education alignment)</li>
              <li className="guidance-list-item">Coordinate and present pricing quotes / tiers</li>
              <li className="guidance-list-item">Analyze institutional engagement report and trial statistics</li>
            </ul>
          </div>
        </section>

        {/* Main Split Grid */}
        <main className="workspace-grid">
          
          {/* Left Column: Authentic Salesforce Tabs Content */}
          <div className="input-pane-group">
            
            <section className="panel-card" style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem' }}>
              {/* Salesforce Tabs strip */}
              <div className="sf-tabs">
                <div className={`sf-tab ${activeTab === 'Details' ? 'active' : ''}`} onClick={() => setActiveTab('Details')}>Details</div>
                <div className={`sf-tab ${activeTab === 'Related' ? 'active' : ''}`} onClick={() => setActiveTab('Related')}>Related</div>
                <div className={`sf-tab ${activeTab === 'Products' ? 'active' : ''}`} onClick={() => setActiveTab('Products')}>Products</div>
                <div className={`sf-tab ${activeTab === 'Contacts' ? 'active' : ''}`} onClick={() => setActiveTab('Contacts')}>Contacts</div>
              </div>

              {activeTab === 'Details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Overview Fields Card (Screenshot 2 replica - Stateful Inline Editable) */}
                  <div className="overview-fields-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="overview-fields-title" style={{ borderBottom: 'none', marginBottom: 0 }}>Overview</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click ✏️ or cell to edit inline</span>
                    </div>
                    <div className="fields-grid-2col" style={{ borderTop: '1px solid #e5e5e5', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      {renderEditableField("Opportunity Name", "opportunityName")}
                      {renderEditableField("Close Date", "closeDate", { inputType: 'date' })}
                      {renderEditableField("Account Name", "accountName", { isLink: true })}
                      {renderEditableField("Stage", "stage", { isSelect: true })}
                      {renderEditableField("Type", "type")}
                      {renderEditableField("Probability (%)", "probability")}
                      {renderEditableField("Amount", "amount")}
                      {renderEditableField("PushCount", "pushCount")}
                      {renderEditableField("New Business ACV", "acv")}
                      {renderEditableField("Quote Date", "quoteDate", { inputType: 'date', hasHelp: true, helpText: 'Date when the pricing proposal or quote was drafted.' })}
                      {renderEditableField("Opportunity Origin", "origin", { hasHelp: true, helpText: 'Source or channel where the opportunity originated.' })}
                      {renderEditableField("Quote Delivered", "quoteDelivered", { inputType: 'checkbox', hasHelp: true, helpText: 'Check if the quote has been successfully sent to the client.' })}
                      {renderEditableField("Description", "description", { inputType: 'textarea', hasHelp: true, helpText: 'General overview or notes on the opportunity.' })}
                      {renderEditableField("Decision Date", "decisionDate", { inputType: 'date', hasHelp: true, helpText: 'Target date for the client to make their final decision.' })}
                      <div className="field-cell empty-placeholder" style={{ borderBottom: 'none' }}></div>
                      {renderEditableField("Price Book", "priceBook", { isLink: true })}
                    </div>
                  </div>

                  {/* Activity Stats Card (Screenshot 2 / 1 details) */}
                  <div className="overview-fields-card">
                    <div className="overview-fields-title">Activity Metrics</div>
                    <div className="fields-grid-2col">
                      <div className="field-cell">
                        <span className="field-label">Librarian Meetings Last 6M</span>
                        <span className="field-value">{oppMetadata?.activityStats?.librarianMeetings || '0'}</span>
                      </div>
                      <div className="field-cell">
                        <span className="field-label">Trials Last 6 Months</span>
                        <span className="field-value">{oppMetadata?.activityStats?.trials6m || '0'}</span>
                      </div>
                      <div className="field-cell">
                        <span className="field-label">Faculty Meetings Last 6M</span>
                        <span className="field-value">{oppMetadata?.activityStats?.facultyMeetings || '0'}</span>
                      </div>
                      <div className="field-cell">
                        <span className="field-label">Total Trials</span>
                        <span className="field-value">{oppMetadata?.activityStats?.totalTrials || '0'}</span>
                      </div>
                      <div className="field-cell">
                        <span className="field-label">Recs Last 6 Months</span>
                        <span className="field-value">{oppMetadata?.activityStats?.recs6m || '0'}</span>
                      </div>
                      <div className="field-cell">
                        <span className="field-label">Faculty Recs Last 6 Months</span>
                        <span className="field-value">{oppMetadata?.activityStats?.facultyRecs || '0'}</span>
                      </div>
                      <div className="field-cell">
                        <span className="field-label">Recs All Time</span>
                        <span className="field-value">{oppMetadata?.activityStats?.recsAll || '0'}</span>
                      </div>
                      <div className="field-cell">
                        <span className="field-label">Recs All Time (Usage Stat)</span>
                        <span className="field-value">{oppMetadata?.activityStats?.recsUsage || '0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps And Comments (Screenshot 4) */}
                  <div className="overview-fields-card">
                    <div className="overview-fields-title">Next Steps and Comments</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem', paddingTop: '0.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="field-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none' }}>
                          <span className="field-label" style={{ width: '100%', marginBottom: '0.2rem' }}>Decision Type</span>
                          <span className="field-value" style={{ fontWeight: '500' }}>{oppMetadata?.nextSteps?.decisionType}</span>
                        </div>
                        <div className="field-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none' }}>
                          <span className="field-label" style={{ width: '100%', marginBottom: '0.2rem' }}>Decision Maker</span>
                          <span className="field-value" style={{ fontWeight: '500', textAlign: 'left', whiteSpace: 'normal', overflow: 'visible' }}>{oppMetadata?.nextSteps?.decisionMaker}</span>
                        </div>
                        <div className="field-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: 'none' }}>
                          <span className="field-label" style={{ width: '100%', marginBottom: '0.2rem' }}>Win Requirements</span>
                          <span className="field-value" style={{ fontWeight: '500', textAlign: 'left', whiteSpace: 'normal', overflow: 'visible', fontSize: '0.75rem', lineHeight: '1.3' }}>{oppMetadata?.nextSteps?.winRequirements}</span>
                        </div>
                      </div>
                      <div className="history-notes-section">
                        <span className="field-label" style={{ fontWeight: 'bold' }}>Opportunity Highlights</span>
                        <div className="highlights-log-box" style={{ height: '180px' }}>
                          {oppMetadata?.nextSteps?.highlights.map((entry, idx) => (
                            <div key={idx} className="highlight-entry">
                              <div className="highlight-entry-date">{entry.date}</div>
                              <p className="highlight-entry-text">{entry.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {activeTab !== 'Details' && (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No metadata records loaded under this Salesforce tab for the POC wedge. Click <strong>Details</strong> to view active opportunity sheets.
                </div>
              )}
            </section>

          </div>

          {/* Right Column: Custom Stagecraft AI Components */}
          <div className="coach-pane-group">
            
            {/* LWC 1: Scoping Assist (Notes input editor) */}
            <section className="panel-card panel-card-ai" style={{ borderTop: '4px solid var(--color-brand)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  🤖 Stagecraft AI Scoping Assist
                </h3>
                <div className="sample-selector">
                  <select value={selectedSampleIdx} onChange={handleSampleNotesChange}>
                    <option value="">-- Load rep notes --</option>
                    {activeTenant?.sampleMeetings?.map((item, idx) => (
                      <option key={idx} value={idx}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="notes-editor-wrapper">
                <textarea
                  className="notes-editor"
                  placeholder="Enter meeting notes or load one of Faisal's templates. You can type or dictate. Stagecraft automatically parses the text into pipeline stages and qualification rubrics..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="editor-toolbar">
                <div className="speech-control">
                  <button 
                     type="button" 
                     className={`btn-mic ${isRecording ? 'recording' : ''}`}
                     onClick={toggleRecording}
                     title="Dictate meeting summary"
                  >
                    🎙️
                  </button>
                  {isRecording && <span className="speech-status active">Recording transcribing...</span>}
                  {!isRecording && <span className="speech-status">Browser Dictation (Free)</span>}
                </div>
                
                <button
                  onClick={analyzeNotes}
                  className="btn-sf btn-sf-primary"
                  disabled={isLoading || !notes.trim()}
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {isLoading ? 'Running interpretation...' : 'Analyze Rep Notes ⚡'}
                </button>
              </div>
            </section>

            {/* LWC 2: AI Coach Dashboard results */}
            <section className="panel-card panel-card-ai" style={{ borderTop: '4px solid var(--color-brand)', minHeight: '380px' }}>
              
              {!isLoading && !analysisResult && !apiError && (
                <div className="results-empty" style={{ height: '320px' }}>
                  <svg className="results-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3>Awaiting AI Scoping Analysis</h3>
                  <p>Load notes or dictate your meeting account and click Analyze to view structured pipeline assessments.</p>
                </div>
              )}

              {isLoading && (
                <div className="skeleton-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
                  </div>
                  <div className="skeleton skeleton-card"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              )}

              {apiError && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>AI Classification Failed</h3>
                  <p style={{ color: 'var(--text-main)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{apiError}</p>
                  <button onClick={analyzeNotes} className="btn-sf" style={{ color: 'var(--text-bright)' }}>
                    Retry API Request
                  </button>
                </div>
              )}

              {!isLoading && analysisResult && (
                <div className="diagnosis-grid">
                  
                  {/* Results Header card */}
                  <div className="diagnosis-header">
                    <div style={{ display: 'flex', alignContent: 'center', gap: '0.5rem' }}>
                      <span className={`confidence-badge ${analysisResult.confidence_label.toLowerCase()}`}>
                        🛡️ Confidence: {analysisResult.confidence_score}%
                      </span>
                      {analysisResult.isMock && (
                        <span className="badge-is-mock">Heuristics Fallback</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Framework: <strong>{activeTenant?.activeFramework.toUpperCase()}</strong>
                    </div>
                  </div>

                  {/* Coach Results layout */}
                  <div className="coach-grid">
                    
                    <div className="reasoning-container">
                      <h4>AI Scaffolding Reasoning</h4>
                      <p className="reasoning-text">{analysisResult.reasoning}</p>
                    </div>

                    {analysisResult.coaching_playbook && analysisResult.coaching_playbook.length > 0 && (
                      <div className="playbook-container">
                        <div className="playbook-header">
                          <h4 className="playbook-title">
                            💡 Sales Coach Action Playbook
                          </h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {analysisResult.coaching_playbook.length} recommended {analysisResult.coaching_playbook.length === 1 ? 'play' : 'plays'}
                          </span>
                        </div>
                        {analysisResult.coaching_playbook.map((play, playIdx) => (
                          <div key={play.gap_key || playIdx} className="playbook-card">
                            <div className="playbook-card-header">
                              <div className="playbook-gap-info">
                                <span className="playbook-gap-label">⚠️ Missing Opportunity Data</span>
                                <h3 className="playbook-gap-title">{play.missing_info}</h3>
                              </div>
                              <div className="playbook-badges">
                                {play.target_contact && (
                                  <span className="playbook-badge contact">
                                    👤 {play.target_contact}
                                  </span>
                                )}
                                {play.timing && (
                                  <span className="playbook-badge time">
                                    ⏱️ {play.timing}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="playbook-details-grid">
                              <div className="playbook-section full-width">
                                <span className="playbook-section-label">📢 AI Recommendation</span>
                                <p className="playbook-section-content">{play.importance}</p>
                              </div>
                              
                              <div className="playbook-section">
                                <span className="playbook-section-label">🎯 Suggested Next Action</span>
                                <p className="playbook-section-content" style={{ fontWeight: '600', color: 'var(--text-white)' }}>
                                  {play.recommended_action}
                                </p>
                              </div>
                              
                              <div className="playbook-section">
                                <span className="playbook-section-label">🤝 Desired Outcome</span>
                                <p className="playbook-section-content">{play.desired_outcome}</p>
                              </div>
                              
                              <div className="playbook-section full-width">
                                <span className="playbook-section-label">💬 Suggested Discovery Questions & Approach</span>
                                <p className="playbook-section-content" style={{ opacity: 0.85, marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                                  <em>Approach: {play.communication_guidance}</em>
                                </p>
                                {play.suggested_questions && play.suggested_questions.length > 0 && (
                                  <div className="playbook-questions-list">
                                    {play.suggested_questions.map((q, qIdx) => {
                                      const key = `${play.gap_key || playIdx}-${qIdx}`;
                                      const isCopied = copiedQuestionKey === key;
                                      return (
                                        <div 
                                          key={qIdx} 
                                          className="playbook-question-item"
                                          onClick={() => handleCopyQuestion(q, key)}
                                          title="Click to copy question to clipboard"
                                        >
                                          <span className="playbook-question-text">"{q}"</span>
                                          <button className="playbook-copy-btn" type="button">
                                            {isCopied ? (
                                              <span className="playbook-copy-toast">Copied!</span>
                                            ) : (
                                              <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <div className="list-block">
                        <h4>📌 Confirmed Signals</h4>
                        {analysisResult.signals_found.length > 0 ? (
                          <ul>
                            {analysisResult.signals_found.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No signals confirmed.</p>
                        )}
                      </div>

                      <div className="list-block missing">
                        <h4>⚠️ Information Gaps</h4>
                        {analysisResult.missing_or_ambiguous.length > 0 ? (
                          <ul>
                            {analysisResult.missing_or_ambiguous.map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No critical information gaps.</p>
                        )}
                      </div>
                    </div>

                    {analysisResult.risk_flags.length > 0 && (
                      <div className="list-block">
                        <h4>🚨 Risk Registry</h4>
                        <div>
                          {analysisResult.risk_flags.map((r, i) => (
                            <span key={i} className="risk-tag">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Framework Checklist cards */}
                    <div className="framework-card" style={{ marginTop: '0.25rem' }}>
                      <h3>Active Sales Framework Checklist</h3>
                      <div className="framework-grid">
                        {analysisResult.framework_criteria.map((item, i) => (
                          <div key={i} className="framework-item">
                            <div className="framework-item-header">
                              <span className="framework-item-title">{item.label}</span>
                              <span className={`framework-status-badge ${item.status}`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="framework-item-evidence">{item.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Override Form */}
                  <div className="override-container">
                    <div className="override-header">
                      <h4>Pipeline Modification Override</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Human validation override loop</span>
                    </div>
                    
                    <form onSubmit={submitOverride} className="override-controls">
                      <select 
                        className="override-select"
                        value={overrideStage}
                        onChange={(e) => setOverrideStage(e.target.value)}
                      >
                        {activeTenant?.stages.map((s, idx) => (
                          <option key={idx} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        className="override-input"
                        placeholder="Provide override rationales (e.g. dean verbally approved)..."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                      />
                      
                      <button type="submit" className="btn-sf" style={{ background: '#f3f2f1', borderColor: 'var(--color-brand)' }}>
                        Override Stage
                      </button>
                    </form>

                    {overrideLogs.length > 0 && (
                      <div className="override-logs">
                        <div className="override-logs-title">Pipeline Override Log</div>
                        {overrideLogs.map((log, idx) => (
                          <div key={idx} className="override-log-item">
                            [{log.timestamp}] Overrode stage for <span className="override-log-meta">{log.deal}</span> to <strong>{log.to}</strong>. Reason: <em>"{log.reason}"</em>.
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </section>
          </div>

        </main>

      </div>

      {/* Settings Side Drawer Overlay */}
      <div 
        className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Settings Side Drawer Panel */}
      <aside className={`settings-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Stage Config & API Settings</h3>
          <button className="btn-drawer-close" onClick={() => setIsDrawerOpen(false)}>×</button>
        </div>

        <form onSubmit={saveTenantSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group">
            <label>Gemini API Key</label>
            <input 
              type="password"
              className="form-control-input"
              placeholder="Enter key (Optional)"
              value={apiKey}
              onChange={handleApiKeyChange}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Add a Gemini Developer API key to run actual AI classifications. If blank, Stagecraft activates simulated heuristics mode.
            </span>
          </div>

          <div className="form-group">
            <label>Tenant Name</label>
            <input 
              type="text" 
              className="form-control-input"
              value={drawerTenantName}
              onChange={(e) => setDrawerTenantName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Active Sales Framework</label>
            <div className="select-wrapper" style={{ width: '100%' }}>
              <select 
                value={drawerFramework}
                onChange={(e) => setDrawerFramework(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="meddic">MEDDIC (Enterprise B2B)</option>
                <option value="bant">BANT (Transactional B2B)</option>
                <option value="spin">SPIN (Advisory/Consultative)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Opportunity Pipeline Stages</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Configure the pipeline steps and exit gates.
            </span>

            <div className="stages-config-list">
              {drawerStages.map((stage, idx) => (
                <div key={idx} className="stage-config-item">
                  <div className="stage-config-item-header">
                    <span className="stage-number">Stage {idx + 1}</span>
                  </div>

                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-control-input"
                      value={stage.name}
                      placeholder="Stage Name"
                      onChange={(e) => handleStageFieldChange(idx, 'name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-control-input"
                      value={stage.description}
                      placeholder="Stage Description"
                      style={{ fontSize: '0.8rem' }}
                      onChange={(e) => handleStageFieldChange(idx, 'description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-control-input"
                      value={stage.exit_criteria}
                      placeholder="Exit criteria requirements"
                      style={{ fontSize: '0.8rem' }}
                      onChange={(e) => handleStageFieldChange(idx, 'exit_criteria', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-save-settings">
            Apply Configurations
          </button>
          
          <button 
            type="button" 
            className="btn-sf" 
            style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', width: '100%', justifyContent: 'center' }}
            onClick={resetToDefaultConfigs}
          >
            Reset Defaults
          </button>
        </form>
      </aside>

    </div>
  );
}
