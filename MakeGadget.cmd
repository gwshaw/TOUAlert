"C:\Program Files\7-Zip\7z.exe" a -tzip TOUAlert.zip -r- *.xml *.css *.cmd *.htm *.js 
del TOUAlert.gadget
ren TOUAlert.zip TOUAlert.gadget