# 1. Use a lightweight version of Node.js
FROM node:22-alpine

# 2. Tell Docker where to put your code inside the container
WORKDIR /app

# 3. Copy your shopping lists (package.json) first
COPY package*.json ./

# 4. Install all the dependencies
RUN npm install

# 5. Copy the rest of your frontend code into the container
COPY . .

# 6. Open the port that Vite uses
EXPOSE 5173

# 7. The command to start the server when the container runs
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]