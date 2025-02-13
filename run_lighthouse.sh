#!/bin/bash

#!/bin/bash

# Define folder paths
FOLDER="generated_html_pages"
REPORT_DIR="lighthouse_reports"

# Create results folder if it doesn't exist
mkdir -p "$REPORT_DIR"

# Start a local HTTP server in the background
echo "🚀 Starting local HTTP server..."
npx http-server -p 8080 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait a few seconds to ensure the server is running
sleep 3

# Base URL for testing
BASE_URL="http://localhost:8080"

# Loop through all HTML files
for file in "$FOLDER"/*.html; do
    filename=$(basename -- "$file")
    report_name="${REPORT_DIR}/${filename%.html}.report.json"

    # Construct the correct URL
    url="${BASE_URL}/${FOLDER}/${filename}"

    echo "🔍 Running Lighthouse for: $url"

    # Run Lighthouse
    lighthouse "$url" --quiet --only-categories=accessibility --output json --output-path "$report_name"

    echo "✅ Report saved: $report_name"
done

# Stop the server after all tests complete
echo "🛑 Stopping local HTTP server..."
kill $SERVER_PID

echo "🎉 All Lighthouse tests completed!"

