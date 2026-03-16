FROM node:22.11

COPY package.json package-lock.json .
RUN npm ci

COPY . .
RUN npm run build

CMD npm run preview
