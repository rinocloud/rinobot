from __future__ import division
import os.path
import numpy as np
from numpy import ndarray
import re
import os
DEBUG = False


class Error(Exception):
    """Base class for exceptions in this module. """
    pass


class UnhandledFileError(Error):
    """Occurs if the file has an unknown structure."""
    pass


class ParameterTypeError(Error):
    """Occurs if a parameter has an unknown type."""
    pass


class UnhandledDataType(Error):
    """Occurs if the file has an unknown data structure."""
    pass


class DataArray():
    """A simple class holding the minimal structure for storing STM data.
       The data is a numpy array with the right shape according to the type of
       data (i.e a vector for curve, a matrix for images, a 3d matrix for maps.)
       Info is a python dictionary to store physical information on the data.
    """
    def __init__(self, data, info):
        self.data = data  # is a nupmy matrix
        self.info = info.copy()  # a simple dictionary


class NanonisFile(object):
    """Parser for Nanonis SXM file to a Python object"""

    def __init__(self, filename):
        """ \arg filename should be a valid path to a nanonis SXM file."""

        self.measurements = []
        self.data = []
        self.header = {}
        self.header['filename'] = filename

        self.open()

    def open(self):
        """ Parse a Nanonis file and create the data array with physical meaning
            based on the file structure stored in the file header.
        """

        # Open file in binary format. The header is stored in ascii format,
        # and data in 4 bytes big endian floats all in the same file.
        self.file = open(os.path.normpath(self.header['filename']), 'rb')

        # Check if file is a nanonis file
        s1 = self.file.readline().decode("utf-8")
        if not re.match(':NANONIS_VERSION:', str(s1)):
            raise UnhandledFileError("The file %s does not have the Nanonis SXM" % self.header['filename'])
            return

        self.header['version'] = int(self.file.readline().decode("utf-8"))

        # Read header lines until the tag 'SCANIT_END' is found
        while True:
            line = self.file.readline().decode("utf-8").strip()

            if re.match('^:.*:$', line):  # Tag are words between colons
                tagname = line[1:-1]  # remove colons
                if DEBUG:
                    print ('New tag %s' % tagname)
            else:  # it's not a tag, we are reading a value for the previous tag
                if 'Z-CONTROLLER' == tagname:
                    # This is a tab separated table on two line
                    # first line is the tag and second value
                    keys = line.split('\t')
                    values = self.file.readline().decode("utf-8").strip().split('\t')
                    self.header['z-controller'] = dict(zip(keys, values))
                elif tagname in ('BIAS', 'REC_TEMP', 'ACQ_TIME', 'SCAN_ANGLE'):
                    self.header[tagname.lower()] = float(line)
                elif tagname in ('SCAN_PIXELS', 'SCAN_TIME', 'SCAN_RANGE', 'SCAN_OFFSET'):
                    self.header[tagname.lower()] = [float(i) for i in re.split('\s+', line)]  # two numerical value separated by any amount of spaces
                elif 'DATA_INFO' == tagname:
                    # This is a tab separated table on two line
                    # first line is the tag and next store the values
                    # an empty line separate the values from the next tag.
                    if 1 == self.header['version']:
                        keys = re.split('\s\s+', line)
                        # FIXME I have no V1 file to test that, I expect
                        # from the rest of the files that there are min 2
                        # spaces to separate values.
                    else:  # from V2 tab separated
                        keys = line.split('\t')
                    self.header['data_info'] = []

                    while True:
                        line = self.file.readline().decode("utf-8").strip()
                        # one empty line separate data from the next tag
                        if not line:
                            break
                        values = line.strip().split('\t')
                        self.header['data_info'].append(dict(zip(keys, values)))
                elif tagname in ('SCANIT_TYPE', 'REC_DATE', 'REC_TIME', 'SCAN_FILE', 'SCAN_DIR'):
                    self.header[tagname.lower()] = line
                elif 'SCANIT_END' == tagname:
                    break  # end of header
                else:   # treat unknown tag content as string
                        # they could be multiline, like comments
                    if not tagname.lower() in self.header:  # 1st create
                        self.header[tagname.lower()] = line
                    else:  # then appends all the next lines
                        self.header[tagname.lower()] += '\n' + line

        # Fix a bug of V1 format
        if 1 == self.header['version']:
            # In version 1 line and pixel were inverted
            self.header['scan_pixels'].reverse()

        # read until 1A 04 (hex) is found, = beginning of binary data
        s = '\x00\x00'
        while '\x1A\x04' != s:
            s = s[1] + self.file.read(1).decode('utf-8')

        size = int(self.header['scan_pixels'][0] * self.header['scan_pixels'][1] * 4)  # 4 Bytes/px

        nchannels = len(self.header['data_info'])
        # supp = 0
        # for n in range(nchannels):  # add 1 per "both"/mirrored directions
        #     supp += ('both' == self.header['data_info'][n]['Direction'])
        # nchannels += supp

        for i in range(nchannels):
            data_buffer = self.file.read(size)
            self.header['channel'] = i
            self.data.append(DataArray(
                ndarray(
                    shape=tuple(self.header['scan_pixels']),
                    dtype='>f',
                    buffer=data_buffer),
                self.header
            ))

    def getData(self):
        """Return the read data"""
        return self.data


def load(filename):
    """Loader function for further data processing
    Return a list of DataArray object"""

    return NanonisFile(filename)


def print_to_asc(index, original_path, data):
    template = """:NANONIS_VERSION:
%d
:SCANIT_TYPE:
              FLOAT            MSBFIRST
:REC_DATE:
 %s
:REC_TIME:
%s
:REC_TEMP:
      %s
:ACQ_TIME:
      %d
:SCAN_PIXELS:
       %d       %d
:SCAN_FILE:
%s
:SCAN_TIME:
             %d             %d
:SCAN_RANGE:
           %lf           %lf
:SCAN_OFFSET:
             %lf         %lf
:SCAN_ANGLE:
            %lf
:SCAN_DIR:
%s
:BIAS:
            %lf
:DATA_INFO:
  Channel	Name	Unit	Direction	Calibration	Offset
  %s	%s	%s	%s	%s	%s

:SCANIT_END:


"""

    printable = template % (
        data.info["version"],
        data.info["rec_date"],
        data.info["rec_time"],
        data.info["rec_temp"],
        data.info["acq_time"],
        data.info["scan_pixels"][0],
        data.info["scan_pixels"][1],
        data.info["filename"],
        data.info["scan_time"][0],
        data.info["scan_time"][1],
        data.info["scan_range"][0],
        data.info["scan_range"][1],
        data.info["scan_offset"][0],
        data.info["scan_offset"][1],
        data.info["scan_angle"],
        data.info["scan_dir"],
        data.info["bias"],
        data.info["data_info"][index]["Channel"],
        data.info["data_info"][index]["Name"],
        data.info["data_info"][index]["Unit"],
        data.info["data_info"][index]["Direction"],
        data.info["data_info"][index]["Calibration"],
        data.info["data_info"][index]["Offset"]
    )
    return printable


def process(path, length=1):
    p = re.compile(r'.*.sxm')

    if re.search(p, path):
        nf = load(path)

        for i, element in enumerate(nf.data):
            print i, length
            if i >= length:
                break

            printable = print_to_asc(i, path, element)
            with open(path + '[%s].asc' % element.info["data_info"][i]["Name"], 'wt') as fp:
                fp.write(printable)

            with open(path + '[%s].asc' % element.info["data_info"][i]["Name"], 'a') as fp:
                np.savetxt(fp, np.array(element.data).T)

if __name__ == "__main__":
    import sys
    process(sys.argv[1], 1000)
