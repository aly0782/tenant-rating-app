const { spawn } = require('child_process');

console.log('🚀 Starting automated deployment...\n');

const deploy = spawn('yarn', ['blueprint', 'run', 'deployREITxFactory', '--testnet'], {
    stdio: ['pipe', 'inherit', 'inherit']
});

// Wait a bit for the prompt to appear
setTimeout(() => {
    console.log('📝 Selecting Mnemonic option...\n');
    // Send arrow down 3 times
    deploy.stdin.write('\x1B[B');
    deploy.stdin.write('\x1B[B');
    deploy.stdin.write('\x1B[B');
    // Send enter
    deploy.stdin.write('\n');
}, 2000);

deploy.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ Deployment completed successfully!');
    } else {
        console.log(`\n❌ Deployment failed with code ${code}`);
    }
});