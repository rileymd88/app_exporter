# App Exporter
A small nodejs application to export/import a Qlik Sense app with all extensions used

# Installation Instructions
1. Install nodejs here: https://nodejs.org/dist/v8.11.1/node-v8.11.1-x64.msi
2. Download the entire package here: https://github.com/rileymd88/app_exporter/archive/master.zip 
3. Unzip the package somewhere on your computer (does not matter where)
4. Create a new folder within the app_exporter folder called 'cert'...it should be created on the same level as the app folder
5. Export platform independent certificates from Qlik Sense. You can find instructions here: https://help.qlik.com/en-US/sense/September2017/Subsystems/ManagementConsole/Content/export-certificates.htm
6. Copy the certificates to the cert folder
7. Edit the config.json file. Normally only the engineHost, userDirectory and userId need to be changed

# Export an App + Extensions
1. Click on the start_server.bat file within the app_exporter folder. You should then see a cmd screen open with the message: "server running on port: yourPort"
2. Go to https://localhost:8081/app/index.html and select your app and hit Export. Your app and all extensions will be exported to the AppExporter folder which can found within the appExporterFolder you defined in the config.json file Ex) C:/AppExporter/app name 

# Import an App + Extensions
1. Click on the start_server.bat file within the app_exporter folder. You should then see a cmd screen open with the message: "server running on port: yourPort"
2. Go to https://localhost:8081/app/index.html and select import and then select the folder where your app and extensions are <b>(This folder needs to be within the appExporterFolder you defined in the config.json file)</b>

# Other notes
1. This application can also be used to mass import apps/extensions into Qlik Sense. Simply follow the instructions from importing an app as this application will loop through all the .zip and .qvf files in the folder you select

