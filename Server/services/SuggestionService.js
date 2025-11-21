const NodeCache = require('node-cache');
const redisClient = require('../utils/redisClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/MessageModel');
require('dotenv').config();


// Comprehensive suggestion templates organized by business, technical, and communication contexts
const quickResponseTemplates = {
  // ========== BUSINESS & PROFESSIONAL ==========
  business_greeting: [
    { suggestion: "Good morning! Ready to tackle today's priorities?", suggestionType: "quick_response", category: "business_greeting" },
    { suggestion: "Hello! What's the strategic focus for today?", suggestionType: "quick_response", category: "business_greeting" },
    { suggestion: "Hi there! How can I support your business objectives?", suggestionType: "quick_response", category: "business_greeting" },
    { suggestion: "Welcome! Let's discuss how we can drive results.", suggestionType: "quick_response", category: "business_greeting" },
    { suggestion: "Good to connect! What key initiatives are you working on?", suggestionType: "quick_response", category: "business_greeting" },
    { suggestion: "Hello! Ready to align on our deliverables?", suggestionType: "quick_response", category: "business_greeting" }
  ],
  
  project_management: [
    { suggestion: "What's our sprint velocity looking like?", suggestionType: "followup_question", category: "project_management" },
    { suggestion: "Let's review the project roadmap and dependencies.", suggestionType: "action_suggestion", category: "project_management" },
    { suggestion: "Are we on track for the milestone deadline?", suggestionType: "followup_question", category: "project_management" },
    { suggestion: "I'll update the Gantt chart with latest progress.", suggestionType: "quick_response", category: "project_management" },
    { suggestion: "Should we conduct a retrospective to optimize workflows?", suggestionType: "action_suggestion", category: "project_management" },
    { suggestion: "Let's identify and mitigate potential risks early.", suggestionType: "action_suggestion", category: "project_management" },
    { suggestion: "What's the resource allocation for Q2 initiatives?", suggestionType: "followup_question", category: "project_management" },
    { suggestion: "Time to realign priorities based on stakeholder feedback.", suggestionType: "quick_response", category: "project_management" }
  ],

  sales_business: [
    { suggestion: "What's the conversion rate from our recent campaigns?", suggestionType: "followup_question", category: "sales_business" },
    { suggestion: "Let's analyze the sales funnel performance metrics.", suggestionType: "action_suggestion", category: "sales_business" },
    { suggestion: "I'll prepare the quarterly sales forecast report.", suggestionType: "quick_response", category: "sales_business" },
    { suggestion: "Have we identified the key decision makers for this deal?", suggestionType: "followup_question", category: "sales_business" },
    { suggestion: "Let's schedule a discovery call to understand their pain points.", suggestionType: "action_suggestion", category: "sales_business" },
    { suggestion: "What's our competitive positioning for this opportunity?", suggestionType: "followup_question", category: "sales_business" },
    { suggestion: "I'll draft a customized proposal with ROI projections.", suggestionType: "quick_response", category: "sales_business" },
    { suggestion: "Time to nurture leads with targeted content marketing.", suggestionType: "action_suggestion", category: "sales_business" }
  ],

  strategy_planning: [
    { suggestion: "Let's conduct a SWOT analysis of our market position.", suggestionType: "action_suggestion", category: "strategy_planning" },
    { suggestion: "What are our key competitive advantages we should leverage?", suggestionType: "followup_question", category: "strategy_planning" },
    { suggestion: "I'll research emerging market trends and opportunities.", suggestionType: "quick_response", category: "strategy_planning" },
    { suggestion: "Should we pivot our go-to-market strategy based on feedback?", suggestionType: "followup_question", category: "strategy_planning" },
    { suggestion: "Let's define our north star metrics and KPIs.", suggestionType: "action_suggestion", category: "strategy_planning" },
    { suggestion: "Time to reassess our value proposition and messaging.", suggestionType: "action_suggestion", category: "strategy_planning" },
    { suggestion: "What's our 5-year vision and how do we get there?", suggestionType: "followup_question", category: "strategy_planning" },
    { suggestion: "I'll prepare a business case for the new initiative.", suggestionType: "quick_response", category: "strategy_planning" }
  ],

  financial_analysis: [
    { suggestion: "Let's review the P&L statements and cash flow projections.", suggestionType: "action_suggestion", category: "financial_analysis" },
    { suggestion: "What's our burn rate and runway at current spending?", suggestionType: "followup_question", category: "financial_analysis" },
    { suggestion: "I'll analyze the ROI on our recent marketing investments.", suggestionType: "quick_response", category: "financial_analysis" },
    { suggestion: "Should we optimize our cost structure for better margins?", suggestionType: "followup_question", category: "financial_analysis" },
    { suggestion: "Let's prepare budget forecasts for the next fiscal year.", suggestionType: "action_suggestion", category: "financial_analysis" },
    { suggestion: "Time to evaluate financing options for growth initiatives.", suggestionType: "action_suggestion", category: "financial_analysis" },
    { suggestion: "What are the key financial metrics we should track?", suggestionType: "followup_question", category: "financial_analysis" },
    { suggestion: "I'll create a financial dashboard for real-time monitoring.", suggestionType: "quick_response", category: "financial_analysis" }
  ],

  // ========== TECHNICAL & CODING ==========
  coding_discussion: [
    { suggestion: "Let's review the code architecture and design patterns.", suggestionType: "action_suggestion", category: "coding_discussion" },
    { suggestion: "What's the time complexity of this algorithm?", suggestionType: "followup_question", category: "coding_discussion" },
    { suggestion: "I'll refactor this code for better readability and performance.", suggestionType: "quick_response", category: "coding_discussion" },
    { suggestion: "Should we implement unit tests for this new feature?", suggestionType: "followup_question", category: "coding_discussion" },
    { suggestion: "Let's conduct a code review before merging to main.", suggestionType: "action_suggestion", category: "coding_discussion" },
    { suggestion: "Time to optimize database queries for better performance.", suggestionType: "action_suggestion", category: "coding_discussion" },
    { suggestion: "What are the potential security vulnerabilities here?", suggestionType: "followup_question", category: "coding_discussion" },
    { suggestion: "I'll document the API endpoints and data models.", suggestionType: "quick_response", category: "coding_discussion" }
  ],

  technical_architecture: [
    { suggestion: "Let's design a scalable microservices architecture.", suggestionType: "action_suggestion", category: "technical_architecture" },
    { suggestion: "What's our disaster recovery and backup strategy?", suggestionType: "followup_question", category: "technical_architecture" },
    { suggestion: "I'll implement CI/CD pipelines for automated deployments.", suggestionType: "quick_response", category: "technical_architecture" },
    { suggestion: "Should we migrate to cloud-native infrastructure?", suggestionType: "followup_question", category: "technical_architecture" },
    { suggestion: "Let's establish monitoring and alerting systems.", suggestionType: "action_suggestion", category: "technical_architecture" },
    { suggestion: "Time to implement load balancing and auto-scaling.", suggestionType: "action_suggestion", category: "technical_architecture" },
    { suggestion: "What are our non-functional requirements and constraints?", suggestionType: "followup_question", category: "technical_architecture" },
    { suggestion: "I'll create technical documentation and system diagrams.", suggestionType: "quick_response", category: "technical_architecture" }
  ],

  devops_operations: [
    { suggestion: "Let's automate the deployment pipeline with Docker.", suggestionType: "action_suggestion", category: "devops_operations" },
    { suggestion: "What's our current system uptime and SLA metrics?", suggestionType: "followup_question", category: "devops_operations" },
    { suggestion: "I'll set up comprehensive logging and monitoring.", suggestionType: "quick_response", category: "devops_operations" },
    { suggestion: "Should we implement blue-green deployment strategy?", suggestionType: "followup_question", category: "devops_operations" },
    { suggestion: "Let's configure infrastructure as code with Terraform.", suggestionType: "action_suggestion", category: "devops_operations" },
    { suggestion: "Time to optimize server costs and resource utilization.", suggestionType: "action_suggestion", category: "devops_operations" },
    { suggestion: "What are our security compliance requirements?", suggestionType: "followup_question", category: "devops_operations" },
    { suggestion: "I'll implement automated testing and quality gates.", suggestionType: "quick_response", category: "devops_operations" }
  ],

  debugging_troubleshooting: [
    { suggestion: "Let's analyze the error logs and stack traces.", suggestionType: "action_suggestion", category: "debugging_troubleshooting" },
    { suggestion: "What are the steps to reproduce this bug consistently?", suggestionType: "followup_question", category: "debugging_troubleshooting" },
    { suggestion: "I'll run profiling tools to identify performance bottlenecks.", suggestionType: "quick_response", category: "debugging_troubleshooting" },
    { suggestion: "Should we roll back to the previous stable version?", suggestionType: "followup_question", category: "debugging_troubleshooting" },
    { suggestion: "Let's implement additional error handling and validation.", suggestionType: "action_suggestion", category: "debugging_troubleshooting" },
    { suggestion: "Time to add comprehensive logging for better debugging.", suggestionType: "action_suggestion", category: "debugging_troubleshooting" },
    { suggestion: "What's the root cause analysis for this incident?", suggestionType: "followup_question", category: "debugging_troubleshooting" },
    { suggestion: "I'll create a hotfix and deploy it to production.", suggestionType: "quick_response", category: "debugging_troubleshooting" }
  ],

  // ========== DATA & ANALYTICS ==========
  data_analysis: [
    { suggestion: "Let's analyze the data patterns and correlations.", suggestionType: "action_suggestion", category: "data_analysis" },
    { suggestion: "What insights can we derive from this dataset?", suggestionType: "followup_question", category: "data_analysis" },
    { suggestion: "I'll create interactive dashboards for data visualization.", suggestionType: "quick_response", category: "data_analysis" },
    { suggestion: "Should we apply machine learning algorithms for predictions?", suggestionType: "followup_question", category: "data_analysis" },
    { suggestion: "Let's clean and preprocess the data for better accuracy.", suggestionType: "action_suggestion", category: "data_analysis" },
    { suggestion: "Time to set up A/B testing for data-driven decisions.", suggestionType: "action_suggestion", category: "data_analysis" },
    { suggestion: "What are the key performance indicators we should track?", suggestionType: "followup_question", category: "data_analysis" },
    { suggestion: "I'll generate comprehensive reports with actionable insights.", suggestionType: "quick_response", category: "data_analysis" }
  ],

  // ========== COMMUNICATION & COLLABORATION ==========
  team_collaboration: [
    { suggestion: "Let's schedule a cross-functional team sync.", suggestionType: "action_suggestion", category: "team_collaboration" },
    { suggestion: "What are the blockers preventing team productivity?", suggestionType: "followup_question", category: "team_collaboration" },
    { suggestion: "I'll facilitate a brainstorming session for innovative solutions.", suggestionType: "quick_response", category: "team_collaboration" },
    { suggestion: "Should we establish better communication channels?", suggestionType: "followup_question", category: "team_collaboration" },
    { suggestion: "Let's create knowledge sharing sessions for skill development.", suggestionType: "action_suggestion", category: "team_collaboration" },
    { suggestion: "Time to recognize and celebrate team achievements.", suggestionType: "action_suggestion", category: "team_collaboration" },
    { suggestion: "What's the team's capacity for taking on new projects?", suggestionType: "followup_question", category: "team_collaboration" },
    { suggestion: "I'll organize team building activities to improve cohesion.", suggestionType: "quick_response", category: "team_collaboration" }
  ],

  client_communication: [
    { suggestion: "Let's schedule a client check-in to review progress.", suggestionType: "action_suggestion", category: "client_communication" },
    { suggestion: "What are the client's evolving needs and expectations?", suggestionType: "followup_question", category: "client_communication" },
    { suggestion: "I'll prepare a detailed status report for the client.", suggestionType: "quick_response", category: "client_communication" },
    { suggestion: "Should we propose additional value-added services?", suggestionType: "followup_question", category: "client_communication" },
    { suggestion: "Let's gather client feedback to improve our offerings.", suggestionType: "action_suggestion", category: "client_communication" },
    { suggestion: "Time to address any client concerns proactively.", suggestionType: "action_suggestion", category: "client_communication" },
    { suggestion: "What's the client satisfaction score and NPS rating?", suggestionType: "followup_question", category: "client_communication" },
    { suggestion: "I'll draft a proposal for contract renewal and expansion.", suggestionType: "quick_response", category: "client_communication" }
  ],

  // ========== INNOVATION & GROWTH ==========
  innovation_research: [
    { suggestion: "Let's explore emerging technologies and industry trends.", suggestionType: "action_suggestion", category: "innovation_research" },
    { suggestion: "What disruptive innovations could impact our industry?", suggestionType: "followup_question", category: "innovation_research" },
    { suggestion: "I'll research competitors' strategies and market positioning.", suggestionType: "quick_response", category: "innovation_research" },
    { suggestion: "Should we invest in R&D for breakthrough innovations?", suggestionType: "followup_question", category: "innovation_research" },
    { suggestion: "Let's prototype new ideas and validate with users.", suggestionType: "action_suggestion", category: "innovation_research" },
    { suggestion: "Time to patent our intellectual property and innovations.", suggestionType: "action_suggestion", category: "innovation_research" },
    { suggestion: "What are the growth opportunities in adjacent markets?", suggestionType: "followup_question", category: "innovation_research" },
    { suggestion: "I'll analyze market gaps where we can create value.", suggestionType: "quick_response", category: "innovation_research" }
  ],

  // ========== PROFESSIONAL DEVELOPMENT ==========
  learning_development: [
    { suggestion: "Let's identify skill gaps and create learning plans.", suggestionType: "action_suggestion", category: "learning_development" },
    { suggestion: "What certifications would advance our expertise?", suggestionType: "followup_question", category: "learning_development" },
    { suggestion: "I'll research best practices and industry standards.", suggestionType: "quick_response", category: "learning_development" },
    { suggestion: "Should we attend conferences and networking events?", suggestionType: "followup_question", category: "learning_development" },
    { suggestion: "Let's establish mentorship programs for career growth.", suggestionType: "action_suggestion", category: "learning_development" },
    { suggestion: "Time to share knowledge through internal presentations.", suggestionType: "action_suggestion", category: "learning_development" },
    { suggestion: "What are the latest tools and frameworks we should learn?", suggestionType: "followup_question", category: "learning_development" },
    { suggestion: "I'll create a skills matrix to track team competencies.", suggestionType: "quick_response", category: "learning_development" }
  ],

  // ========== QUALITY ASSURANCE ==========
  quality_testing: [
    { suggestion: "Let's implement comprehensive automated testing suites.", suggestionType: "action_suggestion", category: "quality_testing" },
    { suggestion: "What are the critical test scenarios we need to cover?", suggestionType: "followup_question", category: "quality_testing" },
    { suggestion: "I'll execute end-to-end testing across all environments.", suggestionType: "quick_response", category: "quality_testing" },
    { suggestion: "Should we perform load testing and stress testing?", suggestionType: "followup_question", category: "quality_testing" },
    { suggestion: "Let's establish quality gates and acceptance criteria.", suggestionType: "action_suggestion", category: "quality_testing" },
    { suggestion: "Time to conduct security testing and vulnerability scans.", suggestionType: "action_suggestion", category: "quality_testing" },
    { suggestion: "What's our test coverage percentage and defect density?", suggestionType: "followup_question", category: "quality_testing" },
    { suggestion: "I'll create detailed test reports and quality metrics.", suggestionType: "quick_response", category: "quality_testing" }
  ],

  // ========== GENERAL PROFESSIONAL RESPONSES ==========
  greeting: [
    { suggestion: "Hi! How are you?", suggestionType: "quick_response", category: "greeting" },
    { suggestion: "Hello! How's your day going?", suggestionType: "quick_response", category: "greeting" },
    { suggestion: "Hey there!", suggestionType: "quick_response", category: "greeting" },
    { suggestion: "Good morning! Hope you're doing well.", suggestionType: "quick_response", category: "greeting" }
  ],
  
  thanks: [
    { suggestion: "You're welcome!", suggestionType: "quick_response", category: "agreement" },
    { suggestion: "No problem at all!", suggestionType: "quick_response", category: "agreement" },
    { suggestion: "Glad I could help!", suggestionType: "quick_response", category: "agreement" }
  ],
  
  confirm: [
    { suggestion: "Yes, sure!", suggestionType: "quick_response", category: "agreement" },
    { suggestion: "Of course!", suggestionType: "quick_response", category: "agreement" },
    { suggestion: "Definitely!", suggestionType: "quick_response", category: "agreement" }
  ],
  
  acknowledge: [
    { suggestion: "I understand.", suggestionType: "quick_response", category: "agreement" },
    { suggestion: "Got it.", suggestionType: "quick_response", category: "agreement" },
    { suggestion: "Alright!", suggestionType: "quick_response", category: "agreement" }
  ]
};

const SuggestionService = {
     normalizeSuggestionType(suggestionType) {
        const typeMapping = {
            'clarification': 'followup_question',
            'smart_suggestion': 'quick_response',
            'action': 'action_suggestion'
        };
        
        return typeMapping[suggestionType] || suggestionType;
    },

    // Normalize and validate suggestion object
    normalizeSuggestion(suggestion) {
        return {
            suggestion: suggestion.suggestion || 'I can help you with that.',
            suggestionType: this.normalizeSuggestionType(suggestion.suggestionType || 'quick_response'),
            category: suggestion.category || 'other'
        };
    },

    // Update your getSuggestions method to normalize outputs
    async getSuggestions(currentMessage, context = []) {
        try {
            if (!currentMessage?.trim()) {
                return this.getDefaultSuggestions().map(s => this.normalizeSuggestion(s));
            }

            const normalizedMessage = currentMessage.toLowerCase().trim();
            const lastContextMessage = context.length > 0 ? context[context.length - 1]?.content?.toLowerCase() || '' : '';
            const cacheKey = `suggestions:${normalizedMessage}:${lastContextMessage.slice(-50)}`;
            
            // Check cache first for instant response
            const cachedSuggestions = await getCache(cacheKey, suggestionCache);
            if (cachedSuggestions) {
                return cachedSuggestions.map(s => this.normalizeSuggestion(s));
            }

            // Analyze message content and context for intelligent matching
            const messageAnalysis = this.analyzeMessageContent(normalizedMessage, context);
            let suggestions = [];

            // Try to match with specialized templates first
            const templateMatch = this.matchAdvancedTemplate(normalizedMessage, context, messageAnalysis);
            if (templateMatch && quickResponseTemplates[templateMatch]) {
                const templateResponses = quickResponseTemplates[templateMatch];
                // Intelligently select 3 most relevant suggestions
                const selected = this.selectBestSuggestions(templateResponses, messageAnalysis, context);
                suggestions = selected;
            }

            // If no specialized match, try contextual analysis
            if (suggestions.length < 3) {
                const contextualSuggestions = await this.getContextualSuggestions(normalizedMessage, context, messageAnalysis);
                suggestions = suggestions.concat(contextualSuggestions).slice(0, 3);
            }

            // If still not enough, get AI suggestions
            if (suggestions.length < 3) {
                const aiSuggestions = await this.getAISuggestions(normalizedMessage, context);
                suggestions = suggestions.concat(aiSuggestions).slice(0, 3);
            }

            // Cache the normalized suggestions
            // Normalize and cache suggestions
            const normalizedSuggestions = suggestions.map(s => this.normalizeSuggestion(s));
            if (normalizedSuggestions.length > 0) {
                await setCache(cacheKey, normalizedSuggestions, 900, suggestionCache);
                return normalizedSuggestions;
            }

            return this.getFallbackSuggestions().map(s => this.normalizeSuggestion(s));

        } catch (error) {
            console.error('Error generating suggestions:', error);
            return this.getFallbackSuggestions().map(s => this.normalizeSuggestion(s));
        }
    },

    getDefaultSuggestions() {
        const timeOfDay = new Date().getHours();
        const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 17 ? "Good afternoon" : "Good evening";
        
        return [
            { suggestion: `${greeting}! How can I help you today?`, suggestionType: "quick_response", category: "business_greeting" },
            { suggestion: "What's the priority focus for today?", suggestionType: "followup_question", category: "project_management" },
            { suggestion: "Let me know if you need support with anything.", suggestionType: "quick_response", category: "team_collaboration" }
        ];
    },

    getFallbackSuggestions() {
        return [
            { suggestion: "I understand. Could you provide more details?", suggestionType: "followup_question", category: "clarification" },
            { suggestion: "That makes sense. Let's discuss the next steps.", suggestionType: "action_suggestion", category: "project_management" },
            { suggestion: "I'll help you work through this systematically.", suggestionType: "quick_response", category: "team_collaboration" }
        ];
    },

    async getAISuggestions(currentMessage, context = []) {
        try {
            if (!process.env.GEMINI_API_KEY) {
                console.warn('GEMINI_API_KEY not found, using fallback suggestions');
                return this.getFallbackSuggestions();
            }

            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const prompt = this.buildEnhancedAIPrompt(currentMessage, context);
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const suggestionsText = this.cleanAIResponse(response.text());
            
            const parsed = JSON.parse(suggestionsText);
            return Array.isArray(parsed.suggestions) ? parsed.suggestions : this.getFallbackSuggestions();
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            return this.getFallbackSuggestions();
        }
    },

    buildEnhancedAIPrompt(currentMessage, context = []) {
        const conversationSummary = context.length > 0 
            ? context.slice(-5).map(msg => `${msg.sender}: ${msg.content}`).join('\n')
            : 'No previous context';

        const analysis = this.analyzeMessageContent(currentMessage.toLowerCase(), context);
        const domainContext = analysis.domain === 'technical' ? 'technical/coding' : 
                             analysis.domain === 'business' ? 'business/professional' : 'general';

        return `As an AI assistant specializing in ${domainContext} communication, analyze this conversation:

CONTEXT:
${conversationSummary}

CURRENT MESSAGE: "${currentMessage}"

MESSAGE ANALYSIS:
- Domain: ${analysis.domain}
- Type: ${analysis.messageType}
- Is Question: ${analysis.isQuestion}
- Is Request: ${analysis.isRequest}
- Urgency: ${analysis.urgency}
- Keywords: ${analysis.keywords.slice(0, 5).join(', ')}
- Technical Terms: ${analysis.technicalTerms.join(', ') || 'None'}
- Business Terms: ${analysis.businessTerms.join(', ') || 'None'}

Generate 3 highly relevant, professional suggestions. Focus on:
- ${analysis.domain === 'technical' ? 'Code reviews, architecture, debugging, DevOps, testing, performance optimization' : ''}
- ${analysis.domain === 'business' ? 'Project management, strategy, sales, financial analysis, client communication' : ''}
- Actionable next steps and follow-up questions
- Professional tone appropriate for workplace communication

CATEGORIES TO USE:
Technical: coding_discussion, technical_architecture, devops_operations, debugging_troubleshooting, data_analysis, quality_testing
Business: project_management, sales_business, strategy_planning, financial_analysis, team_collaboration, client_communication
Growth: innovation_research, learning_development
General: greeting, agreement, question, clarification, scheduling, task

Return ONLY this JSON format:
{
    "suggestions": [
        {
            "suggestion": "specific, actionable response based on context and domain",
            "suggestionType": "quick_response|followup_question|action_suggestion",
            "category": "appropriate_category_from_list_above"
        },
        {
            "suggestion": "relevant follow-up or clarifying question",
            "suggestionType": "followup_question",
            "category": "appropriate_category"
        },
        {
            "suggestion": "actionable next step or solution",
            "suggestionType": "action_suggestion",
            "category": "appropriate_category"
        }
    ]
}`;
    },

    cleanAIResponse(response) {
        return response
            .trim()
            .replace(/```json\n?/g, '')
            .replace(/```/g, '')
            .replace(/^\s*[\r\n]/gm, '')
            .replace(/^[^{]*/g, '') // Remove any text before the JSON
            .replace(/[^}]*$/g, ''); // Remove any text after the JSON
    },

    analyzeMessageContent(message, context = []) {
        const analysis = {
            domain: 'general', // general, technical, business
            messageType: 'statement', // statement, question, request
            isQuestion: message.includes('?'),
            isRequest: /^(can you|could you|please|will you)/i.test(message),
            urgency: 'normal', // normal, high
            keywords: [],
            technicalTerms: [],
            businessTerms: []
        };

        // Urgency
        if (/asap|urgent|immediately|now/i.test(message)) {
            analysis.urgency = 'high';
        }

        // Keywords
        analysis.keywords = message.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(w => w.length > 3);

        // Domain detection
        const techRegex = /\b(code|bug|error|debug|server|database|api|test|deploy|git|react|node|js|javascript|python)\b/i;
        const businessRegex = /\b(meeting|report|deadline|client|project|budget|marketing|sale|business|task)\b/i;

        if (techRegex.test(message)) {
            analysis.domain = 'technical';
        } else if (businessRegex.test(message)) {
            analysis.domain = 'business';
        }

        // Message Type
        if (analysis.isQuestion) {
            analysis.messageType = 'question';
        } else if (analysis.isRequest) {
            analysis.messageType = 'request';
        }
        
        return analysis;
    },

    matchAdvancedTemplate(message, context, analysis) {
        // Simple keyword-to-template mapping
        const keywordMap = {
            'code': 'coding_discussion',
            'error': 'debugging_troubleshooting',
            'database': 'coding_discussion',
            'server': 'devops_operations',
            'deploy': 'devops_operations',
            'client': 'client_communication',
            'meeting': 'scheduling',
            'report': 'project_management',
            'deadline': 'project_management'
        };

        for (const keyword of analysis.keywords) {
            if (keywordMap[keyword]) {
                return keywordMap[keyword];
            }
        }
        return null;
    },

    selectBestSuggestions(templateResponses, analysis, context) {
        // For now, return the first 3. A more advanced implementation could rank them.
        return templateResponses.slice(0, 3);
    },

    getContextualSuggestions(message, context, analysis) {
        let suggestions = [];
        if (analysis.isQuestion) {
            suggestions.push({ suggestion: "Let me find that out for you.", suggestionType: "quick_response", category: "clarification" });
        }
        if (analysis.domain === 'technical') {
            suggestions.push({ suggestion: "Can you share the relevant code snippet?", suggestionType: "followup_question", category: "coding_discussion" });
        }
        if (analysis.domain === 'business') {
            suggestions.push({ suggestion: "What is the deadline for this?", suggestionType: "followup_question", category: "project_management" });
        }
        return suggestions;
    }
};

module.exports = SuggestionService;

// Helper cache utilities that transparently use Redis when available
const getCache = async (key, localCache) => {
  if (redisClient.isReady) {
    return await redisClient.get(key);
  }
  return localCache.get(key);
};

const setCache = async (key, value, ttlSeconds = 900, localCache) => {
  if (redisClient.isReady) {
    await redisClient.set(key, value, ttlSeconds);
  } else {
    localCache.set(key, value, ttlSeconds);
  }
};