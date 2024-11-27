FROM node:lts-alpine
# FROM debian
# ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm i && mv node_modules ../
COPY . .
COPY .env.example .env
RUN npm run build
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node","./dist/index.js"]