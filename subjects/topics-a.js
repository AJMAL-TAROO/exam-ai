/**
 * A Level topic lists per subject.
 * Each entry: { id, label, keywords[] }
 * keywords are used for scoring questions into topics.
 */

export const TOPICS_A = {
  maths: [
    {
      id: "pure-algebra",
      label: "Pure – Algebra",
      keywords: [
        "polynomial", "factor theorem", "remainder theorem", "partial fraction",
        "binomial expansion", "binomial theorem", "series", "arithmetic progression",
        "geometric progression", "sum to infinity", "logarithm", "exponential",
        "modulus", "inequality", "quadratic inequality", "discriminant",
        "completing the square", "roots", "simultaneous", "surds"
      ]
    },
    {
      id: "pure-calculus",
      label: "Pure – Calculus",
      keywords: [
        "differentiate", "differentiation", "derivative", "integrate", "integration",
        "integral", "chain rule", "product rule", "quotient rule", "implicit",
        "parametric", "stationary point", "turning point", "inflection",
        "increasing", "decreasing", "maximum", "minimum", "area under curve",
        "volume of revolution", "definite integral", "indefinite integral",
        "natural logarithm", "ln", "exponential function", "rate of change",
        "tangent", "normal", "second derivative"
      ]
    },
    {
      id: "pure-trigonometry",
      label: "Pure – Trigonometry",
      keywords: [
        "radian", "arc length", "sector area", "sine rule", "cosine rule",
        "compound angle", "double angle", "half angle", "R formula",
        "sec", "cosec", "cot", "secant", "cosecant", "cotangent",
        "inverse trig", "arcsin", "arccos", "arctan", "identity",
        "trigonometric equation", "general solution", "period", "amplitude"
      ]
    },
    {
      id: "pure-functions",
      label: "Pure – Functions & Graphs",
      keywords: [
        "function", "domain", "range", "one-to-one", "onto", "bijection",
        "composite", "inverse function", "even", "odd", "periodic",
        "transformation", "translation", "stretch", "reflection", "asymptote",
        "modulus function", "graph", "sketch", "intercept", "intersection"
      ]
    },
    {
      id: "pure-vectors",
      label: "Pure – Vectors",
      keywords: [
        "vector", "position vector", "unit vector", "scalar product",
        "dot product", "magnitude", "direction", "parallel", "perpendicular",
        "collinear", "angle between vectors", "3D", "three-dimensional",
        "i j k", "component"
      ]
    },
    {
      id: "pure-numerical",
      label: "Pure – Numerical Methods",
      keywords: [
        "numerical method", "Newton-Raphson", "iteration", "iterative",
        "bisection", "convergence", "fixed point", "error bound",
        "root finding", "staircase diagram", "cobweb diagram"
      ]
    },
    {
      id: "statistics",
      label: "Statistics",
      keywords: [
        "probability", "conditional probability", "independent", "mutually exclusive",
        "Bayes", "permutation", "combination", "binomial distribution",
        "normal distribution", "Poisson distribution", "hypothesis test",
        "significance level", "p-value", "confidence interval", "mean",
        "variance", "standard deviation", "correlation", "regression",
        "Spearman", "Pearson", "scatter diagram", "residual", "expected value",
        "cumulative distribution", "probability density", "continuous random variable",
        "discrete random variable"
      ]
    },
    {
      id: "mechanics",
      label: "Mechanics",
      keywords: [
        "force", "Newton", "equilibrium", "moment", "torque", "friction",
        "coefficient of friction", "tension", "thrust", "compression",
        "velocity", "acceleration", "displacement", "SUVAT", "projectile",
        "energy", "momentum", "impulse", "conservation", "elastic",
        "inelastic", "work-energy", "power", "connected particles",
        "Atwood", "inclined plane", "circular motion", "centripetal",
        "angular velocity", "simple harmonic motion", "SHM"
      ]
    }
  ],

  physics: [
    {
      id: "measurements",
      label: "Physical Quantities & Measurement",
      keywords: [
        "SI unit", "base unit", "derived unit", "homogeneous", "dimensional",
        "uncertainty", "error", "systematic", "random", "precision", "accuracy",
        "significant figure", "scalar", "vector", "order of magnitude"
      ]
    },
    {
      id: "kinematics",
      label: "Kinematics",
      keywords: [
        "displacement", "velocity", "acceleration", "SUVAT", "uniform acceleration",
        "projectile", "free fall", "speed-time graph", "displacement-time graph",
        "gradient", "area under graph"
      ]
    },
    {
      id: "dynamics",
      label: "Dynamics",
      keywords: [
        "force", "Newton's law", "mass", "weight", "friction", "normal reaction",
        "tension", "thrust", "momentum", "impulse", "conservation of momentum",
        "elastic collision", "inelastic collision", "centre of mass"
      ]
    },
    {
      id: "work-energy",
      label: "Work, Energy & Power",
      keywords: [
        "work done", "kinetic energy", "potential energy", "gravitational",
        "elastic", "conservation of energy", "power", "efficiency",
        "work-energy theorem"
      ]
    },
    {
      id: "matter",
      label: "Matter & Materials",
      keywords: [
        "density", "pressure", "upthrust", "Archimedes", "Young's modulus",
        "stress", "strain", "elastic limit", "Hooke's law", "spring constant",
        "tensile", "compressive", "brittle", "ductile", "plastic", "viscosity"
      ]
    },
    {
      id: "waves",
      label: "Waves & Superposition",
      keywords: [
        "wave", "wavelength", "frequency", "amplitude", "phase",
        "coherence", "superposition", "interference", "diffraction",
        "stationary wave", "node", "antinode", "standing wave",
        "Young's double slit", "diffraction grating", "polarisation",
        "electromagnetic spectrum", "doppler effect"
      ]
    },
    {
      id: "electricity",
      label: "Electricity",
      keywords: [
        "charge", "current", "voltage", "resistance", "Ohm's law",
        "potential difference", "EMF", "internal resistance", "Kirchhoff",
        "series circuit", "parallel circuit", "resistivity", "power",
        "energy", "capacitor", "capacitance", "dielectric", "charging",
        "discharging", "time constant"
      ]
    },
    {
      id: "fields",
      label: "Fields",
      keywords: [
        "gravitational field", "electric field", "magnetic field",
        "field strength", "flux", "potential", "Coulomb", "Newton's law of gravitation",
        "inverse square law", "equipotential", "field line", "orbit",
        "geostationary", "satellite", "centripetal", "escape velocity"
      ]
    },
    {
      id: "electromagnetism",
      label: "Electromagnetism",
      keywords: [
        "magnetic flux density", "flux linkage", "Faraday", "Lenz",
        "induced EMF", "transformer", "motor", "generator", "alternating current",
        "rms", "peak", "solenoid", "toroid", "Hall effect", "cyclotron"
      ]
    },
    {
      id: "nuclear",
      label: "Nuclear & Particle Physics",
      keywords: [
        "nucleus", "proton", "neutron", "electron", "quark", "lepton",
        "hadron", "baryon", "meson", "antimatter", "radioactive decay",
        "alpha", "beta", "gamma", "half-life", "binding energy",
        "mass defect", "nuclear fission", "nuclear fusion", "particle accelerator",
        "ionisation", "detector"
      ]
    },
    {
      id: "quantum",
      label: "Quantum Physics",
      keywords: [
        "photon", "photoelectric effect", "work function", "threshold frequency",
        "de Broglie", "wave-particle duality", "electron diffraction",
        "energy level", "emission spectrum", "absorption spectrum",
        "Planck's constant", "quantum", "momentum of photon"
      ]
    }
  ],

  "computer-science": [
    {
      id: "thinking",
      label: "Computational Thinking",
      keywords: [
        "abstraction", "decomposition", "generalisation", "pattern recognition",
        "algorithm", "problem solving", "computational thinking"
      ]
    },
    {
      id: "data-structures",
      label: "Data Structures",
      keywords: [
        "array", "stack", "queue", "linked list", "binary tree", "graph",
        "hash table", "dictionary", "record", "pointer", "node", "traversal",
        "in-order", "pre-order", "post-order", "push", "pop", "enqueue", "dequeue",
        "depth-first", "breadth-first", "heap", "priority queue"
      ]
    },
    {
      id: "algorithms",
      label: "Algorithms & Complexity",
      keywords: [
        "sorting", "bubble sort", "merge sort", "insertion sort", "quick sort",
        "searching", "binary search", "linear search", "time complexity",
        "space complexity", "Big O", "O(n)", "O(log n)", "O(n^2)",
        "recursion", "divide and conquer", "dynamic programming", "greedy",
        "backtracking", "heuristic", "optimisation"
      ]
    },
    {
      id: "programming",
      label: "Programming Paradigms",
      keywords: [
        "object-oriented", "class", "object", "inheritance", "polymorphism",
        "encapsulation", "abstraction", "method", "attribute", "constructor",
        "functional programming", "procedural", "declarative", "overloading",
        "overriding", "interface", "abstract class"
      ]
    },
    {
      id: "hardware",
      label: "Hardware & Architecture",
      keywords: [
        "CPU", "processor", "fetch-decode-execute", "pipeline", "cache",
        "RISC", "CISC", "register", "bus", "von Neumann", "Harvard",
        "interrupt", "polling", "DMA", "virtual memory", "paging",
        "segmentation", "thrashing", "GPU", "parallel processing"
      ]
    },
    {
      id: "os",
      label: "Operating Systems",
      keywords: [
        "operating system", "process", "thread", "scheduling", "round robin",
        "priority scheduling", "deadlock", "semaphore", "mutex", "memory management",
        "file system", "virtual memory", "paging", "kernel", "shell",
        "device driver", "interrupt"
      ]
    },
    {
      id: "databases",
      label: "Databases",
      keywords: [
        "relational database", "SQL", "normalisation", "normalization", "1NF", "2NF", "3NF",
        "BCNF", "entity", "relationship", "ERD", "primary key", "foreign key",
        "transaction", "ACID", "concurrent", "locking", "NoSQL", "MongoDB",
        "query optimisation", "index", "view", "stored procedure"
      ]
    },
    {
      id: "networking",
      label: "Networking & Internet",
      keywords: [
        "TCP/IP", "OSI model", "protocol", "packet", "routing", "IP address",
        "subnet", "DNS", "HTTP", "HTTPS", "TLS", "SSL", "socket",
        "client-server", "peer-to-peer", "firewall", "proxy", "VPN",
        "bandwidth", "latency", "throughput", "LAN", "WAN", "cloud"
      ]
    },
    {
      id: "security",
      label: "Security & Cryptography",
      keywords: [
        "encryption", "decryption", "symmetric", "asymmetric", "public key",
        "private key", "RSA", "AES", "cipher", "hash function", "SHA",
        "digital signature", "certificate", "PKI", "authentication",
        "authorisation", "SQL injection", "XSS", "buffer overflow",
        "penetration testing", "social engineering", "malware"
      ]
    },
    {
      id: "theory",
      label: "Theory of Computation",
      keywords: [
        "finite automaton", "FSM", "state machine", "Turing machine",
        "regular language", "context-free grammar", "BNF", "parse tree",
        "compiler", "interpreter", "lexer", "parser", "token",
        "halting problem", "decidable", "undecidable", "NP-complete",
        "regular expression"
      ]
    }
  ]
};
