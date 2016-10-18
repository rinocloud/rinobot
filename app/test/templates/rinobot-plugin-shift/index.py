import sys
import os
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('filepath', type=str)
    parser.add_argument('--prefix', type=str)

    args, unknown = parser.parse_known_args()
    filepath = args.filepath

    filename_without_ext = os.path.splitext(filepath)[0]

    if args.prefix:
        dirname = os.path.dirname(filename_without_ext)
        basename = os.path.basename(filename_without_ext)
        filename_without_ext = os.path.join(dirname, args.prefix + basename)

    oname = filename_without_ext + '-shifted.txt'
    with open(oname, 'w') as outfile:
        outfile.write('123')
