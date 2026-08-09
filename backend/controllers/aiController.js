/**
 * AI Legal Question Asking Controller
 * Provides structured legal information & guidance tailored to LegalConnect Platform & Indian Legal Statutes.
 * Strictly restricts answers to project-related and legal queries only.
 */

const getLegalAIResponse = async (req, res) => {
  try {
    const { question, conversationHistory } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question.",
      });
    }

    const rawQuery = question.trim();
    const query = rawQuery.toLowerCase();
    // Clean query stripping punctuation for smooth keyword matching
    const cleanQuery = query.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

    // -------------------------------------------------------------
    // DOMAIN & SCOPE VERIFICATION LOGIC
    // Check if query is related to LegalConnect platform or Indian Law
    // -------------------------------------------------------------

    // Platform Keywords (LegalConnect Features)
    // Platform Keywords (LegalConnect Features)
    const platformKeywords = [
      "legalconnect", "legal connect", "advocate", "lawyer", "book", "booking",
      "appointment", "case", "complaint", "consultation", "call", "meeting",
      "slot", "document", "upload", "client", "dashboard", "fee", "register",
      "registration", "login", "profile", "account", "schedule", "review", "rating"
    ];

    // Legal & Statutory Keywords (Indian Legal Framework)
    const legalKeywords = [
      "law", "legal", "statute", "act", "section", "court", "police", "fir", "bail",
      "ipc", "crpc", "bns", "bnss", "cpc", "constitution", "article", "right", "rights",
      "consumer", "refund", "defective", "seller", "tenant", "landlord", "rent",
      "eviction", "property", "lease", "deed", "divorce", "marriage", "maintenance",
      "custody", "alimony", "husband", "wife", "domestic violence", "cyber", "hack",
      "phishing", "fraud", "otp", "stalking", "cheque", "check", "bounce", "dishonour",
      "ni act", "loan", "assault", "theft", "notice", "suit", "injunction", "judge",
      "magistrate", "jurisdiction", "verdict", "warrant", "tribunal", "posh", "salary",
      "termination", "employment", "contract", "agreement", "nda", "company", "partnership",
      "will", "inheritance", "probate", "affidavit", "notary", "stamp paper", "police station",
      "crime", "criminal", "civil", "litigation", "advocate notes", "legal advice", "legal help",
      "harassment", "extortion", "defamation", "bailment", "indemnity", "tort", "evidence"
    ];

    // Common Greetings / Capability Inquiries
    const greetingKeywords = [
      "hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening",
      "who are you", "what are you", "what can you do", "help", "who made you"
    ];

    const isPlatformQuery = platformKeywords.some((kw) => query.includes(kw) || cleanQuery.includes(kw));
    const isLegalQuery = legalKeywords.some((kw) => query.includes(kw) || cleanQuery.includes(kw));
    const isGreetingQuery = greetingKeywords.some((kw) => 
      query === kw || cleanQuery === kw || query.startsWith(kw + " ") || cleanQuery.startsWith(kw + " ")
    );

    // If query matches NONE of platform, legal, or greeting criteria -> OUT OF SCOPE
    if (!isPlatformQuery && !isLegalQuery && !isGreetingQuery) {
      return res.status(200).json({
        success: true,
        message: "Question processed.",
        data: {
          id: Date.now(),
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          category: "Out of Project Scope",
          isOffTopic: true,
          summary: `I am the LegalConnect AI Assistant, specialized ONLY in LegalConnect platform services and Indian Legal guidance. Your query ("${rawQuery}") is outside the scope of this project.`,
          legalSections: [],
          keyPoints: [
            "I cannot answer questions about general knowledge, programming, cooking, sports, entertainment, or non-legal topics.",
            "Please ask a question related to LegalConnect platform features (e.g., 'How do I book an advocate?').",
            "Or ask a legal query under Indian Law (e.g., 'What is the procedure for cheque bounce under Section 138?')."
          ],
          procedureSteps: [
            "1. Rephrase your query to focus on an Indian legal issue or LegalConnect platform guidance.",
            "2. Select one of the suggested legal prompt buttons below.",
            "3. Search for verified advocates under the 'Advocates' tab for direct legal counsel."
          ],
          documentList: [],
          recommendedSpecialization: null,
          disclaimer: "LegalConnect AI is strictly restricted to LegalConnect project features and Indian Legal Assistance.",
        },
      });
    }

    let category = "General Legal Advice";
    let legalSections = [];
    let keyPoints = [];
    let procedureSteps = [];
    let documentList = [];
    let summary = "";
    let recommendedSpecialization = "General Legal Practice";
    let isOffTopic = false;

    // 0. GREETINGS & INTRODUCTIONS
    if (isGreetingQuery && !isLegalQuery && !isPlatformQuery) {
      category = "LegalConnect AI Advisor Introduction";
      summary = "Hello! I am your LegalConnect AI Assistant. I am specialized strictly in helping you navigate the LegalConnect platform and providing guidance on Indian Legal matters.";
      keyPoints = [
        "Find & book verified advocates based on specialization and availability.",
        "Register new legal cases and securely attach supporting evidence files.",
        "Get instant guidance on applicable Indian statutes, procedures, and required documents.",
        "Access online consultation rooms via shared conference-call links for scheduled appointments."
      ];
      procedureSteps = [
        "1. Ask a question regarding LegalConnect features or an Indian legal topic.",
        "2. Review the procedural steps, relevant section codes, and document requirements.",
        "3. Click 'Book Advocate' to consult a verified lawyer directly on LegalConnect."
      ];
      documentList = [];
      recommendedSpecialization = null;
    }
    // 1. LEGALCONNECT PLATFORM FEATURES & SERVICES
    else if (query.includes("book") || query.includes("appointment") || query.includes("call") || query.includes("slot") || query.includes("upload") || query.includes("dashboard") || query.includes("register case") || query.includes("file complaint") || query.includes("how to use legalconnect")) {
      category = "LegalConnect Platform Guidance";
      recommendedSpecialization = null;
      summary = "LegalConnect is a digital legal platform connecting clients with verified Advocates in India for consultation, case registration, and online video/audio conference calls.";
      legalSections = [
        "LegalConnect Service Terms (Digital Legal Consultation)",
        "IT Act, 2000 (Section 10A - Validity of Electronic Contracts)",
        "Advocates Act, 1961 (Standard Professional Conduct Rules)"
      ];
      keyPoints = [
        "Advocate Consultation: Browse advocates by specialization (Civil, Criminal, Family, Cyber, Property), view their fees, and pick available time slots.",
        "Case Registration: Click 'Register New Case' in your Client Dashboard to submit case details and attach document files.",
        "Online Meeting Room: Once your advocate approves your appointment, a conference-call meeting link is generated in your 'Booked Consultations' tab."
      ];
      procedureSteps = [
        "1. Go to 'Find Advocates' tab to view verified advocates and their available slots.",
        "2. Click 'Book Consultation / Register Case' and fill out your issue description.",
        "3. Track appointment status and join the online conference call on the scheduled date."
      ];
      documentList = ["Case Title & Description", "Supporting Evidence / Receipts / Agreement PDFs or Images", "Government Photo ID Proof"];
    }
    // 2. CONSUMER PROTECTION / FRAUD / E-COMMERCE
    else if (query.includes("consumer") || query.includes("refund") || query.includes("defective") || query.includes("seller") || query.includes("fraud") || query.includes("online shopping") || query.includes("service quality")) {
      category = "Consumer Rights & Protection";
      recommendedSpecialization = "Consumer Protection";
      summary = "Under the Consumer Protection Act, 2019, consumers have the right to seek redresses against unfair trade practices, defective goods, and deficient services.";
      legalSections = [
        "Consumer Protection Act, 2019 (Section 2(7) - Definition of Consumer)",
        "Section 35 - Filing of complaint before District Consumer Commission",
        "Section 2(47) - Unfair Trade Practice provisions"
      ];
      keyPoints = [
        "You can claim full refund, replacement, and compensation for mental agony and litigation costs.",
        "No mandatory court fee required for claims up to ₹5 Lakhs on the National Consumer Helpline / E-Daakhil portal.",
        "You can file a complaint online via e-daakhil.nic.in without physically visiting court."
      ];
      procedureSteps = [
        "1. Send a formal Written Legal Notice / Complaint to the seller/service provider giving 15 days to resolve.",
        "2. If no response, register an online complaint at National Consumer Helpline (NCH - 1915).",
        "3. File a formal petition on the E-Daakhil portal before District Consumer Disputes Redressal Commission."
      ];
      documentList = ["Invoice / Bill receipt", "Proof of payment / Bank statement", "Emails / WhatsApp chat with seller", "Photos / Videos of defect or service deficiency"];
    }
    // 3. PROPERTY / REAL ESTATE / TENANT / LANDLORD
    else if (query.includes("property") || query.includes("tenant") || query.includes("landlord") || query.includes("rent") || query.includes("eviction") || query.includes("lease") || query.includes("land") || query.includes("possession") || query.includes("trespass")) {
      category = "Property & Real Estate Law";
      recommendedSpecialization = "Property & Real Estate";
      summary = "Property disputes and tenancy matters are governed by the Transfer of Property Act, 1882, state-specific Rent Control Acts, and Model Tenancy Act.";
      legalSections = [
        "Transfer of Property Act, 1882 (Section 105 - Lease definition)",
        "Section 106 - Notice to terminate lease",
        "Specific Relief Act, 1963 (Section 5 & 6 - Recovery of specific immovable property)"
      ];
      keyPoints = [
        "A landlord cannot forcefully evict a tenant without giving a valid legal notice of at least 15 to 30 days.",
        "Tenants are entitled to security deposit refund upon peaceful vacating of premises.",
        "Civil injunction suits can prevent illegal possession or unauthorized construction."
      ];
      procedureSteps = [
        "1. Issue a registered Legal Notice for vacant possession or security deposit recovery.",
        "2. Approach the Rent Control Authority / Rent Tribunal for dispute resolution.",
        "3. File a Suit for Permanent Injunction or Declaration of Title in the Civil Court if title is disputed."
      ];
      documentList = ["Registered Lease / Rent Agreement", "Rent Payment Receipts / Bank Transfers", "Ownership Title Deed / 7/12 Extract / Khata", "Legal Notice copy with Postal Receipt"];
    }
    // 4. FAMILY / MARRIAGE / DIVORCE / MAINTENANCE / CUSTODY
    else if (query.includes("divorce") || query.includes("marriage") || query.includes("maintenance") || query.includes("custody") || query.includes("alimony") || query.includes("husband") || query.includes("wife") || query.includes("domestic violence") || query.includes("dowry")) {
      category = "Family & Matrimonial Law";
      recommendedSpecialization = "Family Law";
      summary = "Family and marital disputes are adjudicated under personal laws (Hindu Marriage Act 1955, Special Marriage Act 1954) and Protection of Women from Domestic Violence Act 2005.";
      legalSections = [
        "Hindu Marriage Act, 1955 (Section 13B - Mutual Consent Divorce)",
        "Section 125 CrPC / Section 144 BNSS - Order for maintenance of wives, children, and parents",
        "Protection of Women from Domestic Violence Act, 2005 (Section 12 & 18)"
      ];
      keyPoints = [
        "Mutual Consent Divorce requires a minimum 6-month cooling period (waivable by court discretion).",
        "Wife and minor children are legally entitled to interim monthly maintenance regardless of divorce status.",
        "Child custody decisions prioritize the paramount welfare and best interest of the child."
      ];
      procedureSteps = [
        "1. Attend mandatory court counseling / mediation session organized by Family Court.",
        "2. File petition under Mutual Consent (Section 13B) or Contested Grounds (Cruelty/Adultery/Desertion).",
        "3. Seek interim maintenance under Section 125 CrPC / Section 144 BNSS during case proceedings."
      ];
      documentList = ["Marriage Certificate & Photographs", "Income Proof / Salary Slips of both spouses", "Address & Identity Proofs", "Details of Joint Assets & Liabilities"];
    }
    // 5. CYBER CRIME / ONLINE FRAUD / IT ACT
    else if (query.includes("cyber") || query.includes("online") || query.includes("hack") || query.includes("phishing") || query.includes("social media") || query.includes("otp") || query.includes("bank fraud") || query.includes("stalking") || query.includes("identity theft")) {
      category = "Cyber Law & Information Technology";
      recommendedSpecialization = "Cyber Law";
      summary = "Cybercrimes, financial frauds, unauthorized data breaches, and online harassment are prosecuted under Information Technology Act, 2000 and Bharatiya Nyaya Sanhita (BNS).";
      legalSections = [
        "Information Technology Act, 2000 (Section 66C - Identity theft)",
        "Section 66D - Cheating by personation using computer resource",
        "Section 43 - Penalty for damage to computer system",
        "BNS Section 318 - Cheating"
      ];
      keyPoints = [
        "Report financial cyber frauds immediately on Cyber Crime Helpline 1930 within the 'Golden Hour' to freeze fraudulent bank transfers.",
        "Banks are liable for unauthorized online transactions if reported within 3 days (RBI Guidelines).",
        "Do not delete chat history, logs, or screenshots as they serve as digital evidence."
      ];
      procedureSteps = [
        "1. Immediately call Cyber Cell Helpline 1930 to freeze stolen funds.",
        "2. Lodge an official complaint on cybercrime.gov.in and submit crime report ID to your bank branch.",
        "3. File an FIR at local Cyber Crime Police Station."
      ];
      documentList = ["Bank Statement highlighting unauthorized debits", "Screenshots of phishing messages / URLs / WhatsApp chats", "Transaction Reference numbers & UPI IDs", "FIR / National Cyber Crime Portal Acknowledgement"];
    }
    // 6. CHEQUE BOUNCE / SECTION 138 NI ACT
    else if (query.includes("cheque") || query.includes("check") || query.includes("dishonour") || query.includes("loan default") || query.includes("promissory note") || query.includes("138")) {
      category = "Negotiable Instruments & Financial Disputes";
      recommendedSpecialization = "Civil Law";
      summary = "Dishonour of cheque due to insufficient funds is a criminal offence under Section 138 of the Negotiable Instruments Act, 1881.";
      legalSections = [
        "Negotiable Instruments Act, 1881 (Section 138 - Dishonour of cheque for insufficiency of funds)",
        "Section 139 - Presumption in favour of holder",
        "Section 141 - Offences by companies"
      ];
      keyPoints = [
        "Statutory Legal Notice MUST be sent to the drawer within 30 days of receiving Cheque Return Memo from bank.",
        "Drawer is given 15 days to pay the cheque amount after receiving notice.",
        "Failure to pay within 15 days allows filing a criminal complaint in Metropolitan Magistrate court within 30 days."
      ];
      procedureSteps = [
        "1. Obtain official Cheque Return Memo from your bank.",
        "2. Send Statutory Demand Notice through an Advocate within 30 days.",
        "3. File Criminal Complaint under Section 138 NI Act if unpaid after 15 days of notice receipt."
      ];
      documentList = ["Original Dishonoured Cheque", "Bank Return Memo stating reason (Insufficient Funds)", "Copy of Legal Notice sent & Registered Post Acknowledgment Slip"];
    }
    // 7. CRIMINAL LAW / FIR / BAIL / POLICE
    else if (query.includes("police") || query.includes("fir") || query.includes("bail") || query.includes("arrest") || query.includes("assault") || query.includes("theft") || query.includes("harassment") || query.includes("extortion")) {
      category = "Criminal Law & Criminal Procedure";
      recommendedSpecialization = "Criminal Law";
      summary = "Criminal offences are regulated by Bharatiya Nyaya Sanhita (BNS) / IPC and Bharatiya Nagarik Suraksha Sanhita (BNSS) / CrPC.";
      legalSections = [
        "BNSS Section 173 (CrPC Section 154) - Information in cognizable cases (FIR)",
        "BNSS Section 479 - Anticipatory & Regular Bail provisions",
        "BNS Section 303 - Theft / BNS Section 115 - Voluntarily causing hurt"
      ];
      keyPoints = [
        "Any citizen has the right to file an FIR at any police station for cognizable offences ('Zero FIR').",
        "Arrested persons have constitutional right to consult a legal practitioner of their choice.",
        "Anticipatory Bail can be applied in Sessions Court or High Court if there is reasonable apprehension of arrest in non-bailable offence."
      ];
      procedureSteps = [
        "1. File a written complaint / FIR at local police station.",
        "2. If police refuse to register FIR, submit written complaint to Superintendent of Police (SP) or Magistrate under BNSS 175.",
        "3. Engage an advocate for Anticipatory Bail or Regular Bail application."
      ];
      documentList = ["Written Police Complaint / FIR copy", "Medical / Injury Report (if assault)", "Identity & Address proof", "Eyewitness statements (if available)"];
    }
    // 8. LABOR & EMPLOYMENT LAW
    else if (query.includes("salary") || query.includes("wages") || query.includes("termination") || query.includes("posh") || query.includes("labor") || query.includes("employment") || query.includes("firing")) {
      category = "Labor & Employment Law";
      recommendedSpecialization = "Labor & Employment";
      summary = "Employment disputes, arbitrary termination, and workplace harassment are governed by the Industrial Disputes Act, Shops & Establishments Act, and POSH Act 2013.";
      legalSections = [
        "Industrial Disputes Act, 1947 (Section 2A - Individual disputes regarding termination)",
        "POSH Act, 2013 (Sexual Harassment of Women at Workplace)",
        "Payment of Wages Act, 1936"
      ];
      keyPoints = [
        "Employers cannot terminate employees without notice period or severance as per employment contract.",
        "POSH complaints must be submitted to Internal Complaints Committee (ICC) within 3 months of incident.",
        "Unpaid salary/dues can be claimed via legal notice followed by filing before Labor Commissioner."
      ];
      procedureSteps = [
        "1. Submit written grievance representation to HR / Management.",
        "2. Issue Statutory Legal Demand Notice for pending salary dues.",
        "3. Approach Labor Conciliation Officer or Labor Court."
      ];
      documentList = ["Employment Contract / Offer Letter", "Salary Slips / Bank Statements", "Termination Email / Letter", "Written Communications / Emails"];
    }
    // 9. CONTRACTS, AGREEMENTS & BUSINESS LAW
    else if (query.includes("contract") || query.includes("agreement") || query.includes("nda") || query.includes("partnership") || query.includes("company") || query.includes("breach")) {
      category = "Contract & Business Law";
      recommendedSpecialization = "Corporate Law";
      summary = "Business agreements and contracts are enforced under the Indian Contract Act, 1872 and Specific Relief Act, 1963.";
      legalSections = [
        "Indian Contract Act, 1872 (Section 10 - Essential elements of valid contract)",
        "Section 73 - Compensation for loss or damage caused by breach of contract",
        "Specific Relief Act, 1963 (Specific performance of contracts)"
      ];
      keyPoints = [
        "Valid contracts require free consent, legal consideration, and lawful object.",
        "Breach of contract entitles the aggrieved party to claim damages or specific performance.",
        "Arbitration clauses in agreements require resolving disputes through arbitrators before court."
      ];
      procedureSteps = [
        "1. Issue Legal Notice for Breach of Contract demanding performance or compensation.",
        "2. Invoke Arbitration Clause if present in the agreement.",
        "3. File a Summary Suit under CPC Order 37 for debt recovery."
      ];
      documentList = ["Signed Agreement / Contract copy", "Proof of breach / Default notice", "Payment receipts / Invoices", "Correspondence logs"];
    }
    // 10. DEFAULT GENERAL INDIAN LEGAL RESPONSE
    else {
      category = "General Legal Consultation (Indian Law)";
      summary = `Regarding your legal query "${rawQuery.slice(0, 70)}...": Indian law provides specific statutory rights and remedies depending on civil, criminal, or administrative jurisdiction.`;
      legalSections = [
        "Constitution of India (Article 21 - Right to Life & Personal Liberty)",
        "Code of Civil Procedure, 1908 / Bharatiya Nagarik Suraksha Sanhita, 2023",
        "Indian Contract Act, 1872"
      ];
      keyPoints = [
        "Always preserve written evidence, notices, receipts, contracts, and digital records.",
        "Sending a formal Legal Notice through an advocate often resolves disputes without expensive litigation.",
        "Legal remedies have strict Limitation Period rules (generally 3 years for civil claims)."
      ];
      procedureSteps = [
        "1. Collect and organize all supporting documents and communications.",
        "2. Send a formal Legal Demand Notice specifying your claim and 15-30 day deadline.",
        "3. Select a verified advocate on LegalConnect specialized in your subject matter for representation."
      ];
      documentList = ["Identity Proof (Aadhaar / PAN)", "Contracts / Written Agreements", "Correspondence / Email / WhatsApp logs", "Receipts / Financial Records"];
    }

    const aiMessage = {
      id: Date.now(),
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category,
      isOffTopic,
      summary,
      legalSections,
      keyPoints,
      procedureSteps,
      documentList,
      recommendedSpecialization,
      disclaimer: "Disclaimer: LegalConnect AI provides information strictly for guidance under Indian Legal Framework and LegalConnect platform services. Consult a verified advocate on LegalConnect for legal counsel.",
    };

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      data: aiMessage,
    });
  } catch (error) {
    console.error("Error in getLegalAIResponse:", error);
    return res.status(500).json({
      success: false,
      message: "Server error generating AI response.",
      error: error.message,
    });
  }
};

module.exports = {
  getLegalAIResponse,
};
