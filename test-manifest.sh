#!/bin/bash

echo "🔍 Testing TON Connect Manifest Configuration"
echo "============================================="

# Test local development server
echo -e "\n📱 Testing Local Development:"
if curl -s http://localhost:5173/tonconnect-manifest.dev.json > /dev/null 2>&1; then
    echo "✅ Local manifest accessible"
    curl -s http://localhost:5173/tonconnect-manifest.dev.json | python3 -m json.tool
else
    echo "⚠️  Local dev server not running (run 'yarn dev' in src/dapp)"
fi

# Test production URL
echo -e "\n🌐 Testing Production URL:"
if curl -s https://reitx.xyz/tonconnect-manifest.json > /dev/null 2>&1; then
    echo "✅ Production manifest accessible"
    curl -s https://reitx.xyz/tonconnect-manifest.json | python3 -m json.tool
else
    echo "❌ Production manifest not accessible yet (deploy first)"
fi

echo -e "\n📋 Local Manifest Content:"
cat src/dapp/public/tonconnect-manifest.json | python3 -m json.tool

echo -e "\n✅ Manifest Validation:"
python3 -c "
import json
import sys

try:
    with open('src/dapp/public/tonconnect-manifest.json', 'r') as f:
        manifest = json.load(f)
    
    required = ['url', 'name', 'iconUrl']
    missing = [field for field in required if field not in manifest]
    
    if missing:
        print(f'❌ Missing required fields: {missing}')
        sys.exit(1)
    
    print('✅ All required fields present')
    print(f'   - URL: {manifest[\"url\"]}')
    print(f'   - Name: {manifest[\"name\"]}')
    print(f'   - Icon: {manifest[\"iconUrl\"]}')
    
except Exception as e:
    print(f'❌ Error validating manifest: {e}')
    sys.exit(1)
"

echo -e "\n🔧 Troubleshooting Tips:"
echo "1. Make sure the manifest is deployed to https://reitx.xyz/tonconnect-manifest.json"
echo "2. Ensure CORS headers allow access from Tonkeeper"
echo "3. Icon URL must be accessible and point to a valid image"
echo "4. All URLs in manifest must use HTTPS in production"