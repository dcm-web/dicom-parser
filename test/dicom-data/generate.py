import json
import os
import pydicom
import hashlib


def get_decoded_pixel(ds):
    try:
        arr = ds.pixel_array
        if ds.file_meta.TransferSyntaxUID == "1.2.840.10008.1.2.4.50":  # JPEG baseline
            print("changed color space for jpeg image")
            arr = pydicom.pixel_data_handlers.util.convert_color_space(arr, ds.PhotometricInterpretation, "RGB")
        return arr.tobytes()
    except Exception:
        print(f"failed to decode pixel data of {filename}")
        return None


setname = 'pydicom'
in_dir = os.path.join(os.path.dirname(__file__), '..', 'dicom-files', setname)
for filename in os.listdir(in_dir):
    in_file = os.path.join(in_dir, filename)
    if not os.path.isfile(in_file):
        continue
    print(f"parsing file {filename}")
    ds = pydicom.read_file(in_file, force=True)

    def tag_string(element):
        return str(element.tag).replace(" ", "")

    tags = [tag_string(de) for de in ds.file_meta] + [tag_string(de) for de in ds]
    file_data = {
        "tags": tags,
        "pixelDataHash": hashlib.sha1(ds.PixelData).hexdigest() if ds.get("PixelData") else None,
        "pixelDecodedHash": hashlib.sha1(get_decoded_pixel(ds)).hexdigest() if get_decoded_pixel(ds) else None
    }

    out_dir = os.path.join(os.path.dirname(__file__), setname)
    with open(os.path.join(out_dir, f'{filename}.json'), 'w') as outfile:
        json.dump(file_data, outfile, indent=2)
