exports.ForgotPasswordEmailTemplate = ({
  to,
  from,
  subject,
  link,
  transporter,
  role = "user",
}) => {
  const mailOptions = {
    to,
    from,
    subject,
    link,
    html: `
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #ffffff" id="bodyTable">
          <tbody>
              <tr>
                  <td style="padding-right: 10px; padding-left: 10px;" align="center" valign="top" id="bodyCell">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width: 600px">
                          <tbody>
                              <tr>
                                  <td align="center" valign="top">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color: #fff; border-color: #e5e5e5; border-style: solid; border-width: 0 1px 1px 1px;">
                                          <tbody>
                                              <tr>
                                                  <td style="background-color: #3DB166; font-size: 1px; line-height: 3px" class="topBorder" height="3">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                  <td style="padding-bottom: 20px; padding-top: 0px;" align="center" valign="top" class="imgHero">
                                                      
                                                  </td>
                                              </tr>
      
                                              <tr>
                                                  <td style="padding-left: 20px; padding-top: px; padding-right: 20px" align="left" valign="top" class="containtTable ui-sortable">
                                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="padding-bottom: 20px;" align="left" valign="top" class="description">
                                                                      <p class="text"
                                                                          style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 600; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: capitalize; text-align: left; padding: 0; margin: 0">
                                                                          Hello ${role}
                                                                      </p>
                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding-left: 20px; padding-right: 20px" align="center" valign="top" class="containtTable ui-sortable">
                                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="padding-bottom: 20px;" align="left" valign="top"
                                                                      class="description">
                                                                      <p class="text"
                                                                          style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 500; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                          You have requested to reset your password for your account.
                                                                      </p>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td style="padding-bottom: 20px;" align="left" valign="top"
                                                                      class="description">
                                                                      <p class="text"
                                                                          style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                          To reset your password, please click the button below:
                                                                      </p>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td style="padding-bottom: 20px;" align="center" valign="top"
                                                                      class="description">
                                                                      <a href="${link}"
                                                                          style="background-color: #3DB166; color: #ffffff; display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 600; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: center;">Reset Password</a>
                                                                  </td>
                                                              </tr>
                                                                <tr>
                                                                  <td style="padding-bottom: 20px;" align="left" valign="top"
                                                                      class="description">
                                                                      <p class="text"
                                                                          style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                          If this button does not work please use this link :
                                                                      </p>
                                                                      <a href="${link}">${link}</a>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td style="padding-bottom: 20px;" align="left" valign="top"
                                                                      class="description">
                                                                      <p class="text"
                                                                          style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                          If you did not request a password reset, please ignore this email.
                                                                      </p>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td style="padding-bottom: 20px;" align="left" valign="top"
                                                                      class="description">
                                                                      <p class="text"
                                                                          style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                          Best regards,
                                                                      </p>
                                                                      <p class="text"
                                                                          style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                          Management Team
                                                                      </p>
                                                                  </td>
                                                              </tr>
      
                                                          </tbody>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                          <tbody>
                                              <tr>
                                                  <td style="font-size: 1px; line-height: 1px" height="30">&nbsp;</td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width: 600px">
                          <tbody>
                              <tr>
                                  <td align="center" valign="top">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
                                          <tbody>
                                              <tr>
                                                  <td style="font-size: 1px; line-height: 1px" height="30">&nbsp;</td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                              <tr>
                                  <td style="font-size: 1px; line-height: 1px" height="30">&nbsp;</td>
                              </tr>
                          </tbody>
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>`,
  };

  return transporter.sendMail(mailOptions);
};
