import sys
import matplotlib.pyplot as plt

with open(sys.argv[1]) as f:
    content = f.readlines()

lines = [c.split('\t') for c in content]
array = [[float(a.strip()) for a in l] for l in lines]

plt.imshow(array, extent=[0, 100, 0, 1], aspect='auto')
plt.savefig(sys.argv[1] + '.png')
