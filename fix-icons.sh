#!/bin/bash
# Script to fix common icon and useKV issues
echo "Fixing common TypeScript issues in VirtualBackroom.ai components..."

# Fix Phosphor Icons imports
echo "Fixing Phosphor icon imports..."

# AlertTriangle -> Warning
sed -i 's/AlertTriangle/Warning/g' /workspaces/spark-template/src/components/*.tsx
# BarChart -> ChartBar
sed -i 's/BarChart/ChartBar/g' /workspaces/spark-template/src/components/*.tsx
# Zap -> Lightning
sed -i 's/Zap/Lightning/g' /workspaces/spark-template/src/components/*.tsx
# TrendingUp -> TrendUp (already correct)
# Search -> MagnifyingGlass
sed -i 's/Search/MagnifyingGlass/g' /workspaces/spark-template/src/components/*.tsx

echo "Icon fixes applied to all components."

# The useKV issues need more careful fixing per component
echo "Manual fixes still needed for useKV data types..."