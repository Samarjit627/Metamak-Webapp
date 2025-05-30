import { Vendor } from '../types/manufacturing';

export const vendors: Vendor[] = [
  {
    id: 'pti-001',
    name: 'Precision Tech Industries',
    location: {
      city: 'Pune',
      state: 'Maharashtra'
    },
    specialties: ['CNC Machining', 'Die Casting', 'Precision Engineering'],
    certifications: ['ISO 9001:2015', 'AS9100D'],
    rating: 4.8,
    reviews: 127,
    minOrderValue: 50000,
    leadTime: '2-3 weeks',
    description: 'Leading manufacturer of precision components with over 15 years of experience.',
    processes: ['CNC Machining', 'Die Casting', 'Sheet Metal Fabrication'],
    materials: ['Aluminum', 'Steel', 'Stainless Steel', 'Brass'],
    image: 'https://images.unsplash.com/photo-1581091226825-c6a89e7e4801?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'rms-002',
    name: 'Rapid Manufacturing Solutions',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka'
    },
    specialties: ['Rapid Prototyping', '3D Printing', 'Low Volume Production'],
    certifications: ['ISO 9001:2015'],
    rating: 4.9,
    reviews: 89,
    minOrderValue: 25000,
    leadTime: '1-2 weeks',
    description: 'Specializing in rapid prototyping and low-volume production using advanced manufacturing technologies.',
    processes: ['3D Printing', 'CNC Machining', 'Injection Molding'],
    materials: ['Plastics', 'Aluminum', 'Steel', 'Engineering Polymers'],
    image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=300&q=80'
  }
];