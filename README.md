 ![Umma NA Logo](assets/ummana.png)
# Umma NA Frontend

A React single-page application that provides administrative tools for the Umma NA community health platform. The interface delivers navigation between operational dashboards, resource management views, and data analytics placeholders while offering a fully interactive Communities module backed by the Umma NA REST API.

## Features
- **Authentication shell** – Landing page with a styled login form and route redirection for future authentication logic.
- **Responsive sidebar navigation** – Shared sidebar component that highlights the active route and provides quick links to major platform areas.
- **Communities management** – Searchable table, create/edit/delete modals, and backend integration for managing catchment areas through the hosted API at `https://umma-na-backend.onrender.com`.
- **Future module placeholders** – Routes and layouts for dashboards, CHIPS agents, ETS drivers, facilities, rides, and analytics that are ready to be wired up with real data sources.

## Prerequisites
- **Node.js**: Version 14.0 or higher recommended
- **npm**: Version 6.0 or higher (comes with Node.js)

## Tech Stack
- [React 19](https://react.dev/) with React Router for client-side routing
- [Create React App](https://create-react-app.dev/) build tooling
- [Axios](https://axios-http.com/) and native Fetch for API communication
- [Lucide React](https://lucide.dev/) icon set for UI affordances

## Getting Started

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd umma-na-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The application runs at [http://localhost:3000](http://localhost:3000) with hot reloading enabled.

4. **Run the test watcher** (optional during development)
   ```bash
   npm test
   ```

5. **Create a production build**
   ```bash
   npm run build
   ```

## Environment Variables (Optional)
By default, the app connects to the production API at `https://umma-na-backend.onrender.com`. 

To use a different API endpoint (e.g., local development), create a `.env` file in the root directory:

```bash
REACT_APP_API_BASE_URL=http://localhost:3001
```

Then update `src/pages/CommunitiesPage.jsx` to use:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://umma-na-backend.onrender.com";
```

## API Documentation
This frontend connects to the Umma NA REST API for managing communities and health platform data.

- **Backend Repository**: [https://github.com/Timamamu/umma-na-backend]
- **Production API**: https://umma-na-backend.onrender.com
- **API Endpoints Used**:
  - `GET /catchment-areas` - Fetch all communities
  - `POST /register-catchment-area` - Create new community
  - `PUT /catchment-areas/:id` - Update community
  - `DELETE /catchment-areas/:id` - Delete community

For complete API documentation and backend setup instructions, refer to the backend repository.

## Project Structure
```
src/
├── assets/              # SVG blobs and logo artwork used across pages
├── components/
│   └── Sidebar.jsx      # Global navigation shell with active-route styling
├── pages/               # Top-level routed views (login, dashboard, resources)
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── CommunitiesPage.jsx
│   ├── ChipsAgentsPage.jsx
│   ├── ETSDriversPage.jsx
│   ├── FacilitiesPage.jsx
│   ├── RidesPage.jsx
│   └── AnalyticsPage.jsx
├── styles/              # Page-specific CSS modules referenced by views
├── App.jsx              # Route configuration
└── index.js             # React entry point that mounts the SPA
```

## Community Data Workflow
1. Use the **Add Community** button to open the registration modal and submit a new catchment area.
2. Use the table action buttons (Edit/Delete) to modify or remove existing communities. 
3. Input validation ensures coordinates fall within valid latitude/longitude ranges before sending requests.
4. Filter the list by name, settlement, ward, or LGA using the search bar at the top of the table.

## Deployment

### Build for Production
```bash
npm run build
```
This creates an optimized production build in the `build/` folder.

### Deploy to Hosting Platforms
The production build can be deployed to:
- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: Drag and drop the `build/` folder or connect your GitHub repo
- **GitHub Pages**: Follow the [CRA deployment guide](https://create-react-app.dev/docs/deployment/#github-pages)

See the [Create React App deployment documentation](https://create-react-app.dev/docs/deployment) for more options.

## Testing & Quality
This project relies on the default testing setup provided by Create React App (`react-scripts test`) and includes DOM testing utilities from Testing Library for authoring future unit tests.

Run tests with:
```bash
npm test
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is open source and available under the [MIT License](LICENSE).

## Support
For questions, issues, or feature requests, please open an issue on the GitHub repository or contact the Umma NA development team.

## Related Projects

- **Backend API**: [umma-na-backend](https://github.com/Timamamu/umma-na-backend)
- **Mobile App**: [umma-na-frontend](https://github.com/Timamamu/umma-na-mobile)


---

**Built by Fatima Mamu for the Umma NA team**
