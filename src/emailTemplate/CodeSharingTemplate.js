exports.CodeSharingTemplate = ({
  to,
  from,
  subject,
  productData,
  transporter,
}) => {
  const mailOptions = {
    to,
    from,
    subject,
    productData,
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
                                                                    style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 600; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                    Hello User
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
                                                                    This email mentioned the codes for the Gift cards which is bought by you.
                                                                </p>
                                                            </td>
                                                        </tr>  
                                                        <tr>
                                                                <td>
                                                                ${productData
                                                                  .map(
                                                                    (product) =>
                                                                      '<div style="margin-bottom: 10px">' +
                                                                      '<div style="display: flex">' +
                                                                      "<img src=" + "https://arabgiftcard.com//" +
                                                                      product.productImage +
                                                                      ' height="100" width="100" />' +
                                                                      '<div style="margin-left: 15px">' +
                                                                      '<p style="margin-bottom: 0px; font-size: 16px; font-weight: 600;">' +
                                                                      product.productName +
                                                                      " (Qty: " +
                                                                      product.productQty +
                                                                      ")" +
                                                                      "</p>" +
                                                                      '<div style="display: flex; flex-wrap: wrap">' +
                                                                      product.codeString
                                                                        .split(
                                                                          ","
                                                                        )
                                                                        .map(
                                                                          (
                                                                            code
                                                                          ) =>
                                                                            '<p style="margin-right: 10px; border: 1px solid; padding: 5px">' +
                                                                            code +
                                                                            "</p>"
                                                                        )
                                                                        .join(
                                                                          ""
                                                                        ) +
                                                                      "</div>" +
                                                                      "</div>" +
                                                                      "</div>" +
                                                                      "</div>"
                                                                  )
                                                                  .join("")}
                                                                </td>
                                                              </tr>
                                                        <tr>
                                                            <td style="padding-bottom: 20px; margin-top: 20px" align="left" valign="top"
                                                                class="description">
                                                                <p class="text"
                                                                    style="color: #000000; font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 400; font-style: normal; letter-spacing: normal; line-height: 22px; text-transform: none; text-align: left; padding: 0; margin: 0">
                                                                    This is confidential information. Please do not share with others. If you need any assistance or help please visit Contact page.
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
</table>
      `,
  };

  return transporter.sendMail(mailOptions);
};
