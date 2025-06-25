import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Users, Target, BookOpen, Lightbulb, FileText, Calendar, DollarSign, Award } from 'lucide-react';

const ResearchProposalAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const proposalAnalysis = {
    strengths: [
      "Strong personal motivation and lived experience",
      "Novel intersection of MI and HCXAI",
      "Clear problem statement with real-world relevance",
      "Well-defined research questions",
      "Practical applications in high-stakes domain"
    ],
    gaps: [
      "Missing detailed methodology section",
      "No timeline or project phases outlined",
      "Limited discussion of technical challenges",
      "Insufficient literature review depth",
      "No evaluation metrics specified",
      "Missing ethical considerations section",
      "No discussion of limitations or risks"
    ],
    suggestions: [
      "Add comprehensive related work section",
      "Include detailed technical implementation plan",
      "Specify evaluation framework and success metrics",
      "Address potential ethical and privacy concerns",
      "Outline collaboration opportunities",
      "Include preliminary results or proof-of-concept",
      "Add resource requirements and budget considerations"
    ]
  };

  const robustnessChecklist = {
    "Problem Definition": [
      "Clear problem statement with quantified impact",
      "Well-motivated research gap identification",
      "Stakeholder analysis (users, institutions, regulators)",
      "Competitive analysis of existing solutions"
    ],
    "Technical Approach": [
      "Detailed methodology for MI integration",
      "Specific MI techniques (SAE, attribution patching, etc.)",
      "Interface design principles and frameworks",
      "Data requirements and sources",
      "Technical architecture overview"
    ],
    "Evaluation Plan": [
      "User study design with multiple stakeholder groups",
      "Quantitative metrics (usability, accuracy, trust)",
      "Qualitative assessment methods",
      "Baseline comparisons with existing systems",
      "Statistical power analysis"
    ],
    "Broader Impact": [
      "Ethical implications and mitigation strategies",
      "Privacy and security considerations",
      "Accessibility and inclusive design principles",
      "Potential for bias amplification or reduction",
      "Regulatory compliance considerations"
    ],
    "Feasibility": [
      "Timeline with clear milestones",
      "Resource requirements (computational, human)",
      "Risk assessment and contingency plans",
      "Required expertise and collaboration needs",
      "Preliminary validation or proof-of-concept"
    ]
  };

  const enhancementSuggestions = [
    {
      category: "Literature Review",
      items: [
        "Survey recent MI papers (Anthropic, Google DeepMind work on SAEs)",
        "Review financial AI transparency regulations (EU AI Act, GDPR)",
        "Analyze existing financial XAI systems and their limitations",
        "Study user experience research in high-stakes AI decisions"
      ]
    },
    {
      category: "Technical Details",
      items: [
        "Specify model architectures to be interpreted (GPT-4, Claude, etc.)",
        "Detail SAE training procedures for financial domain",
        "Outline interface prototyping framework (React, D3.js, etc.)",
        "Define API requirements for real-time MI analysis"
      ]
    },
    {
      category: "Validation Strategy",
      items: [
        "Design A/B testing framework for interface effectiveness",
        "Plan expert interviews with financial professionals",
        "Outline user studies with diverse populations",
        "Establish partnerships with financial institutions"
      ]
    },
    {
      category: "Impact Measurement",
      items: [
        "Define trust and transparency metrics",
        "Measure decision-making improvement outcomes",
        "Track user engagement and satisfaction",
        "Assess regulatory compliance improvements"
      ]
    }
  ];

  const getCompletionRate = (category) => {
    const items = robustnessChecklist[category] || [];
    const completed = items.filter(item => checkedItems[`${category}-${item}`]).length;
    return Math.round((completed / items.length) * 100);
  };

  const overallCompletion = Object.keys(robustnessChecklist).reduce((acc, category) => {
    return acc + getCompletionRate(category);
  }, 0) / Object.keys(robustnessChecklist).length;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Research Proposal Robustness Analyzer</h1>
          <p className="text-blue-100">Strengthen your "Demystifying Financial AI" research proposal</p>
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Robustness</span>
              <span className="text-sm font-bold">{Math.round(overallCompletion)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div 
                className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex border-b">
          {['analysis', 'checklist', 'enhancements', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="text-green-600 mr-2" size={20} />
                    <h3 className="font-semibold text-green-800">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {proposalAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="text-red-600 mr-2" size={20} />
                    <h3 className="font-semibold text-red-800">Critical Gaps</h3>
                  </div>
                  <ul className="space-y-2">
                    {proposalAnalysis.gaps.map((gap, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="text-blue-600 mr-2" size={20} />
                    <h3 className="font-semibold text-blue-800">Quick Wins</h3>
                  </div>
                  <ul className="space-y-2">
                    {proposalAnalysis.suggestions.slice(0, 5).map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <p className="text-gray-600 mb-6">Check off completed elements to track your proposal's robustness:</p>
              {Object.entries(robustnessChecklist).map(([category, items]) => (
                <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <Target className="mr-2 text-blue-600" size={18} />
                        {category}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{getCompletionRate(category)}% complete</span>
                        <div className="w-16 bg-gray-300 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getCompletionRate(category)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid gap-3">
                      {items.map((item, index) => (
                        <label key={index} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={checkedItems[`${category}-${item}`] || false}
                            onChange={() => toggleCheck(category, item)}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${checkedItems[`${category}-${item}`] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'enhancements' && (
            <div className="space-y-6">
              <p className="text-gray-600 mb-6">Detailed suggestions to strengthen each aspect of your proposal:</p>
              {enhancementSuggestions.map((section, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-4 flex items-center">
                    <BookOpen className="mr-2" size={18} />
                    {section.category}
                  </h3>
                  <div className="grid gap-3">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white p-3 rounded-lg border border-purple-100">
                        <p className="text-sm text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Suggested Implementation Timeline</h3>
              <div className="space-y-4">
                {[
                  { phase: "Phase 1: Foundation (Months 1-2)", tasks: ["Comprehensive literature review", "Stakeholder interviews", "Technical architecture design", "Ethics approval"], color: "blue" },
                  { phase: "Phase 2: Development (Months 3-5)", tasks: ["MI tooling setup", "Interface prototyping", "Initial user testing", "Iterative design improvements"], color: "green" },
                  { phase: "Phase 3: Validation (Months 6-8)", tasks: ["Large-scale user studies", "Expert evaluations", "Performance benchmarking", "Results analysis"], color: "purple" },
                  { phase: "Phase 4: Dissemination (Months 9-10)", tasks: ["Paper writing", "Conference presentations", "Industry partnerships", "Open-source release"], color: "orange" }
                ].map((phase, index) => (
                  <div key={index} className={`border-l-4 border-${phase.color}-500 pl-6 pb-6`}>
                    <div className="flex items-center mb-2">
                      <Calendar className={`text-${phase.color}-600 mr-2`} size={18} />
                      <h4 className="font-semibold text-gray-800">{phase.phase}</h4>
                    </div>
                    <ul className="space-y-1">
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="text-sm text-gray-600 flex items-center">
                          <span className={`w-1.5 h-1.5 bg-${phase.color}-400 rounded-full mr-2`}></span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="mr-2 text-yellow-600" size={20} />
          Key Success Metrics
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="mx-auto text-blue-600 mb-2" size={24} />
            <div className="text-2xl font-bold text-blue-700">85%</div>
            <div className="text-sm text-blue-600">User Trust Improvement</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="mx-auto text-green-600 mb-2" size={24} />
            <div className="text-2xl font-bold text-green-700">3x</div>
            <div className="text-sm text-green-600">Faster Decision Understanding</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FileText className="mx-auto text-purple-600 mb-2" size={24} />
            <div className="text-2xl font-bold text-purple-700">5+</div>
            <div className="text-sm text-purple-600">Publications & Patents</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchProposalAnalyzer;