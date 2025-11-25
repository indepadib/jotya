#!/usr/bin/env bash
# Start the dev server in the background
npm run dev &
DEV_PID=$!
# Wait for the server to be ready (adjust sleep as needed)
sleep 5
# Call the test endpoint
response=$(curl -s http://localhost:3000/api/test-ai)
# Kill the dev server
kill $DEV_PID
# Output the response
echo "Response from /api/test-ai:"
echo $response
# Simple check for expected content
if echo $response | grep -q "Hello from Jotya AI"; then
  echo "✅ AI integration works!"
else
  echo "❌ AI integration failed. Check logs and API key."
fi
