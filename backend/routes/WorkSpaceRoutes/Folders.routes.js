const express= require('express');

const router = express.Router();

const { createFolder,
  getAllFolders,
  getFolderById,
  deleteFolder,} = require('../../controller/WorkSpace/Folders.controller');

  //middleware
  const{authToken} = require('../../middleware/authMiddleware');

  //create Folder
  router.post('/create/:workspaceId',authToken,createFolder);

  //getAll Folders
  router.get('/getAllFolders/:workspaceId',authToken,getAllFolders);
  
  //get FolderById
  router.get('/foldersById/:workspaceId',authToken,getFolderById)

  //delete FolderById
  router.delete('/:workspaceId/:folderId',authToken,deleteFolder)

  module.exports=router;

