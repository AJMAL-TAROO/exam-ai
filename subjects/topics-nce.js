/**
 * NCE topic lists per subject.
 * Each entry: { id, label, keywords[] }
 * keywords are used for scoring questions into topics.
 */

export const TOPICS_NCE = {
  maths: [
    {
      id: "number",
      label: "Number",
      keywords: [
        "integer", "fraction", "decimal", "percentage", "ratio", "proportion",
        "prime", "factor", "multiple", "hcf", "lcm", "square", "cube",
        "square root", "cube root", "indices", "standard form", "rounding",
        "significant figure", "estimate", "approximation", "upper bound",
        "lower bound", "profit", "loss", "discount", "simple interest",
        "compound interest", "exchange rate", "speed", "distance", "time"
      ]
    },
    {
      id: "algebra",
      label: "Algebra",
      keywords: [
        "algebra", "expression", "equation", "formula", "substitution",
        "simplify", "expand", "factorise", "factorize", "solve", "linear",
        "quadratic", "inequality", "simultaneous", "sequence", "nth term",
        "pattern", "gradient", "intercept", "graph", "coordinate", "function",
        "variable", "coefficient", "brackets", "rearrange", "make the subject"
      ]
    },
    {
      id: "geometry-and-measure",
      label: "Geometry & Measures",
      keywords: [
        "angle", "triangle", "quadrilateral", "polygon", "circle", "radius",
        "diameter", "circumference", "arc", "sector", "parallel",
        "perpendicular", "bearing", "scale drawing", "symmetry", "reflection",
        "rotation", "translation", "enlargement", "similar", "congruent",
        "area", "perimeter", "volume", "surface area", "prism", "cylinder",
        "cone", "sphere", "net", "compound shape", "mensuration"
      ]
    },
    {
      id: "trigonometry",
      label: "Trigonometry",
      keywords: [
        "trigonometry", "sine", "cosine", "tangent", "sin", "cos", "tan",
        "pythagoras", "hypotenuse", "opposite", "adjacent", "right-angled",
        "angle of elevation", "angle of depression", "bearing", "sine rule",
        "cosine rule", "solve the triangle", "SOHCAHTOA"
      ]
    },
    {
      id: "statistics-and-probability",
      label: "Statistics & Probability",
      keywords: [
        "mean", "median", "mode", "range", "average", "frequency", "data",
        "table", "bar chart", "pie chart", "histogram", "scatter diagram",
        "correlation", "line of best fit", "cumulative frequency", "quartile",
        "interquartile", "box plot", "probability", "event", "outcome",
        "sample space", "tree diagram", "relative frequency", "expected"
      ]
    }
  ],

  physics: [
    {
      id: "measurements-and-motion",
      label: "Measurements & Motion",
      keywords: [
        "measurement", "unit", "SI unit", "length", "mass", "time",
        "temperature", "uncertainty", "error", "accuracy", "precision",
        "speed", "velocity", "acceleration", "distance", "displacement",
        "motion", "gradient", "distance-time graph", "speed-time graph",
        "free fall", "terminal velocity"
      ]
    },
    {
      id: "forces-and-energy",
      label: "Forces & Energy",
      keywords: [
        "force", "newton", "mass", "weight", "gravity", "friction",
        "normal reaction", "resultant force", "moment", "turning effect",
        "pressure", "density", "work done", "energy", "kinetic energy",
        "potential energy", "power", "efficiency", "conservation of energy",
        "momentum", "impulse", "extension", "spring", "Hooke"
      ]
    },
    {
      id: "thermal-physics",
      label: "Thermal Physics",
      keywords: [
        "thermal", "heat", "temperature", "specific heat capacity",
        "specific latent heat", "melting", "boiling", "evaporation",
        "conduction", "convection", "radiation", "expansion", "gas pressure",
        "kinetic model", "particle", "internal energy", "change of state"
      ]
    },
    {
      id: "waves-light-and-sound",
      label: "Waves, Light & Sound",
      keywords: [
        "wave", "wavelength", "frequency", "amplitude", "period", "speed",
        "reflection", "refraction", "diffraction", "interference", "light",
        "ray", "lens", "mirror", "image", "focal length", "dispersion",
        "sound", "echo", "ultrasound", "electromagnetic spectrum"
      ]
    },
    {
      id: "electricity-and-magnetism",
      label: "Electricity & Magnetism",
      keywords: [
        "electricity", "current", "voltage", "potential difference",
        "resistance", "ohm", "circuit", "series", "parallel", "cell",
        "battery", "switch", "lamp", "ammeter", "voltmeter", "power",
        "energy", "charge", "magnet", "magnetic field", "electromagnet",
        "motor effect", "induction", "transformer", "generator"
      ]
    }
  ],

  chemistry: [
    {
      id: "matter-and-separation",
      label: "Matter & Separation Techniques",
      keywords: [
        "solid", "liquid", "gas", "particle", "diffusion", "kinetic theory",
        "melting", "boiling", "freezing", "condensation", "sublimation",
        "mixture", "pure substance", "filtration", "crystallisation",
        "distillation", "fractional distillation", "chromatography", "solvent",
        "solute", "solution", "filtrate", "residue"
      ]
    },
    {
      id: "atomic-structure-and-bonding",
      label: "Atomic Structure & Bonding",
      keywords: [
        "atom", "element", "compound", "molecule", "proton", "neutron",
        "electron", "nucleus", "atomic number", "mass number", "isotope",
        "periodic table", "group", "period", "metal", "non-metal",
        "ionic bond", "covalent bond", "electron arrangement", "valency",
        "ion", "formula"
      ]
    },
    {
      id: "chemical-reactions",
      label: "Chemical Reactions",
      keywords: [
        "reaction", "reactant", "product", "word equation", "symbol equation",
        "balanced equation", "oxidation", "reduction", "combustion",
        "thermal decomposition", "neutralisation", "precipitation",
        "rate of reaction", "catalyst", "exothermic", "endothermic",
        "reversible", "collision", "activation energy"
      ]
    },
    {
      id: "acids-bases-and-salts",
      label: "Acids, Bases & Salts",
      keywords: [
        "acid", "base", "alkali", "salt", "pH", "indicator", "litmus",
        "neutralisation", "hydrogen ion", "hydroxide ion", "carbonate",
        "nitrate", "sulfate", "chloride", "ammonium", "crystal", "titration",
        "soluble", "insoluble", "preparation of salts"
      ]
    },
    {
      id: "metals-air-and-environment",
      label: "Metals, Air & Environment",
      keywords: [
        "metal", "reactivity series", "displacement", "extraction", "ore",
        "alloy", "corrosion", "rusting", "electrolysis", "air", "oxygen",
        "nitrogen", "carbon dioxide", "pollution", "greenhouse", "global warming",
        "water", "fertiliser", "ammonia", "sulfur dioxide", "acid rain"
      ]
    },
    {
      id: "organic-chemistry",
      label: "Organic Chemistry",
      keywords: [
        "organic", "hydrocarbon", "alkane", "alkene", "alcohol", "carboxylic acid",
        "polymer", "monomer", "cracking", "fractional distillation", "petroleum",
        "crude oil", "combustion", "ethanol", "ethanoic acid", "addition reaction",
        "polymerisation", "functional group"
      ]
    }
  ],

  business: [
    {
      id: "enterprise-and-business-activity",
      label: "Enterprise & Business Activity",
      keywords: [
        "enterprise", "entrepreneur", "business", "startup", "risk", "reward",
        "need", "want", "goods", "services", "resources", "opportunity",
        "objective", "profit", "loss", "revenue", "cost", "market",
        "customer", "stakeholder", "sole trader", "partnership", "company"
      ]
    },
    {
      id: "marketing",
      label: "Marketing",
      keywords: [
        "marketing", "market research", "questionnaire", "survey", "sample",
        "customer", "consumer", "product", "price", "place", "promotion",
        "advertising", "brand", "packaging", "competition", "market segment",
        "target market", "sales", "demand", "supply"
      ]
    },
    {
      id: "operations-and-quality",
      label: "Operations & Quality",
      keywords: [
        "production", "operation", "input", "output", "process", "productivity",
        "quality", "quality control", "quality assurance", "stock", "inventory",
        "supplier", "raw material", "technology", "job production", "batch production",
        "flow production", "location", "capacity", "efficiency"
      ]
    },
    {
      id: "finance-and-accounts",
      label: "Finance & Accounts",
      keywords: [
        "finance", "capital", "source of finance", "loan", "bank", "interest",
        "cash flow", "budget", "break-even", "fixed cost", "variable cost",
        "total cost", "revenue", "profit", "loss", "balance sheet",
        "income statement", "asset", "liability", "working capital"
      ]
    },
    {
      id: "people-in-business",
      label: "People in Business",
      keywords: [
        "employee", "employer", "worker", "manager", "leadership", "motivation",
        "training", "recruitment", "selection", "job description", "pay",
        "wage", "salary", "communication", "teamwork", "organisation chart",
        "span of control", "delegation", "human resource"
      ]
    }
  ],

  "computer-science": [
    {
      id: "computer-systems",
      label: "Computer Systems",
      keywords: [
        "computer system", "hardware", "software", "input", "output", "storage",
        "processor", "CPU", "memory", "RAM", "ROM", "operating system",
        "application software", "utility software", "peripheral", "device",
        "sensor", "actuator", "embedded system"
      ]
    },
    {
      id: "data-representation",
      label: "Data Representation",
      keywords: [
        "data", "binary", "denary", "hexadecimal", "bit", "byte", "kilobyte",
        "megabyte", "gigabyte", "character", "ASCII", "Unicode", "image",
        "pixel", "resolution", "colour depth", "sound", "sampling", "compression",
        "file size"
      ]
    },
    {
      id: "networks-and-internet",
      label: "Networks & Internet",
      keywords: [
        "network", "internet", "LAN", "WAN", "router", "switch", "server",
        "client", "protocol", "IP address", "MAC address", "URL", "website",
        "email", "browser", "wireless", "bandwidth", "latency", "topology",
        "cybersecurity", "firewall"
      ]
    },
    {
      id: "algorithms-and-programming",
      label: "Algorithms & Programming",
      keywords: [
        "algorithm", "program", "pseudocode", "flowchart", "sequence",
        "selection", "iteration", "loop", "condition", "variable", "constant",
        "input", "output", "array", "procedure", "function", "debugging",
        "trace table", "syntax error", "logic error"
      ]
    },
    {
      id: "databases-and-spreadsheets",
      label: "Databases & Spreadsheets",
      keywords: [
        "database", "table", "record", "field", "primary key", "query",
        "form", "report", "spreadsheet", "cell", "row", "column", "formula",
        "function", "chart", "sort", "filter", "validation", "data type"
      ]
    },
    {
      id: "digital-society-and-safety",
      label: "Digital Society & Safety",
      keywords: [
        "digital", "ICT", "communication", "social media", "online", "privacy",
        "security", "password", "malware", "virus", "phishing", "backup",
        "copyright", "plagiarism", "ethics", "health and safety", "ergonomics",
        "e-commerce", "digital divide"
      ]
    }
  ]
};
