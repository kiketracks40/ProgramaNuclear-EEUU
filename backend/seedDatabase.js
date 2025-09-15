const mongoose = require('mongoose');
const TimelineEvent = require('./models/Timeline');
const Facility = require('./models/Facility');
const Isotope = require('./models/Material');
const User = require('./models/User');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nuclear-simulator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Datos del Timeline
const timelineData = [
  {
    year: 1942,
    month: 'Agosto',
    title: 'Proyecto Manhattan',
    category: 'inicio',
    description: 'Inicio oficial del Proyecto Manhattan bajo la dirección del General Leslie Groves',
    details: 'El proyecto más secreto de la Segunda Guerra Mundial comienza con un presupuesto inicial de $2 mil millones (equivalente a $28 mil millones hoy).',
    impact: 'critical',
    location: 'Washington D.C.',
    image: '🏛️',
    coordinates: { latitude: 38.9072, longitude: -77.0369 },
    sources: ['Manhattan Project Official Records', 'National Archives'],
    tags: ['manhattan', 'inicio', 'guerra']
  },
  {
    year: 1943,
    month: 'Abril',
    title: 'Los Álamos establecido',
    category: 'instalacion',
    description: 'Se establece el Laboratorio Nacional Los Álamos bajo la dirección de J. Robert Oppenheimer',
    details: 'El sitio secreto en Nuevo México se convierte en el corazón del desarrollo de armas nucleares.',
    impact: 'high',
    location: 'Nuevo México',
    image: '🔬',
    coordinates: { latitude: 35.8811, longitude: -106.3103 },
    sources: ['Los Alamos National Laboratory Archives'],
    tags: ['los-alamos', 'oppenheimer', 'laboratorio']
  },
  {
    year: 1945,
    month: 'Julio 16',
    title: 'Prueba Trinity',
    category: 'prueba',
    description: 'Primera detonación nuclear exitosa en Alamogordo, Nuevo México',
    details: 'La explosión de 21 kilotones marca el nacimiento de la era nuclear. La bola de fuego alcanzó 200 metros de diámetro.',
    impact: 'critical',
    location: 'Nuevo México',
    image: '💥',
    coordinates: { latitude: 33.6773, longitude: -106.4754 },
    sources: ['Trinity Test Reports', 'Manhattan Project Records'],
    tags: ['trinity', 'primera-prueba', 'alamogordo']
  },
  {
    year: 1945,
    month: 'Agosto 6',
    title: 'Hiroshima',
    category: 'uso',
    description: 'Little Boy es detonada sobre Hiroshima',
    details: 'La primera arma nuclear usada en guerra. Explosión de 15 kilotones que devastó la ciudad.',
    impact: 'critical',
    location: 'Japón',
    image: '☢️',
    coordinates: { latitude: 34.3853, longitude: 132.4553 },
    sources: ['US Strategic Bombing Survey', 'Japanese Government Records'],
    tags: ['hiroshima', 'little-boy', 'guerra']
  },
  {
    year: 1962,
    month: 'Octubre',
    title: 'Crisis de los Misiles',
    category: 'crisis',
    description: 'Crisis de los Misiles de Cuba',
    details: 'El mundo llega al borde de la guerra nuclear durante 13 días tensos.',
    impact: 'critical',
    location: 'Cuba',
    image: '🚀',
    coordinates: { latitude: 21.5218, longitude: -77.7812 },
    sources: ['Kennedy Library Archives', 'Soviet Archives'],
    tags: ['cuba', 'kennedy', 'crisis']
  }
];

// Datos de Instalaciones
const facilityData = [
  {
    name: "Browns Ferry Nuclear Plant",
    type: "reactor",
    category: "commercial",
    location: {
      coordinates: [-87.1186, 34.7042],
      address: {
        street: "Highway 72",
        city: "Athens",
        state: "Alabama",
        country: "USA",
        zipCode: "35611"
      }
    },
    operator: "Tennessee Valley Authority",
    specifications: {
      reactors: 3,
      capacity: {
        value: 3304,
        unit: "MW"
      },
      reactorType: "BWR",
      fuel: "LEU"
    },
    operational: {
      firstCritical: new Date("1973-08-17"),
      status: "Operational",
      licenseExpiry: new Date("2033-12-20")
    },
    description: "Complejo de tres reactores BWR en el río Tennessee",
    details: "Uno de los complejos nucleares más grandes de EE.UU. con tres reactores de agua hirviendo General Electric.",
    icon: "🏭",
    color: "#28a745",
    safety: {
      lastInspection: new Date("2023-06-15"),
      safetyRating: "A"
    },
    environmental: {
      emissions: {
        co2Annual: 0,
        radioactiveWaste: 150
      },
      cooling: {
        waterSource: "Tennessee River",
        consumptionDaily: 2300000
      }
    },
    economics: {
      constructionCost: {
        amount: 1400000000,
        currency: "USD",
        year: 1970
      },
      operationalCost: {
        annual: 85000000,
        currency: "USD"
      },
      electricity: {
        generationAnnual: 26000000,
        pricePerMWh: 32
      }
    },
    metadata: {
      verificationStatus: "Verified",
      sources: [
        {
          url: "https://www.tva.gov/energy/our-power-system/nuclear/browns-ferry",
          title: "TVA Browns Ferry Information",
          date: new Date("2023-01-15")
        }
      ]
    }
  },
  {
    name: "Nevada Test Site",
    type: "test",
    category: "military",
    location: {
      coordinates: [-116.0, 37.0],
      address: {
        city: "Mercury",
        state: "Nevada",
        country: "USA"
      }
    },
    operator: "Department of Energy",
    specifications: {
      reactors: 0
    },
    operational: {
      firstCritical: new Date("1951-01-27"),
      status: "Operational",
      lastOperation: new Date("1992-09-23")
    },
    description: "Principal sitio de pruebas nucleares de EE.UU.",
    details: "928 pruebas nucleares realizadas entre 1951-1992. Ahora usado para pruebas subcríticas y experimentos de seguridad.",
    icon: "💥",
    color: "#dc3545",
    safety: {
      lastInspection: new Date("2023-03-10"),
      safetyRating: "B"
    },
    metadata: {
      verificationStatus: "Verified",
      sources: [
        {
          url: "https://www.nnss.gov/",
          title: "Nevada National Security Site",
          date: new Date("2023-02-01")
        }
      ]
    }
  }
];

// Datos de Materiales
const isotopeData = [
  {
    symbol: "U-235",
    name: "Uranio-235",
    element: {
      name: "Uranio",
      symbol: "U",
      atomicNumber: 92
    },
    nuclear: {
      massNumber: 235,
      atomicMass: 235.044,
      abundance: 0.720,
      halfLife: {
        value: "7.04×10⁸ años",
        valueInSeconds: 7.04e8 * 365.25 * 24 * 3600
      },
      decayMode: "α",
      bindingEnergy: 1783.9
    },
    neutronics: {
      fissionable: true,
      fusionable: false,
      crossSection: {
        thermal: 681,
        fast: 1.2,
        resonance: 144
      },
      criticalMass: {
        sphere: 52,
        cylinder: 35,
        slab: 16
      },
      fissionEnergy: 200
    },
    physical: {
      density: 18.7,
      meltingPoint: 1135,
      boilingPoint: 4131,
      thermalConductivity: 27.5,
      specificHeat: 0.116
    },
    applications: {
      uses: [
        "Combustible nuclear",
        "Armas nucleares",
        "Reactores de investigación"
      ],
      industry: ["Nuclear Power", "Nuclear Weapons", "Research"],
      safetyConcerns: [
        "Radiactividad alfa",
        "Toxicidad química",
        "Riesgo de criticidad"
      ]
    },
    discovery: {
      year: 1935,
      discoverer: "Arthur Jeffrey Dempster",
      method: "Espectrometría de masas"
    },
    category: "fisil",
    hazard: {
      radioactivity: "High",
      toxicity: "High",
      handling: "Controlled"
    },
    economics: {
      productionMethod: [
        "Enriquecimiento de uranio natural",
        "Centrifugación gaseosa"
      ],
      cost: {
        amount: 25000,
        unit: "per kg",
        currency: "USD",
        date: new Date("2023-01-01")
      },
      availability: "Rare"
    },
    metadata: {
      verificationStatus: "Verified",
      sources: [
        {
          reference: "CRC Handbook of Chemistry and Physics",
          date: new Date("2023-01-01")
        }
      ]
    }
  },
  {
    symbol: "Pu-239",
    name: "Plutonio-239",
    element: {
      name: "Plutonio",
      symbol: "Pu",
      atomicNumber: 94
    },
    nuclear: {
      massNumber: 239,
      atomicMass: 239.052,
      abundance: 0,
      halfLife: {
        value: "24110 años",
        valueInSeconds: 24110 * 365.25 * 24 * 3600
      },
      decayMode: "α",
      bindingEnergy: 1806.9
    },
    neutronics: {
      fissionable: true,
      fusionable: false,
      crossSection: {
        thermal: 1017,
        fast: 1.8,
        resonance: 300
      },
      criticalMass: {
        sphere: 10,
        cylinder: 7,
        slab: 3
      },
      fissionEnergy: 200
    },
    physical: {
      density: 19.8,
      meltingPoint: 640,
      boilingPoint: 3228,
      thermalConductivity: 6.74,
      specificHeat: 0.130
    },
    applications: {
      uses: [
        "Armas nucleares",
        "Combustible nuclear",
        "Reactores reproductores"
      ],
      industry: ["Nuclear Weapons", "Nuclear Power", "Research"],
      safetyConcerns: [
        "Radiactividad alfa intensa",
        "Extrema toxicidad",
        "Riesgo de criticidad muy alto"
      ]
    },
    discovery: {
      year: 1940,
      discoverer: "Glenn T. Seaborg",
      method: "Bombardeo con deuterones"
    },
    category: "fisil",
    hazard: {
      radioactivity: "Extreme",
      toxicity: "Extreme",
      handling: "Prohibited"
    },
    economics: {
      productionMethod: [
        "Irradiación de U-238 en reactor",
        "Reprocesamiento de combustible gastado"
      ],
      cost: {
        amount: 4000000,
        unit: "per kg",
        currency: "USD",
        date: new Date("2023-01-01")
      },
      availability: "Synthetic Only"
    },
    metadata: {
      verificationStatus: "Verified",
      sources: [
        {
          reference: "Plutonium Handbook",
          date: new Date("2023-01-01")
        }
      ]
    }
  }
];

// Usuario administrador por defecto
const defaultUser = {
  username: "admin",
  email: "admin@nuclearsimulator.com",
  password: "NuclearAdmin2023!",
  profile: {
    firstName: "Nuclear",
    lastName: "Administrator",
    bio: "Sistema de administración del simulador nuclear",
    organization: "Nuclear Simulator Platform",
    position: "System Administrator"
  },
  permissions: {
    role: "admin",
    canCreateContent: true,
    canModifyContent: true,
    canDeleteContent: true,
    canVerifyContent: true
  },
  status: {
    isActive: true,
    isBanned: false
  },
  security: {
    emailVerified: true
  }
};

// Función para limpiar la base de datos
const clearDatabase = async () => {
  try {
    await TimelineEvent.deleteMany({});
    await Facility.deleteMany({});
    await Isotope.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Función para sembrar datos
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Crear usuario administrador
    console.log('👤 Creating admin user...');
    const adminUser = new User(defaultUser);
    await adminUser.save();
    console.log('✅ Admin user created');

    // Sembrar eventos del timeline
    console.log('📅 Seeding timeline events...');
    const timelineEvents = timelineData.map(event => ({
      ...event,
      createdBy: adminUser._id,
      isVerified: true
    }));
    await TimelineEvent.insertMany(timelineEvents);
    console.log(`✅ ${timelineEvents.length} timeline events created`);

    // Sembrar instalaciones
    console.log('🏭 Seeding facilities...');
    const facilities = facilityData.map(facility => ({
      ...facility,
      'metadata.addedBy': adminUser._id,
      'metadata.verificationStatus': 'Verified'
    }));
    await Facility.insertMany(facilities);
    console.log(`✅ ${facilities.length} facilities created`);

    // Sembrar isótopos
    console.log('⚛️ Seeding isotopes...');
    const isotopes = isotopeData.map(isotope => ({
      ...isotope,
      'metadata.addedBy': adminUser._id,
      'metadata.verificationStatus': 'Verified'
    }));
    await Isotope.insertMany(isotopes);
    console.log(`✅ ${isotopes.length} isotopes created`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users: 1`);
    console.log(`📅 Timeline Events: ${timelineEvents.length}`);
    console.log(`🏭 Facilities: ${facilities.length}`);
    console.log(`⚛️ Isotopes: ${isotopes.length}`);
    console.log('\n🔐 Admin Credentials:');
    console.log('Username: admin');
    console.log('Email: admin@nuclearsimulator.com');
    console.log('Password: NuclearAdmin2023!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  
  console.log('⚠️  This will clear all existing data. Continue? (Press Ctrl+C to cancel)');
  
  // Esperar 3 segundos antes de continuar
  setTimeout(async () => {
    await clearDatabase();
    await seedDatabase();
    
    console.log('\n✅ Seeding completed. You can now:');
    console.log('1. Check your MongoDB with: mongosh nuclear-simulator');
    console.log('2. Start your server with: npm run dev');
    console.log('3. Test the API at: http://localhost:5000/api/stats');
    
    process.exit(0);
  }, 3000);
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { clearDatabase, seedDatabase };