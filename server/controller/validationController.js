"use strict";
var validator = require('validator');

exports.checkValidation = (data) => {

    let errors = [];

    if (data) {

        for (var [key, value] of Object.entries(data)) {

            value = validator.trim(value);
            value = validator.escape(value);

            if (validator.isEmpty(value)) {
                errors.push('Invalid Input Data');
            }
        }

        if (errors.length) {
            return { success: false, msg: 'Fields are missing', data: data, errors: errors.join(',') };
        } else {
            return { success: true, msg: 'Fields are valid', data: data, errors: errors.join(',') };
        }
    } else {
        return res.status(400).send({ success: false, msg: 'Fields are missing', data: data, errors: 'Fields are missing' });
    }


}

exports.updateProfileValidation = (data) => {

    let errors = [];

    if (data) {

        for (var [key, value] of Object.entries(data)) {
            value = value[0]
            value = validator.trim(value);
            value = validator.escape(value);

            if (validator.isEmpty(value)) {
                errors.push('Invalid Input Data');
            }
        }

        if (errors.length) {
            return { success: false, msg: 'Fields are missing', data: data, errors: errors.join(',') };
        } else {
            return { success: true, msg: 'Fields are valid', data: data, errors: errors.join(',') };
        }
    } else {
        return res.status(400).send({ success: false, msg: 'Fields are missing', data: data, errors: 'Fields are missing' });
    }


}