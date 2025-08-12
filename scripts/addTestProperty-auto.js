const { spawn } = require('child_process');

console.log('🚀 Adding test property to contract...\n');

const deploy = spawn('yarn', ['blueprint', 'run', 'addTestProperty', '--testnet'], {
    stdio: ['pipe', 'inherit', 'inherit']
});

// Wait a bit for the prompt to appear
setTimeout(() => {
    console.log('📝 Selecting Mnemonic option...\n');
    // Send arrow down 3 times for Mnemonic
    deploy.stdin.write('\x1B[B');
    deploy.stdin.write('\x1B[B');
    deploy.stdin.write('\x1B[B');
    // Send enter
    deploy.stdin.write('\n');
}, 2000);

deploy.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ Property creation completed!');
    } else {
        console.log(`\n❌ Failed with code ${code}`);
    }
});