import React, { useState } from 'react';
import { Search, FileText, User, Calendar, Stethoscope, Building, Send, Check, AlertCircle, Download, Users, Scale, Eye, TrendingUp, Filter, MessageSquare } from 'lucide-react';

const LOMNDemo = () => {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    dob: '',
    diagnosis: '',
    equipment: '',
    duration: '',
    demographics: ''
  });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [similarCases, setSimilarCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [biasAnalysis, setBiasAnalysis] = useState(null);

  // Disease categories with prevalence data
  const diseaseCategories = [
    { name: 'Cancer (Oncology)', prevalence: 23.4, rejectionRate: 31.2 },
    { name: 'Psychiatric', prevalence: 19.8, rejectionRate: 42.1 },
    { name: 'Cardiac', prevalence: 18.7, rejectionRate: 28.4 },
    { name: 'Chronic Pain', prevalence: 16.2, rejectionRate: 47.3 },
    { name: 'Terminal Illness', prevalence: 8.9, rejectionRate: 21.7 },
    { name: 'Diabetes', prevalence: 6.5, rejectionRate: 33.8 },
    { name: 'Respiratory', prevalence: 4.2, rejectionRate: 29.1 },
    { name: 'Neurological', prevalence: 2.3, rejectionRate: 38.9 }
  ];

  // Mock similar cases for "One→Many" mapping
  const mockSimilarCases = [
    {
      id: 1,
      patientDemo: "45F, Hispanic, TX",
      diagnosis: "Breast Cancer Stage II",
      denialReason: "Experimental treatment not covered",
      outcome: "Approved after appeal",
      timeframe: "2024-01",
      similarity: 94,
      reasoning: "Same diagnosis, same treatment, similar demographics",
      insuranceProvider: "UHC"
    },
    {
      id: 2,
      patientDemo: "43F, White, CA",
      diagnosis: "Breast Cancer Stage II",
      denialReason: "Experimental treatment not covered",
      outcome: "Denied after appeal",
      timeframe: "2024-02",
      similarity: 91,
      reasoning: "Same diagnosis, same treatment, different outcome",
      insuranceProvider: "UHC"
    },
    {
      id: 3,
      patientDemo: "47F, African American, GA",
      diagnosis: "Breast Cancer Stage II",
      denialReason: "Experimental treatment not covered",
      outcome: "Approved after appeal",
      timeframe: "2023-12",
      similarity: 89,
      reasoning: "Same diagnosis, same treatment, required legal intervention",
      insuranceProvider: "UHC"
    }
  ];

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSimilarCases(mockSimilarCases);
      
      // Generate bias analysis
      const analysis = analyzeBias(mockSimilarCases);
      setBiasAnalysis(analysis);
      
      setIsLoading(false);
    }, 1500);
  };

  const analyzeBias = (cases) => {
    const demographics = cases.map(c => c.patientDemo.split(', ')[1]);
    const outcomes = cases.map(c => c.outcome);
    
    const raceOutcomes = {
      'Hispanic': cases.filter(c => c.patientDemo.includes('Hispanic')).map(c => c.outcome),
      'White': cases.filter(c => c.patientDemo.includes('White')).map(c => c.outcome),
      'African American': cases.filter(c => c.patientDemo.includes('African American')).map(c => c.outcome)
    };
    
    return {
      totalCases: cases.length,
      approvalRate: (outcomes.filter(o => o.includes('Approved')).length / cases.length * 100).toFixed(1),
      raceDisparity: Object.entries(raceOutcomes).map(([race, outcomes]) => ({
        race,
        approvalRate: outcomes.length > 0 ? (outcomes.filter(o => o.includes('Approved')).length / outcomes.length * 100).toFixed(1) : 0,
        caseCount: outcomes.length
      }))
    };
  };

  const generateCollectiveLetter = () => {
    if (!denialReason || similarCases.length === 0) return;
    
    const approvedCases = similarCases.filter(c => c.outcome.includes('Approved'));
    const deniedCases = similarCases.filter(c => c.outcome.includes('Denied'));
    
    const letter = `Dear [Insurance Company],

RE: COLLECTIVE APPEAL FOR MEDICAL NECESSITY - ${patientInfo.diagnosis}
Patient: ${patientInfo.name}, DOB: ${patientInfo.dob}

SYSTEMIC PATTERN ANALYSIS:
Based on our analysis of similar cases in your system, we have identified concerning patterns in denial decisions for identical medical conditions.

SIMILAR CASES ANALYSIS:
• ${similarCases.length} similar cases found with ${denialReason}
• ${approvedCases.length} cases (${((approvedCases.length / similarCases.length) * 100).toFixed(1)}%) were ultimately approved
• ${deniedCases.length} cases (${((deniedCases.length / similarCases.length) * 100).toFixed(1)}%) remain denied

DEMOGRAPHIC DISPARITY CONCERNS:
${biasAnalysis?.raceDisparity.map(item => 
  `• ${item.race}: ${item.approvalRate}% approval rate (${item.caseCount} cases)`
).join('\n')}

PRECEDENT CASES:
${approvedCases.map((c, i) => 
  `${i + 1}. ${c.patientDemo} - ${c.diagnosis} - APPROVED after appeal (${c.timeframe})`
).join('\n')}

MEDICAL NECESSITY JUSTIFICATION:
The treatment requested for ${patientInfo.name} is identical to the ${approvedCases.length} cases you have already approved. The denial appears inconsistent with your own precedent decisions.

SOCIAL TRANSPARENCY REQUEST:
We request transparency regarding:
1. Why identical cases receive different outcomes
2. Whether demographic factors influence decision-making
3. The appeals process timeline and success rates

This collective evidence demonstrates that the requested treatment is not experimental but rather standard care that you have previously approved for similar patients.

We respectfully request immediate reconsideration based on your own precedent decisions.

Sincerely,
[PHYSICIAN_NAME], MD
[PRACTICE_NAME]

---
This letter is supported by Social Transparency 2.0 analysis of ${similarCases.length} similar cases.`;

    setGeneratedLetter(letter);
  };

  const downloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Collective_LOMN_${patientInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2"> CollectiCure</h1>
        <p className="text-gray-600 mb-4">Harnessing shared cases to cure approval inconsistencies.</p>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-medium">One→Many Mapping</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700 font-medium">Collective Evidence</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
            <Scale className="h-4 w-4 text-purple-600" />
            <span className="text-purple-700 font-medium">Bias Detection</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-md ${activeTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Search Similar Cases
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-md ${activeTab === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Generate Collective Letter
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-md ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Bias Analysis
          </button>
        </div>
      </div>

      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient & Denial Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Denial Reason</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="e.g., Experimental treatment not covered, Medical necessity not established..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={patientInfo.dob}
                  onChange={(e) => setPatientInfo({...patientInfo, dob: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={patientInfo.diagnosis}
                  onChange={(e) => setPatientInfo({...patientInfo, diagnosis: e.target.value})}
                  placeholder="e.g., Breast Cancer Stage II"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Demographics (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={patientInfo.demographics}
                  onChange={(e) => setPatientInfo({...patientInfo, demographics: e.target.value})}
                  placeholder="e.g., 45F, Hispanic, TX"
                />
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                disabled={!denialReason || !patientInfo.diagnosis}
              >
                <Search className="h-4 w-4" />
                Search Similar Cases
              </button>
            </div>
          </div>

          {/* Similar Cases Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Similar Cases Found
            </h2>
            
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Searching for similar cases...</span>
              </div>
            )}

            {similarCases.length > 0 && (
              <div className="space-y-4">
                {similarCases.map((case_item) => (
                  <div key={case_item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{case_item.patientDemo}</h3>
                        <p className="text-sm text-gray-600">{case_item.diagnosis}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {case_item.similarity}% match
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm text-gray-700"><strong>Denial:</strong> {case_item.denialReason}</p>
                      <p className="text-sm text-gray-700"><strong>Outcome:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          case_item.outcome.includes('Approved') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {case_item.outcome}
                        </span>
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{case_item.timeframe}</span>
                      <span>{case_item.insuranceProvider}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && similarCases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Search for similar cases to see collective patterns</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Collective Appeal Letter
          </h2>
          
          <div className="mb-4">
            <button
              onClick={generateCollectiveLetter}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              disabled={!denialReason || similarCases.length === 0}
            >
              <Send className="h-4 w-4" />
              Generate Collective Letter
            </button>
          </div>

          {generatedLetter ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md border max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                  {generatedLetter}
                </pre>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={downloadLetter}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Letter
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Search for similar cases first, then generate a collective appeal letter</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Disease Prevalence */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Disease Categories & Rejection Rates
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {diseaseCategories.map((disease, index) => (
                <div key={disease.name} className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-800 mb-2">{disease.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prevalence in Dataset:</span>
                      <span className="text-sm font-medium">{disease.prevalence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rejection Rate:</span>
                      <span className={`text-sm font-medium ${disease.rejectionRate > 40 ? 'text-red-600' : disease.rejectionRate > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {disease.rejectionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bias Analysis */}
          {biasAnalysis && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Demographic Bias Analysis
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">Total Cases Analyzed</h3>
                  <p className="text-2xl font-bold text-blue-600">{biasAnalysis.totalCases}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="font-medium text-green-800 mb-2">Overall Approval Rate</h3>
                  <p className="text-2xl font-bold text-green-600">{biasAnalysis.approvalRate}%</p>
                </div>
                <div className="bg-red-50 p-4 rounded-md">
                  <h3 className="font-medium text-red-800 mb-2">Demographic Disparity</h3>
                  <p className="text-2xl font-bold text-red-600">Detected</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Approval Rates by Demographics</h3>
                <div className="space-y-2">
                  {biasAnalysis.raceDisparity.map((item) => (
                    <div key={item.race} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-700">{item.race}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">({item.caseCount} cases)</span>
                        <span className={`font-medium px-2 py-1 rounded text-sm ${
                          parseFloat(item.approvalRate) > 60 ? 'bg-green-100 text-green-700' : 
                          parseFloat(item.approvalRate) > 40 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.approvalRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Demo Status */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
        <div className="flex items-start gap-3">
          <Eye className="h-6 w-6 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">Social Transparency 2.0 Demo Status</h3>
            <div className="text-purple-700 space-y-1">
              <p>✅ <strong>One→Many Mapping:</strong> Find similar cases across demographics</p>
              <p>✅ <strong>Collective Evidence:</strong> Generate appeals based on precedent</p>
              <p>✅ <strong>Bias Detection:</strong> Identify demographic disparities in outcomes</p>
              <p>✅ <strong>Principled Reasoning:</strong> Verifiable evidence-based arguments</p>
              <p>✅ <strong>Subversive AI:</strong> Speaking truth to power through transparency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LOMNDemo;

