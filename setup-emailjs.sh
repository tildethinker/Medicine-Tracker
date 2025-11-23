#!/bin/bash
# EmailJS Quick Setup Script for Mac/Linux
# Run this after getting your EmailJS credentials

echo "🔧 EmailJS Configuration Setup"
echo "================================"
echo ""

CONFIG_FILE="src/config/services.config.ts"

# Check if already configured
if ! grep -q "YOUR_SERVICE_ID\|YOUR_PUBLIC_KEY" "$CONFIG_FILE"; then
    echo "✅ EmailJS already configured!"
    echo ""
    echo "Current configuration:"
    grep "serviceId:\|publicKey:" "$CONFIG_FILE"
    exit 0
fi

echo "📧 Get your EmailJS credentials from: https://www.emailjs.com/"
echo ""

# Prompt for credentials
read -p "Enter your EmailJS Service ID: " serviceId
read -p "Enter your EmailJS Template ID: " templateId
read -p "Enter your EmailJS Public Key: " publicKey

# Validate inputs
if [ -z "$serviceId" ] || [ -z "$templateId" ] || [ -z "$publicKey" ]; then
    echo ""
    echo "❌ Error: All fields are required!"
    exit 1
fi

# Update config file
sed -i.bak \
    -e "s/serviceId: 'service_xxxxxxx'/serviceId: '$serviceId'/" \
    -e "s/templateId: 'template_xxxxxxx'/templateId: '$templateId'/" \
    -e "s/publicKey: 'YOUR_PUBLIC_KEY'/publicKey: '$publicKey'/" \
    "$CONFIG_FILE"

rm "${CONFIG_FILE}.bak"

echo ""
echo "✅ Configuration saved successfully!"
echo ""
echo "📱 Next steps:"
echo "   1. Add a caregiver in the app (Caregivers tab)"
echo "   2. Set method to 'Email'"
echo "   3. Enter caregiver email address"
echo "   4. Create notification rules"
echo "   5. Test with 'Test Notification' button"
echo ""
echo "🚀 Start the app with: npm start"
