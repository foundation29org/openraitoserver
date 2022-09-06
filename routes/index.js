// file that contains the routes of the api
'use strict'

const express = require('express')

const userCtrl = require('../controllers/all/user')
const langCtrl = require('../controllers/all/lang')

const patientCtrl = require('../controllers/user/patient')

const deleteAccountCtrl = require('../controllers/user/delete')

const f29azureserviceCtrl = require('../services/f29azure')

const supportCtrl = require('../controllers/all/support')


const feedbackDevCtrl = require('../controllers/all/feedback_dev')

const docsCtrl = require('../controllers/user/patient/documents')

const openRaitoCtrl = require('../controllers/all/openraito')

const auth = require('../middlewares/auth')
const roles = require('../middlewares/roles')
const api = express.Router()

// user routes, using the controller user, this controller has methods
//routes for login-logout
api.post('/signup', userCtrl.signUp)
api.post('/signin', userCtrl.signIn)

// activarcuenta
api.post('/activateuser', userCtrl.activateUser)
api.post('/sendEmail', userCtrl.sendEmail)

// recuperar password
api.post('/recoverpass', userCtrl.recoverPass)
api.post('/updatepass', userCtrl.updatePass)
api.post('/newpass', auth(roles.All), userCtrl.newPass)

api.get('/users/:userId', auth(roles.All), userCtrl.getUser)
api.get('/users/settings/:userId', auth(roles.All), userCtrl.getSettings)
api.put('/users/:userId', auth(roles.AllLessResearcher), userCtrl.updateUser)
api.delete('/users/:userId', auth(roles.AllLessResearcher), userCtrl.deleteUser)//de momento no se usa
api.get('/users/name/:userId', auth(roles.All), userCtrl.getUserName)
api.get('/users/email/:userId', auth(roles.All), userCtrl.getUserEmail)
api.get('/patient/email/:patientId', auth(roles.All), userCtrl.getPatientEmail)
api.get('/verified/:userId', auth(roles.All), userCtrl.isVerified)
api.post('/verified/:userId', auth(roles.All), userCtrl.setInfoVerified)


//delete account
api.post('/deleteaccount/:userId', auth(roles.All), deleteAccountCtrl.deleteAccount)

// patient routes, using the controller patient, this controller has methods
api.get('/patients-all/:userId', auth(roles.All), patientCtrl.getPatientsUser)


// lang routes, using the controller lang, this controller has methods
api.get('/langs/',  langCtrl.getLangs)

//Support
api.post('/support/', auth(roles.UserClinicalSuperAdmin), supportCtrl.sendMsgSupport)
api.post('/homesupport/', supportCtrl.sendMsgLogoutSupport)

api.get('/support/:userId', auth(roles.UserClinicalSuperAdmin), supportCtrl.getUserMsgs)
api.put('/support/:supportId', auth(roles.SuperAdmin), supportCtrl.updateMsg)
api.get('/support/all/:userId', auth(roles.SuperAdmin), supportCtrl.getAllMsgs)


//services f29azure
api.get('/getAzureBlobSasTokenWithContainer/:containerName', f29azureserviceCtrl.getAzureBlobSasTokenWithContainer)

//service feedback
api.post('/feedbackdev', auth(roles.UserClinicalSuperAdmin), feedbackDevCtrl.sendMsgDev)

// docsCtrl routes, using the controller seizures, this controller has methods
api.get('/documents/:patientId', docsCtrl.getDocuments)
api.post('/document/:patientId', auth(roles.OnlyUser), docsCtrl.saveDocument)
api.delete('/document/:documentId', auth(roles.OnlyUser), docsCtrl.deleteDocument)

// openraito
api.get('/openraito/patients', auth(roles.OnlyClinical), openRaitoCtrl.getPatientsUser)
api.post('/openraito/patient/:patientId', auth(roles.OnlyClinical), openRaitoCtrl.getPatient)
api.post('/openraito/patient/all/:patientId', openRaitoCtrl.getAllPatientInfo)
api.get('/openraito/patient/generalshare/:patientId', auth(roles.UserResearcher), openRaitoCtrl.getGeneralShare)
api.get('/openraito/patient/cusmtomshare/:patientId', auth(roles.UserResearcher), openRaitoCtrl.getCustomShare)
api.get('/openraito/patientsrequest/:userId', openRaitoCtrl.getPatientsRequest)
api.post('/openraito/patient/individualshare/:patientId', auth(roles.OnlyClinical), openRaitoCtrl.setIndividualShare)
api.post('/openraito/patient/getindividualshare/:patientId', auth(roles.OnlyClinical), openRaitoCtrl.getIndividualShare)
/*api.get('/testToken', auth, (req, res) => {
	res.status(200).send(true)
})*/
//ruta privada
api.get('/private', auth(roles.AllLessResearcher), (req, res) => {
	res.status(200).send({ message: 'You have access' })
})

module.exports = api
