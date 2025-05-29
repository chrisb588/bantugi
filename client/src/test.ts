import Report from '@/interfaces/report';
import Area from '@/interfaces/area'; // Import Area interface

export const sampleResults: Report[] = [
    {
      id: "1",
      status: 'Being Addressed',
      title: 'MAJOR FLOODING DOWNTOWN',
      urgency: "High",
      location: {
        address: {
          id: 1,
          barangay: 'Main St & Central Ave',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Severe flooding reported, roads impassable. Avoid area. Emergency services dispatched.',
      category: 'Flood Alert',
      createdAt: new Date('2023-10-01T08:00:00Z'),
      creator: {
        username: "Juan Dela Cruz",
        profilePicture: "/img/avatar.png"
      },
    },
    {
      id: "2",
      status: 'Being Addressed',
      title: 'Power Maintenance Scheduled',
      urgency: "Medium",
      location: {
        address: {
          id: 1,
          barangay: 'Main St & Central Ave',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Power outage expected from 1 PM to 5 PM today for urgent maintenance work. Please prepare accordingly.',
      category: 'Utility Work',
      createdAt: new Date('2023-10-01T08:00:00Z'),
      creator: {
        username: "Juan Dela Cruz",
        profilePicture: "/img/avatar.png"
      },
    },
    {
      id: "3",
      status: 'Being Addressed',
      title: 'Landslide Warning: Mountain View',
      urgency: "High",
      location: {
        address: {
          id: 1,
          barangay: 'Main St & Central Ave',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard',
      createdAt: new Date('2023-10-01T08:00:00Z'),
      creator: {
        username: "Juan Dela Cruz",
        profilePicture: "/img/avatar.png"
      },
    },
    {
      id: "4",
      status: 'Being Addressed',
      title: 'Road Closure: Mango Avenue',
      urgency: "Low",
      location: {
        address: {
          id: 1,
          barangay: 'Main St & Central Ave',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic',
      createdAt: new Date('2023-10-01T08:00:00Z'),
      creator: {
        username: "Juan Dela Cruz",
        profilePicture: "/img/avatar.png"
      },
    },
    {
      id: "5",
      status: 'Being Addressed',
      title: 'Landslide Warning: Mountain View',
      urgency: "High",
      location: {
        address: {
          id: 1,
          barangay: 'Main St & Central Ave',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Risk of landslides due to heavy rains. Residents advised to evacuate to safer ground immediately.',
      category: 'Geohazard',
      createdAt: new Date('2023-10-01T08:00:00Z'),
      creator: {
        username: "Juan Dela Cruz",
        profilePicture: "/img/avatar.png"
      },
    },
    {
      id: "6",
      status: 'Being Addressed',
      title: 'Road Closure: Mango Avenue',
      urgency: "Medium",
      location: {
        address: {
          id: 1,
          barangay: 'Main St & Central Ave',
          city: 'Cebu City',
          province: 'Cebu',
        },
        coordinates: { lat: 10, lng: 123 }
      },
      description: 'Street festival today, Mango Avenue closed to traffic until 10 PM. Plan alternate routes to avoid congestion.',
      category: 'Traffic',
      createdAt: new Date('2023-10-01T08:00:00Z'),
      creator: {
        username: "Juan Dela Cruz",
        profilePicture: "/img/avatar.png"
      },
    },
  ];

  export const sampleReport: Report = {
    id: "1",
    title: "BAHA SA UP",
    category: "Environmental",
    location: {
      address: {
        id: 1,
        barangay: "Lahug",
        city: "Cebu City",
        province: "Cebu",
      },
      coordinates: { lat: 10.123, lng: 123.456 }
    },
    status: "Unresolved",
    urgency: "Low",
    description: "Panabangi mi ngari kay kusog kaayo ang baha diri, abot tuhod ang baha!",
    //images: [],
    images: ["/img/flood-image.png", "/img/flood-image.jpg"],
    createdAt: new Date(),
    creator: {
      username: "Juan Dela Cruz",
      profilePicture: "/img/avatar.png"
    },
    comments: [
      {
        id: "1",
        creator: {
          username: "creeeees",
          location: {
            address: {
              id: 1,
              barangay: "Jagobiao",
              city: "Mandaue City",
              province: "Cebu",
            },
            coordinates: { lat: 10.123, lng: 123.456 }
          },
          profilePicture: "/img/avatar.png"
        },
        content: "Di diay ko, hmph!",
        createdAt: new Date()
      }
    ]
  };

export const mapTestReports: Report[] = [
  {
    id: 'dummy1',
    title: 'Major Pothole',
    description: 'A very large and dangerous pothole on Main St.',
    category: 'Road Hazard',
    urgency: 'High',
    status: 'Unresolved',
    location: {
      coordinates: { lat: 10.323, lng: 123.899 },
      address: { id: 1, province: 'Cebu', city: 'Cebu City', barangay: 'Kamputhaw' } as Area,
    },
    createdAt: new Date('2025-05-29T10:00:00Z'), // Using a fixed date for consistency
    creator: { username: 'TestUser1', profilePicture: '/img/avatar.png' },
    images: ['/img/flood-image.jpg'],
  },
  {
    id: 'dummy2',
    title: 'Broken Streetlight',
    description: 'Streetlight near the park is out.',
    category: 'Electrical Issue',
    urgency: 'Medium',
    status: 'Being Addressed',
    location: {
      coordinates: { lat: 10.324, lng: 123.900 },
      address: { id: 2, province: 'Cebu', city: 'Cebu City', barangay: 'Lahug' } as Area,
    },
    createdAt: new Date('2025-05-29T10:05:00Z'),
    creator: { username: 'TestUser2', profilePicture: '/img/avatar.png' },
    images: ['/img/flood-image.png'],
  },
  {
    id: 'dummy3',
    title: 'Overflowing Trash Bin',
    description: 'Public trash bin at the corner is full and overflowing.',
    category: 'Sanitation',
    urgency: 'Low',
    status: 'Resolved',
    location: {
      coordinates: { lat: 10.325, lng: 123.901 },
      address: { id: 3, province: 'Cebu', city: 'Cebu City', barangay: 'Apas' } as Area,
    },
    createdAt: new Date('2025-05-29T10:10:00Z'),
    creator: { username: 'TestUser3', profilePicture: '/img/avatar.png' },
    images: ['/img/hand-img-1.png'],
  },
];