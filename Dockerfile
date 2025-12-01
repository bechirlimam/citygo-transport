# Simple dockerfile that runs backend (for demo). Frontend built separately.
FROM node:18
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
EXPOSE 4000
CMD ["node","backend/server.js"]
