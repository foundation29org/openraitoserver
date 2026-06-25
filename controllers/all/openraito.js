'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')

const { client_server } = require('../../config')

async function getPatientsUser(req, res) {
    try {
        let userId = crypt.decrypt(req.params.userId);
        const user = await User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "confirmed": false, "lastLogin": false });
        if (!user) return res.status(404).send({ code: 208, message: 'The user does not exist' })

        if (user.role == 'Clinical') {
            const patients = await Patient.find({});
            var listpatients = [];

            patients.forEach(function (u) {
                var id = u._id.toString();
                var idencrypt = crypt.encrypt(id);
                if(u.generalShare.data.patientInfo){
                    listpatients.push({ id: idencrypt, patientName: u.patientName, surname: u.surname, birthDate: u.birthDate, gender: u.gender, group: u.group });
                }else{
                    listpatients.push({ id: idencrypt, patientName: null, surname: null, birthDate: null, gender: null, group: u.group });
                }
            });

            res.status(200).send({ listpatients })
        } else {
            res.status(401).send({ message: 'without permission' })
        }
    } catch (err) {
        return res.status(500).send({ message: 'Error making the request:' })
    }
}

async function getPatientsRequest(req, res) {
    try {
        const patients = await Patient.find({});
        var listpatients = [];
        patients.forEach(function (u) {
            var id = u._id.toString();
            var idencrypt = crypt.encrypt(id);
            var found = false;
            var status = 'Pending';
            if(req.params.userId!=undefined){
                for (var i = 0; i < u.individualShare.length && !found; i++) {
                    if(u.individualShare[i].idUser == req.params.userId){
                        found = true;
                        status = u.individualShare[i].status;
                    }
                }
            }
            if(u.generalShare.data.patientInfo){
                listpatients.push({ id: idencrypt, patientName: u.patientName, surname: u.surname, birthDate: u.birthDate, gender: u.gender, group: u.group, previousDiagnosis: u.previousDiagnosis, generalShare: u.generalShare, hasIndividualShare: found, status: status });
            }else if((u.generalShare.data.patientInfo || u.generalShare.data.medicalInfo || u.generalShare.data.devicesInfo || u.generalShare.data.genomicsInfo) || found){
                listpatients.push({ id: idencrypt, patientName: null, surname: null, birthDate: null, gender: null, group: u.group, previousDiagnosis: null, generalShare: u.generalShare, hasIndividualShare: found, status: status});
            }
        });

        res.status(200).send({ listpatients })
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function getPatient(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        console.log(req.body);
        const patientdb = await Patient.findById(patientId, { "_id": false, "createdBy": false });
        if (!patientdb) return res.status(202).send({ message: `The patient does not exist` })
        if(patientdb){
            var found = false;
            var pos = -1;
            for (var i = 0; i < patientdb.individualShare.length && !found; i++) {
                if(patientdb.individualShare[i].idUser == req.body.idUser && patientdb.individualShare[i].status == 'Accepted'){
                    found = true;
                    pos = i;
                }
            }

            var patient = JSON.parse(JSON.stringify(patientdb));
            if(found){
                patient.generalShare = patient.individualShare[pos];
            }
            if(patient.individualShare){
                delete patient.individualShare;
            }

            if(patient.generalShare.data.patientInfo){
                res.status(200).send({ patient })
            }else{
                res.status(200).send({ message: 'You do not have access', generalShare: patient.generalShare })
            }
        }
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function getGeneralShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId, { "_id": false, "createdBy": false });
        res.status(200).send({ generalShare: patient.generalShare })
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function getCustomShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId, { "_id": false, "createdBy": false });
        res.status(200).send({ customShare: patient.customShare })
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function getAllPatientInfo(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId, { "createdBy": false });
        if (!patient) return res.status(202).send({ message: `You do not have access` })
        if(patient.customShare.length>0){
            patient.customShare.forEach(function (element) {
                var splittoken = element.token.split('token=');
                if(splittoken[1] == req.body.token){
                    var id = patient._id.toString();
                    var idencrypt = crypt.encrypt(id);
                    if(element.data.patientInfo){
                        var data = { id: idencrypt, patientName: patient.patientName, surname: patient.surname, birthDate: patient.birthDate, gender: patient.gender, group: patient.group, previousDiagnosis: patient.previousDiagnosis, customShare: element }
                        res.status(200).send({ data })
                    }else{
                        if(element.data.medicalInfo){
                            var data = { id: idencrypt, patientName: null, surname: null, birthDate: null, gender: null, group: patient.group, previousDiagnosis: null, customShare: element }
                            res.status(200).send({ data })
                        }else{
                            res.status(200).send({ message: 'You do not have access', customShare: element})
                        }
                    }
                }
              });
        }else{
            res.status(200).send({ message: 'You do not have access'})
        }
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function setIndividualShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId, { "_id": false, "createdBy": false });
        if(patient){
            var found = false;
            for (var i = 0; i < patient.individualShare.length && !found; i++) {
                if(patient.individualShare[i].idUser == req.body.idUser){
                    patient.individualShare[i] = req.body;
                    found = true;
                }
            }
            if(!found){
                patient.individualShare.push(req.body)
            }
            await Patient.findByIdAndUpdate(patientId, { individualShare: patient.individualShare }, { select: '-createdBy', new: true });
            res.status(200).send({ message: 'individual share added' })
        }else{
            res.status(500).send({ message: `Error making the request` })
        }
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}

async function getIndividualShare(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findOne({ 'individualShare.idUser': req.body.idUser, '_id': patientId });
        var found =false;
        var pos = -1;
        if(patient){
            for (var i = 0; i < patient.individualShare.length && !found; i++) {
                if(patient.individualShare[i].idUser == req.body.idUser){
                    pos = i;
                    found = true;
                }
            }
        }

        if(found){
            res.status(200).send({ individualShare: patient.individualShare[pos]})
        }else{
            res.status(200).send({ message: 'not found' })
        }
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}


function getUniqueFileName(patientId) {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@$^*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var passwordLength = 20;
    var password = "";
    for (var i = 0; i <= passwordLength; i++) {
      var randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber +1);
     }
     var url = client_server+'/?key='+patientId+'&token='+password
    return url;
  }

async function getModules(req, res) {
    try {
        let patientId = crypt.decrypt(req.params.patientId);
        const patient = await Patient.findById(patientId, { "_id": false});
        const user = await User.findById(patient.createdBy);
        if(user){
            res.status(200).send({ modules: user.modules })
        }else{
            res.status(200).send({ modules: ["seizures"]})
        }
    } catch (err) {
        return res.status(500).send({ message: `Error making the request: ${err}` })
    }
}


module.exports = {
    getPatientsUser,
    getPatientsRequest,
    getPatient,
    getAllPatientInfo,
    getGeneralShare,
    getCustomShare,
    setIndividualShare,
    getIndividualShare,
    getModules
}
