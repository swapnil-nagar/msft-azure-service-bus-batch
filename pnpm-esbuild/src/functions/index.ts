import "@azure/functions-extensions-servicebus";
import { ServiceBusMessageContext } from "@azure/functions-extensions-servicebus"
import { app, InvocationContext } from "@azure/functions";

export async function serviceBusTrigger1(
  serviceBusMessageContext: ServiceBusMessageContext, 
  context: InvocationContext
): Promise<void> {
  try {
    //Actual Message
    context.log("triggerMetadata: ", context.triggerMetadata);
    if (Array.isArray(serviceBusMessageContext.messages)) {
      context.log('Completing the message', serviceBusMessageContext.messages[0]);
      //Use serviceBusMessageActions to action on the messages
      await serviceBusMessageContext.actions.complete(serviceBusMessageContext.messages[0]);
      context.log('Completing the body', serviceBusMessageContext.messages[0].body);
    } else {
      context.log('Completing the message', serviceBusMessageContext.messages);
      await serviceBusMessageContext.actions.complete(serviceBusMessageContext.messages);
      context.log('Completing the body', serviceBusMessageContext.messages.body);
    }
  } catch (error) {
    context.log('Error processing Service Bus message:', error);
  }
}

app.serviceBusQueue("serviceBusTrigger", {
  connection: "AzureWebJobsServiceBus",
  queueName: "testqueue",
  cardinality: "many",
  sdkBinding: true, //Ensure this is set to true
  autoCompleteMessages: false, //Exposing this so that customer can take action on the messages
  handler: serviceBusTrigger1,
});

// https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-service-bus?tabs=isolated-process%2Cextensionv5&pivots=programming-language-javascript
// autoCompleteMessages
