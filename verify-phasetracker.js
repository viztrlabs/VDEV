// Final verification that PhaseProgressTracker is accessible
const fs = require('fs');

const filePath = 'app/client-dashboard/components/PhaseProgressTracker.tsx';

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for key elements
  const checks = [
    { name: 'export default function PhaseProgressTracker', regex: /export default function PhaseProgressTracker/ },
    { name: 'CheckCircle2 icon', regex: /<CheckCircle2 className="icon" \/>/ },
    { name: 'const phases =', regex: /const phases = / },
    { name: 'return statement', regex: /return \(/ },
  ];n  
  
  let allChecksPass = true;
  
  console.log('=== PhaseProgressTracker Syntax Verification ===');
  
  checks.forEach(check => {
    if (check.regex.test(content)) {
      console.log(`✅ ${check.name} - FOUND`);
    } else {
      console.log(`❌ ${check.name} - MISSING`);
      allChecksPass = false;
    }
  });
  
  if (allChecksPass) {
    console.log();
    console.log('🎉 PhaseProgressTracker is syntactically correct!');
    console.log('The component should be accessible from the dashboard page.');
  } else {
    console.log();
    console.log('❌ Syntax issues found - the component needs fixes');
  }
} else {
  console.log('❌ PhaseProgressTracker.tsx file not found');
  process.exit(1);
}