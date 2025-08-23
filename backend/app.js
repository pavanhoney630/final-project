const express = require("express");
const cors = require("cors");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//User Routes
const userAuthRoutes = require('./routes/UserRoutes/userAuth.routes')

//Workspace Routes
const WorkSpaceRoutes = require('./routes/WorkSpaceRoutes/workSpace.routes')
const FolderRoutes = require('./routes/WorkSpaceRoutes/Folders.routes')

//Form Routes
const FormRoutes = require('./routes/FormRoutes/form.routes')
const ThemeRoutes = require('./routes/FormRoutes/theme.routes')
const ResponseRoutes = require('./routes/FormRoutes/formResponse.routes')
const FromAnalyticsRoutes = require('./routes/FormRoutes/formAnalytics.routes')

// Routes
app.use("/api/auth", userAuthRoutes);

//workspace
app.use('/api/workSapce',WorkSpaceRoutes)
app.use('/api/folder',FolderRoutes)

//Form
app.use('/api/form', FormRoutes)
app.use('/api/theme',ThemeRoutes)
app.use('/api/response',ResponseRoutes)
app.use('/api/analytics',FromAnalyticsRoutes)


module.exports = app;
