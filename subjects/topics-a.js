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
        "completing the square", "roots", "simultaneous", "surds",
        // additional keywords / synonyms
        "algebraic long division", "synthetic division", "rational roots",
        "natural numbers", "real numbers", "complex roots", "conjugate roots",
        "product of roots", "sum of roots", "Vieta's formulas",
        "log rules", "laws of logarithm", "change of base", "ln",
        "natural log", "exponential equation", "logarithmic equation",
        "absolute value", "modulus inequality", "critical values",
        "AP", "GP", "arithmetic mean", "geometric mean",
        "convergent series", "divergent series", "sigma notation",
        "nCr", "binomial coefficient", "Pascal's triangle"
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
        "tangent", "normal", "second derivative",
        // additional keywords / synonyms
        "dy/dx", "d²y/dx²", "f'(x)", "f''(x)", "gradient function",
        "first principles", "limit", "small angle approximation",
        "connected rates of change", "related rates", "implicit differentiation",
        "parametric differentiation", "integration by parts",
        "integration by substitution", "integration by partial fractions",
        "separable differential equation", "differential equation",
        "general solution", "particular solution", "initial condition",
        "trapezium rule", "numerical integration", "area between curves",
        "volume of solid of revolution", "kinematics calculus"
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
        "trigonometric equation", "general solution", "period", "amplitude",
        // additional keywords / synonyms
        "reciprocal trigonometric", "Pythagorean identity",
        "sin²θ + cos²θ = 1", "sec²θ", "cosec²θ",
        "addition formula", "double angle formula", "half angle formula",
        "R sin(θ + α)", "R cos(θ + α)", "harmonic form",
        "sin(A ± B)", "cos(A ± B)", "tan(A ± B)",
        "exact values", "special angles", "30°", "45°", "60°",
        "solving trig equations", "trig graph", "sin graph", "cos graph",
        "phase shift", "vertical shift"
      ]
    },
    {
      id: "pure-functions",
      label: "Pure – Functions & Graphs",
      keywords: [
        "function", "domain", "range", "one-to-one", "onto", "bijection",
        "composite", "inverse function", "even", "odd", "periodic",
        "transformation", "translation", "stretch", "reflection", "asymptote",
        "modulus function", "graph", "sketch", "intercept", "intersection",
        // additional keywords / synonyms
        "f(x)", "g(x)", "fg(x)", "gf(x)", "f⁻¹(x)",
        "mapping", "many-to-one", "one-to-many", "function notation",
        "vertical line test", "horizontal line test",
        "self-inverse", "piecewise", "defined function",
        "graph transformation", "y = f(x+a)", "y = f(x) + a",
        "y = af(x)", "y = f(ax)", "y = -f(x)", "y = f(-x)",
        "graph of |f(x)|", "solve graphically", "number of solutions"
      ]
    },
    {
      id: "pure-vectors",
      label: "Pure – Vectors",
      keywords: [
        "vector", "position vector", "unit vector", "scalar product",
        "dot product", "magnitude", "direction", "parallel", "perpendicular",
        "collinear", "angle between vectors", "3D", "three-dimensional",
        "i j k", "component",
        // additional keywords / synonyms
        "displacement vector", "direction vector", "ratio theorem",
        "section formula", "midpoint", "vector equation of line",
        "equation of line in 3D", "skew lines", "intersecting lines",
        "distance from point to line", "angle between lines",
        "lambda", "parameter", "cartesian form", "column notation",
        "a·b", "i-component", "j-component", "k-component",
        "perpendicular vectors", "zero vector"
      ]
    },
    {
      id: "pure-numerical",
      label: "Pure – Numerical Methods",
      keywords: [
        "numerical method", "Newton-Raphson", "iteration", "iterative",
        "bisection", "convergence", "fixed point", "error bound",
        "root finding", "staircase diagram", "cobweb diagram",
        // additional keywords / synonyms
        "change of sign", "sign change", "root", "approximate root",
        "interval bisection", "decimal search", "xₙ₊₁ = g(xₙ)",
        "iterative formula", "convergent iteration", "divergent iteration",
        "Newton Raphson formula", "f(x) = 0", "gradient descent",
        "absolute error", "relative error", "percentage error",
        "number of iterations"
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
        "discrete random variable",
        // additional keywords / synonyms
        "random variable", "probability distribution", "PDF", "CDF",
        "P(X = x)", "P(X < x)", "P(X ≤ x)", "P(X > x)",
        "B(n, p)", "N(μ, σ²)", "Po(λ)", "standardise", "z-score",
        "standard normal", "Φ(z)", "normal approximation",
        "Poisson approximation", "continuity correction",
        "null hypothesis", "alternative hypothesis", "H₀", "H₁",
        "critical region", "test statistic", "one-tailed", "two-tailed",
        "Type I error", "Type II error", "nCr", "nPr",
        "product rule", "addition rule", "Venn diagram",
        "sample mean", "unbiased estimate", "sample variance",
        "population", "sample", "census", "sampling method",
        "stratified", "systematic", "simple random", "cluster"
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
        "angular velocity", "simple harmonic motion", "SHM",
        // additional keywords / synonyms
        "Newton's laws", "F = ma", "resultant force", "net force",
        "resolving forces", "resolve", "component of force",
        "limiting friction", "smooth surface", "rough surface",
        "light string", "inextensible string", "pulleys", "wedge",
        "lamina", "centre of gravity", "couple", "coplanar forces",
        "Lami's theorem", "triangle of forces",
        "v = u + at", "s = ut + ½at²", "v² = u² + 2as",
        "range of projectile", "maximum height", "time of flight",
        "conservation of energy", "conservation of momentum",
        "kinetic energy", "potential energy", "work done",
        "power output", "efficiency", "angular displacement",
        "angular acceleration", "centripetal acceleration",
        "period of circular motion", "amplitude", "frequency",
        "restoring force", "Hooke's law"
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
        "significant figure", "scalar", "vector", "order of magnitude",
        // additional keywords / synonyms
        "absolute uncertainty", "percentage uncertainty", "fractional uncertainty",
        "combining uncertainties", "error bar", "reading error",
        "parallax error", "zero error", "calibration", "sensitivity",
        "resolution", "range", "repeatability", "reproducibility",
        "dimensional analysis", "homogeneity", "fundamental quantity",
        "kilogram", "metre", "second", "ampere", "kelvin", "mole", "candela"
      ]
    },
    {
      id: "kinematics",
      label: "Kinematics",
      keywords: [
        "displacement", "velocity", "acceleration", "SUVAT", "uniform acceleration",
        "projectile", "free fall", "speed-time graph", "displacement-time graph",
        "gradient", "area under graph",
        // additional keywords / synonyms
        "v-t graph", "s-t graph", "a-t graph", "deceleration",
        "terminal velocity", "initial velocity", "final velocity",
        "horizontal component", "vertical component", "time of flight",
        "range of projectile", "maximum height", "relative velocity",
        "relative motion", "instantaneous velocity", "average velocity",
        "v = u + at", "s = ut + ½at²", "v² = u² + 2as",
        "non-uniform acceleration", "variable acceleration"
      ]
    },
    {
      id: "dynamics",
      label: "Dynamics",
      keywords: [
        "force", "Newton's law", "mass", "weight", "friction", "normal reaction",
        "tension", "thrust", "momentum", "impulse", "conservation of momentum",
        "elastic collision", "inelastic collision", "centre of mass",
        // additional keywords / synonyms
        "Newton's first law", "Newton's second law", "Newton's third law",
        "F = ma", "resultant force", "net force", "drag", "air resistance",
        "terminal velocity", "free body diagram", "resolving forces",
        "connected particles", "Atwood machine", "inclined plane",
        "coefficient of friction", "limiting friction", "smooth surface",
        "rough surface", "linear momentum", "change in momentum",
        "rate of change of momentum", "impulse-momentum theorem",
        "conservation of linear momentum", "perfectly elastic",
        "perfectly inelastic", "coefficient of restitution"
      ]
    },
    {
      id: "work-energy",
      label: "Work, Energy & Power",
      keywords: [
        "work done", "kinetic energy", "potential energy", "gravitational",
        "elastic", "conservation of energy", "power", "efficiency",
        "work-energy theorem",
        // additional keywords / synonyms
        "gravitational potential energy", "elastic potential energy",
        "chemical energy", "thermal energy", "nuclear energy",
        "energy transfer", "energy conversion", "dissipation",
        "W = Fd", "W = Fs cos θ", "KE = ½mv²", "GPE = mgh",
        "P = Fv", "P = W/t", "useful energy", "wasted energy",
        "Sankey diagram", "energy source", "renewable", "non-renewable",
        "mechanical energy"
      ]
    },
    {
      id: "matter",
      label: "Matter & Materials",
      keywords: [
        "density", "pressure", "upthrust", "Archimedes", "Young's modulus",
        "stress", "strain", "elastic limit", "Hooke's law", "spring constant",
        "tensile", "compressive", "brittle", "ductile", "plastic", "viscosity",
        // additional keywords / synonyms
        "elastic deformation", "plastic deformation", "yield point",
        "ultimate tensile stress", "UTS", "fracture", "stiffness",
        "extension", "compression", "load", "force-extension graph",
        "stress-strain graph", "area under force-extension", "elastic strain energy",
        "fluid", "pressure in fluid", "hydrostatic pressure", "buoyancy",
        "Stokes' law", "terminal velocity in fluid", "drag force",
        "laminar flow", "turbulent flow"
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
        "electromagnetic spectrum", "doppler effect",
        // additional keywords / synonyms
        "constructive interference", "destructive interference",
        "path difference", "phase difference", "coherent source",
        "monochromatic light", "fringe spacing", "fringe width",
        "slit separation", "order of maximum", "diffraction pattern",
        "transverse wave", "longitudinal wave", "compression", "rarefaction",
        "wavefront", "Huygens' principle", "refraction", "reflection",
        "total internal reflection", "Snell's law", "refractive index",
        "critical angle", "wave speed", "v = fλ", "period",
        "plane polarised", "Malus's law", "brewster's angle",
        "stationary wave pattern", "harmonics", "fundamental frequency",
        "overtone", "resonance", "Doppler shift", "red shift", "blue shift",
        "speed of sound", "speed of light"
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
        "discharging", "time constant",
        // additional keywords / synonyms
        "Kirchhoff's first law", "Kirchhoff's second law",
        "junction rule", "loop rule", "charge carrier", "electron drift",
        "drift velocity", "number density", "I = nAve", "V = IR",
        "P = IV", "P = I²R", "P = V²/R", "Q = CV", "E = ½CV²",
        "Q = It", "W = QV", "R = ρL/A", "resistivity",
        "temperature coefficient", "superconductivity", "Wheatstone bridge",
        "potential divider", "potentiometer", "terminal potential difference",
        "lost volts", "maximum power transfer",
        "RC circuit", "CR circuit", "exponential decay", "τ = RC",
        "charging capacitor", "discharging capacitor"
      ]
    },
    {
      id: "fields",
      label: "Fields",
      keywords: [
        "gravitational field", "electric field", "magnetic field",
        "field strength", "flux", "potential", "Coulomb", "Newton's law of gravitation",
        "inverse square law", "equipotential", "field line", "orbit",
        "geostationary", "satellite", "centripetal", "escape velocity",
        // additional keywords / synonyms
        "gravitational field strength", "g = GM/r²", "gravitational potential",
        "V = -GM/r", "gravitational potential energy", "GPE = -GMm/r",
        "electric field strength", "E = F/Q", "E = V/d", "E = kQ/r²",
        "electric potential", "V = kQ/r", "Coulomb's law", "F = kQ₁Q₂/r²",
        "permittivity", "ε₀", "radial field", "uniform field",
        "point charge", "charged sphere", "capacitor plates",
        "field between parallel plates", "orbital speed", "orbital period",
        "Kepler's third law", "T² ∝ r³", "geosynchronous orbit",
        "low Earth orbit", "orbital mechanics"
      ]
    },
    {
      id: "electromagnetism",
      label: "Electromagnetism",
      keywords: [
        "magnetic flux density", "flux linkage", "Faraday", "Lenz",
        "induced EMF", "transformer", "motor", "generator", "alternating current",
        "rms", "peak", "solenoid", "toroid", "Hall effect", "cyclotron",
        // additional keywords / synonyms
        "Faraday's law", "Lenz's law", "electromagnetic induction",
        "flux change", "rate of change of flux", "ε = -dΦ/dt",
        "Φ = BA", "flux linkage = NΦ", "B = μ₀nI",
        "force on current-carrying conductor", "F = BIL", "F = BIL sinθ",
        "force on moving charge", "F = BQv", "F = BQv sinθ",
        "magnetic force", "magnetic field of solenoid",
        "step-up transformer", "step-down transformer", "turns ratio",
        "V₁/V₂ = N₁/N₂", "transformer efficiency", "eddy currents",
        "peak voltage", "peak current", "Vrms", "Irms",
        "Vrms = V₀/√2", "power in AC circuit", "P = Vrms × Irms",
        "Hall voltage", "Hall probe", "cyclotron frequency"
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
        "ionisation", "detector",
        // additional keywords / synonyms
        "alpha particle", "beta minus", "beta plus", "positron",
        "antineutrino", "neutrino", "nuclear equation", "atomic number",
        "mass number", "nucleon number", "proton number",
        "strong nuclear force", "weak nuclear force", "electromagnetic force",
        "fundamental forces", "up quark", "down quark", "strange quark",
        "charge of quark", "conservation of charge", "conservation of baryon number",
        "conservation of lepton number", "pair production", "annihilation",
        "nuclear stability", "binding energy per nucleon",
        "activity", "decay constant", "A = λN", "N = N₀e^{-λt}",
        "A = A₀e^{-λt}", "count rate", "Geiger-Müller", "cloud chamber",
        "spark chamber", "linear accelerator", "synchrotron",
        "chain reaction", "critical mass", "moderator", "control rod", "coolant"
      ]
    },
    {
      id: "quantum",
      label: "Quantum Physics",
      keywords: [
        "photon", "photoelectric effect", "work function", "threshold frequency",
        "de Broglie", "wave-particle duality", "electron diffraction",
        "energy level", "emission spectrum", "absorption spectrum",
        "Planck's constant", "quantum", "momentum of photon",
        // additional keywords / synonyms
        "quantum theory", "photon energy", "E = hf", "E = hc/λ",
        "p = h/λ", "de Broglie wavelength", "wave nature of particles",
        "particle nature of waves", "photoelectron", "stopping potential",
        "kinetic energy of photoelectron", "h = 6.63 × 10⁻³⁴",
        "Planck constant", "electron volt", "eV", "ionisation energy",
        "excitation", "ground state", "excited state",
        "line spectrum", "spectral line", "visible spectrum",
        "hydrogen spectrum", "Lyman series", "Balmer series",
        "stimulated emission", "spontaneous emission", "laser",
        "coherent light", "population inversion"
      ]
    }
  ],

  "computer-science": [
    {
      id: "thinking",
      label: "Computational Thinking",
      keywords: [
        "abstraction", "decomposition", "generalisation", "pattern recognition",
        "algorithm", "problem solving", "computational thinking",
        // additional keywords / synonyms
        "top-down design", "modular design", "stepwise refinement",
        "problem decomposition", "identify the problem", "sub-problem",
        "reusable", "general solution", "problem representation",
        "modelling", "simulation", "data abstraction", "procedural abstraction",
        "automation", "logical thinking", "systematic approach"
      ]
    },
    {
      id: "data-structures",
      label: "Data Structures",
      keywords: [
        "array", "stack", "queue", "linked list", "binary tree", "graph",
        "hash table", "dictionary", "record", "pointer", "node", "traversal",
        "in-order", "pre-order", "post-order", "push", "pop", "enqueue", "dequeue",
        "depth-first", "breadth-first", "heap", "priority queue",
        // additional keywords / synonyms
        "one-dimensional array", "two-dimensional array", "multi-dimensional array",
        "static data structure", "dynamic data structure", "abstract data type",
        "ADT", "singly linked list", "doubly linked list", "circular linked list",
        "binary search tree", "BST", "AVL tree", "balanced tree",
        "left child", "right child", "parent node", "leaf node", "root node",
        "adjacency matrix", "adjacency list", "weighted graph", "directed graph",
        "undirected graph", "spanning tree", "minimum spanning tree",
        "hash function", "collision", "chaining", "linear probing",
        "open addressing", "closed addressing", "load factor",
        "LIFO", "FIFO", "front", "rear", "top of stack", "underflow", "overflow",
        "circular queue", "priority order", "max heap", "min heap"
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
        "backtracking", "heuristic", "optimisation",
        // additional keywords / synonyms
        "Big O notation", "O(1)", "O(n log n)", "O(2^n)", "O(n!)",
        "best case", "worst case", "average case", "time complexity analysis",
        "space complexity analysis", "algorithm efficiency",
        "selection sort", "heap sort", "shell sort", "radix sort",
        "counting sort", "comparison sort", "stable sort", "in-place sort",
        "sequential search", "interpolation search", "hash search",
        "base case", "recursive case", "call stack", "memoisation", "memoization",
        "tabulation", "optimal substructure", "overlapping subproblems",
        "greedy algorithm", "activity selection", "fractional knapsack",
        "0/1 knapsack", "shortest path", "Dijkstra", "Bellman-Ford",
        "Floyd-Warshall", "Prim's algorithm", "Kruskal's algorithm",
        "A* algorithm", "nearest neighbour", "travelling salesman"
      ]
    },
    {
      id: "programming",
      label: "Programming Paradigms",
      keywords: [
        "object-oriented", "class", "object", "inheritance", "polymorphism",
        "encapsulation", "abstraction", "method", "attribute", "constructor",
        "functional programming", "procedural", "declarative", "overloading",
        "overriding", "interface", "abstract class",
        // additional keywords / synonyms
        "OOP", "object-oriented programming", "instantiation", "instance",
        "subclass", "superclass", "base class", "derived class", "parent class",
        "child class", "multiple inheritance", "single inheritance",
        "method overriding", "method overloading", "operator overloading",
        "getter", "setter", "accessor", "mutator", "private", "public", "protected",
        "static method", "static attribute", "virtual method",
        "pure virtual", "abstract method", "concrete class",
        "lambda function", "higher-order function", "first-class function",
        "closure", "recursion", "tail recursion", "map", "filter", "reduce",
        "immutable", "side effect", "pure function", "functor",
        "imperative programming", "event-driven programming", "concurrency",
        "parallel programming", "multithreading"
      ]
    },
    {
      id: "hardware",
      label: "Hardware & Architecture",
      keywords: [
        "CPU", "processor", "fetch-decode-execute", "pipeline", "cache",
        "RISC", "CISC", "register", "bus", "von Neumann", "Harvard",
        "interrupt", "polling", "DMA", "virtual memory", "paging",
        "segmentation", "thrashing", "GPU", "parallel processing",
        // additional keywords / synonyms
        "central processing unit", "arithmetic logic unit", "ALU",
        "control unit", "CU", "program counter", "PC", "accumulator", "ACC",
        "memory address register", "MAR", "memory data register", "MDR",
        "current instruction register", "CIR", "status register",
        "clock speed", "GHz", "multi-core", "word length", "address bus",
        "data bus", "control bus", "bus width", "memory hierarchy",
        "L1 cache", "L2 cache", "L3 cache", "hit rate", "miss rate",
        "direct mapped cache", "fully associative", "set associative",
        "RAM", "ROM", "flash memory", "DRAM", "SRAM",
        "instruction set architecture", "ISA", "opcode", "operand",
        "addressing mode", "immediate addressing", "direct addressing",
        "indirect addressing", "indexed addressing",
        "pipeline stages", "pipeline hazard", "data hazard", "control hazard",
        "branch prediction", "out-of-order execution", "superscalar",
        "coprocessor", "FPGA", "embedded system", "IoT"
      ]
    },
    {
      id: "os",
      label: "Operating Systems",
      keywords: [
        "operating system", "process", "thread", "scheduling", "round robin",
        "priority scheduling", "deadlock", "semaphore", "mutex", "memory management",
        "file system", "virtual memory", "paging", "kernel", "shell",
        "device driver", "interrupt",
        // additional keywords / synonyms
        "OS", "multitasking", "multiprogramming", "time-sharing",
        "batch processing", "real-time OS", "embedded OS",
        "process state", "ready", "running", "blocked", "terminated",
        "process control block", "PCB", "context switching",
        "first come first served", "FCFS", "shortest job first", "SJF",
        "shortest remaining time", "SRT", "multilevel queue",
        "Banker's algorithm", "resource allocation graph",
        "circular wait", "mutual exclusion", "hold and wait", "no preemption",
        "critical section", "race condition", "locking", "spinlock",
        "monitors", "condition variable", "producer-consumer problem",
        "readers-writers problem", "dining philosophers",
        "page table", "page fault", "frame", "swap space",
        "logical address", "physical address", "memory allocation",
        "fragmentation", "compaction", "garbage collection",
        "FAT", "NTFS", "ext4", "inode", "directory", "path"
      ]
    },
    {
      id: "databases",
      label: "Databases",
      keywords: [
        "relational database", "SQL", "normalisation", "normalization", "1NF", "2NF", "3NF",
        "BCNF", "entity", "relationship", "ERD", "primary key", "foreign key",
        "transaction", "ACID", "concurrent", "locking", "NoSQL", "MongoDB",
        "query optimisation", "index", "view", "stored procedure",
        // additional keywords / synonyms
        "database management system", "DBMS", "relational model",
        "entity-relationship diagram", "ER diagram", "cardinality",
        "one-to-one relationship", "one-to-many relationship", "many-to-many relationship",
        "functional dependency", "partial dependency", "transitive dependency",
        "unnormalised form", "UNF", "first normal form", "second normal form",
        "third normal form", "Boyce-Codd normal form", "data redundancy",
        "data anomaly", "insertion anomaly", "deletion anomaly", "update anomaly",
        "atomicity", "consistency", "isolation", "durability",
        "serialisability", "serializability", "commit", "rollback",
        "deadlock in database", "concurrency control", "timestamp ordering",
        "two-phase locking", "optimistic concurrency", "pessimistic concurrency",
        "SELECT FROM WHERE", "JOIN ON", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
        "FULL OUTER JOIN", "GROUP BY HAVING", "ORDER BY ASC DESC",
        "CREATE", "ALTER", "DROP", "INSERT INTO", "UPDATE SET", "DELETE FROM",
        "aggregate function", "COUNT", "SUM", "AVG", "MAX", "MIN",
        "subquery", "nested query", "query plan", "execution plan",
        "B-tree index", "clustered index", "non-clustered index",
        "materialized view", "trigger", "function", "cursor"
      ]
    },
    {
      id: "networking",
      label: "Networking & Internet",
      keywords: [
        "TCP/IP", "OSI model", "protocol", "packet", "routing", "IP address",
        "subnet", "DNS", "HTTP", "HTTPS", "TLS", "SSL", "socket",
        "client-server", "peer-to-peer", "firewall", "proxy", "VPN",
        "bandwidth", "latency", "throughput", "LAN", "WAN", "cloud",
        // additional keywords / synonyms
        "seven-layer OSI", "application layer", "presentation layer",
        "session layer", "transport layer", "network layer", "data link layer",
        "physical layer", "TCP", "UDP", "IP", "ARP", "ICMP",
        "IPv4", "IPv6", "subnet mask", "CIDR", "DHCP", "NAT",
        "MAC address", "Ethernet", "Wi-Fi", "802.11", "Bluetooth",
        "packet header", "packet payload", "fragmentation", "reassembly",
        "routing table", "routing protocol", "RIP", "OSPF", "BGP",
        "switch", "router", "hub", "bridge", "gateway", "repeater",
        "collision domain", "broadcast domain", "VLAN",
        "three-way handshake", "SYN", "ACK", "FIN",
        "port number", "well-known port", "ephemeral port",
        "HTTP request", "HTTP response", "REST API", "web service",
        "email protocol", "SMTP", "POP3", "IMAP",
        "network security", "intrusion detection", "honeypot"
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
        "penetration testing", "social engineering", "malware",
        // additional keywords / synonyms
        "symmetric key encryption", "asymmetric key encryption",
        "public key infrastructure", "Certificate Authority", "CA",
        "SSL certificate", "TLS handshake", "key exchange",
        "Diffie-Hellman", "elliptic curve", "Caesar cipher",
        "Vigenère cipher", "one-time pad", "block cipher", "stream cipher",
        "DES", "3DES", "AES-128", "AES-256", "MD5", "SHA-1", "SHA-256",
        "HMAC", "message authentication code", "MAC",
        "non-repudiation", "integrity", "confidentiality", "availability",
        "CIA triad", "access control list", "ACL", "role-based access control", "RBAC",
        "zero-day exploit", "vulnerability", "patch", "security audit",
        "SQL injection attack", "cross-site scripting", "cross-site request forgery",
        "CSRF", "man-in-the-middle attack", "phishing", "spear phishing",
        "brute force attack", "dictionary attack", "rainbow table",
        "salting", "hashing password", "key derivation function", "PBKDF2"
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
        "regular expression",
        // additional keywords / synonyms
        "finite state machine", "deterministic finite automaton", "DFA",
        "non-deterministic finite automaton", "NFA", "epsilon transition",
        "state diagram", "state table", "transition function",
        "accepting state", "start state", "final state",
        "regular grammar", "context-sensitive grammar",
        "Chomsky hierarchy", "type 0", "type 1", "type 2", "type 3",
        "Backus-Naur form", "EBNF", "syntax diagram", "railroad diagram",
        "derivation", "sentential form", "terminal", "non-terminal",
        "ambiguous grammar", "left recursion", "right recursion",
        "lexical analysis", "tokenisation", "tokenization", "scanning",
        "syntax analysis", "semantic analysis", "code generation",
        "symbol table", "abstract syntax tree", "AST",
        "P vs NP", "polynomial time", "exponential time",
        "tractable", "intractable", "NP-hard",
        "Church-Turing thesis", "computability", "recursive function",
        "pushdown automaton", "PDA", "stack machine"
      ]
    }
  ]
};
