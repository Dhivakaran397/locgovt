const mongoose = require('mongoose');
require('dotenv').config();
const GovtService = require('./models/GovtService');
const { URL } = require('url');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/locgovt';

console.log('🔌 Connecting to MongoDB at:', mongoUri);

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const services = await GovtService.find({});
    console.log(`🔍 Found ${services.length} government services in database. Starting validation...`);

    let invalidUrlsCount = 0;
    let totalChecked = 0;

    services.forEach((service, index) => {
      totalChecked++;
      
      // 1. Check Official URL
      try {
        const url = new URL(service.officialUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new Error('Invalid protocol');
        }
      } catch (err) {
        console.error(`❌ [Service #${index + 1}] "${service.serviceName}" has an invalid officialUrl: "${service.officialUrl}"`);
        invalidUrlsCount++;
      }

      // 2. Check Video URL (if defined)
      if (service.videoUrl) {
        try {
          const url = new URL(service.videoUrl);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('Invalid protocol');
          }
        } catch (err) {
          console.error(`❌ [Service #${index + 1}] "${service.serviceName}" has an invalid videoUrl: "${service.videoUrl}"`);
          invalidUrlsCount++;
        }
      }
    });

    console.log('\n--- Link Checking Summary ---');
    console.log(`✅ Checked: ${totalChecked} government services.`);
    if (invalidUrlsCount === 0) {
      console.log('🎉 SUCCESS: All seeded officialUrl and videoUrl records in the database are syntactically valid absolute web links!');
    } else {
      console.log(`⚠️ WARNING: Found ${invalidUrlsCount} invalid URL formatting issues.`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(invalidUrlsCount > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
