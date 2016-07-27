if exist('filepath', 'var') == 1;
  m = csvread(filepath);
  disp(m + 1)
  csvwrite([filepath, '.processed.txt'], m + 1);
end;
