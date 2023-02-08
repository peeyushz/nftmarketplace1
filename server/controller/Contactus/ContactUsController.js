"use strict";
const ContactUs = require('../../model/contactUsModel');
const Validator = require('../validationController');

exports.addContact = (req, res) => {
    let data = Validator.checkValidation(req.body);
    if (data['success'] === true) {
        data = data['data'];
    } else {
        return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
    }

    let Email = data.email;
    let FullName = data.fullname;
    let Country = data.country;
    let Subject = data.subject;
    let Message = data.message;


    //New report
    const NewContactUsReport = new ContactUs({
        email: Email,
        fullName: FullName,
        country: Country,
        subject: Subject,
        message: Message
    })

    NewContactUsReport.save(NewContactUsReport).then((contactUsData) => {
        if (contactUsData) {
            res.status(200).send({ success: true, msg: "Thanks for contacting us, our team will get back to you soon", data: '', errors: '' });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating a create operation"
        });
    })
}