FROM node:22.12

WORKDIR app/

COPY package.json package-lock.json .
RUN npm ci

COPY . .
RUN npm run build

CMD npm run preview
