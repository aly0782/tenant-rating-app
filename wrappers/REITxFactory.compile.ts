import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'func',
    targets: ['contracts/REITxFactory.fc'],
    preCompileHook: async () => {
        // Ensure standard library is available
        console.log('🔨 Preparing contract compilation...');
    }
};