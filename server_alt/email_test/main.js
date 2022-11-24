const AWS = require("aws-sdk");
const ses = new AWS.SES({
    region: 'us-west-2'
});

const mainFunction = async () => {

    const params = require("./email_template.json");
    return await ses.createTemplate(params).promise();

}

mainFunction().then(() => {

    console.log('template created successfully.');
}, (ex) => {
    console.log('Error in template creation.');
    console.dir(ex.message);

});