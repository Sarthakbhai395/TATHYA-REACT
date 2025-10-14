const path = require('path');
const fs = require('fs');

// Load about content from a JSON file so it's easy to edit without changing code
const ABOUT_DATA_PATH = path.join(__dirname, '..', 'data', 'about.json');

exports.getAbout = (req, res) => {
  try {
    if (!fs.existsSync(ABOUT_DATA_PATH)) {
      return res.status(200).json({
        title: 'TATHYA',
        subtitle: 'Awareness • Support • Safety',
        hero: {
          heading: 'Welcome to TATHYA',
          text: 'A student-first platform that helps you report, find resources, and get support in campus safety and wellbeing.',
        },
        sections: [],
      });
    }

    const raw = fs.readFileSync(ABOUT_DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    return res.json(data);
  } catch (err) {
    console.error('Failed to read about data:', err);
    return res.status(500).json({ message: 'Failed to load about content' });
  }
};
