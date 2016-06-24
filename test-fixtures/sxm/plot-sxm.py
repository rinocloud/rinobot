
import sys
import numpy as np
import matplotlib.pyplot as plt

data = np.loadtxt(sys.argv[1], skiprows=35)
plt.imshow(data, extent=[0, 100, 0, 1], aspect='auto')
plt.savefig(sys.argv[1] + '.png')
