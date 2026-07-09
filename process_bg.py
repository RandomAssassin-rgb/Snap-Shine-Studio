import os
from rembg import remove

assets_dir = 'public/ar-assets'
images = ['dog.png', 'glasses.png', 'crown.png', 'bows.png']

for img_name in images:
    path = os.path.join(assets_dir, img_name)
    if os.path.exists(path):
        with open(path, 'rb') as i:
            input_data = i.read()
            output_data = remove(input_data)
        with open(path, 'wb') as o:
            o.write(output_data)
        print(f'Processed {img_name}')
