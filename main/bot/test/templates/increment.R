

filepath<-commandArgs(TRUE)
data <- scan(filepath, what=integer(), sep="\n")

print(data)

newFilepath = paste(filepath, ".processed.txt", sep="")
newData = data + 1
write(newData, file=newFilepath, sep="\n")
