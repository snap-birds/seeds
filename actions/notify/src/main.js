const core = require('@actions/core');
const github = require('@actions/github');
// const { PubSub } = require('@google-cloud/pubsub');

const stepsErrors = new Array(
  {id: "req_generate#(failure|skipped)", error: 'HANDLE_TEMPLATE_ERROR', context: ["run_id"]},
  {id: "req_create_pr_check#(failure|skipped)", error: 'HANDLE_NO_CHANGES_ERROR', context: ["run_id"]},
  {id: "req_create_pr#(failure|skipped)", error: 'HANDLE_CREATE_PR_ERROR', context: ["run_id"]},
  {id: "req_create_pr#success", error: 'HANDLE_SUCCESS', context: ["run_id", "pull-request-url"]},
);

async function main() {
  const inputSteps = new Map(Object.entries(JSON.parse(core.getInput('steps', {required: true}))));
  const inputMessage = new Map(Object.entries(JSON.parse(core.getInput('message', {required: true}))))

  let message = Object();
  let step = Object();

  for (let i = 0, len = stepsErrors.length; i < len; i++) {
    let [stepError, stepErrorStatus] = stepsErrors[i].id.split('#');

    if (inputSteps.has(stepError)) {
      step = inputSteps[stepError];
      if (step.outcome.math(stepErrorStatus)) {
        message = {
          status: stepsErrors[i].error,
          context: Object.fromEntries(stepError.context.map(
            ctx => [ctx, (step.outputs[ctx] ?? github.context.get(ctx) ?? '')]
          ))
        };
        break;
      }
    }
  }
  inputMessage["pipeline_status"] = message;
  console.log(inputMessage);
  console.log("-----");
  console.log(github.context);

  // Pubsub logic
}
