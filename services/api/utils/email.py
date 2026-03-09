import os
from mailjet_rest import Client

def send_email(dest, subject, content):
    try:
        mailjet = Client(
            auth=(
                os.environ.get("MAILJET_ACCESS_KEY"),
                os.environ.get("MAILJET_SECRET_KEY")
            ),
            version='v3.1'
        )
        data = {
            'Messages': [
                {
                    "From": {
                        "Email": "stanleyserbin@gmail.com",
                        "Name": "Matcha"
                    },
                    "To": [
                        {
                            "Email": dest['email'],
                            "Name": dest['name']
                        }
                    ],
                    "Subject": subject,
                    "TextPart": content,
                    "HTMLPart": content,
                }
            ]
        }
        result = mailjet.send.create(data=data)
        print (result.status_code)
        print (result.json())
        return True
    except Exception as e:
        print(e)
        return False


def send_signup_confirmation_email(dest, confirmation_code):
    return send_email(
        dest=dest,
        subject="Matcha: Please confirm your email",
        content="Your matcha confirmation code is: {}".format(confirmation_code)
    )

def send_password_update_request_email(dest, confirmation_code):
    return send_email(
        dest=dest,
        subject="Matcha: you have requested a new password",
        content="Your matcha new password request confirmation code is: {}".format(confirmation_code)
    )
