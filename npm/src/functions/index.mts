import "@azure/functions-extensions-servicebus";
import { ServiceBusMessageActions, ServiceBusMessageContext } from "@azure/functions-extensions-servicebus"
import { app, InvocationContext } from "@azure/functions";

export async function serviceBusTrigger1(
  serviceBusMessageContext: ServiceBusMessageContext, 
  context: InvocationContext
): Promise<void> {
  //console.log('ServiceBus function invoked with args:', args);
  context.log(
    `Service Bus function processed message:`
  );
  const actions: ServiceBusMessageActions = serviceBusMessageContext.actions;
      //context.log("triggerMetadata: ", context.triggerMetadata);
    //Actual Message
    for(let message of serviceBusMessageContext.messages) {
      //context.log('Completing the message', message);
      //Use serviceBusMessageActions to action on the messages
      await actions.complete(message);
      //context.log('Completing the body', message.body);
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

