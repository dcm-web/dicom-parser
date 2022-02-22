import json
import os
import pydicom

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
        "tags": tags
    }


    out_dir = os.path.join(os.path.dirname(__file__), setname)
    with open(os.path.join(out_dir, f'{filename}.json'), 'w') as outfile:
        json.dump(file_data, outfile, indent=2)
