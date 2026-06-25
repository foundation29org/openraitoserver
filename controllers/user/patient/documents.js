// functions for each call of the api on social-info. Use the social-info model

'use strict'

// add the social-info model
const Document = require('../../../models/document')
const Patient = require('../../../models/patient')
const crypt = require('../../../services/crypt')

async function getDocuments (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		const eventsdb = await Document.find({"createdBy": patientId}).select("-createdBy");
		var listEventsdb = [];

		eventsdb.forEach(function(eventdb) {
			listEventsdb.push(eventdb);
		});
		res.status(200).send(listEventsdb)
	} catch (err) {
		return res.status(500).send({message: `Error making the request: ${err}`})
	}
}

async function saveDocument (req, res){
	try {
		let patientId= crypt.decrypt(req.params.patientId);
		let eventdb = new Document()
		eventdb.name = req.body.name;
		eventdb.description = req.body.description;
		eventdb.url = req.body.url;
		eventdb.dateDoc = req.body.dateDoc;
		eventdb.notes = req.body.notes;
		eventdb.createdBy = patientId

		const eventdbStored = await eventdb.save();
		if(eventdbStored){
			res.status(200).send({message: 'Done'})
		}
	} catch (err) {
		res.status(500).send({message: `Failed to save in the database: ${err} `})
	}
}

async function deleteDocument (req, res){
	try {
		let documentId=req.params.documentId
		const documentdb = await Document.findById(documentId);
		if (documentdb){
			await documentdb.deleteOne();
			res.status(200).send({message: `The document has been deleted`})
		}else{
			return res.status(404).send({code: 208, message: `Error deleting the document`})
		}
	} catch (err) {
		return res.status(500).send({message: `Error deleting the document: ${err}`})
	}
}

module.exports = {
	getDocuments,
	saveDocument,
	deleteDocument
}
