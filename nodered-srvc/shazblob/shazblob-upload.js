
const { BlobServiceClient } = require("@azure/storage-blob");
const { ClientSecretCredential } = require("@azure/identity");
const { v1: uuidv1 } = require("uuid");
const mime = require('mime-types');

module.exports = function(RED) {
    function ShAzureBlobStorageUpload(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.config = RED.nodes.getNode(config.configname);
        if (this.config) {
            RED.log.info(`Storage Config Name: ${this.config.name}`);
        } else {
            this.error('Missing config setting');
        }
        const credential = new ClientSecretCredential(
            this.config.azure_tenant_id,
            this.config.azure_client_id,
            this.config.azure_client_secret
          );
          const blobServiceClient = new BlobServiceClient(
            `https://${this.config.azure_storage_account_name}.blob.core.windows.net`,
            credential
          );
     
        this.on('input', async (msg) => {
            let contentType = msg.contentType;
            let bfilename=msg.blobName || config.blobName
            // Якщо msg.contentType не передано, спробуємо визначити його за ім'ям файлу
            if (!contentType && bfilename ) {
                // 1. Отримати MIME-тип, використовуючи ім'я Blob-об'єкта
               
                const determinedMimeType = mime.lookup(bfilename);

                if (determinedMimeType) {
                    contentType = determinedMimeType;
                    node.warn(`Content-Type автоматично визначено як: ${contentType}`);
                }
            }



            const options = {
                buffer: msg.payload,
                //filePath: msg.filePath || config.filePath,
                // Allow blobName to be overwritten by msg.blobName
                blobName: msg.blobName || config.blobName,
                containerName: msg.containerName || config.containerName,
                blobMetadata: msg.blobMetadata || {},
                blobContentType: contentType || 'application/octet-stream'
            };
            try {

                console.log( `====MSG  containerName: ${msg.containerName}  blobName: ${msg.blobName}` )
                //console.log( `====OPTS containerName: ${options.containerName}  blobName: ${options.blobName}` )
                console.log( `====OPTS containerName: ${options.containerName}  blobName: ${options.blobName} blobMetadata ${JSON.stringify(options.blobMetadata)}` )
                const containerName = options.containerName;
                const blobName =  options.blobName;
                const imageContent = options.buffer; 
                const blobUploadOptions={ metadata: options.blobMetadata, blobHTTPHeaders: {blobContentType: options.blobContentType} }  ;
                
                // Get a reference to a container
                const containerClient = blobServiceClient.getContainerClient(containerName);
      
                // Create the container if it does not exist
                await containerClient.createIfNotExists();
      
                // Get a block blob client
                 const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
                // Upload data to the blob
                const uploadBlobResponse = await blockBlobClient.upload( imageContent,  imageContent.length, blobUploadOptions) ;
                console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`);
                msg.payload = {}
                msg.payload.requestId = uploadBlobResponse.requestId;
                msg.payload.ok = true;
                msg.payload.blobName = blobName;
                this.send(msg);
            } catch(e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }

    RED.nodes.registerType("shazbstorage-upload", ShAzureBlobStorageUpload);

}
