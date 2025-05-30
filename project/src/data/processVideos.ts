interface ProcessVideo {
  processName: string;
  videoUrl: string;
  description: string;
}

export const processVideos: Record<string, ProcessVideo> = {
  'CNC Milling': {
    processName: 'CNC Milling Process',
    videoUrl: 'https://www.youtube.com/watch?v=jF4F8Zr2YO8',
    description: 'Advanced CNC Milling Process'
  },
  'Investment Casting': {
    processName: 'Investment Casting Process',
    videoUrl: 'https://www.youtube.com/watch?v=E8vOxnZPeJk',
    description: 'Investment Casting Manufacturing Process'
  },
  'Die Casting': {
    processName: 'Die Casting Process',
    videoUrl: 'https://www.youtube.com/watch?v=S5vGNwMnJQg',
    description: 'Die Casting Manufacturing Process'
  },
  'Sand Casting': {
    processName: 'Sand Casting Process',
    videoUrl: 'https://www.youtube.com/watch?v=J_A6LzQI0Ek',
    description: 'Sand Casting Manufacturing Process'
  },
  'FDM': {
    processName: 'FDM 3D Printing Process',
    videoUrl: 'https://www.youtube.com/watch?v=WHO6G67GJbM',
    description: 'FDM 3D Printing Process'
  },
  'SLA': {
    processName: 'SLA 3D Printing Process',
    videoUrl: 'https://www.youtube.com/watch?v=yW4EbCWaJaE',
    description: 'SLA 3D Printing Process'
  },
  'Injection Molding': {
    processName: 'Injection Molding Process',
    videoUrl: 'https://www.youtube.com/watch?v=RMjtmsr3CqA',
    description: 'Plastic Injection Molding Process'
  },
  'Sheet Metal Fabrication': {
    processName: 'Sheet Metal Fabrication Process',
    videoUrl: 'https://www.youtube.com/watch?v=KqSamVg-MBk',
    description: 'Sheet Metal Manufacturing Process'
  },
  'Metal DMLS': {
    processName: 'Metal DMLS Process',
    videoUrl: 'https://www.youtube.com/watch?v=yiUUZxp7bLQ',
    description: 'Direct Metal Laser Sintering Process'
  },
  'CNC Machining': {
    processName: 'CNC Machining Process',
    videoUrl: 'https://www.youtube.com/watch?v=jF4F8Zr2YO8',
    description: 'CNC Machining Manufacturing Process'
  },
  '3D Printing': {
    processName: '3D Printing Process',
    videoUrl: 'https://www.youtube.com/watch?v=WHO6G67GJbM',
    description: '3D Printing Manufacturing Process'
  },
  '3D Printing (FDM/SLA)': {
    processName: '3D Printing Process',
    videoUrl: 'https://www.youtube.com/watch?v=WHO6G67GJbM',
    description: '3D Printing Manufacturing Process'
  },
  'Vacuum Forming': {
    processName: 'Vacuum Forming Process',
    videoUrl: 'https://www.youtube.com/watch?v=MUoJWfHCA8k',
    description: 'Vacuum Forming Manufacturing Process'
  },
  'Compression Molding': {
    processName: 'Compression Molding Process',
    videoUrl: 'https://www.youtube.com/watch?v=4sZtOeFPTX4',
    description: 'Compression Molding Manufacturing Process'
  },
  'CNC Wood Routing': {
    processName: 'CNC Wood Routing Process',
    videoUrl: 'https://www.youtube.com/watch?v=OCgfR1rGNUk',
    description: 'CNC Wood Routing Manufacturing Process'
  }
};