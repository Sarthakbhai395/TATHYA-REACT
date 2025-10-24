// tathya-backend/seedCommunities.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Community = require('./models/Community');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use IPv4 explicitly to avoid connection issues
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tathya_db';
    console.log('Connecting to MongoDB using URI:', mongoUri);

    const conn = await mongoose.connect(mongoUri, {
      family: 4, // Force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Make sure MongoDB is running.');
    process.exit(1);
  }
};

// Sample communities data
const communities = [
  {
    name: 'Mumbai Chapter',
    region: 'Maharashtra',
    description: 'Connect with students in Mumbai facing academic pressure, harassment, or career challenges. Share experiences, get advice, and support each other.',
    tags: ['Academic Pressure', 'Harassment', 'Career']
  },
  {
    name: 'Delhi-NCR Hub',
    region: 'Delhi/NCR',
    description: 'A vibrant community for students in the Delhi-NCR region. Discuss issues like unfair treatment, excessive workload, and mental health support.',
    tags: ['Unfair Treatment', 'Workload', 'Mental Health']
  },
  {
    name: 'Bangalore Circle',
    region: 'Karnataka',
    description: 'Tech-savvy students in Bangalore unite! Share insights on internships, coding bootcamps, and navigating the startup culture.',
    tags: ['Tech', 'Internships', 'Startup']
  },
  {
    name: 'AGRA Group',
    region: 'Uttar Pradesh',
    description: 'Students in AGRA dealing with academic stress, peer pressure, or family expectations. Find support and guidance here.',
    tags: ['Academic Stress', 'Peer Pressure', 'Family']
  },
  {
    name: 'Kolkata Forum',
    region: 'West Bengal',
    description: 'A supportive space for students in Kolkata facing financial difficulties, discrimination, or lack of resources.',
    tags: ['Financial', 'Discrimination', 'Resources']
  },
  {
    name: 'Hyderabad Squad',
    region: 'Telangana',
    description: 'Connect with fellow students in Hyderabad tackling research pressures, thesis deadlines, or PhD challenges.',
    tags: ['Research', 'Thesis', 'PhD']
  },
  {
    name: 'Pune Connect',
    region: 'Maharashtra',
    description: 'Students in Pune facing academic pressure, hostel life challenges, or career uncertainty. Get peer support and guidance.',
    tags: ['Academic Pressure', 'Hostel Life', 'Career Uncertainty']
  },
  {
    name: 'Jaipur Scholars',
    region: 'Rajasthan',
    description: 'A community for students in Jaipur dealing with cultural adjustments, academic rigor, or financial aid queries.',
    tags: ['Cultural Adjustment', 'Academic Rigor', 'Financial Aid']
  },
  {
    name: 'Ahmedabad Innovators',
    region: 'Gujarat',
    description: 'Connect with entrepreneurial and innovative students in Ahmedabad. Share startup ideas, collaborate on projects.',
    tags: ['Entrepreneurship', 'Innovation', 'Collaboration']
  }
];

// Seed communities
const seedCommunities = async () => {
  try {
    // Connect to database
    const connection = await connectDB();

    // Delete existing communities
    const deleteResult = await Community.deleteMany();
    console.log(`Removed ${deleteResult.deletedCount} existing communities`);

    // Create new communities
    const createdCommunities = await Community.insertMany(communities);
    console.log(`Created ${createdCommunities.length} communities:`);
    createdCommunities.forEach(community => {
      console.log(`  - ${community.name} (${community.region})`);
    });

    console.log('Communities seeded successfully!');
    await connection.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding communities:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCommunities();