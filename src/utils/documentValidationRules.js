/**
 * Centralized Document Validation Rules & Dynamic Configuration Engine
 * Covers both Resource Partner company documents and all Staff document categories
 * for both Staffoo Staff and Contractor / Resource Partner Staff.
 *
 * Provides functions to view, set, add, edit, or reset keywords for any document type at runtime.
 */

export const STATE_CATEGORY_MAP = {
  contractor_document: "vic",
  nsw_document: "nsw",
  qld_document: "qld",
  tas_document: "tas",
  wa_document: "wa",
  sa_document: "sa",
  act_document: "act",
  nt_document: "nt",
};

export const STATE_NAMES = {
  vic: "Victoria",
  nsw: "New South Wales",
  qld: "Queensland",
  tas: "Tasmania",
  wa: "Western Australia",
  sa: "South Australia",
  act: "Australian Capital Territory",
  nt: "Northern Territory",
};

export const DOC_TYPE_DISPLAY_NAMES = {
  // Resource Partner / Contractor Company Documents
  public_liability: "Public Liability",
  asic_report: "ASIC Report",
  security_membership: "Security Industry Membership Certificate",
  security_master_license: "Security Master License",
  workcover: "Workcover",
  labour_hire: "Labour Hire",

  // Staff Documents (Staffoo Staff & Contractor Staff)
  passport: "Passport",
  visa: "Visa",
  working_rights: "Working Rights Document",
  driver_license_front: "Driver License (Front)",
  driver_license_back: "Driver License (Back)",
  security_license: "Security License",
  working_with_children: "Working With Children Check (WWCC)",
  first_aid: "First Aid Certificate",
  cpr: "CPR Certificate",
  white_card: "White Card",
  citizen_ship: "Citizenship Certificate",
  medicare: "Medicare Certificate",
  birth_certificate: "Birth Certificate",
  vaccination: "Vaccination Certificate",
  employment_application: "Employment Application Form",
  tfn_declaration: "TFN Declaration",
  superannuation: "Superannuation Form",
  rsa_certificate: "RSA Certificate",
  control_room_certificate: "Control Room Operator Certificate",
  msic_card: "MSIC Card",
};

/**
 * Default immutable baseline rules for each document type.
 */
export const DEFAULT_DOCUMENT_RULES = {
  // ==========================================
  // 1. RESOURCE PARTNER / CONTRACTOR DOCUMENTS
  // ==========================================
  public_liability: {
    coreKeywords: [
      "public liability",
      "broadform liability",
      "broadform",
      "general liability",
      "public and products liability",
      "public & products liability",
      "commercial liability",
      "commercial general liability",
    ],
    supportingKeywords: [
      "certificate of currency",
      "policy number",
      "limit of liability",
      "limit of indemnity",
      "sum insured",
      "period of insurance",
      "policy period",
      "indemnity",
      "underwritten",
      "insurer",
      "insured:",
      "named insured",
      "business description",
      "interested party",
      "qbe",
      "allianz",
      "cgu",
      "zurich",
      "chubb",
      "aig",
      "vero",
      "iag",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid Public Liability Certificate of Currency. It must clearly state 'Public Liability' or 'Broadform Liability' along with policy details.",
  },

  asic_report: {
    coreKeywords: [
      "asic",
      "australian securities and investments commission",
      "australian securities & investments commission",
      "australian securities commission",
      "current organisation extract",
      "organisation extract",
      "current company extract",
      "company extract",
      "historical extract",
    ],
    supportingKeywords: [
      "acn",
      "australian company number",
      "registered office",
      "principal place of business",
      "director",
      "shareholder",
      "secretaries",
      "proprietary limited",
      "pty ltd",
      "pty. ltd.",
      "annual return",
      "type: australian proprietary company",
      "registration date",
    ],
    minSupportingMatches: 1,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid ASIC Company Extract or ASIC Report. It must contain the official ASIC heading and company registration details (ACN/ABN).",
  },

  security_membership: {
    coreKeywords: [
      "asial",
      "australian security industry association",
      "security industry association",
      "security providers association",
      "spaa",
      "security industry",
      "security institute",
      "world association of detectives",
    ],
    supportingKeywords: [
      "membership certificate",
      "certificate of membership",
      "member name",
      "membership number",
      "member no",
      "corporate member",
      "individual member",
      "financial member",
      "associate member",
      "certified member",
      "is a member of",
      "has been admitted as a member",
      "membership category",
      "code of conduct",
      "current member",
    ],
    minSupportingMatches: 1,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid Security Industry Membership Certificate (such as ASIAL or SPAA). Please upload your official membership certificate.",
  },

  security_master_license: {
    coreKeywords: [
      "master licence",
      "master license",
      "security master licence",
      "security master license",
      "private security business licence",
      "private security business license",
      "private security business",
      "security firm licence",
      "security firm license",
      "security agent licence",
      "security agent license",
      "security provider licence",
      "security provider license",
      "security business licence",
      "security business license",
      "security and investigation agent",
      "security & investigation agent",
      "security agent and inquiry agent",
    ],
    supportingKeywords: [
      "licence number",
      "license number",
      "licence no",
      "license no",
      "business licence",
      "business license",
      "security licence",
      "security license",
      "master",
      "firm",
      "agent",
      "operator",
      "corporation",
    ],
    minSupportingMatches: 0,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid Security Master / Business Licence. Please select the correct document.",
  },

  workcover: {
    coreKeywords: [
      "workcover",
      "workers compensation",
      "workers' compensation",
      "workers compensation insurance",
      "worksafe",
      "icare",
      "insurance and care nsw",
      "returntoworksa",
      "return to work sa",
      "state insurance regulatory authority",
      "sira",
      "comcare",
      "accident compensation",
      "injury insurance",
      "workplace injury rehabilitation",
    ],
    supportingKeywords: [
      "certificate of currency",
      "policy number",
      "employer",
      "employer name",
      "period of insurance",
      "policy period",
      "insurance period",
      "wages",
      "indemnity",
      "insured",
      "cover",
      "claim number",
    ],
    minSupportingMatches: 1,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid Workcover / Workers' Compensation document. Please select the correct document.",
  },

  labour_hire: {
    coreKeywords: [
      "labour hire",
      "labor hire",
    ],
    supportingKeywords: [
      "labour hire licence",
      "labour hire license",
      "labour hire licensing",
      "licence number",
      "license number",
      "licence details",
      "licence status",
      "licensed labour hire provider",
      "labour hire provider",
      "labour hire services",
      "lhla",
      "labour hire licensing authority",
      "office of industrial relations",
      "consumer and business services",
      "access canberra",
      "certificate of licence",
      "certificate of license",
      "register of licensed providers",
      "labour hire services act",
    ],
    minSupportingMatches: 1,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid Labour Hire Licence or document. Please select the correct document.",
  },

  // ==========================================
  // 2. ALL STAFF DOCUMENTS (BOTH STAFF TYPES)
  // ==========================================
  passport: {
    coreKeywords: [
      "passport",
      "travel document",
      "department of foreign affairs and trade",
      "commonwealth of australia",
      "type: p",
      "type p",
      "nationality",
      "republic of",
      "united states of america",
      "kingdom of",
      "passaporte",
      "passeport",
      "republique",
    ],
    supportingKeywords: [
      "surname",
      "given names",
      "authority",
      "date of birth",
      "place of birth",
      "date of expiry",
      "expiry date",
      "sex",
      "date of issue",
      "document no",
      "passport no",
      "p<",
      "holder",
      "bearer",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "driving licence", "medicare"],
    errorMessage:
      "This file does not appear to be a valid Passport. Please upload an official passport document showing the photo and personal details page.",
  },

  visa: {
    coreKeywords: [
      "visa",
      "department of home affairs",
      "department of immigration",
      "vevo",
      "visa entitlement verification online",
      "visa grant notice",
      "resident return",
      "bridging visa",
      "electronic travel authority",
      "visa grant number",
      "permanent resident",
      "australian visa",
    ],
    supportingKeywords: [
      "visa class",
      "visa subclass",
      "grant number",
      "work rights",
      "work limitation",
      "entitlement",
      "valid to",
      "applicant",
      "passport number",
      "conditions",
      "permission to work",
      "unlimited rights",
      "study rights",
      "expiry date",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license"],
    errorMessage:
      "This file does not appear to be a valid Australian Visa or VEVO check. Please upload your official Visa Grant Notice or VEVO Entitlement check.",
  },

  working_rights: {
    coreKeywords: [
      "work rights",
      "working rights",
      "vevo",
      "visa entitlement verification online",
      "department of home affairs",
      "department of immigration",
      "entitlement details",
      "work limitation",
      "condition 8104",
      "condition 8105",
      "permission to work",
      "unlimited work",
      "right to work",
      "work in australia",
      "work entitlement",
    ],
    supportingKeywords: [
      "visa grant",
      "visa class",
      "visa subclass",
      "conditions",
      "passport",
      "valid until",
      "employment",
      "entitlement",
      "check date",
      "australia",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license"],
    errorMessage:
      "This file does not appear to be a valid Working Rights document. Please upload your VEVO check or Visa conditions showing permission to work in Australia.",
  },

  driver_license_front: {
    coreKeywords: [
      "driver licence",
      "driver license",
      "driver's licence",
      "driver's license",
      "driving licence",
      "driving license",
      "learner permit",
      "probationary licence",
      "provisional licence",
      "heavy vehicle licence",
    ],
    supportingKeywords: [
      "licence no",
      "license no",
      "licence number",
      "license number",
      "card number",
      "card no",
      "date of birth",
      "dob",
      "expires",
      "expiry",
      "class",
      "conditions",
      "vicroads",
      "service nsw",
      "transport for nsw",
      "department of transport",
      "queensland transport",
      "transport and main roads",
      "department of state growth",
      "access canberra",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["passport"],
    errorMessage:
      "This file does not appear to be a valid Driver License (Front). Please upload a clear image or PDF of the front of your driver licence.",
  },

  driver_license_back: {
    coreKeywords: [
      "driver licence",
      "driver license",
      "driving licence",
      "licence conditions",
      "card number",
      "card no",
      "barcode",
      "organ donor",
      "change of address",
      "back of licence",
      "back of license",
      "demerit points",
      "vicroads",
      "service nsw",
      "transport for nsw",
      "department of transport",
      "conditions",
      "signature",
    ],
    supportingKeywords: [
      "conditions",
      "class",
      "licence",
      "license",
      "card",
      "donor",
      "address",
      "signature",
      "magnetic",
      "transport",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["passport"],
    errorMessage:
      "This file does not appear to be a valid Driver License (Back). Please upload a clear image or PDF of the reverse side of your driver licence.",
  },

  security_license: {
    coreKeywords: [
      "security licence",
      "security license",
      "private security individual licence",
      "private security individual license",
      "security operative",
      "security guard",
      "crowd controller",
      "unarmed guard",
      "armed guard",
      "bodyguard",
      "monitoring centre operator",
      "private security",
      "security provider",
      "security officer",
      "private security licence",
      "private security license",
      "security employee",
      "class 1",
      "class 2",
      "sub-class",
      "security activities",
    ],
    supportingKeywords: [
      "licence number",
      "license number",
      "licence no",
      "license no",
      "lrd",
      "licensing & regulation division",
      "licensing and regulation division",
      "sled",
      "security licensing & enforcement directorate",
      "security licensing and enforcement directorate",
      "victoria police",
      "nsw police",
      "office of fair trading",
      "consumer and business services",
      "cbos",
      "licensing nt",
      "access canberra",
      "wa police",
      "expiry",
      "date of expiry",
      "authorised",
      "authorized",
    ],
    minSupportingMatches: 1,
    disqualifiers: [
      "master licence",
      "master license",
      "security master licence",
      "security master license",
      "driver licence",
      "driver license",
      "passport",
    ],
    errorMessage:
      "This file does not appear to be a valid Individual Security License. Please upload your state-issued individual security guard / crowd controller licence.",
  },

  working_with_children: {
    coreKeywords: [
      "working with children",
      "wwcc",
      "wwc check",
      "working with children check",
      "blue card",
      "child-related work",
      "working with children clearance",
      "wwc card",
      "working with vulnerable people",
      "wwvp",
    ],
    supportingKeywords: [
      "check number",
      "application number",
      "clearance",
      "assessment",
      "department of justice",
      "office of the children's guardian",
      "blue card services",
      "card number",
      "expiry date",
      "date of expiry",
      "volunteer",
      "employee",
      "paid",
      "screening unit",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid Working With Children Check (WWCC / Blue Card). Please upload your official WWCC clearance card or notice.",
  },

  first_aid: {
    coreKeywords: [
      "first aid",
      "provide first aid",
      "hltaid011",
      "hltaid003",
      "apply first aid",
      "senior first aid",
      "first aid certificate",
      "emergency first aid",
    ],
    supportingKeywords: [
      "hltaid009",
      "cpr",
      "cardiopulmonary resuscitation",
      "statement of attainment",
      "nationally recognised training",
      "nationally recognized training",
      "rto",
      "registered training organisation",
      "training.gov.au",
      "st john ambulance",
      "australian red cross",
      "red cross",
      "first aid training",
      "competency",
      "attainment",
      "issued on",
      "certificate",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport", "working with children"],
    errorMessage:
      "This file does not appear to be a valid First Aid Certificate (HLTAID011 / HLTAID003). Please upload your official Statement of Attainment or Certificate.",
  },

  cpr: {
    coreKeywords: [
      "cpr",
      "cardiopulmonary resuscitation",
      "provide cardiopulmonary resuscitation",
      "hltaid009",
      "hltaid001",
      "cpr refresher",
    ],
    supportingKeywords: [
      "statement of attainment",
      "nationally recognised training",
      "nationally recognized training",
      "rto",
      "registered training organisation",
      "first aid",
      "competent",
      "issued on",
      "st john ambulance",
      "red cross",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid CPR Certificate (HLTAID009 / HLTAID001). Please upload your Statement of Attainment.",
  },

  white_card: {
    coreKeywords: [
      "white card",
      "general construction induction",
      "construction induction",
      "cpccwhs1001",
      "cpcwhs1001",
      "induction training card",
      "general induction card",
      "construction card",
    ],
    supportingKeywords: [
      "worksafe",
      "safework",
      "safe work australia",
      "card number",
      "card no",
      "date of issue",
      "induction",
      "construction",
      "rto",
      "statement of attainment",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["passport", "medicare"],
    errorMessage:
      "This file does not appear to be a valid White Card (General Construction Induction). Please upload your official White Card or Statement of Attainment.",
  },

  citizen_ship: {
    coreKeywords: [
      "citizenship certificate",
      "australian citizenship",
      "certificate of australian citizenship",
      "commonwealth of australia",
      "australian citizen",
      "citizenship by descent",
      "citizenship by grant",
      "nationality and citizenship act",
      "australian citizenship act",
    ],
    supportingKeywords: [
      "evidence of australian citizenship",
      "date of grant",
      "conferred",
      "minister",
      "department of immigration",
      "department of home affairs",
      "certificate number",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license"],
    errorMessage:
      "This file does not appear to be a valid Australian Citizenship Certificate. Please upload your official Certificate of Australian Citizenship.",
  },

  medicare: {
    coreKeywords: [
      "medicare",
      "medicare card",
      "services australia",
      "department of human services",
      "reciprocal health care",
      "medicare certificate",
    ],
    supportingKeywords: [
      "card number",
      "valid to",
      "cardholder",
      "commonwealth of australia",
      "green card",
      "interim card",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["passport", "driver licence", "driver license"],
    errorMessage:
      "This file does not appear to be a valid Medicare card or document. Please upload a clear image of your Medicare card.",
  },

  birth_certificate: {
    coreKeywords: [
      "birth certificate",
      "certificate of birth",
      "registry of births deaths and marriages",
      "births deaths and marriages",
      "bdm",
      "extract of birth",
      "register of births",
      "certified copy of an entry of birth",
    ],
    supportingKeywords: [
      "child",
      "father",
      "mother",
      "parent",
      "date of birth",
      "registration number",
      "place of birth",
      "registrar",
      "district",
      "born on",
      "born at",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid Birth Certificate. Please upload your official Birth Certificate from the Registry of Births, Deaths & Marriages.",
  },

  vaccination: {
    coreKeywords: [
      "immunisation",
      "immunization",
      "vaccination",
      "covid-19",
      "australian immunisation register",
      "air",
      "covid-19 digital certificate",
      "immunisation history statement",
      "vaccine",
    ],
    supportingKeywords: [
      "services australia",
      "medicare",
      "dose",
      "date given",
      "healthcare identifier",
      "immunised",
      "immunized",
      "brand name",
      "statement",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid Vaccination / Immunisation Certificate. Please upload your official Immunisation History Statement or Certificate.",
  },

  employment_application: {
    coreKeywords: [
      "employment application",
      "application for employment",
      "staffoo",
      "employment form",
      "job application",
      "candidate application",
      "employee onboarding",
      "staff registration",
    ],
    supportingKeywords: [
      "position applied",
      "applicant",
      "emergency contact",
      "availability",
      "experience",
      "signature",
      "date",
      "personal details",
      "employment history",
    ],
    minSupportingMatches: 1,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid Employment Application Form. Please upload your completed employment application.",
  },

  tfn_declaration: {
    coreKeywords: [
      "tax file number declaration",
      "tfn declaration",
      "australian taxation office",
      "ato",
      "nat 3092",
      "tax file number",
      "tfn",
    ],
    supportingKeywords: [
      "section a",
      "payee",
      "payer",
      "australian resident",
      "tax-free threshold",
      "signature of payee",
      "date of birth",
      "higher education loan",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid Tax File Number (TFN) Declaration. Please upload your official ATO TFN Declaration form.",
  },

  superannuation: {
    coreKeywords: [
      "superannuation",
      "superannuation standard choice",
      "super choice form",
      "superannuation fund",
      "nat 13080",
      "standard choice form",
      "super fund",
    ],
    supportingKeywords: [
      "section a",
      "employee",
      "employer",
      "fund name",
      "fund abn",
      "usi",
      "unique superannuation identifier",
      "member number",
      "signature",
      "apra",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid Superannuation Standard Choice form. Please upload your completed Superannuation form.",
  },

  rsa_certificate: {
    coreKeywords: [
      "responsible service of alcohol",
      "rsa",
      "sithfab021",
      "sithfab002",
      "rsa certificate",
      "liquor licensing",
      "responsible service of alcohol certificate",
    ],
    supportingKeywords: [
      "statement of attainment",
      "nationally recognised training",
      "rto",
      "liquor",
      "hospitality",
      "competency",
      "trainer",
    ],
    minSupportingMatches: 1,
    disqualifiers: ["driver licence", "driver license", "passport"],
    errorMessage:
      "This file does not appear to be a valid RSA (Responsible Service of Alcohol) Certificate. Please upload your Statement of Attainment.",
  },

  control_room_certificate: {
    coreKeywords: [
      "control room",
      "monitoring centre",
      "security monitoring",
      "cppsec",
      "control room operator",
      "monitoring centre operator",
    ],
    supportingKeywords: [
      "statement of attainment",
      "security",
      "certificate",
      "competency",
      "rto",
    ],
    minSupportingMatches: 1,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid Control Room Operator Certificate. Please upload your official qualification certificate.",
  },

  msic_card: {
    coreKeywords: [
      "msic",
      "maritime security identification card",
      "auscheck",
    ],
    supportingKeywords: [
      "department of home affairs",
      "card number",
      "expiry",
      "maritime",
      "security",
    ],
    minSupportingMatches: 1,
    disqualifiers: [],
    errorMessage:
      "This file does not appear to be a valid Maritime Security Identification Card (MSIC). Please upload a clear copy of your MSIC card.",
  },
};

/**
 * Deep clone utility to prevent accidental state mutation of defaults.
 */
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Active in-memory document rules config that can be modified via API.
 */
export const DOCUMENT_RULES_CONFIG = deepClone(DEFAULT_DOCUMENT_RULES);

/**
 * State authorities and agency signatures for detecting state alignment or conflicts.
 */
export const STATE_AUTHORITY_SIGNATURES = {
  vic: {
    self: [
      "victoria",
      "vic",
      "worksafe victoria",
      "victorian workcover",
      "licensing & regulation division",
      "licensing and regulation division",
      "lrd",
      "victoria police",
      "lhla",
      "labour hire licensing authority",
    ],
    authorities: [
      "licensing and regulation division",
      "lrd",
      "victoria police",
      "worksafe victoria",
      "lhla",
    ],
  },
  nsw: {
    self: [
      "new south wales",
      "nsw",
      "icare",
      "insurance and care nsw",
      "sira",
      "state insurance regulatory authority",
      "sled",
      "security licensing & enforcement directorate",
      "security licensing and enforcement directorate",
      "nsw police force",
      "nsw police",
    ],
    authorities: [
      "sled",
      "security licensing and enforcement directorate",
      "nsw police",
      "icare",
      "sira",
    ],
  },
  qld: {
    self: [
      "queensland",
      "qld",
      "workcover queensland",
      "workcover qld",
      "office of fair trading",
      "fair trading queensland",
      "security providers act",
    ],
    authorities: [
      "office of fair trading",
      "workcover queensland",
      "workcover qld",
    ],
  },
  tas: {
    self: [
      "tasmania",
      "tas",
      "workcover tasmania",
      "worksafe tasmania",
      "consumer, building and occupational services",
      "consumer building and occupational services",
      "cbos",
      "department of justice tasmania",
    ],
    authorities: [
      "cbos",
      "consumer, building and occupational services",
      "consumer building and occupational services",
      "workcover tasmania",
    ],
  },
  wa: {
    self: [
      "western australia",
      "wa",
      "workcover wa",
      "wa police",
      "licensing services",
      "security activities regulation",
    ],
    authorities: [
      "workcover wa",
      "wa police",
    ],
  },
  sa: {
    self: [
      "south australia",
      "sa",
      "returntoworksa",
      "return to work sa",
      "consumer and business services",
      "cbs",
      "south australia police",
    ],
    authorities: [
      "returntoworksa",
      "consumer and business services",
    ],
  },
  act: {
    self: [
      "australian capital territory",
      "act",
      "access canberra",
      "act policing",
      "worksafe act",
    ],
    authorities: [
      "access canberra",
      "act policing",
      "worksafe act",
    ],
  },
  nt: {
    self: [
      "northern territory",
      "nt",
      "worksafe nt",
      "nt worksafe",
      "licensing nt",
      "department of industry, tourism and trade",
    ],
    authorities: [
      "licensing nt",
      "nt worksafe",
      "worksafe nt",
    ],
  },
};

/**
 * List of document types that are state-specific in Australia.
 * Federal documents (passport, medicare, visa, tfn, superannuation) do not trigger state conflicts.
 */
export const STATE_SPECIFIC_DOC_TYPES = [
  "security_master_license",
  "workcover",
  "labour_hire",
  "security_license",
  "driver_license_front",
  "driver_license_back",
  "working_with_children",
];

// ============================================================================
// DYNAMIC CONFIGURATION & KEYWORD MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Resolves any document type name/slug to canonical key ('public_liability', 'passport', etc.)
 */
export const resolveDocumentTypeKey = (docType, docName) => {
  const norm = (str) =>
    String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const t = norm(docType);
  const n = norm(docName);

  // Resource Partner Company Documents
  if (t === "publicliability" || n.includes("publicliability")) return "public_liability";
  if (t === "asicreport" || t === "asic" || n.includes("asic")) return "asic_report";
  if (
    t === "securitymembership" ||
    t === "securityindustrymembership" ||
    t === "securityindustrymembershipcertificate" ||
    n.includes("membership")
  ) {
    return "security_membership";
  }
  if (
    t === "securitymasterlicense" ||
    t === "masterlicense" ||
    t === "securitymasterlicence" ||
    t === "masterlicence" ||
    n.includes("masterlicense") ||
    n.includes("masterlicence")
  ) {
    return "security_master_license";
  }
  if (t === "workcover" || n.includes("workcover") || n.includes("workerscompensation")) {
    return "workcover";
  }
  if (t === "labourhire" || n.includes("labourhire")) return "labour_hire";

  // Staff Documents
  // Passport
  if (t === "passport" || t === "passportdoc" || n.includes("passport")) return "passport";

  // Working Rights / VEVO
  if (
    t === "workingrights" ||
    t === "workingrightsfile" ||
    n.includes("workingrights") ||
    t === "workrights" ||
    n.includes("workrights")
  ) {
    return "working_rights";
  }

  // Visa
  if (t === "visa" || n.includes("visa")) return "visa";

  // Driver License Front & Back
  if (
    t === "driverlicensefront" ||
    t === "driverlicencefront" ||
    n.includes("driverlicensefront") ||
    n.includes("driverlicencefront") ||
    (n.includes("driver") && n.includes("front"))
  ) {
    return "driver_license_front";
  }
  if (
    t === "driverlicenseback" ||
    t === "driverlicenceback" ||
    n.includes("driverlicenseback") ||
    n.includes("driverlicenceback") ||
    (n.includes("driver") && n.includes("back"))
  ) {
    return "driver_license_back";
  }
  if (
    t === "driverlicense" ||
    t === "driverlicence" ||
    n.includes("driverlicense") ||
    n.includes("driverlicence")
  ) {
    return "driver_license_front";
  }

  // Individual Security License (evaluated after Security Master License above)
  if (
    t === "securitylicense" ||
    t === "securitylicence" ||
    t === "securitylicensedoc" ||
    n.includes("securitylicense") ||
    n.includes("securitylicence")
  ) {
    return "security_license";
  }

  // Working With Children Check
  if (
    t === "workingwithchildren" ||
    t === "workingwithchildrencheck" ||
    t === "workingwithchildrenceck" ||
    t === "wwcc" ||
    t === "bluecard" ||
    n.includes("workingwithchildren") ||
    n.includes("bluecard") ||
    n.includes("wwcc")
  ) {
    return "working_with_children";
  }

  // First Aid Certificate
  if (
    t === "firstaid" ||
    t === "firstaidcertificate" ||
    t === "firstaiddoc" ||
    n.includes("firstaid")
  ) {
    return "first_aid";
  }

  // CPR Certificate
  if (t === "cpr" || t === "cprcertificate" || n.includes("cpr")) return "cpr";

  // White Card
  if (t === "whitecard" || n.includes("whitecard")) return "white_card";

  // Citizenship Certificate
  if (
    t === "citizenship" ||
    t === "citizenshipcertificate" ||
    n.includes("citizenship")
  ) {
    return "citizen_ship";
  }

  // Medicare
  if (t === "medicare" || t === "medicarecertificate" || n.includes("medicare")) return "medicare";

  // Birth Certificate
  if (t === "birthcertificate" || n.includes("birthcertificate")) return "birth_certificate";

  // Vaccination Certificate
  if (
    t === "vaccination" ||
    t === "vaccinationcertificate" ||
    t === "immunisation" ||
    n.includes("vaccin") ||
    n.includes("immunis")
  ) {
    return "vaccination";
  }

  // Employment Application Form
  if (
    t === "employmentapplication" ||
    t === "employmentapplicationform" ||
    n.includes("employmentapplication") ||
    n.includes("applicationform")
  ) {
    return "employment_application";
  }

  // TFN Declaration
  if (t === "tfndeclaration" || t === "tfn" || n.includes("tfndeclaration") || n.includes("tfn")) {
    return "tfn_declaration";
  }

  // Superannuation Form
  if (
    t === "superannuation" ||
    t === "superannuationform" ||
    t === "superform" ||
    n.includes("superannuation")
  ) {
    return "superannuation";
  }

  // RSA Certificate
  if (t === "rsa" || t === "rsacertificate" || n.includes("rsa")) return "rsa_certificate";

  // Control Room Operator Certificate
  if (
    t === "controlroom" ||
    t === "controlroomcertificate" ||
    n.includes("controlroom")
  ) {
    return "control_room_certificate";
  }

  // MSIC Card
  if (t === "msic" || t === "msiccard" || n.includes("msic")) return "msic_card";

  return null;
};

/**
 * Gets the current active rules for a document type.
 *
 * @param {string} docType - Category key (e.g., 'public_liability', 'passport')
 * @returns {object|null} Current rules object
 */
export function getDocumentRules(docType) {
  const key = resolveDocumentTypeKey(docType, docType) || docType;
  return DOCUMENT_RULES_CONFIG[key] ? deepClone(DOCUMENT_RULES_CONFIG[key]) : null;
}

/**
 * Gets all active document rules.
 */
export function getAllDocumentRules() {
  return deepClone(DOCUMENT_RULES_CONFIG);
}

/**
 * Sets (overwrites) the rules for a specific document category.
 *
 * @param {string} docType   - Category key (e.g. 'public_liability', 'passport')
 * @param {object} newRules  - New rules object { coreKeywords, supportingKeywords, minSupportingMatches, disqualifiers, errorMessage }
 * @returns {object} Updated rules
 */
export function setDocumentRules(docType, newRules) {
  const key = resolveDocumentTypeKey(docType, docType) || docType;
  if (!DOCUMENT_RULES_CONFIG[key]) {
    DOCUMENT_RULES_CONFIG[key] = {
      coreKeywords: [],
      supportingKeywords: [],
      minSupportingMatches: 1,
      disqualifiers: [],
      errorMessage: "",
    };
  }

  const target = DOCUMENT_RULES_CONFIG[key];

  if (Array.isArray(newRules.coreKeywords)) {
    target.coreKeywords = newRules.coreKeywords.map((k) => String(k).toLowerCase().trim());
  }
  if (Array.isArray(newRules.supportingKeywords)) {
    target.supportingKeywords = newRules.supportingKeywords.map((k) => String(k).toLowerCase().trim());
  }
  if (typeof newRules.minSupportingMatches === "number") {
    target.minSupportingMatches = newRules.minSupportingMatches;
  }
  if (Array.isArray(newRules.disqualifiers)) {
    target.disqualifiers = newRules.disqualifiers.map((k) => String(k).toLowerCase().trim());
  }
  if (typeof newRules.errorMessage === "string") {
    target.errorMessage = newRules.errorMessage;
  }

  return deepClone(target);
}

/**
 * Incrementally adds or removes keywords from a document category.
 *
 * @param {string} docType   - Category key (e.g., 'public_liability', 'passport')
 * @param {object} options   - { addCore, removeCore, addSupporting, removeSupporting, addDisqualifiers, removeDisqualifiers, minSupportingMatches, errorMessage }
 * @returns {object} Updated rules
 */
export function updateDocumentKeywords(docType, options = {}) {
  const key = resolveDocumentTypeKey(docType, docType) || docType;
  if (!DOCUMENT_RULES_CONFIG[key]) {
    throw new Error(`Unknown document type '${docType}'. Resolved key was not found in rules.`);
  }

  const target = DOCUMENT_RULES_CONFIG[key];

  const add = (arr, items) => {
    if (!items) return;
    const list = Array.isArray(items) ? items : [items];
    list.forEach((item) => {
      const clean = String(item).toLowerCase().trim();
      if (clean && !arr.includes(clean)) arr.push(clean);
    });
  };

  const remove = (arr, items) => {
    if (!items) return;
    const list = Array.isArray(items) ? items : [items];
    list.forEach((item) => {
      const clean = String(item).toLowerCase().trim();
      const idx = arr.indexOf(clean);
      if (idx !== -1) arr.splice(idx, 1);
    });
  };

  if (options.addCore) add(target.coreKeywords, options.addCore);
  if (options.removeCore) remove(target.coreKeywords, options.removeCore);

  if (options.addSupporting) add(target.supportingKeywords, options.addSupporting);
  if (options.removeSupporting) remove(target.supportingKeywords, options.removeSupporting);

  if (options.addDisqualifiers) add(target.disqualifiers, options.addDisqualifiers);
  if (options.removeDisqualifiers) remove(target.disqualifiers, options.removeDisqualifiers);

  if (typeof options.minSupportingMatches === "number") {
    target.minSupportingMatches = options.minSupportingMatches;
  }
  if (typeof options.errorMessage === "string") {
    target.errorMessage = options.errorMessage;
  }

  return deepClone(target);
}

/**
 * Resets one or all document category rules back to their default immutable baselines.
 *
 * @param {string} [docType] - If provided, resets only this category. If omitted, resets all.
 */
export function resetDocumentRules(docType) {
  if (docType) {
    const key = resolveDocumentTypeKey(docType, docType) || docType;
    if (DEFAULT_DOCUMENT_RULES[key]) {
      DOCUMENT_RULES_CONFIG[key] = deepClone(DEFAULT_DOCUMENT_RULES[key]);
    }
  } else {
    for (const k of Object.keys(DEFAULT_DOCUMENT_RULES)) {
      DOCUMENT_RULES_CONFIG[k] = deepClone(DEFAULT_DOCUMENT_RULES[k]);
    }
  }
  return getAllDocumentRules();
}

/**
 * Updates authority keywords for a specific Australian state (e.g. 'vic', 'nsw').
 *
 * @param {string} stateCode - 'vic', 'nsw', 'qld', 'tas', 'wa', 'sa', 'act', 'nt'
 * @param {object} options   - { addSelf, removeSelf, addAuthorities, removeAuthorities }
 */
export function updateStateKeywords(stateCode, options = {}) {
  const code = String(stateCode || "").toLowerCase().trim();
  const stateObj = STATE_AUTHORITY_SIGNATURES[code];
  if (!stateObj) {
    throw new Error(`Unknown state code: ${stateCode}. Valid codes: vic, nsw, qld, tas, wa, sa, act, nt`);
  }

  const add = (arr, items) => {
    if (!items) return;
    const list = Array.isArray(items) ? items : [items];
    list.forEach((item) => {
      const clean = String(item).toLowerCase().trim();
      if (clean && !arr.includes(clean)) arr.push(clean);
    });
  };

  const remove = (arr, items) => {
    if (!items) return;
    const list = Array.isArray(items) ? items : [items];
    list.forEach((item) => {
      const clean = String(item).toLowerCase().trim();
      const idx = arr.indexOf(clean);
      if (idx !== -1) arr.splice(idx, 1);
    });
  };

  if (options.addSelf) add(stateObj.self, options.addSelf);
  if (options.removeSelf) remove(stateObj.self, options.removeSelf);

  if (options.addAuthorities) add(stateObj.authorities, options.addAuthorities);
  if (options.removeAuthorities) remove(stateObj.authorities, options.removeAuthorities);

  return deepClone(stateObj);
}

// Make accessible on window object in browser for testing / console manipulation
if (typeof window !== "undefined") {
  window.StaffooDocRules = {
    updateDocumentKeywords,
    setDocumentRules,
    getDocumentRules,
    getAllDocumentRules,
    resetDocumentRules,
    updateStateKeywords,
    DOCUMENT_RULES_CONFIG,
    DEFAULT_DOCUMENT_RULES,
    resolveDocumentTypeKey,
  };
}

// ============================================================================
// TEXT EVALUATION ENGINE
// ============================================================================

/**
 * Normalizes raw extracted text for case, whitespace, punctuation and common OCR artifacts.
 */
export const normalizeExtractedText = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[—–]/g, "-")
    .replace(/['"`]/g, "'")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

/**
 * Resolves the state code ('vic', 'nsw', etc.) from category string or document info.
 */
export const resolveStateCode = (category, doc) => {
  const c = String(category || doc?.document_category || "").toLowerCase().trim();
  if (STATE_CATEGORY_MAP[c]) return STATE_CATEGORY_MAP[c];

  if (c === "vic" || c.includes("victoria")) return "vic";
  if (c === "nsw" || c.includes("new south wales") || c.includes("newsouthwales")) return "nsw";
  if (c === "qld" || c.includes("queensland")) return "qld";
  if (c === "tas" || c.includes("tasmania")) return "tas";
  if (c === "wa" || c.includes("western australia") || c.includes("westernaustralia")) return "wa";
  if (c === "sa" || c.includes("south australia") || c.includes("southaustralia")) return "sa";
  if (c === "act" || c.includes("capital territory") || c.includes("capitalterritory")) return "act";
  if (c === "nt" || c.includes("northern territory") || c.includes("northernterritory")) return "nt";

  return null;
};

const hasAny = (text, phrases) => phrases.some((p) => text.includes(p.toLowerCase()));
const countMatches = (text, phrases) => phrases.filter((p) => text.includes(p.toLowerCase())).length;

/**
 * Detects if the document unambiguously belongs to a DIFFERENT Australian state.
 */
const detectOpposingStateConflict = (text, targetState) => {
  if (!targetState || !STATE_AUTHORITY_SIGNATURES[targetState]) return null;

  const targetSignatures = STATE_AUTHORITY_SIGNATURES[targetState].self;
  const hasTargetMention = hasAny(text, targetSignatures);

  for (const [stateKey, signatures] of Object.entries(STATE_AUTHORITY_SIGNATURES)) {
    if (stateKey === targetState) continue;

    const hasOpposingAuthority = hasAny(text, signatures.authorities);
    if (hasOpposingAuthority && !hasTargetMention) {
      return stateKey;
    }
  }

  return null;
};

/**
 * Validates extracted text against category-specific rules.
 * Uses the active DOCUMENT_RULES_CONFIG dynamically so any keyword additions/edits take effect instantly.
 */
export const evaluateDocumentText = (rawText, docType, docCategory, docName = "") => {
  const normText = normalizeExtractedText(rawText);
  const typeKey = resolveDocumentTypeKey(docType, docName);
  const stateCode = resolveStateCode(docCategory);
  const stateName = stateCode ? STATE_NAMES[stateCode] : "";
  const docDisplayName = typeKey ? DOC_TYPE_DISPLAY_NAMES[typeKey] : docName || "Document";

  if (!typeKey) {
    return { isValid: true, docDisplayName };
  }

  // Minimum content check
  if (normText.length < 25) {
    return {
      isValid: false,
      error: `The uploaded file is empty or text could not be recognized. Please upload a clear, legible ${docDisplayName} document.`,
      docDisplayName,
      stateName,
    };
  }

  // Common solo generic rejection check
  const isGenericOnly =
    normText.split(/\s+/).length < 8 &&
    (normText.includes("certificate") ||
      normText.includes("insurance") ||
      normText.includes("license") ||
      normText.includes("licence") ||
      normText.includes("identity"));
  if (isGenericOnly) {
    return {
      isValid: false,
      error: `This file contains insufficient document information to identify as a valid ${docDisplayName}. Please upload the complete official document.`,
      docDisplayName,
      stateName,
    };
  }

  // Retrieve active rules for this document type
  const rule = DOCUMENT_RULES_CONFIG[typeKey];
  if (!rule) {
    return { isValid: true, docDisplayName, stateName };
  }

  // 1. Check Disqualifiers (e.g. driver license or passport inside public liability)
  if (Array.isArray(rule.disqualifiers) && rule.disqualifiers.length > 0) {
    for (const disq of rule.disqualifiers) {
      if (normText.includes(disq.toLowerCase())) {
        return {
          isValid: false,
          error: `This file appears to be an unrelated document (${disq}), not a valid ${docDisplayName}. Please select the correct document.`,
          docDisplayName,
          stateName,
        };
      }
    }
  }

  // 2. Check Core Keywords
  const hasCore = hasAny(normText, rule.coreKeywords);

  // Special case for Master License: combination of security licence + business/master/firm
  const hasMasterCombination =
    typeKey === "security_master_license" &&
    (normText.includes("security licence") || normText.includes("security license")) &&
    (normText.includes("master") ||
      normText.includes("business") ||
      normText.includes("firm") ||
      normText.includes("agent") ||
      normText.includes("operator"));

  if (!hasCore && !hasMasterCombination) {
    const errorMsg =
      rule.errorMessage ||
      `This file does not appear to be a valid ${docDisplayName}${stateName ? ` for ${stateName}` : ""}. Please select the correct document.`;
    return {
      isValid: false,
      error: errorMsg,
      docDisplayName,
      stateName,
    };
  }

  // 3. Check Supporting Keywords
  if (rule.minSupportingMatches > 0 && Array.isArray(rule.supportingKeywords) && rule.supportingKeywords.length > 0) {
    const supportingCount = countMatches(normText, rule.supportingKeywords);
    if (supportingCount < rule.minSupportingMatches) {
      const errorMsg =
        rule.errorMessage ||
        `This file does not contain sufficient details to verify as a valid ${docDisplayName}. Please upload the complete document.`;
      return {
        isValid: false,
        error: errorMsg,
        docDisplayName,
        stateName,
      };
    }
  }

  // 4. State Conflict Check (only for Australian state-specific documents when state is specified)
  if (stateCode && STATE_SPECIFIC_DOC_TYPES.includes(typeKey)) {
    const opposingState = detectOpposingStateConflict(normText, stateCode);
    if (opposingState) {
      const opposingStateName = STATE_NAMES[opposingState];
      return {
        isValid: false,
        error: `This file appears to be a ${docDisplayName} for ${opposingStateName}, not ${stateName}. Please select the correct document for ${stateName}.`,
        docDisplayName,
        stateName,
      };
    }
  }

  return { isValid: true, docDisplayName, stateName };
};
