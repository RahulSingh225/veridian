import { execSync } from 'child_process';
try {
    const out = execSync('npx -y tsc --noEmit src/components/AdSense.tsx', { stdio: 'pipe' });
    console.log(out.toString());
} catch (e) {
    if (e.stdout) console.log(e.stdout.toString());
    if (e.stderr) console.error(e.stderr.toString());
    process.exit(e.status || 1);
}
