import matplotlib.pyplot as plt
import numpy as np
import sys

data = np.loadtxt(sys.argv[1])
plt.plot(data)
plt.savefig(sys.argv[1] + '.png')
