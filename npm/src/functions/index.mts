import "@azure/functions-extensions-servicebus";
import { ServiceBusMessageActions, ServiceBusMessageContext } from "@azure/functions-extensions-servicebus"
import { app, InvocationContext } from "@azure/functions";

export async function serviceBusTrigger1(
  serviceBusMessageContext: ServiceBusMessageContext, 
  context: InvocationContext
): Promise<void> {

    const message = serviceBusMessageContext.messages[0];
    context.log(message);
    
    // Get current retry count from custom properties, default to 0
    const deliveryCount = message.deliveryCount ? message.deliveryCount : 0;
    context.log(`Current retry count: ${deliveryCount}`);

    if (deliveryCount >= 3) {
        // After 3 retries, complete the message to remove it from the queue
        context.log(`Maximum retry count (3) reached. Completing message to prevent infinite loop.`);
        await serviceBusMessageContext.actions.complete(message);
        context.log('Message completed after maximum retries');
    } else {
        // Abandon with updated retry count
            const propertiesToModify = {
                retryCnt: deliveryCount + 1,
                lastRetryTime: new Date().toISOString(),
                errorMessage: "Processing failed"
            };

            context.log(`Abandoning message with retry count: ${deliveryCount + 1}`);
            await serviceBusMessageContext.actions.abandon(message, propertiesToModify);
        }
    
    
    context.log('triggerMetadata: ', context.triggerMetadata);
}

app.serviceBusQueue("serviceBusTrigger", {
  connection: "AzureWebJobsServiceBus",
  queueName: "testqueue",
  cardinality: "many",
  sdkBinding: true, //Ensure this is set to true
  autoCompleteMessages: false, //Exposing this so that customer can take action on the messages
  handler: serviceBusTrigger1,
});

