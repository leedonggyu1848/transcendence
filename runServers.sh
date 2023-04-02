#!/bin/sh

# Run npm run dev in /tmp/frontend in the background
cd /tmp/frontend
npm run dev &

# Run npm run start in /tmp/backend
cd /tmp/backend
npm run start