#!/bin/bash

# Claude Dev Environment Starter
# Opens two terminal windows: one for netlify dev, one for claude

# Show dialog to select project using AppleScript
selected_project=$(osascript << 'EOF'
set projectList to {"OCC", "hest", "Teambattle Website", "EventDay"}
set selectedProject to choose from list projectList with prompt "Vælg projekt til Claude Dev:" with title "Claude Dev Environment" default items {"OCC"}
if selectedProject is false then
    return "CANCELLED"
else
    return item 1 of selectedProject
end if
EOF
)

# Exit if cancelled
if [ "$selected_project" = "CANCELLED" ] || [ -z "$selected_project" ]; then
    echo "Cancelled by user"
    exit 0
fi

# Set project path based on selection
case "$selected_project" in
    "OCC")
        project_path="/Users/thomas/GITHUB/OCC"
        ;;
    "hest")
        project_path="/Users/thomas/GITHUB/hest"
        ;;
    "Teambattle Website")
        project_path="/Users/thomas/GITHUB/teambattle-website"
        ;;
    "EventDay")
        project_path="/Users/thomas/GITHUB/eventday"
        ;;
    *)
        osascript -e "display alert \"Projekt ikke fundet\" message \"Kunne ikke finde stien til $selected_project\""
        exit 1
        ;;
esac

# Check if project directory exists
if [ ! -d "$project_path" ]; then
    osascript -e "display alert \"Mappe ikke fundet\" message \"Projektmappen findes ikke: $project_path\""
    exit 1
fi

# Open Terminal 1: Netlify Dev
osascript << EOF
tell application "Terminal"
    activate
    do script "cd '$project_path' && echo '🚀 Starting Netlify Dev for $selected_project...' && netlify dev"
end tell
EOF

# Small delay to ensure first terminal is ready
sleep 1

# Open Terminal 2: Claude
osascript << EOF
tell application "Terminal"
    activate
    do script "cd '$project_path' && echo '🤖 Claude ready for $selected_project' && echo '' && claude"
end tell
EOF

# Show confirmation
osascript -e "display notification \"Dev environment startet for $selected_project\" with title \"Claude Dev\" sound name \"Glass\""

echo "Started dev environment for: $selected_project"
echo "Project path: $project_path"
