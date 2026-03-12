import os
from imagekitio import ImageKit

client = ImageKit(
    private_key=os.environ.get("IMAGE_KIT_SECRET_KEY"),
)

def upload_files(public_id, file):
    response = client.files.upload(
        file=file.stream,
        file_name="{}.jpg".format(public_id),
    )
    print(response.file_id)
    print(response.url)
