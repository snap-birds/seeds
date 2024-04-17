const core = require('@actions/core');
const github = require('@actions/github');
// const { PubSub } = require('@google-cloud/pubsub');

const stepsErrors = new Array(
  {id: "req_generate#(failure|skipped)", error: 'HANDLE_TEMPLATE_ERROR', context: ["run_id"]},
  {id: "req_create_pr_check#(failure|skipped)", error: 'HANDLE_UNCHANGED_ERROR', context: ["run_id"]},
  {id: "req_create_pr#(failure|skipped)", error: 'HANDLE_CREATE_PR_ERROR', context: ["run_id"]},
  {id: "req_create_pr#success", error: 'HANDLE_SUCCESS', context: ["run_id", "pull-request-url"]},
);

// const inputStepsJson = '{"req_generate":{"outputs":{},"outcome":"success","conclusion":"success"},"req_create_pr":{"outputs":{},"outcome":"success","conclusion":"success"},"req_create_pr_check":{"outputs":{},"outcome":"failure","conclusion":"failure"}}';
// const inputMessageJson = '{"foo": 1, "bar": 2}'

async function main() {
  const inputSteps = new Map(Object.entries(JSON.parse(core.getInput('steps', {required: true}))));
  const inputMessage = new Map(Object.entries(JSON.parse(core.getInput('message', {required: true}))))
  // const inputSteps = new Map(Object.entries(JSON.parse(inputStepsJson)));
  // const inputMessage = new Map(Object.entries(JSON.parse(inputMessageJson)));

  let message = Object();
  let step = Object();

  for (let i = 0, len = stepsErrors.length; i < len; i++) {
    let [stepError, stepErrorStatus] = stepsErrors[i].id.split('#');

    if (inputSteps.has(stepError)) {
      step = inputSteps.get(stepError);
      console.log(step);
      if (step.outcome.match(stepErrorStatus)) {
        message = {
          status: stepsErrors[i].error,
          context: Object.fromEntries(stepsErrors[i].context.map(
            ctx => [ctx, (step.outputs[ctx] ?? github.context.get(ctx) ?? '')]
            // ctx => [ctx, (step.outputs[ctx] ?? '')]
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

main().catch((err) => {
  console.error(err);
  core.setFailed(err.message);
});
