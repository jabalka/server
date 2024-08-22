const { kMaxLength } = require('buffer');
const {Schema, model} = require('mongoose');
// title
const titleMin = 5;
const titleMax = 25
// description
const descrMin = 10;
const descrMax = 250;
// code
const codeMin = 10;
const codeMax = 2500;

const schema = new Schema({
    title: {type: String, required: [true, 'Title is required!'], minLength: [titleMin, `Title must be at least ${titleMin} characters long!`], maxLength: [titleMax, `Title must be less than ${titleMax} characters long!`]},
    description: {type: String, required: [true, 'Description is required!'], minLength: [descrMin, `Description must be at least ${descrMin} characters long!`], maxLength: [descrMax, `Description  must be less than ${descrMax} characters long!`]},
    // img: {type: String, required: [true, 'Image URL is required!']},
    language: {type: String, required: true},
    code: {type: String, required: [true, 'The Code is required, please write your code or paste it into the space provided!'], minLength: [codeMin, `The code less than ${codeMin} characters is not considered helpfull!`], maxLength: [codeMax, `Code with more than ${codeMax} must be written in separate Code Sheets. However, it is better to be connected to each others.`]},
    // date: {type: Date, required: true},
    createdAt: {type: Date, default: Date.now},
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
});

module.exports = model('Project', schema);