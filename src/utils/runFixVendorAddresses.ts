// Run this file with: npx tsx src/utils/runFixVendorAddresses.ts
import { fixVendorAddresses } from './fix-vendor-addresses';

console.log('Starting vendor address fix...');
fixVendorAddresses()
  .then(() => {
    console.log('Vendor address fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running vendor address fix:', error);
    process.exit(1);
  });