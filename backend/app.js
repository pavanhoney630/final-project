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

// Routes
app.use("/api/auth", userAuthRoutes);

//workspace
app.use('/api/workSapce',WorkSpaceRoutes)
app.use('/api/folder',FolderRoutes)


module.exports = app;
