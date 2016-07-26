import sys
import ast
import yaml

obj = {}

with open(sys.argv[1]) as f:
    for line in f.readlines():
        if '[' not in line and ']' not in line:
            x, y = line.split('=')
            try:
                y = ast.literal_eval(y.strip())
            except:
                y = y.strip()
            obj[x.strip()] = y

with open(sys.argv[1] + '.yaml', 'w') as outfile:
    outfile.write(yaml.dump(obj, default_flow_style=False))
