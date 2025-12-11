#!/bin/bash
# Startup verification script

echo "=== Verifying Tools ==="

# Test solcjs
echo -n "Testing solcjs... "
if solcjs --version &> /dev/null; then
    echo "✅"
else
    echo "❌ FAILED"
fi

# Test solc wrapper
echo -n "Testing solc wrapper... "
if /root/.solcx/solc-v0.8.20 --version &> /dev/null; then
    echo "✅"
else
    echo "❌ FAILED"
fi

# Test myth
echo -n "Testing Mythril... "
if myth --version &> /dev/null; then
    echo "✅"
else
    echo "❌ FAILED"
fi

# Test slither
echo -n "Testing Slither... "
if slither --version &> /dev/null; then
    echo "✅"
else
    echo "❌ FAILED"
fi

# Test py-solc-x can find solc
echo -n "Testing py-solc-x... "
if python3 -c "from solcx import get_installed_solc_versions; print(get_installed_solc_versions())" &> /dev/null; then
    echo "✅"
else
    echo "⚠️  Warning: py-solc-x may not detect solc"
fi

echo "=== Tool Verification Complete ==="