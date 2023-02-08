"use strict";
exports.signupfield = (data) => {
    let errors = [];

    if (data) {
        if (!data.email[0]) {
            errors.push('Missing email field');
        }
        if (!data.displayname[0]) {
            errors.push('Missing first_name field');
        }
        if (!data.password[0]) {
            errors.push('Missing password field');
        }

        if (!data.re_password[0]) {
            errors.push('Missing confirm password field');
        }

        if (errors.length) {
            return { success: false, msg: 'Fields are missing', data: data, errors: errors.join(',') };
        } else {
            return { success: true, msg: 'Fields are valid', data: data, errors: errors.join(',') };
        }
    } else {
        return res.status(400).send({ success: false, msg: 'Fields are missing', data: data, errors: 'Fields are missing' });
    }
};

exports.productField = (data, files) => {
    let errors = [];
    if (data) {
        if (!data.product_name) {
            errors.push('Missing name field');
        }
        if (!data.product_price) {
            errors.push('Missing price field');
        }
        if (!data.product_details) {
            errors.push('Missing details field');
        }
        if (!files.product_images) {
            errors.push('Missing Inage field');
        }
        if (!data.category) {
            errors.push('Missing Category field');
        }
        if (errors.length) {
            return { success: false, msg: 'Fields are missing', data: data, errors: errors.join(',') };
        } else {
            return { success: true, msg: 'Fields are valid', data: data, errors: errors.join(',') };
        }
    } else {
        return ({ success: false, msg: 'Fields are missing', data: data, errors: 'Fields are missing' });
    }
};

exports.buyProductForm = (data) => {
    let errors = [];
    if (data) {
        if (!data.product_id) {
            errors.push('Product Details Not Found');
        }
        if (!data.currency) {
            errors.push('Currency Not Selected');
        }
        if (!data.address) {
            errors.push('Missing address field');
        }
        if (!data.contact) {
            errors.push('Missing contact field');
        }
        if (errors.length) {
            return { success: false, msg: 'Fields are missing', data: data, errors: errors.join(',') };
        } else {
            return { success: true, msg: 'Fields are valid', data: data, errors: '' };
        }
    } else {
        return ({ success: false, msg: 'Fields are missing', data: data, errors: 'All Fields are missing' });
    }
}