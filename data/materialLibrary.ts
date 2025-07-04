export const materialLibrary = [
  {
    category: "Plastic",
    name: "ABS",
    subtypes: ["Natural", "Black", "FR"],
    properties: {
      tensileStrength: "40 MPa",
      temperatureResistance: "85°C",
      machinability: "Good"
    },
    compatibleProcesses: ["Injection Molding", "3D Printing", "CNC Machining"],
    bestFor: ["Housings", "Prototypes", "Consumer Products"]
  },
  {
    category: "Plastic",
    name: "Polycarbonate (PC)",
    subtypes: ["Clear", "UV-Resistant"],
    properties: {
      tensileStrength: "60 MPa",
      temperatureResistance: "125°C",
      machinability: "Fair"
    },
    compatibleProcesses: ["Injection Molding", "3D Printing"],
    bestFor: ["Lenses", "Impact-resistant housings"]
  },
  {
    category: "Plastic",
    name: "Polypropylene (PP)",
    subtypes: ["Copolymer", "Homopolymer"],
    properties: {
      tensileStrength: "30 MPa",
      temperatureResistance: "100°C",
      machinability: "Poor"
    },
    compatibleProcesses: ["Injection Molding", "Blow Molding"],
    bestFor: ["Containers", "Living hinges", "Automotive"]
  },
  {
    category: "Plastic",
    name: "Nylon 6",
    subtypes: ["Unfilled", "Glass-Filled"],
    properties: {
      tensileStrength: "75 MPa",
      temperatureResistance: "130°C",
      machinability: "Good"
    },
    compatibleProcesses: ["Injection Molding", "CNC Machining"],
    bestFor: ["Gears", "Bearings", "Bushings"]
  },
  {
    category: "Metal",
    name: "Aluminum 6061",
    subtypes: ["T6", "T651", "Anodized"],
    properties: {
      tensileStrength: "310 MPa",
      temperatureResistance: "160°C",
      machinability: "Excellent"
    },
    compatibleProcesses: ["CNC Machining", "Die Casting"],
    bestFor: ["Frames", "Heat Sinks", "Structural parts"]
  },
  {
    category: "Metal",
    name: "Stainless Steel 304",
    subtypes: ["Annealed", "Pickled", "Bright"],
    properties: {
      tensileStrength: "505 MPa",
      temperatureResistance: "870°C",
      machinability: "Moderate"
    },
    compatibleProcesses: ["CNC Machining", "Sheet Metal", "Welding"],
    bestFor: ["Screws", "Food-grade parts", "Architectural"]
  },
  {
    category: "Metal",
    name: "Brass C360",
    subtypes: ["Free Machining"],
    properties: {
      tensileStrength: "350 MPa",
      temperatureResistance: "200°C",
      machinability: "Excellent"
    },
    compatibleProcesses: ["CNC Machining", "Casting"],
    bestFor: ["Valves", "Fittings", "Decorative parts"]
  },
  {
    category: "Rubber",
    name: "EPDM",
    subtypes: ["UV Resistant", "Weather Grade"],
    properties: {
      tensileStrength: "15 MPa",
      temperatureResistance: "120°C",
      machinability: "Poor"
    },
    compatibleProcesses: ["Compression Molding", "Injection Molding"],
    bestFor: ["Seals", "Gaskets", "Weather Stripping"]
  },
  {
    category: "Rubber",
    name: "Nitrile (Buna-N)",
    subtypes: ["Fuel Grade", "70A"],
    properties: {
      tensileStrength: "18 MPa",
      temperatureResistance: "110°C",
      machinability: "Poor"
    },
    compatibleProcesses: ["Molding"],
    bestFor: ["Fuel Seals", "O-Rings"]
  },
  {
    category: "Rubber",
    name: "Silicone",
    subtypes: ["Medical Grade", "Translucent"],
    properties: {
      tensileStrength: "10 MPa",
      temperatureResistance: "200°C",
      machinability: "Poor"
    },
    compatibleProcesses: ["Molding"],
    bestFor: ["Medical devices", "High-temp gaskets"]
  },
  {
    category: "Wood",
    name: "Birch Plywood",
    subtypes: ["Furniture Grade", "Laser Grade"],
    properties: {
      tensileStrength: "N/A",
      temperatureResistance: "N/A",
      machinability: "Good"
    },
    compatibleProcesses: ["Laser Cutting", "CNC Routing"],
    bestFor: ["Furniture", "Prototypes", "Signage"]
  },
  {
    category: "Wood",
    name: "MDF",
    subtypes: ["Standard", "Moisture Resistant"],
    properties: {
      tensileStrength: "N/A",
      temperatureResistance: "N/A",
      machinability: "Excellent"
    },
    compatibleProcesses: ["Routing", "Lamination"],
    bestFor: ["Cabinetry", "Displays"]
  },
  {
    category: "Composite",
    name: "FR4",
    subtypes: ["Glass Epoxy", "Flame-Retardant"],
    properties: {
      tensileStrength: "300 MPa",
      temperatureResistance: "130°C",
      machinability: "Moderate"
    },
    compatibleProcesses: ["CNC Machining", "Lamination"],
    bestFor: ["PCBs", "Insulators"]
  },
  {
    category: "Composite",
    name: "Carbon Fiber Reinforced",
    subtypes: ["Unidirectional", "Woven"],
    properties: {
      tensileStrength: "600 MPa",
      temperatureResistance: "150°C",
      machinability: "Difficult"
    },
    compatibleProcesses: ["Lamination", "Layup"],
    bestFor: ["Lightweight structures", "Motorsports"]
  },
  {
    category: "3D Printing",
    name: "PLA",
    subtypes: ["Natural", "Silk", "Matte"],
    properties: {
      tensileStrength: "50 MPa",
      temperatureResistance: "60°C",
      machinability: "Poor"
    },
    compatibleProcesses: ["FDM Printing"],
    bestFor: ["Prototypes", "Toys", "Containers"]
  },
  {
    category: "3D Printing",
    name: "PETG",
    subtypes: ["Transparent", "Carbon-Filled"],
    properties: {
      tensileStrength: "55 MPa",
      temperatureResistance: "80°C",
      machinability: "Poor"
    },
    compatibleProcesses: ["FDM Printing"],
    bestFor: ["Containers", "Functional prints"]
  },
  {
    category: "3D Printing",
    name: "Resin",
    subtypes: ["Standard", "Tough", "Flexible"],
    properties: {
      tensileStrength: "30–80 MPa",
      temperatureResistance: "100°C",
      machinability: "Post-processing required"
    },
    compatibleProcesses: ["SLA/DLP Printing"],
    bestFor: ["Models", "Dental", "Miniatures"]
  }
];
