const nodemailer = require('nodemailer');

module.exports = (formulario) => {  
    var transporter = nodemailer.createTransport({
            service: 'gmail',    
            auth: {      
                user: 'carhounderspain@gmail.com',      
                pass: '11enero2021'
                
            }  
    });
    const mailOptions = {    
      from: "Out Time",    
      to: 'carhounderspain@gmail.com',    
      subject: `Mensaje contacto de : ${formulario.nombre} `,    
      html: ` <strong>Nombre:</strong> ${formulario.nombre} <br/><br>    
      <strong>E-mail:</strong> ${formulario.correo} <br/><br>    
      <strong>Asunto:</strong> ${formulario.asunto} <br/><br>    
      <strong>Mensaje:</strong> ${formulario.mensaje}`          
    };
    transporter.sendMail(mailOptions, function (err, info) {   
        if (err)      console.log(err)    
        else      console.log(info);  
    });
}