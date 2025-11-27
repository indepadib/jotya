#!/bin/bash
# Script to add style column to Listing table

echo "Adding style column to Listing table..."

# Use the DIRECT_URL for migrations
psql "$DIRECT_URL" -c "ALTER TABLE \"Listing\" ADD COLUMN IF NOT EXISTS \"style\" TEXT;"

if [ $? -eq 0 ]; then
    echo "✅ Successfully added style column!"
else
    echo "❌ Failed to add style column. Error above."
    exit 1
fi
