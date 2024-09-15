import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = internalAction({
  args: { email: v.optional(v.string()), firstName: v.optional(v.string()) },
  handler: async (actionCtx, args) => {
    const { email, firstName } = args;

    if (!email) {
      console.error(`Can't send welcome email as email is missing`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: "hello@exploresnippets.today",
      to: [email],
      subject: firstName
        ? `Welcome to Snippets, ${firstName}!`
        : "Welcome to Snippets!",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html dir="ltr" lang="en">
         <head>
            <link rel="preload" as="image" href="https://www.exploresnippets.today/logo.png" />
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
         </head>
         <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
            Snippets is an AI powered ed-tech social media platform that aims to enhance your knowledge, one snippet at a time.
         </div>
         <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;margin:0 auto;padding:20px 0 48px">
               <tbody>
                  <tr style="width:100%">
                     <td>
                        <img alt="Snippets logo" src="https://www.exploresnippets.today/logo.png" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" width="170" height="170" />
                        <p style="font-size:16px;line-height:26px;margin:16px 0">
                           ${firstName ? `Hi ${firstName}` : "Hi"},
                        </p>
                        <p style="font-size:16px;line-height:26px;margin:16px 0">I'm thrilled to welcome you to Snippets!</p>
                        <p style="font-size:16px;line-height:26px;margin:16px 0">I've created this AI-powered platform to be your personal learning companion. Here, you'll discover fascinating bits of knowledge tailored to your interests, and embark on an exciting journey of continuous learning.</p>
                        <p style="font-size:16px;line-height:26px;margin:16px 0">
                           Your adventure begins now. Dive in, explore a snippet, and let your curiosity guide you.
                           I can't wait to see what amazing things you'll discover!
                        </p>
                        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="text-align:center">
                           <tbody>
                              <tr>
                                 <td>
                                    <a href="https://exploresnippets.today" style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#F37593;border-radius:3px;color:#fff;font-size:16px;text-align:center;padding:12px 12px 12px 12px" target="_blank">
                                       <span>
                                          <!--[if mso]><i style="mso-font-width:300%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]-->
                                       </span>
                                       <span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Start exploring Snippets!</span>
                                       <span>
                                          <!--[if mso]><i style="mso-font-width:300%" hidden>&#8202;&#8202;&#8203;</i><![endif]-->
                                       </span>
                                    </a>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        <p style="font-size:16px;line-height:26px;margin:16px 0">Happy learning,<br />Indrajit</p>
                        <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#cccccc;margin:20px 0" />
                        <p style="font-size:12px;line-height:24px;margin:16px 0;color:#8898aa">Snippets - Where every scroll inspires learning.</p>
                     </td>
                  </tr>
               </tbody>
            </table>
         </body>`,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  },
});
