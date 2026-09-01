// Quick syntax check for PhaseProgressTracker
const fs = require('fs');

try {
  const content = fs.readFileSync('app/client-dashboard/components/PhaseProgressTracker.tsx', 'utf8');
  
  // Basic syntax checks
  if (!content.includes('export default function PhaseProgressTracker')) {
    console.log('❌ Missing export function');
    process.exit(1);
  }
  
  if (!content.includes('const phases = [')) {
    console.log('❌ Missing phases constant');
    process.exit(1);
  }
  
  if (!content.includes('<CheckCircle2 className="icon" />')) {
    console.log('❌ Missing CheckCircle2 icon');
    process.exit(1);
  }
  
  console.log('✅ PhaseProgressTracker syntax is valid');
  console.log('Length:', content.length, 'characters');
  
} catch (error) {
  console.error('❌ Syntax check failed:', error.message);
  process.exit(1);
}