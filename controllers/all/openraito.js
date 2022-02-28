'use strict'

// add the user model
const User = require('../../models/user')
const Patient = require('../../models/patient')
const crypt = require('../../services/crypt')

function getPatientsUser(req, res) {
    let userId = crypt.decrypt(req.params.userId);


    User.findById(userId, { "_id": false, "password": false, "__v": false, "confirmationCode": false, "loginAttempts": false, "confirmed": false, "lastLogin": false }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error making the request:' })
        if (!user) return res.status(404).send({ code: 208, message: 'The user does not exist' })

        if (user.role == 'Clinical') {
            Patient.find({}, (err, patients) => {
                if (err) return res.status(500).send({ message: `Error making the request: ${err}` })

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

                //res.status(200).send({patient, patient})
                // if the two objects are the same, the previous line can be set as follows
                res.status(200).send({ listpatients })
            })
        } else {
            res.status(401).send({ message: 'without permission' })
        }
    })


}

function getPatientsRequest(req, res) {
    Patient.find({}, (err, patients) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })

        var listpatients = [];

        patients.forEach(function (u) {
            var id = u._id.toString();
            var idencrypt = crypt.encrypt(id);
            if(u.generalShare.data.patientInfo){
                listpatients.push({ id: idencrypt, patientName: u.patientName, surname: u.surname, birthDate: u.birthDate, gender: u.gender, group: u.group, previousDiagnosis: u.previousDiagnosis, generalShare: u.generalShare });
            }else if(u.generalShare.data.patientInfo || u.generalShare.data.medicalInfo || u.generalShare.data.devicesInfo || u.generalShare.data.genomicsInfo){
                listpatients.push({ id: idencrypt, patientName: null, surname: null, birthDate: null, gender: null, group: u.group, previousDiagnosis: null, generalShare: u.generalShare });
            }
            
        });

        //res.status(200).send({patient, patient})
        // if the two objects are the same, the previous line can be set as follows
        res.status(200).send({ listpatients })
    })


}

function getPatient(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    console.log(req.body);
    Patient.findById(patientId, { "_id": false, "createdBy": false }, (err, patient) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        if (!patient) return res.status(202).send({ message: `The patient does not exist` })
        if(patient.generalShare.data.patientInfo){
            res.status(200).send({ patient })
        }else{
            res.status(200).send({ message: 'You do not have access', generalShare: patient.generalShare })
        }
        
    })
}

function getGeneralShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findById(patientId, { "_id": false, "createdBy": false }, (err, patient) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        res.status(200).send({ generalShare: patient.generalShare })
    })
}

function getCustomShare(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findById(patientId, { "_id": false, "createdBy": false }, (err, patient) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        res.status(200).send({ customShare: patient.customShare })
    })
}

function getAllPatientInfo(req, res) {
    let patientId = crypt.decrypt(req.params.patientId);
    Patient.findById(patientId, { "createdBy": false }, (err, patient) => {
        if (err) return res.status(500).send({ message: `Error making the request: ${err}` })
        if (!patient) return res.status(202).send({ message: `You do not have access` })
        if(patient.customShare.length>0){
            patient.customShare.forEach(function (element) {
                var splittoken = element.token.split('token=');
                if(splittoken[1] == req.body.token){
                    if(element.data.patientInfo){
                        var id = patient._id.toString();
                        var idencrypt = crypt.encrypt(id);
                        var data = { id: idencrypt, patientName: patient.patientName, surname: patient.surname, birthDate: patient.birthDate, gender: patient.gender, group: patient.group, previousDiagnosis: patient.previousDiagnosis, customShare: element }
                        res.status(200).send({ data })
                    }else{
                        res.status(200).send({ message: 'You do not have access', customShare: element})
                    }
                    
                }
              });
        }else{
            res.status(200).send({ message: 'You do not have access'})
        }        
    })
}

module.exports = {
    getPatientsUser,
    getPatientsRequest,
    getPatient,
    getAllPatientInfo,
    getGeneralShare,
    getCustomShare
}