
# WPlace Status

This project displays the real-time status of the main WPlace services.

## What is it?
A web page that automatically checks if WPlace services are online or down, showing how long any outage has lasted. The design is modern, with a dark background and visually pleasant style.

- **Main page:** Shows the status of services (Backend and Frontend).
- **Route /alicante:** Informational page and access to the WPlace Alicante Discord.

## Technologies
- Next.js
- React
- TypeScript

## How does it work?
Every 30 seconds, the page checks if the services are online. If any are down, it shows how long the outage has lasted.

## Deployment
The site is ready to be published as a static page on GitHub Pages.

## Installation & Development
```bash
npm install
npm run dev
```

## Export for GitHub Pages
```bash
npm run build
npm run export
```
Rename the `out` folder to `docs` and push the changes to your repository.

## License
MIT

---
Created by izanthebestn1 for the WPlace community.
