
const { BlobServiceClient } = require("@azure/storage-blob");
const { ClientSecretCredential } = require("@azure/identity");

const { QueueServiceClient } = require('@azure/storage-queue');


const { v1: uuidv1 } = require("uuid");
const mime = require('mime-types');

module.exports = function(RED) {
    function ShAzStrgQueueReceiver(config) {
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
     
          const queueServiceClient = new QueueServiceClient(
                `https://${this.config.azure_storage_account_name}.queue.core.windows.net`,
                credential
          );  
        
        this.on('input', async (msg) => {
            //Назва черги, з якої читаємо повідомлення
            let queueName=msg.queueName || config.queueName;
            // Кількість повідомлень для одночасного отримання
            let maxMessages = parseInt(msg.maxMessages || config.maxMessages || 1);
            //Скільки секунд повідомлення будуть невидимими для інших (Timeout)
            let visibilityTimeout = parseInt(msg.visibilityTimeout  || config.visibilityTimeout || 30);

            console.log( `Queue Read params  queueName: ${queueName}  maxMessages: ${maxMessages} visibilityTimeout: ${visibilityTimeout}` )

            try {
                queueClient = queueServiceClient.getQueueClient(queueName);
                node.warn(`Queue client initealized for queue: ${queueName}`);
                // Кількість повідомлень для одночасного отримання
                //const maxMessages = 10;
                // Скільки секунд повідомлення будуть невидимими для інших (Timeout)
                //const visibilityTimeout = 30;

                // 1. Отримання повідомлень
                const receiveResponse = await queueClient.receiveMessages({ 
                    numberOfMessages: maxMessages, 
                    visibilityTimeout: visibilityTimeout 
                });

                if (receiveResponse.receivedMessageItems.length === 0) {
                    // Немає повідомлень, повертаємо null
                    return null;
                }  


                // Масив вихідних повідомлень для Node-RED
                const outputMsgs = [];

                // 2. Обробка та видалення повідомлень
                for (const message of receiveResponse.receivedMessageItems) {
                    // Декодуємо тіло повідомлення (воно в base64)
                    const messageBody = Buffer.from(message.messageText, 'base64').toString('utf8');
                    
                    // Створюємо вихідне повідомлення Node-RED
                    outputMsgs.push({
                        queueMessageBody: JSON.parse(messageBody),
                        queueMessageId: message.messageId,
                        popReceipt: message.popReceipt // Необхідно для видалення
                    });
                    
                    // 3. Видаляємо повідомлення з черги 
                    // ВАЖЛИВО: Видаляйте лише після того, як ви впевнені, що обробка пройшла успішно
                    // Тут ми видаляємо його відразу, що підходить для простого прикладу.
                    // У реальному житті краще видаляти його в наступному вузлі,
                    // якщо ви використовуєте Promise.

                    //console.log( `====MSG  containerName: ${msg.containerName}  blobName: ${msg.blobName}` )
                    //console.log( `====OPTS containerName: ${options.containerName}  blobName: ${options.blobName}` )
                    //console.log( `====OPTS containerName: ${options.containerName}  blobName: ${options.blobName} blobMetadata ${JSON.stringify(options.blobMetadata)}` )

                    
                    await queueClient.deleteMessage(message.messageId, message.popReceipt);
                }
                
       
                //console.log(`Messages has got successfully. `)
                //msg.payload = {}
                //msg.payload.messages = outputMsgs
                //this.send(msg);

                console.log(`Messages has got successfully. Total: ${outputMsgs.length}`)
                //##############################
                // РЕКОМЕНДОВАНИЙ ПІДХІД: Ітеруйте та відправляйте кожен елемент окремо
                node.error(`Array contents before send: ${JSON.stringify(outputMsgs)}`);
                if (outputMsgs.length > 0) {
                    msg.payload = outputMsgs; 
                    this.send(msg);
                    
                } else {
                    // Якщо повідомлень немає, не відправляємо нічого
                    return null; 
                }





            } catch(e) {
                // Clear status in the node
                this.status({});
                // Send error to catch node, original msg object must be provided
                this.error(e.message, msg);
            }
        });
    }

    RED.nodes.registerType("shazstrgqueue-receiver", ShAzStrgQueueReceiver);

}
