import { Report } from '@/interfaces/report';

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